import { fabric } from "fabric";
import { useEffect } from "react";

interface UseCanvasEventsProps {
    canvas: fabric.Canvas | null;
    save: () => void;
    setSelectedObjects: (objects: fabric.Object[]) => void;
    clearSelectionCallback?: () => void;
}

export const useCanvasEvents = ({
    canvas,
    save,
    setSelectedObjects,
    clearSelectionCallback,
}: UseCanvasEventsProps) => {
    useEffect(() => {
        if (canvas) {
            canvas.on("object:added", () => save());
            canvas.on("object:removed", () => save());
            canvas.on("object:modified", () => save());
            canvas.on("selection:created", (e) => {
                setSelectedObjects(e.selected || []);
            });
            canvas.on("selection:updated", (e) => {
                setSelectedObjects(e.selected || []);
            });
            canvas.on("selection:cleared", () => {
                setSelectedObjects([]);
                clearSelectionCallback?.();
            });
        }

        return () => {
            if(canvas) {
                canvas.off("object:added");
                canvas.off("object:removed");
                canvas.off("object:modified");
                canvas.off("selection:created");
                canvas.off("selection:updated");
                canvas.off("selection:cleared");
            }
        }
    }, [
        canvas,
        save,
        clearSelectionCallback,
        setSelectedObjects, // No need other than to make linter happy since comes from setState
    ]);
}