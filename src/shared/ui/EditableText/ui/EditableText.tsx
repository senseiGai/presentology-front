import React, { useEffect, useState } from "react";
import { usePresentationStore } from "@/shared/stores/usePresentationStore";

interface EditableTextProps {
  elementId: string;
  initialText: string;
  defaultText?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  elementId,
  initialText,
  defaultText = "Click to edit",
  className = "",
  onClick,
  ...props
}) => {
  const {
    selectedTextElement,
    textEditorContent,
    setSelectedTextElement,
    setTextEditorContent,
    getTextElementStyle,
    deletedTextElements,
    getTextElementContent,
  } = usePresentationStore();

  const [displayText, setDisplayText] = useState(initialText || defaultText);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Get the specific style for this element
  const elementStyle = getTextElementStyle(elementId);

  const formatText = (text: string) => {
    // Split text into lines and process each line
    const lines = text.split("\n");

    const formattedLines = lines.map((line) => {
      const trimmedLine = line.trim();

      // Check if line is a bullet point
      if (trimmedLine.match(/^(•\s*|-\s*|\*\s*)/)) {
        const content = trimmedLine.replace(/^(•\s*|-\s*|\*\s*)/, "").trim();
        return `<div style="display: flex; align-items: flex-start; margin: 2px 0;"><span style="margin-right: 8px; flex-shrink: 0;">•</span><span>${
          content || ""
        }</span></div>`;
      }

      // Check if line is a numbered list item
      if (trimmedLine.match(/^\d+\.\s*/)) {
        const match = trimmedLine.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          const number = match[1];
          const content = match[2].trim();
          return `<div style="display: flex; align-items: flex-start; margin: 2px 0;"><span style="margin-right: 8px; flex-shrink: 0;">${number}.</span><span>${
            content || ""
          }</span></div>`;
        }
      }

      // Regular line - just return it, handle empty lines
      return trimmedLine
        ? `<div style="margin: 2px 0;">${trimmedLine}</div>`
        : '<div style="margin: 2px 0; height: 1.2em;"></div>';
    });

    return formattedLines.join("");
  };

  useEffect(() => {
    if (selectedTextElement === elementId) {
      // If this element is selected, sync displayText with textEditorContent
      if (textEditorContent !== displayText) {
        setDisplayText(textEditorContent);
      }
    } else {
      // If this element is not selected, show saved content or initial text
      const savedContent = getTextElementContent(elementId);
      const contentToShow = savedContent || initialText;
      if (displayText !== contentToShow) {
        setDisplayText(contentToShow);
      }
    }
  }, [
    textEditorContent,
    selectedTextElement,
    elementId,
    initialText,
    getTextElementContent,
  ]);

  // Force re-render when deletion status changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [deletedTextElements]);

  // Force re-render when styles change for this element
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [
    elementStyle.fontSize,
    elementStyle.fontWeight,
    elementStyle.fontStyle,
    elementStyle.textDecoration,
    elementStyle.textAlign,
    elementStyle.color,
    elementStyle.zIndex,
    elementStyle.x,
    elementStyle.y,
  ]);

  const handleClick = (e: React.MouseEvent) => {
    setSelectedTextElement(elementId);
    setTextEditorContent(displayText);
    if (onClick) {
      onClick(e);
    }
  };

  // Don't render if element is deleted - check after all hooks
  if (deletedTextElements.has(elementId)) {
    console.log(
      "EditableText: Element",
      elementId,
      "is deleted, not rendering"
    );
    return null;
  }

  return (
    <div
      className={`cursor-pointer transition-all duration-200 ${className}`}
      onClick={handleClick}
      data-text-element={elementId}
      style={{
        fontSize: `${elementStyle.fontSize}px`,
        fontWeight: elementStyle.fontWeight,
        fontStyle: elementStyle.fontStyle || "normal",
        textDecoration: elementStyle.textDecoration || "none",
        textAlign: elementStyle.textAlign,
        color: elementStyle.color,
        ...props.style,
      }}
      dangerouslySetInnerHTML={{ __html: formatText(displayText) }}
      {...props}
    />
  );
};
