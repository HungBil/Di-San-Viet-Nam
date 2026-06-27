import { Box, Maximize2, RotateCcw, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GlbModel } from "../lib/types";

type LoadStatus = "idle" | "loading" | "ready" | "error";
type Annotation = {
  id: number;
  title: string;
  body: string;
  position: Vector3;
};

const sealModelPath = "Ấn_Sắc_mệnh_chi_bảo-compressed.glb";
const hoaKhiemModelPath =
  "Hoa_Khiem_Temple_-_Tomb_of_Emperor_Tu_Duc_compressed.glb";
const modelTitles: Record<string, string> = {
  [sealModelPath]: "Ấn Sắc mệnh chi bảo",
  [hoaKhiemModelPath]: "Lăng vua Tự Đức - khu Hòa Khiêm",
  "one-pillar-pagoda-chua-mot-cot-compressed.glb": "Chùa Một Cột",
  "tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb": "Xe tăng 843",
};

const localModels: GlbModel[] = [
  {
    name: "Ấn Sắc mệnh chi bảo",
    path: sealModelPath,
    url: `/models/${encodeURIComponent(sealModelPath)}`,
    size: 7848516,
  },
  {
    name: "Lăng vua Tự Đức - khu Hòa Khiêm",
    path: hoaKhiemModelPath,
    url: `/models/${encodeURIComponent(hoaKhiemModelPath)}`,
    size: 20792420,
  },
  {
    name: "Chùa Một Cột",
    path: "one-pillar-pagoda-chua-mot-cot-compressed.glb",
    url: "/models/one-pillar-pagoda-chua-mot-cot-compressed.glb",
    size: 2991400,
  },
  {
    name: "Xe tăng 843",
    path: "tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb",
    url: "/models/tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb",
    size: 6058444,
  },
];

const modelCameraPresets: Record<string, { direction: Vector3; zoom: number; targetOffset?: Vector3 }> = {
  [hoaKhiemModelPath]: { direction: new Vector3(0.25, 0.44, 1.18), zoom: 0.28 },
  [sealModelPath]: { direction: new Vector3(0, 0.42, 1), zoom: 1.02 },
  "one-pillar-pagoda-chua-mot-cot-compressed.glb": { direction: new Vector3(0, 0.3, 1), zoom: 0.68 },
  "tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb": { direction: new Vector3(0, -1, 0.24), zoom: 0.68, targetOffset: new Vector3(0.16, 0, 0.04) },
};

const brighterModelPaths = new Set([
  "one-pillar-pagoda-chua-mot-cot-compressed.glb",
  "tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb",
]);

type ModelViewerPageProps = {
  embeddedModel?: GlbModel;
};

const annotationSets: Record<string, Annotation[]> = {
  [sealModelPath]: [
    {
      id: 1,
      title: "Mặt ấn",
      body: "Hình vuông, đúc nổi 4 chữ Hán kiểu chữ Triện. Chữ đọc từ trên xuống dưới, từ phải qua trái là Sắc mệnh chi bảo.",
      position: new Vector3(-0.1228, -0.2089, -0.8014),
    },
    {
      id: 2,
      title: "Quai ấn",
      body: "Quai ấn tạo hình rồng cuộn, đầu vươn về phía trước, hai sừng dài, đuôi xòe thành nhiều dải.",
      position: new Vector3(-0.0073, 0.0109, -0.8839),
    },
    {
      id: 3,
      title: "Dòng lạc khoản bên trái",
      body: "Dòng ghi trọng lượng và chất liệu của bảo ấn.",
      position: new Vector3(-0.168, -0.0919, -1.0241),
    },
    {
      id: 4,
      title: "Dòng lạc khoản bên phải",
      body: "Dòng ghi niên đại đúc ấn thời Minh Mệnh.",
      position: new Vector3(0.1496, -0.1596, -0.8073),
    },
  ],
  [hoaKhiemModelPath]: [
    {
      id: 1,
      title: "Xung Khiêm Tạ",
      body: "Công trình nằm bên hồ Lưu Khiêm, là nơi vua Tự Đức ngắm cảnh, hóng mát và làm thơ.",
      position: new Vector3(12.8239, -21.5856, -34.5832),
    },
    {
      id: 2,
      title: "Khiêm Cung Môn",
      body: "Cổng dẫn vào sân trước Hòa Khiêm Điện.",
      position: new Vector3(0, 5, -103),
    },
    {
      id: 3,
      title: "Hòa Khiêm Điện",
      body: "Công trình trung tâm trong khu tẩm điện, sau dùng làm nơi thờ phụng.",
      position: new Vector3(7.6373, 27.7562, -140.8787),
    },
  ],
};

export function ModelViewerPage({ embeddedModel }: ModelViewerPageProps = {}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const ambientLightRef = useRef<AmbientLight | null>(null);
  const keyLightRef = useRef<DirectionalLight | null>(null);
  const modelRef = useRef<Object3D | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const annotationsRef = useRef<Annotation[]>([]);

  const models = embeddedModel ? [embeddedModel] : localModels;
  const initialModel = getInitialModel(models);
  const [selectedUrl, setSelectedUrl] = useState(initialModel?.url ?? "");
  const [selectedName, setSelectedName] = useState(
    initialModel ? (modelTitles[initialModel.path] ?? initialModel.name) : "",
  );
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(
    null,
  );
  const [annotationPoints, setAnnotationPoints] = useState<
    { annotation: Annotation; left: number; top: number; visible: boolean }[]
  >([]);
  const selectedPath = useMemo(
    () => models.find((model) => model.url === selectedUrl)?.path,
    [models, selectedUrl],
  );
  const annotations =
    status === "ready" && annotationSets[selectedPath ?? ""]
      ? annotationPoints
      : [];
  const activePoint = annotations.find(
    (point) => point.annotation.id === activeAnnotation?.id,
  );

  useEffect(() => {
    annotationsRef.current = annotationSets[selectedPath ?? ""] ?? [];
    if (annotationsRef.current.length === 0) {
      setActiveAnnotation(null);
      setAnnotationPoints([]);
    }
  }, [selectedPath]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const container = mount;

    const scene = new Scene();
    const ambientLight = new AmbientLight("#ffffff", 1.8);
    scene.add(ambientLight);

    const keyLight = new DirectionalLight("#ffffff", 2.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
    camera.position.set(3, 2, 4);

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = "srgb";
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;
    ambientLightRef.current = ambientLight;
    keyLightRef.current = keyLight;

    function resize() {
      camera.aspect =
        container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    let lastAnnotationUpdate = 0;
    function animate(now = 0) {
      controls.update();
      renderer.render(scene, camera);
      if (now - lastAnnotationUpdate > 100) {
        lastAnnotationUpdate = now;
        if (annotationsRef.current.length > 0)
          setAnnotationPoints(
            projectAnnotations(annotationsRef.current, camera, container),
          );
      }
      requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      objectUrlRef.current && URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedUrl || !sceneRef.current) return;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    let cancelled = false;
    if (modelRef.current) {
      disposeModel(modelRef.current);
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    setActiveAnnotation(null);
    setAnnotationPoints([]);
    setModelLighting(selectedPath, ambientLightRef.current, keyLightRef.current);
    setStatus("loading");
    setProgress(0);
    setError("");

    loader.load(
      selectedUrl,
      (gltf) => {
        if (cancelled) return;
        modelRef.current = gltf.scene;
        sceneRef.current?.add(gltf.scene);
        frameModel(
          gltf.scene,
          cameraRef.current,
          controlsRef.current,
          selectedPath,
        );
        setStatus("ready");
      },
      (event) => {
        if (event.total)
          setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => {
        if (cancelled) return;
        setStatus("error");
        setError("Không tải được file GLB này.");
      },
    );

    return () => {
      cancelled = true;
      dracoLoader.dispose();
    };
  }, [selectedUrl]);

  function chooseModel(model: GlbModel) {
    objectUrlRef.current && URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setSelectedUrl(model.url);
    setSelectedName(modelTitles[model.path] ?? model.name);
  }

  function chooseLocalFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    objectUrlRef.current && URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setSelectedUrl(objectUrlRef.current);
    setSelectedName(file.name.replace(/\.glb$/i, ""));
  }

  function openAnnotation(annotation: Annotation) {
    setActiveAnnotation(annotation);
    focusAnnotation(
      annotation,
      modelRef.current,
      cameraRef.current,
      controlsRef.current,
    );
  }

  return (
    <section
      className={
        embeddedModel ? "h-full" : "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      }
    >
      <div
        className={
          embeddedModel
            ? "hidden"
            : "mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-end"
        }
      >
        <div>
          <h1 className="text-3xl font-semibold">Bảo tàng 3D</h1>
          <p className="mt-2 text-sm text-ink/65">
            Đặt file .glb vào frontend/public/models, rồi sửa marker trong
            ModelViewerPage.tsx.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded bg-[#102832] px-4 py-2 text-sm font-semibold text-white">
          <Upload size={16} />
          Mở GLB từ máy
          <input
            className="sr-only"
            type="file"
            accept=".glb,model/gltf-binary"
            onChange={chooseLocalFile}
          />
        </label>
      </div>

      <div
        className={
          embeddedModel
            ? "h-full min-h-[620px] overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft"
            : "grid min-h-[680px] overflow-hidden rounded border border-ink/10 bg-white shadow-soft lg:grid-cols-[320px_1fr]"
        }
      >
        <aside
          className={
            embeddedModel
              ? "hidden"
              : "border-b border-ink/10 bg-paper p-4 lg:border-b-0 lg:border-r"
          }
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Box size={18} />
            File GLB
          </div>
          <div className="space-y-2">
            {models.length === 0 && (
              <p className="text-sm text-ink/60">
                Chưa có file .glb trong frontend/public/models.
              </p>
            )}
            {models.map((model) => (
              <button
                key={model.path}
                className={[
                  "w-full rounded border px-3 py-2 text-left text-sm transition",
                  selectedPath === model.path
                    ? "border-gold bg-gold/20"
                    : "border-ink/10 bg-white hover:border-gold/50",
                ].join(" ")}
                onClick={() => chooseModel(model)}
              >
                <span className="block font-semibold">
                  {modelTitles[model.path] ?? model.name}
                </span>
                <span className="mt-1 block truncate text-xs text-ink/55">
                  {formatBytes(model.size)}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div
          className={
            embeddedModel
              ? "relative h-full min-h-[620px] bg-[radial-gradient(circle_at_48%_36%,#5a5a5a_0%,#3d3d3d_30%,#242424_58%,#111111_100%)]"
              : "relative min-h-[680px] bg-[radial-gradient(circle_at_48%_36%,#5a5a5a_0%,#3d3d3d_30%,#242424_58%,#111111_100%)]"
          }
        >
          <div ref={mountRef} className="absolute inset-0" />
          {annotations.map(({ annotation, left, top, visible }) => (
            <button
              key={annotation.id}
              className={[
                "absolute z-10 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/45 text-sm font-semibold text-white shadow-soft backdrop-blur transition",
                visible ? "opacity-100" : "pointer-events-none opacity-20",
                activeAnnotation?.id === annotation.id
                  ? "bg-gold text-ink"
                  : "hover:bg-gold hover:text-ink",
              ].join(" ")}
              style={{ left, top }}
              onClick={() => openAnnotation(annotation)}
              aria-label={`Mở chú thích ${annotation.id}: ${annotation.title}`}
            >
              {annotation.id}
            </button>
          ))}
          {activeAnnotation && activePoint && (
            <div
              className="absolute z-20 max-w-sm rounded bg-black/75 p-4 text-white shadow-soft backdrop-blur"
              style={{
                left: activePoint.left,
                top: activePoint.top,
                transform:
                  activePoint.left > 520
                    ? "translate(calc(-100% - 20px), -16px)"
                    : "translate(20px, -16px)",
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold">
                  {activeAnnotation.title}
                </h2>
                <button
                  className="text-sm text-white/65 hover:text-white"
                  onClick={() => setActiveAnnotation(null)}
                  aria-label="Đóng chú thích"
                >
                  Đóng
                </button>
              </div>
              <p className="text-sm leading-6 text-white/90">
                {activeAnnotation.body}
              </p>
            </div>
          )}
          <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded bg-black/45 px-4 py-3 text-white backdrop-blur">
            <p className="text-sm font-semibold">
              {selectedName || "Trình xem GLB"}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {status === "loading"
                ? `Đang tải ${progress}%`
                : status === "ready"
                  ? "Kéo để xoay, cuộn để zoom"
                  : error || "Chọn model để bắt đầu"}
            </p>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              className="grid h-10 w-10 place-items-center rounded bg-white text-[#102832]"
              onClick={() =>
                frameModel(
                  modelRef.current,
                  cameraRef.current,
                  controlsRef.current,
                  selectedPath,
                )
              }
              aria-label="Căn lại model"
            >
              <Maximize2 size={18} />
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded bg-white text-[#102832]"
              onClick={() => controlsRef.current?.reset()}
              aria-label="Reset camera"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function projectAnnotations(
  annotations: Annotation[],
  camera: PerspectiveCamera,
  container: HTMLDivElement,
) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  return annotations.map((annotation) => {
    const projected = annotation.position.clone().project(camera);
    return {
      annotation,
      left: ((projected.x + 1) / 2) * width,
      top: ((-projected.y + 1) / 2) * height,
      visible: projected.z > -1 && projected.z < 1,
    };
  });
}

function frameModel(
  model: Object3D | null,
  camera: PerspectiveCamera | null,
  controls: OrbitControls | null,
  modelPath?: string,
) {
  if (!model || !camera || !controls) return;

  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const preset = modelPath ? modelCameraPresets[modelPath] : undefined;
  const target = center.clone();
  if (preset?.targetOffset) {
    target.add(new Vector3(size.x * preset.targetOffset.x, size.y * preset.targetOffset.y, size.z * preset.targetOffset.z));
  }
  const distance = (maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360))) * (preset?.zoom ?? 1);
  const direction = preset?.direction.clone().normalize() ?? new Vector3(1, 0.55, 1).normalize();

  camera.position
    .copy(target)
    .add(direction.multiplyScalar(distance));
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  controls.target.copy(target);
  controls.update();
  controls.saveState();
}

function setModelLighting(modelPath: string | undefined, ambientLight: AmbientLight | null, keyLight: DirectionalLight | null) {
  const brighter = modelPath ? brighterModelPaths.has(modelPath) : false;
  if (ambientLight) ambientLight.intensity = brighter ? 2.35 : 1.8;
  if (keyLight) keyLight.intensity = brighter ? 3.1 : 2.4;
}

function focusAnnotation(
  annotation: Annotation,
  model: Object3D | null,
  camera: PerspectiveCamera | null,
  controls: OrbitControls | null,
) {
  if (!model || !camera || !controls) return;

  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const target = annotation.position.clone();
  const direction = target.clone().sub(center);

  if (direction.lengthSq() < 0.0001) {
    direction.copy(camera.position).sub(target);
  }

  direction.normalize();
  const distance = Math.max(maxSize * 0.14, maxSize < 5 ? 0.7 : 8);
  const endPosition = target.clone().add(direction.multiplyScalar(distance));
  animateCamera(camera, controls, endPosition, target);
}

function animateCamera(
  camera: PerspectiveCamera,
  controls: OrbitControls,
  endPosition: Vector3,
  endTarget: Vector3,
) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startedAt = performance.now();
  const duration = 520;

  function tick(now: number) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - (1 - progress) ** 3;

    camera.position.lerpVectors(startPosition, endPosition, eased);
    controls.target.lerpVectors(startTarget, endTarget, eased);
    controls.update();

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function disposeModel(model: Object3D) {
  model.traverse((object) => {
    const mesh = object as Object3D & {
      geometry?: { dispose: () => void };
      material?: { dispose?: () => void } | { dispose?: () => void }[];
    };
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose?.());
      return;
    }
    mesh.material?.dispose?.();
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function getInitialModel(models: GlbModel[]) {
  if (typeof window === "undefined") return models[0];

  const requestedModel = new URLSearchParams(window.location.search).get("model");
  return models.find((model) => model.path === requestedModel || model.name === requestedModel) ?? models[0];
}
