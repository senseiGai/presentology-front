import React, { useState } from "react";
import {
  SlideTemplateParser,
  type SlideTemplateParserProps,
} from "./SlideTemplateParser";
import {
  ParsedSlideRenderer,
  type ParsedSlideRendererProps,
} from "./ParsedSlideRenderer";
import { type ParsedPage } from "./HTMLTemplateParser";

export interface IntegratedSlideParserProps {
  slideNumber: number;
  slideType?: "title" | "content" | "default";
  className?: string;
}

export const IntegratedSlideParser: React.FC<IntegratedSlideParserProps> = ({
  slideNumber,
  slideType,
  className,
}) => {
  const [parsedPages, setParsedPages] = useState<ParsedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleParsed = (pages: ParsedPage[]) => {
    console.log(
      `🎯 IntegratedSlideParser: Received ${pages.length} parsed pages for slide ${slideNumber}`
    );
    setParsedPages(pages);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className={`integrated-slide-parser-loading ${className || ""}`}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
          }}
        >
          <div>Loading slide {slideNumber}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`integrated-slide-parser ${className || ""}`}>
      <SlideTemplateParser
        slideNumber={slideNumber}
        slideType={slideType}
        onParsed={handleParsed}
      />
      {parsedPages.length > 0 && (
        <ParsedSlideRenderer
          pages={parsedPages}
          slideNumber={slideNumber}
          className="parsed-slide-content"
        />
      )}
    </div>
  );
};

export default IntegratedSlideParser;
