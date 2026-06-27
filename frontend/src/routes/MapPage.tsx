import { MapPinned } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { ProvinceGeoJsonMap, type MapMarker } from "../components/map/ProvinceGeoJsonMap";
import type { GlbModel } from "../lib/types";

const EmbeddedModelViewer = lazy(() => import("./ModelViewerPage").then((module) => ({ default: module.ModelViewerPage })));

const thangLongCitadel: MapMarker = {
  id: "thang-long-citadel",
  name: "Hoàng thành Thăng Long",
  image: "/images/hoang-thanh-thang-long.webp",
  latitude: 21.039444,
  longitude: 105.837222,
  address: "19C Hoàng Diệu, phường Điện Biên, quận Ba Đình, Hà Nội"
};

const hoaKhiemPalace: MapMarker = {
  id: "hoa-khiem-palace",
  name: "Điện Hòa Khiêm – Lăng Tự Đức",
  image: "/images/lang-vua-tu-duc.webp",
  latitude: 16.4328,
  longitude: 107.5658,
  address: "Đường Đoàn Nhữ Hải, Thủy Xuân, Thành phố Huế, Thừa Thiên Huế"
};

const mapMarkers = [thangLongCitadel, hoaKhiemPalace];

const sealModel = {
  name: "Ấn Sắc mệnh chi bảo",
  path: "Ấn_Sắc_mệnh_chi_bảo-compressed.glb",
  url: "/models/%E1%BA%A4n_S%E1%BA%AFc_m%E1%BB%87nh_chi_b%E1%BA%A3o-compressed.glb",
  size: 7848516
};

const hoaKhiemModel = {
  name: "Lăng vua Tự Đức - khu Hòa Khiêm",
  path: "Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb",
  url: "/models/Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb",
  size: 20792420
};

const markerModels: Record<string, GlbModel> = {
  [thangLongCitadel.id]: sealModel,
  [hoaKhiemPalace.id]: hoaKhiemModel
};

export function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const selectedModel = selectedMarker ? markerModels[selectedMarker.id] : undefined;

  return (
    <div className="heritage-surface -mt-[88px] min-h-screen pt-[40px]">
      <section className="mx-auto max-w-[1600px] px-3 pb-12 pt-8 sm:px-4 sm:pt-10 lg:px-5">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--heritage-line)] pb-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-2 font-serif text-4xl text-[var(--heritage-brown)] sm:text-5xl">
              Khám phá Việt Nam
            </h1>
          </div>

        </div>

        <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
          <div className="min-w-0">
            <ProvinceGeoJsonMap
              className="h-[620px] min-h-[620px] border border-[var(--heritage-line)] shadow-[0_20px_48px_rgba(45,40,32,0.14)]"
              markers={mapMarkers}
              activeMarkerId={selectedMarker?.id}
              onMarkerClick={setSelectedMarker}
            />
          </div>

          <div className="min-w-0 self-stretch">
            {selectedModel ? (
              <Suspense fallback={<div className="h-full min-h-[620px] animate-pulse rounded-lg bg-[var(--heritage-paper-deep)]" />}>
                <EmbeddedModelViewer key={selectedModel.path} embeddedModel={selectedModel} />
              </Suspense>
            ) : (
              <div className="grid h-full min-h-[620px] place-items-center overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper-deep)] p-8 text-center shadow-[0_20px_48px_rgba(45,40,32,0.14)]">
                <div className="max-w-sm">
                  <MapPinned className="mx-auto text-[var(--heritage-bronze)]" size={42} strokeWidth={1.4} />
                  <h2 className="mt-5 font-serif text-2xl text-[var(--heritage-brown)]">Chọn một địa điểm trên bản đồ</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--heritage-muted)]">
                    Bấm vào một marker di sản để mở và tương tác với model 3D tương ứng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
