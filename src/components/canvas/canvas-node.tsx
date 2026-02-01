import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BuilderNode } from "@/core/types";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/core/store";

interface CanvasNodeProps {
    node: BuilderNode;
    children?: React.ReactNode;
}

export const CanvasNode = ({ node, children }: CanvasNodeProps) => {
    const selectedId = useBuilderStore((state) => state.selectedId);
    const selectNode = useBuilderStore((state) => state.selectNode);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: node.id,
        data: {
            type: "canvas-node",
            node,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const isSelected = selectedId === node.id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
                "relative group min-h-[50px] transition-all",
                isSelected && "ring-2 ring-blue-500",
                isDragging && "opacity-50",
                node.type === "SECTION" && "p-8 border border-dashed border-transparent hover:border-gray-500",
                node.type === "COLUMN" && "flex-1 p-4 border border-dashed border-gray-700/50 min-h-[100px]",
                node.type === "TEXT" && "p-2 cursor-text",
                node.type === "BUTTON" && "inline-block"
            )}
            onClick={(e) => {
                e.stopPropagation();
                selectNode(node.id);
            }}
        >
            {/* Drag Handle - Only show on hover or selection */}
            <div
                {...listeners}
                className={cn(
                    "absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10",
                    isSelected && "opacity-100"
                )}
            >
                {node.type}
            </div>

            <div className="w-full h-full">
                {/* Content rendering logic will go here or be passed as children */}
                {children ? children : (
                    // Fallback content based on type
                    node.type === "TEXT" ? <p className="pointer-events-none">{node.props.content || "Text Block"}</p> :
                        node.type === "BUTTON" ? <button className="px-4 py-2 bg-primary text-white rounded pointer-events-none">{node.props.content || "Button"}</button> :
                            null
                )}
            </div>
        </div>
    );
};
