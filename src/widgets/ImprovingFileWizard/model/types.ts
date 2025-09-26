export type PresentationCreationStep = "file-upload" | "description" | "style";

export interface ExtractedFile {
  name: string;
  type: string;
  size: number;
  text: string;
}

export interface BriefData {
  topic: string;
  goal: string;
  audience: string;
  keyIdea: string;
  expectedAction: string;
}

export interface StructureData {
  hasStructure: boolean;
  slideCount: number;
  slides: Array<{
    title: string;
    summary: string;
  }>;
}

export interface PresentationData {
  // File upload step
  uploadedFiles?: File[];
  extractedFiles?: ExtractedFile[];
  brief?: BriefData;
  structure?: StructureData;

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
