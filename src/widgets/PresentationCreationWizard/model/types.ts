export type PresentationCreationStep = "description" | "structure" | "style";

export interface PresentationData {
  // Description step
  topic: string;
  goal: string;
  audience: string;
  context?: string;
  materials?: string[];

  // Structure step
  slideCount: number;
  textVolume: "minimal" | "medium" | "large";
  imageSource: "flux" | "internet" | "mixed";
  addedSlides?: Array<{
    title: string;
    description: string;
  }>;

  // Style step
  selectedTemplate?: string;
  selectedStyle?: "modern" | "corporate" | "creative";
}

export interface GoalOption {
  id: string;
  label: string;
  description?: string;
}

export interface AudienceOption {
  id: string;
  label: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  preview: string;
  style: "modern" | "corporate" | "creative";
}
