"use client";

import { useCallback, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Editor component provides a rich text editing experience
 * Uses contentEditable for better formatting support
 */
export function Editor({ value, onChange, placeholder }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Update editor content when value prop changes
  useEffect(() => {
    // if (editorRef.current && editorRef.current.innerHTML !== value) {
    //   editorRef.current.innerHTML = value;
    // }
    console.log(value);
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow basic formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          document.execCommand("bold", false);
          break;
        case "i":
          e.preventDefault();
          document.execCommand("italic", false);
          break;
        case "u":
          e.preventDefault();
          document.execCommand("underline", false);
          break;
      }
    }
  }, []);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Edit your summary (supports basic HTML formatting):
      </Label>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`
            w-full min-h-[300px] p-3 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            prose prose-sm max-w-none
            ${value.length == 0 ? "text-gray-400" : "text-gray-900"}
          `}
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
          suppressContentEditableWarning={true}
        />

        {
          <div className="absolute top-3 left-3 pointer-events-none text-gray-400 text-sm">
            {value.length == 0 ? placeholder : value}
          </div>
        }
      </div>

      {value.length != 0 && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Tip: Use Ctrl+B for bold, Ctrl+I for italic</span>
          <span>{value.replace(/<[^>]*>/g, "").length} characters</span>
        </div>
      )}
    </div>
  );
}
