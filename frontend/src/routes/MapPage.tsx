import { MapPinned } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { ProvinceGeoJsonMap, type MapMarker } from "../components/map/ProvinceGeoJsonMap";

const EmbeddedModelViewer = lazy(() => import("./ModelViewerPage").then((module) => ({ default: module.ModelViewerPage })));

const thangLongCitadel: MapMarker = {
  id: "thang-long-citadel",
  name: "Hoàng thành Thăng Long",
  image: "/images/hoang-thanh-thang-long.webp",
  latitude: 21.039444,
  longitude: 105.837222,
  address: "19C Hoàng Diệu, phường Điện Biên, quận Ba Đình, Hà Nội"
};

const sealModel = {
  name: "Ấn Sắc mệnh chi bảo",
  path: "Ấn_Sắc_mệnh_chi_bảo-compressed.glb",
  url: "/models/%E1%BA%A4n_S%E1%BA%AFc_m%E1%BB%87nh_chi_b%E1%BA%A3o-compressed.glb",
  size: 7848516
};

export function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  return (
    <div className="heritage-surface -mt-[88px] min-h-screen pt-[88px]">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--heritage-line)] pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[var(--heritage-muted)]">
              <MapPinned size={15} strokeWidth={1.7} />
              Hành trình di sản
            </p>
            <h1 className="mt-2 font-serif text-4xl text-[var(--heritage-brown)] sm:text-5xl">
              Khám phá Việt Nam
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--heritage-muted)]">
              Khám phá không gian văn hóa và những dấu tích lịch sử trên bản đồ 34 tỉnh, thành Việt Nam.
            </p>
          </div>

          <p className="max-w-xs text-sm leading-6 text-[var(--heritage-muted)] sm:text-right">
            Di chuột để xem tên tỉnh thành, kéo để di chuyển và dùng nút điều khiển để phóng to bản đồ.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
          <div className="min-w-0">
            <ProvinceGeoJsonMap
              className="h-[620px] min-h-[620px] border border-[var(--heritage-line)] shadow-[0_20px_48px_rgba(45,40,32,0.14)]"
              markers={[thangLongCitadel]}
              activeMarkerId={selectedMarker?.id}
              onMarkerClick={setSelectedMarker}
            />
          </div>

          <div className="min-w-0">
            {selectedMarker ? (
              <Suspense fallback={<div className="h-[620px] animate-pulse rounded-lg bg-[var(--heritage-paper-deep)]" />}>
                <EmbeddedModelViewer embeddedModel={sealModel} />
              </Suspense>
            ) : (
              <div className="grid h-[620px] min-h-[620px] place-items-center overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper-deep)] p-8 text-center shadow-[0_20px_48px_rgba(45,40,32,0.14)]">
                <div className="max-w-sm">
                  <MapPinned className="mx-auto text-[var(--heritage-bronze)]" size={42} strokeWidth={1.4} />
                  <h2 className="mt-5 font-serif text-2xl text-[var(--heritage-brown)]">Chọn một địa điểm trên bản đồ</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--heritage-muted)]">
                    Bấm vào marker Hoàng thành Thăng Long để mở và tương tác với model Ấn Sắc mệnh chi bảo.
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
