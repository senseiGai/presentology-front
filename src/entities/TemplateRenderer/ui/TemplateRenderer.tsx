"use client";

import React from "react";

export interface TemplateRendererProps {
  html: string;
  templateId: string;
  className?: string;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  html,
  templateId,
  className = "",
}) => {
  return (
    <div
      className={`template-renderer ${className}`}
      data-template-id={templateId}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
};
