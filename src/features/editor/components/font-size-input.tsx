import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

interface FontSizeInputProps {
    value: number;
    onChange: (value: number) => void;
}

export const FontSizeInput = ({
    value,
    onChange
}: FontSizeInputProps) => {
    const sizeIncrement = () => onChange(value + 1);
    const sizeDecrement = () => onChange(value - 1);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(e.target.value, 10);
        onChange(value);
    }
    return (
        <div className="flex items-center">
            <Button
                onClick={sizeDecrement}
                variant="outline"
                className="p-2 rounded-r-none border-r-0"
                size="icon"
            >
                <Minus className="size-4" />
            </Button>
            <Input
                onChange={handleChange}
                value={value}
                className="w-[50px] h-8 focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none"
            />
            <Button
                onClick={sizeIncrement}
                variant="outline"
                className="p-2 rounded-l-none border-l-0"
                size="icon"
            >
                <Plus className="w-[50px] h-8" />
            </Button>
        </div>
    );
}