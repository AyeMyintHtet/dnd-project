import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { BuilderNode } from "./types";

interface BuilderStore {
    nodes: BuilderNode[];
    selectedId: string | null;
    draggingId: string | null;

    // Actions
    addNode: (node: BuilderNode, parentId?: string) => void;
    removeNode: (id: string) => void;
    updateNodeProps: (id: string, props: Record<string, any>) => void;
    selectNode: (id: string | null) => void;
    setDraggingId: (id: string | null) => void;
    moveNode: (activeId: string, overId: string) => void;
}

// Helper: recursive insertion (immutable-ish)
const insertNode = (nodes: BuilderNode[], parentId: string, newNode: BuilderNode): BuilderNode[] => {
    return nodes.map((node) => {
        if (node.id === parentId) {
            return { ...node, children: [...node.children, newNode] };
        }
        if (node.children.length > 0) {
            return { ...node, children: insertNode(node.children, parentId, newNode) };
        }
        return node;
    });
};

// Helper: recursive update
const updateNodeInTree = (nodes: BuilderNode[], id: string, props: Record<string, any>): BuilderNode[] => {
    return nodes.map((node) => {
        if (node.id === id) {
            return { ...node, props: { ...node.props, ...props } };
        }
        if (node.children.length > 0) {
            return { ...node, children: updateNodeInTree(node.children, id, props) };
        }
        return node;
    });
};

// Helper: recursive remove
const removeNodeFromTree = (nodes: BuilderNode[], id: string): BuilderNode[] => {
    return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
            ...node,
            children: removeNodeFromTree(node.children, id),
        }));
};

export const useBuilderStore = create<BuilderStore>((set) => ({
    nodes: [],
    selectedId: null,
    draggingId: null,

    addNode: (node, parentId) =>
        set((state) => {
            // If no parentId, add to root
            if (!parentId) {
                return { nodes: [...state.nodes, node] };
            }
            return { nodes: insertNode(state.nodes, parentId, node) };
        }),

    removeNode: (id) =>
        set((state) => ({ nodes: removeNodeFromTree(state.nodes, id) })),

    updateNodeProps: (id, props) =>
        set((state) => ({ nodes: updateNodeInTree(state.nodes, id, props) })),

    selectNode: (id) => set({ selectedId: id }),

    setDraggingId: (id) => set({ draggingId: id }),

    moveNode: (activeId, overId) =>
        set((state) => {
            const activeNodeInfo = findNodeAndParent(state.nodes, activeId);
            const overNodeInfo = findNodeAndParent(state.nodes, overId);

            if (!activeNodeInfo || !overNodeInfo) {
                return state;
            }

            const { node: activeNode, parent: activeParent, index: activeIndex } = activeNodeInfo;
            const { node: overNode, parent: overParent, index: overIndex } = overNodeInfo;

            // Safeguard: Unknown nodes
            if (!activeNode || !overNode) return state;

            // Safeguard: Prevent moving a node into its own child (Cycle detection)
            if (isDescendant(activeNode, overNode.id)) {
                return state;
            }

            // Scenario 1: Same parent
            if (activeParent?.id === overParent?.id) {
                // If both are at root (parent is null) or share the same parent node
                const parentChildren = activeParent ? activeParent.children : state.nodes;
                const newChildren = arrayMove(parentChildren, activeIndex, overIndex);

                if (activeParent) {
                    // Update nested children
                    return {
                        nodes: updateNodeInTree(state.nodes, activeParent.id, { children: newChildren })
                    };
                } else {
                    // Update root nodes
                    return { nodes: newChildren };
                }
            }

            // Scenario 2: Different parents (Moving between containers)
            // Implementation detail: For now, we support reordering within the same container predominantly.
            // Moving between containers requires removing from old parent and inserting into new parent at specific index.

            // 1. Remove from source
            let newNodes = removeNodeFromTree(state.nodes, activeId);

            // 2. Insert into target
            // We need to insert 'activeNode' into 'overParent's children at 'overIndex'
            // OR if 'overNode' is the target container itself?
            // DndKit 'over' usually implies the item we are hovering OVER. 

            // Let's assume we are just swapping positions for now, which implies they are siblings 
            // in the flattened sortable context, but here we have a tree.

            // If we support moving between lists:
            if (activeParent !== overParent) {
                // Remove from old
                // This is complex because we need to construct a new tree.
                // "removeNodeFromTree" already returns a new tree without the node.

                // Now we need to insert `activeNode` into the new position.
                // The new position is relative to `overNode` (prob direct sibling).

                // Let's create a custom inserter that finds `overParent` and splices `activeNode` into children.
                // If `overParent` is null, insert into root.

                const insertIntoParent = (nodes: BuilderNode[], targetParentId: string | null, nodeToInsert: BuilderNode, insertIndex: number): BuilderNode[] => {
                    if (targetParentId === null) {
                        const newRoot = [...nodes];
                        newRoot.splice(insertIndex, 0, nodeToInsert);
                        return newRoot;
                    }

                    return nodes.map(n => {
                        if (n.id === targetParentId) {
                            const newChildren = [...n.children];
                            newChildren.splice(insertIndex, 0, nodeToInsert);
                            return { ...n, children: newChildren };
                        }
                        if (n.children.length > 0) {
                            return { ...n, children: insertIntoParent(n.children, targetParentId, nodeToInsert, insertIndex) };
                        }
                        return n;
                    });
                };

                newNodes = insertIntoParent(newNodes, overParent ? overParent.id : null, activeNode, overIndex);
                return { nodes: newNodes };
            }

            return state;
        }),
}));

// Helper to find a node and its parent
const findNodeAndParent = (
    nodes: BuilderNode[],
    id: string,
    parent: BuilderNode | null = null
): { node: BuilderNode; parent: BuilderNode | null; index: number } | null => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return { node: nodes[i], parent, index: i };
        }
        if (nodes[i].children.length > 0) {
            const result = findNodeAndParent(nodes[i].children, id, nodes[i]);
            if (result) {
                return result;
            }
        }
    }
    return null;
};

const isDescendant = (node: BuilderNode, targetId: string): boolean => {
    if (node.children.some(child => child.id === targetId)) return true;
    return node.children.some(child => isDescendant(child, targetId));
};
