import { Box, Maximize2, RefreshCw, RotateCcw, ScanLine, Square, Upload, Volume2 } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AmbientLight,
  Box3,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Raycaster,
  RingGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useAnnotationVoice } from "../components/voice/useAnnotationVoice";
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
const tankModelPath = "tank-843-ho-chi-minh-mobile-phone-capture_compressed.glb";
const modelTitles: Record<string, string> = {
  [sealModelPath]: "Ấn Sắc mệnh chi bảo",
  [hoaKhiemModelPath]: "Lăng vua Tự Đức - khu Hòa Khiêm",
  "one-pillar-pagoda-chua-mot-cot-compressed.glb": "Chùa Một Cột",
  [tankModelPath]: "Xe tăng 843",
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
    path: tankModelPath,
    url: `/models/${tankModelPath}`,
    size: 6058444,
  },
];

const modelCameraPresets: Record<
  string,
  { direction: Vector3; zoom: number; targetOffset?: Vector3 }
> = {
  [hoaKhiemModelPath]: { direction: new Vector3(0.25, 0.44, 1.18), zoom: 0.28 },
  [sealModelPath]: { direction: new Vector3(0, 0.42, 1), zoom: 1.02 },
  "one-pillar-pagoda-chua-mot-cot-compressed.glb": {
    direction: new Vector3(0, 0.3, 1),
    zoom: 0.68,
  },
  [tankModelPath]: {
    direction: new Vector3(0, -1, 0.18),
    zoom: 0.86,
    targetOffset: new Vector3(0.08, 0, 0.02),
  },
};

const brighterModelPaths = new Set([
  "one-pillar-pagoda-chua-mot-cot-compressed.glb",
  tankModelPath,
]);

type ModelViewerPageProps = {
  autoNarrateAnnotations?: boolean;
  embeddedModel?: GlbModel;
};

type ArRuntime = {
  capture: () => Promise<void>;
  end: () => void;
  start: () => Promise<void>;
};

// Sửa vị trí marker ở `position: new Vector3(x, y, z)`.
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

export function ModelViewerPage({ autoNarrateAnnotations = false, embeddedModel }: ModelViewerPageProps = {}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const ambientLightRef = useRef<AmbientLight | null>(null);
  const keyLightRef = useRef<DirectionalLight | null>(null);
  const sealFillLightsRef = useRef<DirectionalLight[]>([]);
  const tankFillLightsRef = useRef<DirectionalLight[]>([]);
  const modelRef = useRef<Object3D | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const annotationsRef = useRef<Annotation[]>([]);
  const arRuntimeRef = useRef<ArRuntime | null>(null);

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
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isArRunning, setIsArRunning] = useState(false);
  const [arMessage, setArMessage] = useState("");
  const [annotationPoints, setAnnotationPoints] = useState<
    { annotation: Annotation; left: number; top: number; visible: boolean }[]
  >([]);
  const selectedPath = useMemo(
    () => models.find((model) => model.url === selectedUrl)?.path,
    [models, selectedUrl],
  );
  const annotations =
    !isArRunning && status === "ready" && annotationSets[selectedPath ?? ""]
      ? annotationPoints
      : [];
  const activePoint = annotations.find(
    (point) => point.annotation.id === activeAnnotation?.id,
  );
  const { speakAnnotation, stopAnnotationVoice, voiceState } =
    useAnnotationVoice(autoNarrateAnnotations);

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
    const overlayRoot = container.parentElement ?? document.body;

    const scene = new Scene();
    const ambientLight = new AmbientLight("#ffffff", 1.8);
    scene.add(ambientLight);

    const keyLight = new DirectionalLight("#ffffff", 2.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const sealFillLights = [
      new DirectionalLight("#ffffff", 0),
      new DirectionalLight("#ffffff", 0),
      new DirectionalLight("#ffffff", 0),
      new DirectionalLight("#ffffff", 0),
    ];
    sealFillLights[0].position.set(8, 1.5, 0);
    sealFillLights[1].position.set(-8, 1.5, 0);
    sealFillLights[2].position.set(0, 1.5, 8);
    sealFillLights[3].position.set(0, 1.5, -8);
    sealFillLights.forEach((light) => scene.add(light));

    const tankFillLights = [
      new DirectionalLight("#ffffff", 0),
      new DirectionalLight("#ffffff", 0),
      new DirectionalLight("#ffffff", 0),
      new DirectionalLight("#ffffff", 0),
    ];
    tankFillLights[0].position.set(10, 3, 0);
    tankFillLights[1].position.set(-10, 3, 0);
    tankFillLights[2].position.set(0, 3, 10);
    tankFillLights[3].position.set(0, 3, -10);
    tankFillLights.forEach((light) => scene.add(light));

    const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
    camera.position.set(3, 2, 4);

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = "srgb";
    renderer.setClearAlpha(0);
    renderer.setClearColor(0x000000, 0);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotateSpeed = 4.8;

    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;
    ambientLightRef.current = ambientLight;
    keyLightRef.current = keyLight;
    sealFillLightsRef.current = sealFillLights;
    tankFillLightsRef.current = tankFillLights;

    const reticle = new Group();
    const scanGrid = new GridHelper(1.2, 12, "#d8ad52", "#d8ad52");
    const gridMaterials = Array.isArray(scanGrid.material)
      ? scanGrid.material
      : [scanGrid.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.45;
      material.depthWrite = false;
    });
    const scanRing = new Mesh(
      new RingGeometry(0.52, 0.56, 72).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({
        color: "#d8ad52",
        opacity: 0.8,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
    const scanCenter = new Mesh(
      new RingGeometry(0.08, 0.1, 40).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({
        color: "#fff2c7",
        opacity: 0.9,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
    reticle.add(scanGrid, scanRing, scanCenter);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    let hitTestSource: XRHitTestSource | null = null;
    let hitTestRequested = false;
    let hasPlacedModel = false;
    let modelPlaneY = 0;
    let previewTransform: { position: Vector3; quaternion: Quaternion; scale: Vector3 } | null = null;
    const pointer = new Vector2();
    const raycaster = new Raycaster();
    const movePlane = new Plane();
    const moveHit = new Vector3();
    const activePointers = new Map<number, { x: number; y: number }>();
    let ignoreSelectUntil = 0;
    let arDrag:
      | {
        pointerId: number;
        mode: "move" | "rotate";
        startX: number;
        startY: number;
        lastX: number;
        moved: boolean;
        moveOffset: Vector3;
        planeY: number;
      }
      | null = null;
    let arPinch:
      | {
        startDistance: number;
        startScale: Vector3;
        planeY: number;
      }
      | null = null;

    function getPointerDistance() {
      const points = [...activePointers.values()];
      if (points.length < 2) return 0;
      return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    }

    function keepModelOnPlane(model: Object3D, planeY: number) {
      const box = new Box3().setFromObject(model);
      model.position.y += planeY - box.min.y;
    }

    function setPointerFromEvent(event: PointerEvent) {
      const rect = overlayRoot.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
    }

    function intersectModel(event: PointerEvent) {
      const model = modelRef.current;
      if (!model || !model.visible) return false;
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, renderer.xr.isPresenting ? renderer.xr.getCamera() : camera);
      return raycaster.intersectObject(model, true).length > 0;
    }

    function intersectMovePlane(event: PointerEvent, planeY: number) {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointer, renderer.xr.isPresenting ? renderer.xr.getCamera() : camera);
      movePlane.set(new Vector3(0, 1, 0), -planeY);
      return raycaster.ray.intersectPlane(movePlane, moveHit);
    }

    function onArPointerDown(event: PointerEvent) {
      if (!renderer.xr.isPresenting || event.button !== 0) return;
      if ((event.target as Element | null)?.closest?.("button")) return;
      const model = modelRef.current;
      if (!model || !model.visible) return;

      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      overlayRoot.setPointerCapture?.(event.pointerId);

      if (activePointers.size >= 2) {
        arDrag = null;
        arPinch = {
          startDistance: getPointerDistance(),
          startScale: model.scale.clone(),
          planeY: model.position.y,
        };
        setArMessage("Chụm/mở 2 ngón để thu phóng hiện vật.");
        return;
      }

      const planeY = hasPlacedModel ? modelPlaneY : model.position.y;
      const hit = intersectMovePlane(event, planeY);
      arDrag = {
        pointerId: event.pointerId,
        mode: intersectModel(event) ? "rotate" : "move",
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        moved: false,
        moveOffset: hit ? model.position.clone().sub(hit) : new Vector3(),
        planeY,
      };
      setArMessage(arDrag.mode === "rotate" ? "Kéo ngang để xoay hiện vật." : "Kéo để di chuyển hiện vật trên mặt phẳng.");
    }

    function onArPointerMove(event: PointerEvent) {
      const model = modelRef.current;
      if (activePointers.has(event.pointerId)) {
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }

      if (arPinch && activePointers.size >= 2 && model && model.visible) {
        const distance = getPointerDistance();
        if (arPinch.startDistance > 0 && distance > 0) {
          const scaleFactor = Math.min(2.4, Math.max(0.35, distance / arPinch.startDistance));
          model.scale.copy(arPinch.startScale).multiplyScalar(scaleFactor);
          keepModelOnPlane(model, arPinch.planeY);
          ignoreSelectUntil = performance.now() + 600;
        }
        return;
      }

      if (!arDrag || arDrag.pointerId !== event.pointerId || !model || !model.visible) return;

      const movedDistance = Math.hypot(event.clientX - arDrag.startX, event.clientY - arDrag.startY);
      if (movedDistance > 6) arDrag.moved = true;

      if (arDrag.mode === "rotate") {
        const deltaX = event.clientX - arDrag.lastX;
        const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), deltaX * 0.012);
        model.quaternion.premultiply(rotation);
        arDrag.lastX = event.clientX;
        return;
      }

      const hit = intersectMovePlane(event, arDrag.planeY);
      if (hit) {
        model.position.copy(hit).add(arDrag.moveOffset);
        keepModelOnPlane(model, arDrag.planeY);
      }
    }

    function onArPointerUp(event: PointerEvent) {
      activePointers.delete(event.pointerId);
      if (arPinch) {
        ignoreSelectUntil = performance.now() + 600;
        setArMessage("Đã thu phóng hiện vật.");
        if (activePointers.size < 2) arPinch = null;
      }
      overlayRoot.releasePointerCapture?.(event.pointerId);
      if (!arDrag || arDrag.pointerId !== event.pointerId) return;
      if (arDrag.moved) {
        ignoreSelectUntil = performance.now() + 600;
        setArMessage(arDrag.mode === "rotate" ? "Đã xoay hiện vật." : "Đã di chuyển hiện vật.");
      }
      arDrag = null;
    }

    async function captureArPhoto() {
      const width = renderer.domElement.width || overlayRoot.clientWidth || window.innerWidth;
      const height = renderer.domElement.height || overlayRoot.clientHeight || window.innerHeight;
      const snapshotCanvas = document.createElement("canvas");
      snapshotCanvas.width = width;
      snapshotCanvas.height = height;
      const context = snapshotCanvas.getContext("2d");
      if (!context) {
        setArMessage("Không thể tạo ảnh chụp AR trên trình duyệt này.");
        return;
      }

      try {
        setArMessage("Đang chụp ảnh AR...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: width },
            height: { ideal: height },
          },
        });

        try {
          const video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.srcObject = stream;
          await video.play();
          await new Promise<void>((resolve) => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              resolve();
              return;
            }
            video.onloadeddata = () => resolve();
          });

          const videoWidth = video.videoWidth || width;
          const videoHeight = video.videoHeight || height;
          const sourceRatio = videoWidth / videoHeight;
          const targetRatio = width / height;
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = videoWidth;
          let sourceHeight = videoHeight;

          if (sourceRatio > targetRatio) {
            sourceWidth = videoHeight * targetRatio;
            sourceX = (videoWidth - sourceWidth) / 2;
          } else {
            sourceHeight = videoWidth / targetRatio;
            sourceY = (videoHeight - sourceHeight) / 2;
          }

          context.drawImage(
            video,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            width,
            height,
          );
          context.drawImage(renderer.domElement, 0, 0, width, height);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch {
        try {
          context.drawImage(renderer.domElement, 0, 0, width, height);
        } catch {
          setArMessage("Trình duyệt không cho phép chụp ảnh AR.");
          return;
        }
      }

      snapshotCanvas.toBlob((blob) => {
        if (!blob) {
          setArMessage("Không thể lưu ảnh AR trên trình duyệt này.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `di-san-viet-ar-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setArMessage("Đã chụp ảnh AR.");
      }, "image/png");
    }

    function placeModelAtReticle() {
      if (performance.now() < ignoreSelectUntil) return;
      const model = modelRef.current;
      if (!model || !reticle.visible || !previewTransform) {
        setArMessage("Hãy lia camera xuống mặt sàn hoặc mặt bàn.");
        return;
      }

      const hitPosition = new Vector3();
      reticle.matrix.decompose(hitPosition, new Quaternion(), new Vector3());

      model.position.copy(previewTransform.position);
      model.quaternion.copy(previewTransform.quaternion);
      model.scale.copy(previewTransform.scale);
      const box = new Box3().setFromObject(model);
      const size = box.getSize(new Vector3());
      const fitScale = 0.65 / (Math.max(size.x, size.y, size.z) || 1);

      model.scale.multiplyScalar(fitScale);
      model.quaternion.identity();
      model.position.set(hitPosition.x, hitPosition.y, hitPosition.z);
      keepModelOnPlane(model, hitPosition.y);
      model.visible = true;
      hasPlacedModel = true;
      modelPlaneY = hitPosition.y;
      reticle.visible = false;
      setArMessage("Đã đặt hiện vật. Kéo trên model để xoay, kéo ngoài model để di chuyển.");
    }

    function onSessionStart() {
      document.body.classList.add("is-ar-active");
      hasPlacedModel = false;
      modelPlaneY = 0;
      arDrag = null;
      arPinch = null;
      activePointers.clear();
      controls.enabled = false;
      const model = modelRef.current;
      if (model) {
        previewTransform = {
          position: model.position.clone(),
          quaternion: model.quaternion.clone(),
          scale: model.scale.clone(),
        };
        model.visible = false;
      }
      setActiveAnnotation(null);
      setIsArRunning(true);
      setArMessage("Lia camera để tìm mặt phẳng, chạm để đặt. Sau đó kéo model để xoay hoặc kéo nền để di chuyển.");
      requestAnimationFrame(resize);
    }

    function onSessionEnd() {
      document.body.classList.remove("is-ar-active");
      hitTestSource?.cancel();
      hitTestSource = null;
      hitTestRequested = false;
      hasPlacedModel = false;
      modelPlaneY = 0;
      arDrag = null;
      arPinch = null;
      activePointers.clear();
      reticle.visible = false;
      const model = modelRef.current;
      if (model && previewTransform) {
        model.position.copy(previewTransform.position);
        model.quaternion.copy(previewTransform.quaternion);
        model.scale.copy(previewTransform.scale);
        model.visible = true;
      }
      previewTransform = null;
      controls.enabled = true;
      controls.reset();
      setIsArRunning(false);
      setArMessage("");
      requestAnimationFrame(resize);
    }

    renderer.xr.addEventListener("sessionstart", onSessionStart);
    renderer.xr.addEventListener("sessionend", onSessionEnd);
    overlayRoot.addEventListener("pointerdown", onArPointerDown);
    overlayRoot.addEventListener("pointermove", onArPointerMove);
    overlayRoot.addEventListener("pointerup", onArPointerUp);
    overlayRoot.addEventListener("pointercancel", onArPointerUp);

    function resize() {
      camera.aspect =
        container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    let lastAnnotationUpdate = 0;
    function animate(now = 0, frame?: XRFrame) {
      if (renderer.xr.isPresenting) {
        const session = renderer.xr.getSession();
        if (session && frame && !hitTestRequested) {
          const requestHitTestSource = session.requestHitTestSource?.bind(session);
          if (!requestHitTestSource) {
            setArMessage("Thiết bị này chưa hỗ trợ dò mặt phẳng AR.");
            hitTestRequested = true;
            return;
          }
          session
            .requestReferenceSpace("viewer")
            .then((space) => requestHitTestSource({ space }))
            .then((source) => {
              hitTestSource = source ?? null;
            })
            .catch(() =>
              setArMessage("Không thể dò mặt phẳng trên thiết bị này."),
            );
          hitTestRequested = true;
        }

        if (frame && hitTestSource) {
          const referenceSpace = renderer.xr.getReferenceSpace();
          const hits = frame.getHitTestResults(hitTestSource);
          reticle.visible = !hasPlacedModel && hits.length > 0 && Boolean(referenceSpace);
          if (reticle.visible && referenceSpace) {
            const pose = hits[0].getPose(referenceSpace);
            if (pose) reticle.matrix.fromArray(pose.transform.matrix);
            const pulse = 1 + Math.sin(now * 0.006) * 0.04;
            scanGrid.scale.setScalar(pulse);
            scanRing.scale.setScalar(0.94 + Math.sin(now * 0.004) * 0.08);
            scanCenter.scale.setScalar(1 + Math.sin(now * 0.01) * 0.18);
          }
        }
      } else {
        controls.update();
        reticle.visible = false;
      }
      renderer.render(scene, camera);
      if (!renderer.xr.isPresenting && now - lastAnnotationUpdate > 100) {
        lastAnnotationUpdate = now;
        if (annotationsRef.current.length > 0)
          setAnnotationPoints(
            projectAnnotations(annotationsRef.current, camera, container),
          );
      }
    }

    resize();
    renderer.setAnimationLoop(animate);
    window.addEventListener("resize", resize);

    arRuntimeRef.current = {
      capture: captureArPhoto,
      end: () => renderer.xr.getSession()?.end(),
      start: async () => {
        if (!window.isSecureContext) {
          setArMessage("AR cần HTTPS hoặc localhost.");
          return;
        }
        if (!navigator.xr || !(await navigator.xr.isSessionSupported("immersive-ar"))) {
          setArMessage("Thiết bị hoặc trình duyệt chưa hỗ trợ WebXR AR.");
          return;
        }

        try {
          renderer.xr.setReferenceSpaceType("local-floor");
          const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["local-floor", "dom-overlay"],
            domOverlay: { root: overlayRoot },
          });
          session.addEventListener("select", placeModelAtReticle);
          await renderer.xr.setSession(session);
        } catch (currentError) {
          const errorName = currentError instanceof DOMException ? currentError.name : "Error";
          setArMessage(errorName === "NotAllowedError" ? "Bạn chưa cấp quyền camera cho AR." : "Không thể mở chế độ AR.");
        }
      },
    };

    return () => {
      window.removeEventListener("resize", resize);
      arRuntimeRef.current = null;
      document.body.classList.remove("is-ar-active");
      renderer.setAnimationLoop(null);
      renderer.xr.removeEventListener("sessionstart", onSessionStart);
      renderer.xr.removeEventListener("sessionend", onSessionEnd);
      overlayRoot.removeEventListener("pointerdown", onArPointerDown);
      overlayRoot.removeEventListener("pointermove", onArPointerMove);
      overlayRoot.removeEventListener("pointerup", onArPointerUp);
      overlayRoot.removeEventListener("pointercancel", onArPointerUp);
      renderer.xr.getSession()?.end();
      hitTestSource?.cancel();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      objectUrlRef.current && URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedUrl || !sceneRef.current) return;

    if (autoNarrateAnnotations) stopAnnotationVoice();
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
    setModelLighting(
      selectedPath,
      ambientLightRef.current,
      keyLightRef.current,
      sealFillLightsRef.current,
      tankFillLightsRef.current,
    );
    setStatus("loading");
    setProgress(0);
    setError("");

    loader.load(
      selectedUrl,
      (gltf) => {
        if (cancelled) return;
        const pivot = createCenteredModelPivot(gltf.scene);
        modelRef.current = pivot;
        sceneRef.current?.add(pivot);
        frameModel(pivot, cameraRef.current, controlsRef.current, selectedPath);
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
  }, [autoNarrateAnnotations, selectedPath, selectedUrl, stopAnnotationVoice]);

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
      selectedPath,
    );
    if (autoNarrateAnnotations) {
      void speakAnnotation(
        `Di tích: ${selectedName}. Điểm thuyết minh: ${annotation.title}. ${annotation.body}`,
      );
    }
  }

  function closeAnnotation() {
    setActiveAnnotation(null);
    if (autoNarrateAnnotations) stopAnnotationVoice();
  }

  function toggleAr() {
    if (isArRunning) arRuntimeRef.current?.end();
    else void arRuntimeRef.current?.start();
  }

  function captureArPhoto() {
    void arRuntimeRef.current?.capture();
  }

  function toggleAutoRotate() {
    setIsAutoRotating((current) => {
      const next = !current;
      if (controlsRef.current) controlsRef.current.autoRotate = next;
      return next;
    });
  }

  function resetCamera() {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
      controlsRef.current.reset();
    }
    setIsAutoRotating(false);
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
            ? "model-viewer-shell h-full min-h-[620px] overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft"
            : "model-viewer-shell grid min-h-[680px] overflow-hidden rounded border border-ink/10 bg-white shadow-soft lg:grid-cols-[320px_1fr]"
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
              ? "model-viewer-stage relative h-full min-h-[620px] bg-[radial-gradient(circle_at_48%_36%,#5a5a5a_0%,#3d3d3d_30%,#242424_58%,#111111_100%)]"
              : "model-viewer-stage relative min-h-[680px] bg-[radial-gradient(circle_at_48%_36%,#5a5a5a_0%,#3d3d3d_30%,#242424_58%,#111111_100%)]"
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
                  onClick={closeAnnotation}
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
              {arMessage || (status === "loading"
                ? `Đang tải ${progress}%`
                : status === "ready"
                  ? "Kéo để xoay, cuộn để zoom"
                  : error || "Chọn model để bắt đầu")}
            </p>
          </div>
          {isArRunning ? (
            <>
              <button
                className="absolute bottom-5 left-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#d8ad52] px-4 text-sm font-semibold text-[#2d2820] shadow-lg"
                onClick={toggleAr}
                aria-label="Thoát chế độ AR"
                title="Thoát AR"
              >
                <ScanLine size={18} />
                Thoát AR
              </button>
              <button
                className="absolute bottom-5 left-1/2 grid h-[74px] w-[74px] -translate-x-1/2 place-items-center rounded-full border-4 border-white bg-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur"
                onClick={captureArPhoto}
                aria-label="Chụp ảnh camera AR"
                title="Chụp ảnh camera AR"
              >
                <span className="block h-[54px] w-[54px] rounded-full bg-white shadow-inner" />
              </button>
              <div className="absolute bottom-5 right-4 flex gap-2">
                <button
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#102832] shadow-lg"
                  onClick={() => {
                    if (controlsRef.current) controlsRef.current.autoRotate = false;
                    setIsAutoRotating(false);
                    frameModel(
                      modelRef.current,
                      cameraRef.current,
                      controlsRef.current,
                      selectedPath,
                    );
                  }}
                  aria-label="Căn lại model"
                >
                  <Maximize2 size={18} />
                </button>
                <button
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#102832] shadow-lg"
                  onClick={resetCamera}
                  aria-label="Reset camera"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded bg-white px-3 text-sm font-semibold text-[#102832] shadow-lg"
                onClick={toggleAr}
                aria-label="Mở chế độ AR"
                title="Xem trong không gian AR"
              >
                <ScanLine size={18} />
                Mở AR
              </button>
              <button
                className="grid h-10 w-10 place-items-center rounded bg-white text-[#102832]"
                onClick={() => {
                  if (controlsRef.current) controlsRef.current.autoRotate = false;
                  setIsAutoRotating(false);
                  frameModel(
                    modelRef.current,
                    cameraRef.current,
                    controlsRef.current,
                    selectedPath,
                  );
                }}
                aria-label="Căn lại model"
              >
                <Maximize2 size={18} />
              </button>
              <button
                className={[
                  "grid h-10 w-10 place-items-center rounded text-[#102832] transition",
                  isAutoRotating ? "bg-gold" : "bg-white hover:bg-gold/70",
                ].join(" ")}
                onClick={toggleAutoRotate}
                aria-pressed={isAutoRotating}
                aria-label={
                  isAutoRotating ? "Tắt tự xoay model" : "Bật tự xoay model"
                }
              >
                <RefreshCw size={18} />
              </button>
              <button
                className="grid h-10 w-10 place-items-center rounded bg-white text-[#102832]"
                onClick={resetCamera}
                aria-label="Reset camera"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          )}
          {autoNarrateAnnotations && voiceState.phase !== "idle" ? (
            <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-8.5rem)] items-center gap-3 rounded bg-black/65 px-3 py-2 text-white shadow-soft backdrop-blur">
              <Volume2 size={17} className="shrink-0 text-gold" />
              <p className="min-w-0 truncate text-xs">
                {voiceState.phase === "loading"
                  ? "Đang tạo giọng..."
                  : voiceState.phase === "speaking"
                    ? "Đang đọc chú thích"
                    : voiceState.message ?? "Không phát được giọng đọc"}
              </p>
              <button
                type="button"
                className="grid h-8 w-8 shrink-0 place-items-center rounded bg-white text-[#102832] transition hover:bg-gold"
                onClick={stopAnnotationVoice}
                aria-label="Dừng giọng đọc"
                title="Dừng"
              >
                <Square size={13} fill="currentColor" />
              </button>
            </div>
          ) : null}
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
    target.add(
      new Vector3(
        size.x * preset.targetOffset.x,
        size.y * preset.targetOffset.y,
        size.z * preset.targetOffset.z,
      ),
    );
  }
  const distance =
    (maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360))) *
    (preset?.zoom ?? 1);
  const direction =
    preset?.direction.clone().normalize() ??
    new Vector3(1, 0.55, 1).normalize();

  camera.position.copy(target).add(direction.multiplyScalar(distance));
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  controls.target.copy(target);
  controls.update();
  controls.saveState();
}

function createCenteredModelPivot(content: Object3D) {
  const box = new Box3().setFromObject(content);
  const center = box.getCenter(new Vector3());
  const pivot = new Group();
  pivot.name = content.name ? `${content.name}-pivot` : "model-pivot";
  content.position.sub(center);
  pivot.position.copy(center);
  pivot.add(content);
  return pivot;
}

function setModelLighting(
  modelPath: string | undefined,
  ambientLight: AmbientLight | null,
  keyLight: DirectionalLight | null,
  sealFillLights: DirectionalLight[],
  tankFillLights: DirectionalLight[],
) {
  const brighter = modelPath ? brighterModelPaths.has(modelPath) : false;
  if (ambientLight) ambientLight.intensity = brighter ? 2.35 : 1.8;
  if (keyLight) keyLight.intensity = brighter ? 3.1 : 2.4;
  sealFillLights.forEach((light) => {
    light.intensity = modelPath === sealModelPath ? 1.15 : 0;
  });
  tankFillLights.forEach((light) => {
    light.intensity = modelPath === tankModelPath ? 1.35 : 0;
  });
}

function focusAnnotation(
  annotation: Annotation,
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
  const target = annotation.position.clone();
  const preset = modelPath ? modelCameraPresets[modelPath] : undefined;
  const direction =
    modelPath === hoaKhiemModelPath && preset
      ? preset.direction.clone()
      : target.clone().sub(center);

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

  const requestedModel = new URLSearchParams(window.location.search).get(
    "model",
  );
  return (
    models.find(
      (model) => model.path === requestedModel || model.name === requestedModel,
    ) ?? models[0]
  );
}
