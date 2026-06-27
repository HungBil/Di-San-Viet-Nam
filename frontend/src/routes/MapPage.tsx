import { Copy, MapPinned, Share2, X } from "lucide-react";
import { ChangeEvent, lazy, Suspense, useMemo, useState } from "react";
import {
  ProvinceGeoJsonMap,
  type MapMarker,
} from "../components/map/ProvinceGeoJsonMap";
import type { GlbModel } from "../lib/types";

const EmbeddedModelViewer = lazy(() =>
  import("./ModelViewerPage").then((module) => ({
    default: module.ModelViewerPage,
  })),
);

const thangLongCitadel: MapMarker = {
  id: "thang-long-citadel",
  name: "Hoàng thành Thăng Long",
  image: "/images/hoang-thanh-thang-long.webp",
  latitude: 21.039444,
  longitude: 105.837222,
  address: "19C Hoàng Diệu, phường Điện Biên, quận Ba Đình, Hà Nội",
};

const onePillarPagoda: MapMarker = {
  id: "one-pillar-pagoda",
  name: "Chùa Một Cột (Liên Hoa Đài)",
  image: "/images/chua-mot-cot.webp",
  latitude: 21.03583,
  longitude: 105.833622,
  address:
    "Phố Chùa Một Cột, phường Đội Cấn, quận Ba Đình, Hà Nội",
  displayOffset: {
    x: -3,
    y: 2.5,
  },
};

const hoaKhiemPalace: MapMarker = {
  id: "hoa-khiem-palace",
  name: "Điện Hòa Khiêm – Lăng Tự Đức",
  image: "/images/lang-vua-tu-duc.webp",
  latitude: 16.4328,
  longitude: 107.5658,
  address: "Đường Đoàn Nhữ Hải, Thủy Xuân, Thành phố Huế, Thừa Thiên Huế",
};

const independencePalace: MapMarker = {
  id: "independence-palace",
  name: "Dinh Độc Lập",
  image: "/images/dinh-doc-lap.webp",
  latitude: 10.777108,
  longitude: 106.695441,
  address:
    "135 Nam Kỳ Khởi Nghĩa, phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
};

const mapMarkers = [
  thangLongCitadel,
  onePillarPagoda,
  hoaKhiemPalace,
  independencePalace,
];

const sealModel = {
  name: "Ấn Sắc mệnh chi bảo",
  path: "Ấn_Sắc_mệnh_chi_bảo-compressed.glb",
  url: "/models/%E1%BA%A4n_S%E1%BA%AFc_m%E1%BB%87nh_chi_b%E1%BA%A3o-compressed.glb",
  size: 7848516,
};

const hoaKhiemModel = {
  name: "Lăng vua Tự Đức - khu Hòa Khiêm",
  path: "Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb",
  url: "/models/Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb",
  size: 20792420,
};

const onePillarPagodaModel = {
  name: "Chùa Một Cột",
  path: "one-pillar-pagoda-chua-mot-cot-compressed.glb",
  url: "/models/one-pillar-pagoda-chua-mot-cot-compressed.glb",
  size: 2991400,
};

const tank843Model = {
  name: "Xe tăng 843",
  path: "tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb",
  url: "/models/tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb",
  size: 6058444,
};

const markerModels: Record<string, GlbModel> = {
  [thangLongCitadel.id]: sealModel,
  [onePillarPagoda.id]: onePillarPagodaModel,
  [hoaKhiemPalace.id]: hoaKhiemModel,
  [independencePalace.id]: tank843Model,
};

export function MapPage() {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(() => {
    const markerId = new URLSearchParams(window.location.search).get("marker");
    return mapMarkers.find((marker) => marker.id === markerId) ?? null;
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [shareName, setShareName] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareAvatar, setShareAvatar] = useState("");
  const [shareLink, setShareLink] = useState("");
  const selectedModel = selectedMarker
    ? markerModels[selectedMarker.id]
    : undefined;
  const shareSummary = selectedMarker
    ? `${selectedMarker.name} - ${selectedMarker.address}`
    : "Chọn một địa điểm trên bản đồ để chia sẻ.";
  const canShare = Boolean(selectedMarker);
  const shareUrl = useMemo(() => {
    if (!selectedMarker) return "";
    const params = new URLSearchParams({
      name: shareName.trim() || "Khách tham quan",
      message:
        shareMessage.trim() ||
        "Mình vừa khám phá hiện vật và không gian 3D này trên Di Sản Việt.",
      avatar: shareAvatar,
      title: selectedMarker.name,
      summary: shareSummary,
      marker: selectedMarker.id,
    });
    return `${window.location.origin}/share/card?${params.toString()}`;
  }, [selectedMarker, shareAvatar, shareMessage, shareName, shareSummary]);

  function createShareLink() {
    if (!shareUrl) return;
    setShareLink(shareUrl);
    void navigator.clipboard?.writeText(shareUrl).catch(() => undefined);
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    resizeAvatar(file).then(setShareAvatar).catch(() => setShareAvatar(""));
  }

  return (
    <div className="heritage-surface -mt-[88px] min-h-screen pt-[40px]">
      <section className="mx-auto max-w-[1600px] px-3 pb-12 pt-8 sm:px-4 sm:pt-10 lg:px-5">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[var(--heritage-line)] pb-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-2 font-serif text-4xl text-[var(--heritage-brown)] sm:text-5xl">
              Khám phá Việt Nam
            </h1>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded bg-[var(--heritage-brown)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--heritage-bronze)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canShare}
            onClick={() => setShareOpen(true)}
            title={canShare ? "Chia sẻ địa điểm đang chọn" : "Chọn một marker trước"}
          >
            <Share2 size={17} />
            Chia sẻ
          </button>
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
              <Suspense
                fallback={
                  <div className="h-full min-h-[620px] animate-pulse rounded-lg bg-[var(--heritage-paper-deep)]" />
                }
              >
                <EmbeddedModelViewer
                  key={selectedModel.path}
                  embeddedModel={selectedModel}
                />
              </Suspense>
            ) : (
              <div className="grid h-full min-h-[620px] place-items-center overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper-deep)] p-8 text-center shadow-[0_20px_48px_rgba(45,40,32,0.14)]">
                <div className="max-w-sm">
                  <MapPinned
                    className="mx-auto text-[var(--heritage-bronze)]"
                    size={42}
                    strokeWidth={1.4}
                  />
                  <h2 className="mt-5 font-serif text-2xl text-[var(--heritage-brown)]">
                    Chọn một địa điểm trên bản đồ
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--heritage-muted)]">
                    Bấm vào một marker di sản để mở và tương tác với model 3D
                    tương ứng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {shareOpen && selectedMarker ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper)] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between border-b border-[var(--heritage-line)] px-5 py-4">
              <h2 className="font-serif text-2xl text-[var(--heritage-brown)]">
                Chia sẻ trải nghiệm
              </h2>
              <button
                className="grid h-9 w-9 place-items-center rounded bg-white text-[var(--heritage-brown)]"
                onClick={() => setShareOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[320px_1fr]">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-[var(--heritage-brown)]">
                  Tên của bạn
                  <input
                    className="mt-2 w-full rounded border border-[var(--heritage-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--heritage-bronze)]"
                    value={shareName}
                    onChange={(event) => setShareName(event.target.value)}
                    placeholder="Ví dụ: Cô Lan"
                  />
                </label>
                <label className="block text-sm font-semibold text-[var(--heritage-brown)]">
                  Avatar
                  <input
                    className="mt-2 w-full text-sm text-[var(--heritage-muted)]"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                <label className="block text-sm font-semibold text-[var(--heritage-brown)]">
                  Nội dung chia sẻ
                  <textarea
                    className="mt-2 min-h-32 w-full resize-none rounded border border-[var(--heritage-line)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--heritage-bronze)]"
                    value={shareMessage}
                    onChange={(event) => setShareMessage(event.target.value)}
                    placeholder="Bạn muốn nói gì về địa điểm/hiện vật này?"
                  />
                </label>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--heritage-brown)] px-4 py-3 text-sm font-semibold text-white"
                  onClick={createShareLink}
                >
                  <Copy size={16} />
                  Tạo link chia sẻ
                </button>
                {shareLink ? (
                  <input
                    className="w-full rounded border border-[var(--heritage-line)] bg-white px-3 py-2 text-xs text-[var(--heritage-muted)]"
                    readOnly
                    value={shareLink}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                ) : null}
              </div>

              <ShareCard
                avatar={shareAvatar}
                name={shareName || "Khách tham quan"}
                message={
                  shareMessage ||
                  "Mình vừa khám phá hiện vật và không gian 3D này trên Di Sản Việt."
                }
                summary={shareSummary}
                title={selectedMarker.name}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShareCard({
  avatar,
  message,
  name,
  summary,
  title,
}: {
  avatar: string;
  message: string;
  name: string;
  summary: string;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--heritage-line)] bg-[#fff8eb] p-6 shadow-[0_18px_50px_rgba(111,86,45,0.14)]">
      <p className="font-serif text-4xl text-[var(--heritage-bronze)]">”</p>
      <p className="mt-4 font-serif text-2xl leading-9 text-[var(--heritage-brown)]">
        {message}
      </p>
      <div className="mt-8 flex items-center gap-4">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-[var(--heritage-paper-deep)]">
          {avatar ? (
            <img className="h-full w-full object-cover" src={avatar} alt="" />
          ) : null}
        </div>
        <div>
          <p className="font-semibold text-[var(--heritage-brown)]">{name}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--heritage-muted)]">
            {title}
          </p>
          <p className="mt-1 text-xs text-[var(--heritage-muted)]">{summary}</p>
        </div>
      </div>
    </article>
  );
}

function resizeAvatar(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 96;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Không thể đọc ảnh"));
        const size = Math.min(image.width, image.height);
        context.drawImage(
          image,
          (image.width - size) / 2,
          (image.height - size) / 2,
          size,
          size,
          0,
          0,
          96,
          96,
        );
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.onerror = reject;
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
