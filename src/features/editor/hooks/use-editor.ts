import { fabric } from "fabric";
import { useCallback, useState, useMemo } from "react";

import {
    EditorHookProps,
    BuildEditorProps,
    Editor,
    CIRCLE_OPTIONS,
    RECTANGLE_OPTIONS,
    TRIANGLE_OPTIONS,
    DIAMOND_OPTIONS,
    FILL_COLOR,
    STROKE_COLOR,
    STROKE_WIDTH,
    STROKE_DASH_ARRAY,
    TEXT_OPTIONS,
    FONT_FAMILY,
    FONT_WEIGHT,
    FONT_SIZE,
} from "@/features/editor/types";

import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useClipboard } from "@/features/editor/hooks/use-clipboard";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import { createFilter, isTextType } from "@/features/editor/utils";

const buildEditor = ({
    canvas,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    strokeDashArray,
    setStrokeDashArray,
    selectedObjects,
    fontFamily,
    copy,
    paste,
    setFontFamily,
}: BuildEditorProps): Editor => {
    const getWorkspace = () => {
        return canvas.getObjects().find((object) => object.name === "clip");
    };

    const center = (object: fabric.Object) => {
        const workspace = getWorkspace();
        const center = workspace?.getCenterPoint();

        if (!center) return;

        // @ts-ignore
        canvas._centerObject(object, center);
    };

    const addToCanvas = (object: fabric.Object) => {
        center(object);
        canvas.add(object);
        canvas.setActiveObject(object);
    };

    return {
        onCopy: () => copy(),
        onPaste: () => paste(),
        changeImageFilter: (value) => {
            const objects = canvas.getActiveObjects();
            objects.forEach((object) => {
                if(object.type === "image"){
                    const imageObject = object as fabric.Image;

                    const effect = createFilter(value);

                    imageObject.filters = effect ? [effect] : [];
                    imageObject.applyFilters();
                    
                    canvas.renderAll();
                }
            });
        },
        addImage: (value) => {
            fabric.Image.fromURL(
                value,
                (image) => {
                    const workspace = getWorkspace();
                    
                    image.scaleToWidth(workspace?.width || 0);
                    image.scaleToHeight(workspace?.height || 0);

                    addToCanvas(image);
                },
                {
                    crossOrigin: "anonymous",
                },
            )
        },
        delete: () => {
            canvas.getActiveObjects().forEach((object) => canvas.remove(object));
            canvas.discardActiveObject();

            canvas.renderAll();
        },
        changeFontFamily: (value) => {
            setFontFamily(value);
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ fontFamily: value });
                }
            });
            canvas.renderAll();
        },
        changeFontWeight: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ fontWeight: value });
                }
            });

            canvas.renderAll();
        },
        changeFontStyle: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ fontStyle: value });
                }
            });

            canvas.renderAll();
        },
        changeFontLinethrough: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ linethrough: value });
                }
            });

            canvas.renderAll();
        },
        changeFontUnderline: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ underline: value });
                }
            });

            canvas.renderAll();
        },
        changeTextAlign: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ textAlign: value });
                }
            });

            canvas.renderAll();
        },
        changeFontSize: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                if(isTextType(object.type)){
                    // @ts-ignore
                    object.set({ fontSize: value });
                }
            });

            canvas.renderAll();
        },
        changeOpacity: (value) => {
            canvas.getActiveObjects().forEach((object) => {
                object.set({ opacity: value });
            });

            canvas.renderAll();
        },
        bringForward: () => {
            canvas.getActiveObjects().forEach((object) => {
                canvas.bringForward(object);
            });

            canvas.renderAll();
            
            const workspace = getWorkspace();
            workspace?.sendToBack();
        },
        sendBackwards: () => {
            canvas.getActiveObjects().forEach((object) => {
                canvas.sendBackwards(object);
            });

            canvas.renderAll();
            
            const workspace = getWorkspace();
            workspace?.sendToBack();
        },
        changeFillColor: (value) => {
            setFillColor(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ fill: value });
            });
            canvas.renderAll();
        },
        changeStrokeColor: (value) => {
            setStrokeColor(value);
            canvas.getActiveObjects().forEach((object) => {
                // Text types don't have stroke
                if (isTextType(object.type)) {
                    object.set({ fill: value });
                    return;
                }
                object.set({ stroke: value });
            });
            canvas.renderAll();
        },
        changeStrokeWidth: (value) => {
            setStrokeWidth(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeWidth: value });
            });
            canvas.renderAll();
        },
        changeStrokeDashArray: (value) => {
            setStrokeDashArray(value);
            canvas.getActiveObjects().forEach((object) => {
                object.set({ strokeDashArray: value });
            });
            canvas.renderAll();
        },
        addText: (value, options) => {
            const object = new fabric.Textbox(value, {
                ...TEXT_OPTIONS,
                ...options,
            });

            addToCanvas(object);
        },
        addCircle: () => {
            const object = new fabric.Circle({
                ...CIRCLE_OPTIONS,
            });

            addToCanvas(object);
        },
        addSoftRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
                rx: 50,
                ry: 50,
            });

            addToCanvas(object);
        },
        addRectangle: () => {
            const object = new fabric.Rect({
                ...RECTANGLE_OPTIONS,
            });

            addToCanvas(object);
        },
        addTriangle: () => {
            const object = new fabric.Triangle({
                ...TRIANGLE_OPTIONS,
            });

            addToCanvas(object);
        },
        addInverseTriangle: () => {
            const HEIGHT = TRIANGLE_OPTIONS.height;
            const WIDTH = TRIANGLE_OPTIONS.width;

            const object = new fabric.Polygon(
                [
                    { x: 0, y: 0 },
                    { x: WIDTH, y: 0 },
                    { x: WIDTH / 2, y: HEIGHT },
                ],
                {
                    ...TRIANGLE_OPTIONS,
                }
            );

            addToCanvas(object);
        },
        addDiamond: () => {
            const HEIGHT = DIAMOND_OPTIONS.height;
            const WIDTH = DIAMOND_OPTIONS.width;

            const object = new fabric.Polygon(
                [
                    { x: WIDTH / 2, y: 0 },
                    { x: WIDTH, y: HEIGHT / 2 },
                    { x: WIDTH / 2, y: HEIGHT },
                    { x: 0, y: HEIGHT / 2 },
                ],
                {
                    ...DIAMOND_OPTIONS,
                }
            );

            addToCanvas(object);
        },
        canvas,
        getActiveFontWeight: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return FONT_WEIGHT;
            }
            // @ts-ignore
            const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

            return value;
        },
        getActiveFontStyle: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return "normal";
            }
            // @ts-ignore
            const value = selectedObject.get("fontStyle") || "normal";

            return value;
        },
        getActiveFontLinethrough: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return false;
            }
            // @ts-ignore
            const value = selectedObject.get("linethrough") || false;

            return value;
        },
        getActiveFontUnderline: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return false;
            }
            // @ts-ignore
            const value = selectedObject.get("underline") || false;

            return value;
        },
        getActiveTextAlign: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return "left";
            }
            // @ts-ignore
            const value = selectedObject.get("textAlign") || "left";

            return value;
        },
        getActiveFontSize: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return FONT_SIZE;
            }
            // @ts-ignore
            const value = selectedObject.get("fontSize") || FONT_SIZE;

            return value;
        },
        getActiveFontFamily: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return fontFamily;
            }
            // @ts-ignore
            const value = selectedObject.get("fontFamily") || fontFamily;

            return value;
        },
        getActiveFillColor: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return fillColor;
            }

            const value = selectedObject.get("fill") || fillColor;

            // Currently, gradients & patterns are not supported
            return value as string;
        },
        getActiveStrokeColor: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return strokeColor;
            }

            const value = selectedObject.get("stroke") || strokeColor;

            return value;
        },
        getActiveStrokeWidth: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return strokeWidth;
            }

            const value = selectedObject.get("strokeWidth") || strokeWidth;

            return value;
        },
        getActiveStrokeDashArray: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return strokeDashArray;
            }

            const value = selectedObject.get("strokeDashArray") || strokeDashArray;

            return value;
        },
        getActiveOpacity: () => {
            const selectedObject = selectedObjects[0];

            if(!selectedObject){
                return 1;
            }

            const value = selectedObject.get("opacity") || 1;

            return value;
        },
        selectedObjects
    };
};

export const useEditor = ({
    clearSelectionCallback
}: EditorHookProps) => {
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

    const [fontFamily, setFontFamily] = useState<string>(FONT_FAMILY);
    const [fillColor, setFillColor] = useState<string>(FILL_COLOR);
    const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLOR);
    const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTH);
    const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);

    const { copy, paste } = useClipboard({ canvas });

    useAutoResize({
        canvas,
        container,
    });

    useCanvasEvents({
        canvas,
        setSelectedObjects,
        clearSelectionCallback,
    });

    const editor = useMemo(() => {
        if (canvas) {
            return buildEditor({
                canvas,
                fillColor,
                setFillColor,
                strokeColor,
                setStrokeColor,
                strokeWidth,
                setStrokeWidth,
                strokeDashArray,
                setStrokeDashArray,
                selectedObjects,
                fontFamily,
                setFontFamily,
                copy,
                paste,
            });
        }

        return undefined;
    }, [canvas, fillColor, strokeColor, strokeWidth, strokeDashArray, fontFamily, copy, paste, selectedObjects]);

    const init = useCallback(
        ({
            initialCanvas,
            initialContainer,
        }: {
            initialCanvas: fabric.Canvas;
            initialContainer: HTMLDivElement;
        }) => {
            fabric.Object.prototype.set({
                cornerColor: "#FFF",
                cornerStyle: "circle",
                borderColor: "#3b82f6",
                borderScaleFactor: 1.5,
                transparentCorners: false,
                borderOpacityWhenMoving: 1,
                cornerStrokeColor: "#3b82f6",
            });

            const initialWorkspace = new fabric.Rect({
                width: 900,
                height: 1200,
                name: "clip",
                fill: "white",
                selectable: false,
                hasControls: false,
                hoverCursor: "default",
                shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.8)",
                    blur: 5,
                }),
            });

            initialCanvas.setWidth(initialContainer.offsetWidth);
            initialCanvas.setHeight(initialContainer.offsetHeight);

            initialCanvas.add(initialWorkspace);
            initialCanvas.centerObject(initialWorkspace);
            initialCanvas.clipPath = initialWorkspace;

            setCanvas(initialCanvas);
            setContainer(initialContainer);
        },
        []
    );

    return { init, editor };
};
