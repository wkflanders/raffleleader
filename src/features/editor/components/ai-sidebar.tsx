import { useState } from "react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useGenerateImage } from "@/features/ai/api/use-generate-image";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import React from "react";

interface AiSidebarProps {
    editor: Editor | undefined;
    activeTool: ActiveTool;
    onChangeActiveTool: (tool: ActiveTool) => void;
}

export const AiSidebar = ({
    editor,
    activeTool,
    onChangeActiveTool,
}: AiSidebarProps) => {
    const mutation = useGenerateImage();

    const [value, setValue] = useState("");

    const onSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        // TODO: Block with paywall

        mutation.mutate({ prompt: value }, {
            onSuccess: ({ data }) => {
                if (data) {
                    editor?.addImage(data);
                } else {
                    // Handle case where data is not returned
                    alert('No image data received.');
                }
            },
            onError: (error) => {
                // Handle errors
                console.error('Image generation error:', error);
                alert('Failed to generate image.');
            },
        });
    }

    const onClose = () => {
        onChangeActiveTool("select");
    }

    return (
        <aside
            className={cn(
                "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
                activeTool === "ai" ? "visible" : "hidden"
            )}>
            <ToolSidebarHeader
                title="AI"
                description="Generate an image using AI"
            />
            <ScrollArea>
                <form onSubmit={onSubmit} className="p-4 space-y-6">
                    <Textarea
                        disabled={mutation.isPending}
                        placeholder="An astronaut riding a horse on mars, hd, dramatic lighting"
                        cols={30}
                        rows={10}
                        required
                        minLength={3}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <Button
                        disabled={mutation.isPending}
                        type="submit"
                        className="w-full"
                    >
                        Generate
                    </Button>
                </form>
            </ScrollArea>
            <ToolSidebarClose
                onClick={onClose}
            />
        </aside>
    );
}