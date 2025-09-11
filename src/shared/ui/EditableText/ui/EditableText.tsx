import React, { useEffect, useState, useRef, useCallback } from "react";
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
    setSelectedTextElement,
    getTextElementStyle,
    deletedTextElements,
    getTextElementContent,
    setTextElementContent,
    textElementContents, // Add this to track content changes from undo/redo
    addToHistory,
  } = usePresentationStore();

  const [displayText, setDisplayText] = useState(initialText || defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: log when component renders
  console.log(
    `EditableText render - elementId: ${elementId}, isEditing: ${isEditing}, displayText: ${displayText}`
  );

  // Add mouse event handlers for debugging
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("MOUSE DOWN on", elementId, "target:", e.target);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    console.log("MOUSE UP on", elementId, "target:", e.target);
  };

  // Get the specific style for this element
  const elementStyle = getTextElementStyle(elementId);

  const cancelEditing = useCallback(() => {
    console.log("Canceling edit");
    setIsEditing(false);
    setEditText("");
  }, []);

  const startEditing = useCallback(() => {
    console.log("=== STARTING EDIT MODE ===");
    console.log("Starting edit for element:", elementId);
    console.log("Current displayText:", displayText);

    // No need to save to history here - it will be saved when content changes

    // Force the element to be selected first
    if (selectedTextElement !== elementId) {
      console.log("Setting selected element to:", elementId);
      setSelectedTextElement(elementId);
    }

    console.log("Setting editing mode to true");
    setIsEditing(true);

    // Always use the most current content from store, not just displayText
    const currentContent = getTextElementContent(elementId) || displayText;
    setEditText(currentContent);
    console.log("Editing mode activated, text:", currentContent);

    // Focus on textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        console.log("Focusing textarea - SUCCESS");
        textareaRef.current.focus();
        textareaRef.current.select();
      } else {
        console.log("Textarea ref not found - FAILED");
      }
    }, 200);
    console.log("=== END STARTING EDIT MODE ===");
  }, [
    elementId,
    displayText,
    selectedTextElement,
    setSelectedTextElement,
    getTextElementContent,
  ]);

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
    // Show saved content or initial text
    const savedContent = getTextElementContent(elementId);
    const contentToShow = savedContent || initialText;
    if (displayText !== contentToShow && !isEditing) {
      setDisplayText(contentToShow);
    }
  }, [
    elementId,
    initialText,
    getTextElementContent,
    isEditing,
    textElementContents,
  ]);

  // Watch for changes in this element's content (for undo/redo)
  useEffect(() => {
    const currentContent = textElementContents[elementId];
    if (
      currentContent !== undefined &&
      currentContent !== displayText &&
      !isEditing
    ) {
      console.log(
        `Content changed for ${elementId}: "${displayText}" -> "${currentContent}"`
      );
      setDisplayText(currentContent);
    } else if (
      currentContent === undefined &&
      displayText !== initialText &&
      !isEditing
    ) {
      // Content was removed from store (undo to initial state), restore initial text
      console.log(
        `Content removed from store for ${elementId}, restoring initial text: "${initialText}"`
      );
      setDisplayText(initialText);
    }
  }, [textElementContents, elementId, displayText, isEditing, initialText]);

  // Update editText when displayText changes (important for undo/redo)
  useEffect(() => {
    if (!isEditing) {
      setEditText(displayText);
    }
  }, [displayText, isEditing]);

  // Cancel editing if another element is selected
  useEffect(() => {
    if (selectedTextElement !== elementId && isEditing) {
      console.log("Another element selected, canceling edit");
      cancelEditing();
    }
  }, [selectedTextElement, elementId, isEditing, cancelEditing]);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    console.log("=== SINGLE CLICK EVENT ===");
    console.log("Single click on element:", elementId);
    console.log("Event target:", e.target);
    console.log("Current target:", e.currentTarget);

    // Alternative double click detection
    setClickCount((prev) => prev + 1);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      console.log("Click count:", clickCount + 1);
      if (clickCount + 1 >= 2) {
        console.log("DETECTED DOUBLE CLICK via manual tracking!");
        startEditing();
      }
      setClickCount(0);
    }, 300); // 300ms window for double click

    // Don't prevent default or stop propagation for single clicks
    // e.stopPropagation(); // Removed this line

    // Just select the element, don't save to history here
    // History will be saved when making actual changes
    setSelectedTextElement(elementId);
    if (onClick) {
      onClick(e);
    }
    console.log("=== END SINGLE CLICK EVENT ===");
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    console.log("=== DOUBLE CLICK EVENT ===");
    console.log("Double click detected on element:", elementId);
    console.log("Event target:", e.target);
    console.log("Current target:", e.currentTarget);
    console.log("Is editing:", isEditing);
    console.log("Selected element:", selectedTextElement);

    e.stopPropagation();
    // Remove preventDefault to allow proper double click detection
    // e.preventDefault();

    // Clear any pending single click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setClickCount(0);

    startEditing();
    console.log("=== END DOUBLE CLICK EVENT ===");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log("Key pressed:", e.key, "Shift:", e.shiftKey);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Enter pressed without Shift, finishing edit");
      finishEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      console.log("Escape pressed, canceling edit");
      cancelEditing();
    }
    // Shift+Enter allows new lines
  };

  const handleBlur = () => {
    console.log("Textarea blur, finishing editing");
    finishEditing();
  };

  const finishEditing = () => {
    console.log("Finishing edit, saving text:", editText);
    setDisplayText(editText);

    // For first edit, we need to handle initial text properly
    const currentStoreContent = getTextElementContent(elementId);
    if (!currentStoreContent && initialText && editText !== initialText) {
      // This is the first time we're setting content, use initialText as previous value
      console.log(
        "First edit detected, using initialText as previous value:",
        initialText
      );
      addToHistory({
        type: "text_content",
        elementId,
        previousValue: initialText,
        newValue: editText,
        timestamp: Date.now(),
      });

      // Now set the content without triggering another history entry
      const state = usePresentationStore.getState();
      usePresentationStore.setState({
        textElementContents: {
          ...state.textElementContents,
          [elementId]: editText,
        },
      });
    } else {
      // Normal content update - will record history automatically
      setTextElementContent(elementId, editText);
    }

    setIsEditing(false);
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
      className={`cursor-pointer transition-all duration-200 ${className} `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      data-text-element={elementId}
      style={{
        fontSize: `${elementStyle.fontSize}px`,
        fontWeight: elementStyle.fontWeight,
        fontStyle: elementStyle.fontStyle || "normal",
        textDecoration: elementStyle.textDecoration || "none",
        textAlign: elementStyle.textAlign,
        color: elementStyle.color,
        position: "relative",
        width: "100%", // Fill parent width
        height: "100%", // Fill parent height
        minHeight: "1.2em",
        minWidth: "50px",
        pointerEvents: "auto",
        userSelect: "text",
        overflow: "hidden", // Prevent content overflow
        wordWrap: "break-word",
        overflowWrap: "break-word",
        ...props.style,
      }}
      {...props}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="absolute inset-0 w-full h-full resize-none outline-none bg-transparent"
          style={{
            fontSize: `${elementStyle.fontSize}px`,
            fontWeight: elementStyle.fontWeight,
            fontStyle: elementStyle.fontStyle || "normal",
            textAlign: elementStyle.textAlign,
            color: elementStyle.color,
            fontFamily: "inherit",
            lineHeight: "1.4",
            padding: "8px", // Adequate padding for text
            margin: "0",
            width: "100%",
            height: "100%",
            minHeight: "100%",
            maxWidth: "100%", // Prevent horizontal overflow
            maxHeight: "100%", // Prevent vertical overflow
            overflow: "hidden", // Hide scrollbars and prevent overflow
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap", // Preserve formatting but wrap text
            zIndex: 99999,
            pointerEvents: "auto",
            boxSizing: "border-box", // Include padding and border in dimensions
          }}
          autoFocus
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: "100%", // Ensure it takes full height
            lineHeight: "1.4",
            padding: "8px", // Match textarea padding
            margin: "0",
            overflow: "hidden", // Prevent content overflow
            wordWrap: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap", // Preserve formatting but wrap text
            boxSizing: "border-box", // Include padding in dimensions
          }}
          dangerouslySetInnerHTML={{ __html: formatText(displayText) }}
        />
      )}
    </div>
  );
};
