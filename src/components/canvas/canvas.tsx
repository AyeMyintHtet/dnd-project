"use client";

import React from "react";
import {
    DndContext,
    DragOverlay,
    useDroppable,
    closestCenter,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useBuilderStore } from "@/core/store";
import { RecursiveRenderer } from "./recursive-renderer";
import { cn } from "@/lib/utils";

export const Canvas = () => {
    const { nodes, addNode, moveNode, setDraggingId } = useBuilderStore();

    // Configure sensors to ensure good interaction (especially avoiding conflicts with click)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Drag must move 8px before activating
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Drop area for the root
    const { setNodeRef } = useDroppable({
        id: "canvas-root",
    });

    const handleDragStart = (event: DragStartEvent) => {
        console.log("Drag Start:", event);
        setDraggingId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        console.log("Drag Over:", event);
        // Logic to handle nested drops or placeholder prediction
    };

    const handleDragEnd = (event: DragEndEvent) => {
        console.log("Drag End:", event);
        setDraggingId(null);
        const { active, over } = event;

        if (!over) return;

        // Handling Drop from Sidebar
        if (active.data.current?.type === 'sidebar-item') {
            const type = active.data.current.nodeType;
            const newNode: any = {
                id: crypto.randomUUID(),
                type,
                name: type.charAt(0) + type.slice(1).toLowerCase(), // e.g. "Section"
                props: {},
                children: []
            };

            // Initialize default props based on type
            if (type === 'SECTION') newNode.props.padding = 'p-8';
            if (type === 'TEXT') newNode.props.content = 'Edit this text...';
            if (type === 'BUTTON') newNode.props.content = 'Click Me';
            if (type === 'COLUMN') newNode.props.className = 'flex-1';

            // Check where we dropped it
            if (over.id === 'canvas-root') {
                addNode(newNode);
            } else {
                // Dropped on another node
                // If the target is a container (Section/Column), add as child
                // Otherwise (for now) just add to root or handle sorting later
                // To keep it simple: if dropped on a Node, try to add to its parent? 
                // Or if it's a container, add inside.
                // We need to look up the over node type.

                // Note: @dnd-kit's over.data.current might not be fully typed here without casting
                const overNode = over.data.current?.node;

                if (overNode && (overNode.type === 'SECTION' || overNode.type === 'COLUMN')) {
                    addNode(newNode, overNode.id);
                } else {
                    // Fallback: Add to root (or adjacent, but simplicity first)
                    addNode(newNode);
                }
            }

        } else if (active.id !== over.id) {
            moveNode(active.id as string, over.id as string);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 h-full min-h-[calc(100vh-4rem)] p-8 bg-background overflow-y-auto transition-colors",
                    // "border-2 border-dashed border-gray-800 rounded-lg m-4"
                )}
            >
                {nodes.length === 0 ? (
                    <div className="flex h-full items-center justify-center border-2 border-dashed border-muted rounded-lg text-muted-foreground p-12">
                        <p>Drag elements here to build your page</p>
                    </div>
                ) : (
                    <RecursiveRenderer nodes={nodes} />
                )}
            </div>

            <DragOverlay>
                {/* Render dragging item preview */}
                {/* We need the dragging node data here for the sidebar item.
                    We can't easily access 'active' state inside DragOverlay without using the hook or store,
                    but DndContext handles it. We just need to check if we have an active ID that matches sidebar.
                */}
                {/* Simplified Preview: just a box or use custom component */}
                <div className="p-2 bg-blue-500/50 text-white rounded shadow-lg border-2 border-blue-600">
                    Dragging Item...
                </div>
            </DragOverlay>
        </DndContext>
    );
};
