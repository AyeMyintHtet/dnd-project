import React from "react";
import { DraggableItem } from "./draggable-item";
import { Square, Type, LayoutTemplate, Columns } from "lucide-react";

export const Palette = () => {
    return (
        <div className="w-60 bg-card border-r border-border p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-foreground/80 mb-2">Components</h2>

            <div className="flex flex-col gap-3">
                <DraggableItem type="SECTION" label="Section" icon={<LayoutTemplate className="w-4 h-4" />} />
                <DraggableItem type="COLUMN" label="Column" icon={<Columns className="w-4 h-4" />} />
                <DraggableItem type="TEXT" label="Text Block" icon={<Type className="w-4 h-4" />} />
                <DraggableItem type="BUTTON" label="Button" icon={<Square className="w-4 h-4" />} />
            </div>

            <div className="mt-auto p-4 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
                <p>Drag items onto the canvas to build your page.</p>
            </div>
        </div>
    );
};
