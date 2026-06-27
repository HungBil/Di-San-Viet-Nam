import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Shell } from "./components/layout/Shell";
import { ArtifactDetailPage } from "./routes/ArtifactDetailPage";
import { HomePage } from "./routes/HomePage";
import { LandmarkDetailPage } from "./routes/LandmarkDetailPage";
import { MapPage } from "./routes/MapPage";
import { SharePage } from "./routes/SharePage";
import { StoryPage } from "./routes/StoryPage";

const ModelViewerPage = lazy(() => import("./routes/ModelViewerPage").then((module) => ({ default: module.ModelViewerPage })));

export default function App() {
  return (
    <Shell>
      <Suspense fallback={<div className="p-8 text-sm text-ink/60">Đang tải...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/3d" element={<ModelViewerPage autoNarrateAnnotations />} />
          <Route path="/landmarks/:landmarkId" element={<LandmarkDetailPage />} />
          <Route path="/artifacts/:artifactId" element={<ArtifactDetailPage />} />
          <Route path="/stories/:storyId" element={<StoryPage />} />
          <Route path="/share/:shareId" element={<SharePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}

