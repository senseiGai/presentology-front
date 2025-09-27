"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/shared/ui";
import { PresentationGenerationBlock } from "@/widgets/PresentationGenerationBlock/ui/PresentationGenerationBlock";

interface PresentationEditorPageProps {
  params: {
    slug: string;
  };
}

function PresentationEditorPage() {
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    // Сохраняем slug в localStorage для использования в компонентах
    if (slug) {
      localStorage.setItem("currentPresentationSlug", slug);
      console.log("🔗 Set currentPresentationSlug to:", slug);
    }
  }, [slug]);

  console.log("📋 PresentationEditorPage rendering with slug:", slug);

  return (
    <MainLayout fullWidth>
      <PresentationGenerationBlock presentationSlug={slug} />
    </MainLayout>
  );
}

export default PresentationEditorPage;
