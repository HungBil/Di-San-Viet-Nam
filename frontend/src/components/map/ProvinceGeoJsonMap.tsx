import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

type ProvinceMeta = {
  code: string;
  file: string;
  name: string;
};

type ProvinceFeature = {
  type: "Feature";
  geometry: unknown;
  properties?: Record<string, unknown>;
};

type LoadedProvince = ProvinceMeta & {
  feature: ProvinceFeature;
};

type Pan = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  clientX: number;
  clientY: number;
  pan: Pan;
};

type ProvinceGeoJsonMapProps = {
  activeMarkerId?: string | null;
  className?: string;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
};

export type MapMarker = {
  address?: string;
  description?: string;
  displayOffset?: {
    x: number;
    y: number;
  };
  id: string;
  image?: string;
  latitude: number;
  longitude: number;
  name: string;
};

const viewBoxWidth = 300;
const viewBoxHeight = 360;
const viewBoxCenterX = viewBoxWidth / 2;
const viewBoxCenterY = viewBoxHeight / 2;
const baseMapScaleX = 1.22;
const baseMapScaleY = 1.04;
const baseMapOffsetX = 36;
const minZoom = 1;
const maxZoom = 4;
const zoomStep = 0.4;

const provinces: ProvinceMeta[] = [
  { code: "1", file: "1_thu_đo_ha_noi.geojson", name: "Hà Nội" },
  { code: "2", file: "2_tinh_cao_bang.geojson", name: "Cao Bằng" },
  { code: "3", file: "3_tinh_tuyen_quang.geojson", name: "Tuyên Quang" },
  { code: "4", file: "4_tinh_lao_cai.geojson", name: "Lào Cai" },
  { code: "5", file: "5_tinh_đien_bien.geojson", name: "Điện Biên" },
  { code: "6", file: "6_tinh_lai_chau.geojson", name: "Lai Châu" },
  { code: "7", file: "7_tinh_son_la.geojson", name: "Sơn La" },
  { code: "8", file: "8_tinh_thai_nguyen.geojson", name: "Thái Nguyên" },
  { code: "9", file: "9_tinh_lang_son.geojson", name: "Lạng Sơn" },
  { code: "10", file: "10_tinh_quang_ninh.geojson", name: "Quảng Ninh" },
  { code: "11", file: "11_tinh_phu_tho.geojson", name: "Phú Thọ" },
  { code: "12", file: "12_tinh_bac_ninh.geojson", name: "Bắc Ninh" },
  { code: "13", file: "13_hai_phong.geojson", name: "Hải Phòng" },
  { code: "14", file: "14_tinh_hung_yen.geojson", name: "Hưng Yên" },
  { code: "15", file: "15_tinh_ninh_binh.geojson", name: "Ninh Bình" },
  { code: "16", file: "16_tinh_thanh_hoa.geojson", name: "Thanh Hóa" },
  { code: "17", file: "17_tinh_nghe_an.geojson", name: "Nghệ An" },
  { code: "18", file: "18_tinh_ha_tinh.geojson", name: "Hà Tĩnh" },
  { code: "19", file: "19_tinh_quang_tri.geojson", name: "Quảng Trị" },
  { code: "20", file: "20_hue.geojson", name: "Huế" },
  { code: "21", file: "21_đa_nang.geojson", name: "Đà Nẵng" },
  { code: "22", file: "22_tinh_quang_ngai.geojson", name: "Quảng Ngãi" },
  { code: "23", file: "23_tinh_khanh_hoa.geojson", name: "Khánh Hòa" },
  { code: "24", file: "24_tinh_gia_lai.geojson", name: "Gia Lai" },
  { code: "25", file: "25_tinh_đak_lak.geojson", name: "Đắk Lắk" },
  { code: "26", file: "26_tinh_lam_đong.geojson", name: "Lâm Đồng" },
  { code: "27", file: "27_tinh_tay_ninh.geojson", name: "Tây Ninh" },
  { code: "28", file: "28_tinh_đong_nai.geojson", name: "Đồng Nai" },
  { code: "29", file: "29_ho_chi_minh.geojson", name: "TP. Hồ Chí Minh" },
  { code: "30", file: "30_tinh_vinh_long.geojson", name: "Vĩnh Long" },
  { code: "31", file: "31_tinh_đong_thap.geojson", name: "Đồng Tháp" },
  { code: "32", file: "32_tinh_an_giang.geojson", name: "An Giang" },
  { code: "33", file: "33_can_tho.geojson", name: "Cần Thơ" },
  { code: "34", file: "34_tinh_ca_mau.geojson", name: "Cà Mau" }
];

const mapLegend = [
  { label: "Di tích lịch sử", color: "#9b7a3a" },
  { label: "Bảo tàng", color: "#776f62" },
  { label: "Danh lam thắng cảnh", color: "#b8aa8d" },
  { label: "Di sản văn hóa", color: "#6f5830" }
];

export function ProvinceGeoJsonMap({ activeMarkerId = null, className = "", markers = [], onMarkerClick }: ProvinceGeoJsonMapProps) {
  const [loadedProvinces, setLoadedProvinces] = useState<LoadedProvince[]>([]);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(minZoom);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<DragState | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProvinces() {
      const data = await Promise.all(
        provinces.map(async (province) => {
          const response = await fetch(`/geojson/provinces/${encodeURIComponent(province.file)}`, {
            signal: controller.signal
          });

          if (!response.ok) {
            throw new Error(`Cannot load ${province.file}`);
          }

          const collection = (await response.json()) as { features?: ProvinceFeature[] };
          const feature = collection.features?.[0];

          if (!feature) {
            throw new Error(`Missing province geometry in ${province.file}`);
          }

          return {
            ...province,
            feature: {
              ...feature,
              properties: {
                ...feature.properties,
                matinh: province.code,
                name: province.name
              }
            }
          };
        })
      );

      setLoadedProvinces(data);
    }

    loadProvinces().catch((currentError) => {
      if (!controller.signal.aborted) {
        setError(currentError instanceof Error ? currentError.message : "Cannot load province GeoJSON");
      }
    });

    return () => controller.abort();
  }, []);

  const renderedMap = useMemo(() => {
    if (loadedProvinces.length === 0) return { paths: [], projectedMarkers: [] };

    const collection = {
      type: "FeatureCollection",
      features: loadedProvinces.map((province) => province.feature)
    } as GeoPermissibleObjects;

    const projection = geoMercator().fitExtent(
      [
        [6, 6],
        [294, 354]
      ],
      collection
    );
    const path = geoPath(projection);

    return {
      paths: loadedProvinces.map((province) => ({
        ...province,
        path: path(province.feature as GeoPermissibleObjects) ?? ""
      })),
      projectedMarkers: markers.flatMap((marker) => {
        const point = projection([marker.longitude, marker.latitude]);
        return point
          ? [
              {
                ...marker,
                x: point[0],
                y: point[1],
                displayX: point[0] + (marker.displayOffset?.x ?? 0),
                displayY: point[1] + (marker.displayOffset?.y ?? 0)
              }
            ]
          : [];
      })
    };
  }, [loadedProvinces, markers]);

  const { paths, projectedMarkers } = renderedMap;

  const activeProvince = paths.find((province) => province.code === activeCode);
  const hoveredMarker = projectedMarkers.find((marker) => marker.id === hoveredMarkerId);
  const markerTooltipPosition = hoveredMarker
    ? {
        left: `${((viewBoxCenterX + zoom * baseMapScaleX * (hoveredMarker.displayX - viewBoxCenterX) + pan.x + baseMapOffsetX) / viewBoxWidth) * 100}%`,
        top: `${((viewBoxCenterY + zoom * baseMapScaleY * (hoveredMarker.displayY - viewBoxCenterY) + pan.y) / viewBoxHeight) * 100}%`
      }
    : null;

  function clampPan(nextPan: Pan, nextZoom = zoom) {
    if (nextZoom <= minZoom) return { x: 0, y: 0 };

    const maxX = (viewBoxWidth * (nextZoom - 1)) / 2;
    const maxY = (viewBoxHeight * (nextZoom - 1)) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, nextPan.x)),
      y: Math.max(-maxY, Math.min(maxY, nextPan.y))
    };
  }

  function zoomBy(delta: number) {
    setZoom((currentZoom) => {
      const nextZoom = Math.max(minZoom, Math.min(maxZoom, Number((currentZoom + delta).toFixed(2))));

      setPan((currentPan) => clampPan(currentPan, nextZoom));

      return nextZoom;
    });
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      pan
    };
    setIsDragging(true);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const currentDrag = dragState.current;
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - currentDrag.clientX) / bounds.width) * viewBoxWidth;
    const deltaY = ((event.clientY - currentDrag.clientY) / bounds.height) * viewBoxHeight;

    setPan(clampPan({ x: currentDrag.pan.x + deltaX, y: currentDrag.pan.y + deltaY }));
  }

  function onPointerEnd(event: PointerEvent<SVGSVGElement>) {
    if (dragState.current?.pointerId !== event.pointerId) return;

    dragState.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const mapContent = error ? (
    <div className="grid h-full place-items-center px-5 text-center text-sm leading-6 text-[var(--heritage-muted)]">
      Không tải được GeoJSON tỉnh/thành.
    </div>
  ) : paths.length === 0 ? (
    <div className="h-full p-4">
      <div className="h-full animate-pulse rounded-lg bg-white/18" />
    </div>
  ) : (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-x-6 top-5 h-20 rounded-full bg-white/35 blur-2xl" />
      <svg
        className={isDragging ? "relative h-full w-full cursor-grabbing select-none touch-none" : "relative h-full w-full cursor-grab select-none touch-none"}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        role="img"
        aria-label="Bản đồ Việt Nam gồm 34 tỉnh thành sau sáp nhập"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
      >
        <g transform={`translate(${pan.x + baseMapOffsetX} ${pan.y})`}>
          <g transform={`translate(${viewBoxCenterX} ${viewBoxCenterY}) scale(${zoom}) scale(${baseMapScaleX} ${baseMapScaleY}) translate(${-viewBoxCenterX} ${-viewBoxCenterY})`}>
            {paths.map((province) => {
              const isActive = province.code === activeCode;

              return (
                <path
                  key={province.code}
                  d={province.path}
                  fill="#ffffff"
                  stroke={isActive ? "#4b5563" : "#9ca3af"}
                  strokeWidth={isActive ? 1.1 : 0.65}
                  vectorEffect="non-scaling-stroke"
                  className="cursor-pointer transition duration-150 outline-none hover:brightness-95 focus:brightness-95"
                  tabIndex={0}
                  onMouseEnter={() => setActiveCode(province.code)}
                  onMouseLeave={() => setActiveCode(null)}
                  onFocus={() => setActiveCode(province.code)}
                  onBlur={() => setActiveCode(null)}
                >
                  <title>{province.name}</title>
                </path>
              );
            })}
            {projectedMarkers.map((marker) => {
              const hasDisplayOffset = marker.x !== marker.displayX || marker.y !== marker.displayY;

              return hasDisplayOffset ? (
                <g key={`${marker.id}-anchor`} className="pointer-events-none">
                  <line
                    x1={marker.x}
                    y1={marker.y}
                    x2={marker.displayX}
                    y2={marker.displayY}
                    stroke="#6f5830"
                    strokeDasharray="1.6 1.6"
                    strokeLinecap="round"
                    strokeWidth={0.75}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={1.7}
                    fill="#fffaf0"
                    stroke="#6f5830"
                    strokeWidth={0.9}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ) : null;
            })}
            {projectedMarkers.map((marker) => {
              const isActive = marker.id === activeMarkerId;

              return (
                <g
                  key={marker.id}
                  className="cursor-pointer outline-none"
                  transform={`translate(${marker.displayX} ${marker.displayY})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${marker.name}. ${marker.address ?? ""}`}
                  onMouseEnter={() => setHoveredMarkerId(marker.id)}
                  onMouseLeave={() => setHoveredMarkerId(null)}
                  onFocus={() => setHoveredMarkerId(marker.id)}
                  onBlur={() => setHoveredMarkerId(null)}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onMarkerClick?.(marker);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onMarkerClick?.(marker);
                    }
                  }}
                >
                  <circle r={isActive ? 8 : 7} fill="rgba(155,122,58,0.22)" stroke="none" className="animate-pulse" />
                  <circle r={isActive ? 4.2 : 3.6} fill={isActive ? "#6f5830" : "#9b7a3a"} stroke="#fffaf0" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                  <title>{marker.name}</title>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      {hoveredMarker && markerTooltipPosition ? (
        <div
          className="pointer-events-none absolute z-20 grid w-72 -translate-y-1/2 grid-cols-[92px_1fr] overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper-light)] text-left shadow-[0_16px_36px_rgba(45,40,32,0.24)]"
          style={{ left: `calc(${markerTooltipPosition.left} + 12px)`, top: markerTooltipPosition.top }}
          role="tooltip"
        >
          {hoveredMarker.image ? (
            <img className="heritage-image h-full min-h-24 w-full object-cover" src={hoveredMarker.image} alt="" />
          ) : (
            <div className="bg-[var(--heritage-paper-deep)]" />
          )}
          <div className="min-w-0 p-3">
            <p className="font-serif text-sm leading-5 text-[var(--heritage-brown)]">{hoveredMarker.name}</p>
            {hoveredMarker.address ? <p className="mt-1 text-[11px] leading-4 text-[var(--heritage-muted)]">{hoveredMarker.address}</p> : null}
            {hoveredMarker.description ? <p className="mt-1 line-clamp-3 text-[10px] leading-4 text-[var(--heritage-muted)]">{hoveredMarker.description}</p> : null}
            <p className="mt-1.5 text-[10px] text-[var(--heritage-muted)]">
              {hoveredMarker.latitude.toFixed(6)}°B · {hoveredMarker.longitude.toFixed(6)}°Đ
            </p>
          </div>
        </div>
      ) : null}
      <div className="absolute right-3 top-3 grid gap-2">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd5d1] bg-white text-[#24383c] shadow-sm transition hover:bg-[#f4f7f5] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => zoomBy(zoomStep)}
          disabled={zoom >= maxZoom}
          aria-label="Phóng to bản đồ"
          title="Phóng to"
        >
          <ZoomIn size={18} />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd5d1] bg-white text-[#24383c] shadow-sm transition hover:bg-[#f4f7f5] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => zoomBy(-zoomStep)}
          disabled={zoom <= minZoom}
          aria-label="Thu nhỏ bản đồ"
          title="Thu nhỏ"
        >
          <ZoomOut size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative h-72 min-h-72 overflow-hidden rounded-lg bg-[#D8C7A5]/95 text-[var(--heritage-ink)] lg:h-[100%] lg:min-h-0 ${className}`}>
      {mapContent}

      <div className="pointer-events-none absolute left-5 top-5">
        <p className="text-xs uppercase tracking-normal text-[var(--heritage-muted)]">34 tỉnh/thành</p>
        <h2 className="mt-1 font-serif text-3xl text-[var(--heritage-brown)]">Theo bản đồ</h2>
        {activeProvince ? <p className="mt-1 text-sm font-semibold text-[var(--heritage-muted)]">{activeProvince.name}</p> : null}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-5 grid gap-2 text-xs text-[var(--heritage-muted)]">
        {mapLegend.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
