import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { NodeType } from "@/core/types";
import { GripVertical } from "lucide-react";

interface DraggableItemProps {
    type: NodeType;
    label: string;
    icon?: React.ReactNode;
}

export const DraggableItem = ({ type, label, icon }: DraggableItemProps) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}`,
        data: {
            type: "sidebar-item",
            nodeType: type,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "flex items-center gap-3 p-3 bg-secondary rounded-md cursor-grab active:cursor-grabbing hover:bg-secondary/80 transition-colors border border-border",
                isDragging && "opacity-50 ring-2 ring-primary"
            )}
        >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="font-medium text-sm">{label}</span>

            {/* Ghost Element for Dragging - visual feedback handled by DragOverlay in Canvas usually, 
          but we style the source to look 'taken' 
      */}
        </div>
    );
};
