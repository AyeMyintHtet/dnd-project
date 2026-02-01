export type NodeType = "SECTION" | "COLUMN" | "ROW" | "TEXT" | "BUTTON";

export interface BuilderNode {
    id: string;
    type: NodeType;
    name: string;
    props: Record<string, any>;
    children: BuilderNode[];
}

export type DndData = {
    type: "sidebar-item" | "canvas-node";
    nodeType?: NodeType; // if sidebar-item
    node?: BuilderNode; // if canvas-node
};
