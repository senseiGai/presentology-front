"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/shared/ui";
import { PresentationGenerationBlock } from "@/widgets/PresentationGenerationBlock/ui/PresentationGenerationBlock";

interface PresentationPageProps {
  params: {
    slug: string;
  };
}

function PresentationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  useEffect(() => {
    // Сохраняем slug в localStorage для использования в компонентах
    if (slug) {
      localStorage.setItem("currentPresentationSlug", slug);
    }
  }, [slug]);

  return (
    <MainLayout fullWidth>
      <PresentationGenerationBlock presentationSlug={slug} />
    </MainLayout>
  );
}

export default PresentationPage;
