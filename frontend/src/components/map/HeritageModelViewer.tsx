import { Maximize2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AmbientLight, Box3, DirectionalLight, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type HeritageModelViewerProps = {
  src: string;
  title: string;
};

type LoadStatus = "loading" | "ready" | "error";

export function HeritageModelViewer({ src, title }: HeritageModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<Object3D | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new Scene();
    scene.add(new AmbientLight("#ffffff", 1.8));

    const keyLight = new DirectionalLight("#ffffff", 2.6);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new DirectionalLight("#d8c7a5", 1.2);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const camera = new PerspectiveCamera(45, 1, 0.01, 1000);
    camera.position.set(3, 2, 4);

    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = "srgb";
    renderer.setClearAlpha(0);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    cameraRef.current = camera;
    controlsRef.current = controls;

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });
    resizeObserver.observe(mount);

    let animationFrame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    let cancelled = false;

    setStatus("loading");
    setProgress(0);
    loader.load(
      src,
      (gltf) => {
        if (cancelled) return;
        modelRef.current = gltf.scene;
        scene.add(gltf.scene);
        frameModel(gltf.scene, camera, controls);
        setStatus("ready");
      },
      (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => {
        if (!cancelled) setStatus("error");
      }
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      dracoLoader.dispose();
      controls.dispose();
      if (modelRef.current) disposeModel(modelRef.current);
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [src]);

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-lg bg-[radial-gradient(circle_at_48%_36%,#665f52_0%,#3f3a32_35%,#27231e_65%,#171411_100%)]">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-md border border-white/15 bg-black/35 px-4 py-3 text-[var(--heritage-white)] backdrop-blur-sm">
        <p className="font-serif text-lg">{title}</p>
        <p className="mt-1 text-xs text-white/70">
          {status === "loading" ? `Đang tải model ${progress}%` : status === "ready" ? "Kéo để xoay · Cuộn để phóng to" : "Không tải được model 3D"}
        </p>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md bg-[var(--heritage-paper-light)] text-[var(--heritage-brown)] shadow-lg"
          onClick={() => frameModel(modelRef.current, cameraRef.current, controlsRef.current)}
          aria-label="Căn model vào giữa"
        >
          <Maximize2 size={18} />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md bg-[var(--heritage-paper-light)] text-[var(--heritage-brown)] shadow-lg"
          onClick={() => controlsRef.current?.reset()}
          aria-label="Đặt lại góc nhìn"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

function frameModel(model: Object3D | null, camera: PerspectiveCamera | null, controls: OrbitControls | null) {
  if (!model || !camera || !controls) return;

  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const distance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));

  camera.position.copy(center).add(new Vector3(distance, distance * 0.55, distance));
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
  controls.saveState();
}

function disposeModel(model: Object3D) {
  model.traverse((object) => {
    const mesh = object as Object3D & { geometry?: { dispose: () => void }; material?: { dispose?: () => void } | { dispose?: () => void }[] };
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose?.());
    else mesh.material?.dispose?.();
  });
}
