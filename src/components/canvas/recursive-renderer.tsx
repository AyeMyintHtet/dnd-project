import React, { memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BuilderNode } from "@/core/types";
import { CanvasNode } from "./canvas-node";

interface RecursiveRendererProps {
    nodes: BuilderNode[];
}

export const RecursiveRenderer = memo(({ nodes }: RecursiveRendererProps) => {
    return (
        <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 w-full h-full">
                {nodes.map((node) => (
                    <CanvasNode key={node.id} node={node}>
                        {/* Recursively render children if any */}
                        {node.children && node.children.length > 0 && (
                            <div className={node.type === "SECTION" ? "flex gap-2" : ""}>
                                {/* Simplified nesting layout: Sections have flex row/col, etc. */}
                                <RecursiveRenderer nodes={node.children} />
                            </div>
                        )}
                    </CanvasNode>
                ))}
            </div>
        </SortableContext>
    );
});

RecursiveRenderer.displayName = "RecursiveRenderer";
