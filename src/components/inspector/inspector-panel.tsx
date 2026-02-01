import React from "react";
import { useBuilderStore } from "@/core/store";
import { BuilderNode } from "@/core/types";

// Helper to find node by ID (duplicated from store for local usage or imported if I export it)
// I'll grab the node from the tree using a selector or just traverse in the component for simplicity
// But store assumes I passed 'selectedId'.
// Better to have a selector `activeNode`.
// I'll use a simple recursive finder here.

const findNode = (nodes: BuilderNode[], id: string): BuilderNode | undefined => {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNode(node.children, id);
        if (found) return found;
    }
    return undefined;
};

export const InspectorPanel = () => {
    const { nodes, selectedId, updateNodeProps } = useBuilderStore();

    const selectedNode = selectedId ? findNode(nodes, selectedId) : null;

    if (!selectedNode) {
        return (
            <div className="w-64 bg-card border-l border-border p-6 flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-center text-sm">Select an element to edit properties.</p>
            </div>
        );
    }

    const handlePropChange = (key: string, value: any) => {
        if (!selectedId) return;
        updateNodeProps(selectedId, { [key]: value });
    };

    return (
        <div className="w-80 bg-card border-l border-border p-4 flex flex-col gap-6">
            <div className="border-b border-border pb-4">
                <h2 className="font-semibold text-lg">{selectedNode.name}</h2>
                <span className="text-xs text-muted-foreground font-mono">ID: {selectedNode.id}</span>
            </div>

            <div className="flex flex-col gap-4">
                {/* Common inputs */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Padding</label>
                    <input
                        type="text"
                        value={selectedNode.props.padding || "p-4"}
                        onChange={(e) => handlePropChange('padding', e.target.value)}
                        className="bg-background border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g. p-4, p-8"
                    />
                </div>

                {/* Specific inputs */}
                {selectedNode.type === "TEXT" && (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Content</label>
                        <textarea
                            value={selectedNode.props.content || ""}
                            onChange={(e) => handlePropChange('content', e.target.value)}
                            className="bg-background border border-input rounded px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                )}

                {selectedNode.type === "BUTTON" && (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Label</label>
                        <input
                            type="text"
                            value={selectedNode.props.content || "Click Me"}
                            onChange={(e) => handlePropChange('content', e.target.value)}
                            className="bg-background border border-input rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
