import { MainLayout } from "@/shared/ui";
import { DesignFromText } from "@/features/DesignFromText";

function DesignFromTextPage() {
  return (
    <MainLayout fullWidth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <DesignFromText />
        </div>
      </div>
    </MainLayout>
  );
}

export default DesignFromTextPage;
