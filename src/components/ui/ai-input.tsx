"use client";

import { CornerRightUp, Mic } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

interface AIInputProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string) => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function AIInput({
  id = "ai-input",
  placeholder = "Type your message...",
  minHeight = 52,
  maxHeight = 200,
  onSubmit,
  className,
  value,
  onChange,
}: AIInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const [internalValue, setInternalValue] = useState("");
  const isControlled = typeof value === "string";
  const inputValue = useMemo(() => (isControlled ? value ?? "" : internalValue), [isControlled, value, internalValue]);

  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  const handleChange = (val: string) => {
    if (isControlled) {
      onChange?.(val);
    } else {
      setInternalValue(val);
      onChange?.(val);
    }
  };

  const handleReset = () => {
    if (!inputValue.trim()) return;
    onSubmit?.(inputValue);
    if (isControlled) {
      onChange?.("");
    } else {
      setInternalValue("");
      onChange?.("");
    }
    adjustHeight(true);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto">
        <Textarea
          id={id}
          placeholder={placeholder}
          className={cn(
            "max-w-xl bg-black/5 dark:bg-white/5 rounded-3xl pl-6 pr-16",
            "placeholder:text-black/50 dark:placeholder:text-white/50",
            "border-none ring-black/20 dark:ring-white/20",
            "text-black dark:text-white text-wrap",
            "overflow-y-auto resize-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "transition-[height] duration-100 ease-out",
            "leading-[1.2] py-[16px]",
            `min-h-[${minHeight}px]`,
            `max-h-[${maxHeight}px]`,
            "[&::-webkit-resizer]:hidden",
          )}
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            handleChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReset();
            }
          }}
        />
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1 transition-all duration-200",
            inputValue ? "right-10" : "right-3",
          )}
        >
          <Mic className="w-4 h-4 text-black/70 dark:text-white/70" />
        </div>
        <button
          onClick={handleReset}
          type="button"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-3",
            "rounded-xl bg-black/5 dark:bg-white/5 py-1 px-1",
            "transition-all duration-200",
            inputValue ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          )}
        >
          <CornerRightUp className="w-4 h-4 text-black/70 dark:text-white/70" />
        </button>
      </div>
    </div>
  );
}

