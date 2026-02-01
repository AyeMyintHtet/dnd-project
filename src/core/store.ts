import { create } from "zustand";
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
            // Placeholder for complex reordering logic
            return state;
        }),
}));
