import React, {
  useRef,
  useEffect,
  useState,
  ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';

/**
 * Lazy GLTFLoader that falls back to a geometric ashtray.
 */
const GLTFLoader = (() => {
  if (typeof window !== 'undefined' && (window as any).THREE?.GLTFLoader) {
    return (window as any).THREE.GLTFLoader;
  }
  class GLTFLoaderFallback {
    load(
      _url: string,
      onLoad: (gltf: any) => void,
      _onProgress?: (e: any) => void,
      _onError?: (e: any) => void
    ) {
      // Dynamically import real loader if available
      import('three/examples/jsm/loaders/GLTFLoader.js')
        .then((m) => new m.GLTFLoader().load(_url, onLoad))
        .catch(() => onLoad({ scene: this.createGeometricAshtray() }));
    }

    private createGeometricAshtray() {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2.5, 0.5, 32),
        new THREE.MeshPhongMaterial({
          color: 0xf8f8f8,
          shininess: 15,
          specular: 0x888888,
        })
      );
      body.position.y = 0.25;
      group.add(body);

      const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32),
        new THREE.MeshPhongMaterial({ color: 0xe8e8e8, shininess: 10 })
      );
      inner.position.y = 0.35;
      group.add(inner);

      for (let i = 0; i < 3; i++) {
        const notch = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.2, 0.1),
          body.material.clone()
        );
        const angle = (i / 3) * Math.PI * 2;
        notch.position.set(
          Math.cos(angle) * 2.2,
          0.4,
          Math.sin(angle) * 2.2
        );
        group.add(notch);
      }
      return group;
    }
  }
  return GLTFLoaderFallback;
})();

const Floating3DObjects: React.FC = (): ReactElement => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- main effect ---------------- */
  useEffect(() => {
    if (!mountRef.current) return;

    /* ---- helpers ---- */
    const isMobile = () => window.innerWidth < 768;
    const getScale = () => (isMobile() ? 15 : 24) * 0.512;
    const getCameraDistance = () =>
      window.innerWidth < 480
        ? 45
        : window.innerWidth < 768
        ? 40
        : window.innerWidth < 1024
        ? 35
        : 30;

    /* ---- scene / camera / renderer ---- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      isMobile() ? 85 : 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = getCameraDistance();

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isMobile();
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mountRef.current!.appendChild(renderer.domElement);

    /* ---- lights ---- */
    scene.add(new THREE.AmbientLight(0xf0f0f0, isMobile() ? 0.8 : 0.7));
    const dl = new THREE.DirectionalLight(0xffffff, isMobile() ? 1 : 1.2);
    dl.position.set(15, 15, 10);
    dl.castShadow = !isMobile();
    scene.add(dl);

    /* ---- load textures ---- */
    const tl = new THREE.TextureLoader();
    tl.setCrossOrigin('anonymous');
    const loadTex = (url: string) =>
      new Promise<THREE.Texture>((res, rej) =>
        tl.load(
          url,
          (t) => {
            ('colorSpace' in t
              ? ((t as any).colorSpace = THREE.SRGBColorSpace)
              : ((t as any).encoding = THREE.sRGBEncoding));
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(2, 2);
            res(t);
          },
          undefined,
          rej
        )
      );

    /* ---- model + particles ---- */
    const loader = new GLTFLoader();
    let ashtray: THREE.Object3D | null = null;
    let particles: THREE.Object3D[] = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;

    const createParticles = (
      mat: THREE.MeshStandardMaterial
    ): THREE.Object3D[] => {
      const cfg = [
        { s: 0.8, d: 12, sp: 0.015, oy: 2, e: 0.7 },
        { s: 0.6, d: 15, sp: -0.012, oy: -3, e: 0.8 },
        { s: 1.4, d: 18, sp: 0.008, oy: 1, e: 0.6 },
        { s: 2.2, d: 22, sp: -0.006, oy: -1.5, e: 0.9 },
        { s: 1.0, d: 14, sp: 0.011, oy: 3.5, e: 0.75 },
        { s: 1.6, d: 20, sp: -0.009, oy: -2.5, e: 0.65 },
      ];

      const sphere = (size: number) =>
        new THREE.SphereGeometry(size, isMobile() ? 8 : 12, isMobile() ? 8 : 12);

      return cfg.map((c, i) => {
        const geo = sphere(c.s);
        const m = mat.clone();
        m.transparent = false;
        m.roughness = 0.9;
        m.metalness = 0.02;

        const p = new THREE.Mesh(geo, m);
        const angle = (i / cfg.length) * Math.PI * 2;
        p.position.set(
          Math.cos(angle) * c.d,
          c.oy,
          Math.sin(angle) * c.d * c.e
        );
        (p as any).orbit = {
          d: c.d,
          s: c.sp,
          e: c.e,
          oy: c.oy,
          ang: angle,
        };
        scene.add(p);
        return p;
      });
    };

    const loadModel = async () => {
      try {
        const [diff, norm, rough] = await Promise.all([
          loadTex('/textures/anthracite-diff.jpg'),
          loadTex('/textures/anthracite-normal.exr'),
          loadTex('/textures/anthracite-roughness.exr'),
        ]);
        const matParams: THREE.MeshStandardMaterialParameters = {
          color: new THREE.Color('#8a8a8a'),
          roughness: 0.7,
          map: diff,
          normalMap: norm,
          roughnessMap: rough,
          transparent: true,
          opacity: 0,
        };
        const baseMat = new THREE.MeshStandardMaterial(matParams);

        const gltf: any = await new Promise((res, rej) =>
          loader.load('/models/ashtray.glb', res, undefined, rej)
        );

        ashtray = gltf.scene.clone();
        ashtray.position.set(0, 0, 0);
        ashtray.rotation.set(0.3, 1.2, -0.1);
        ashtray.scale.setScalar(getScale());

        ashtray.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const m = baseMat.clone();
            (c as THREE.Mesh).material = m;
            (c as THREE.Mesh).castShadow = !isMobile();
          }
        });
        scene.add(ashtray);

        particles = createParticles(baseMat);

        /* fade‑in */
        const start = performance.now();
        const fade = () => {
          const t = (performance.now() - start) / 700;
          const o = Math.min(t * t, 1);
          ashtray!.traverse((c) => {
            if ((c as THREE.Mesh).isMesh) {
              ((c as THREE.Mesh).material as any).opacity = o;
            }
          });
          particles.forEach((p) => {
            ((p as THREE.Mesh).material as any).opacity = o;
          });
          if (o < 1) requestAnimationFrame(fade);
          else setIsLoaded(true);
        };
        fade();
      } catch (e) {
        setError('Model loading failed');
      }
    };
    loadModel();

    /* ---- pointer ---- */
    const move = (e: MouseEvent | TouchEvent) => {
      const c = 'touches' in e ? e.touches[0] : (e as MouseEvent);
      mouse.x = (c.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(c.clientY / window.innerHeight) * 2 + 1;

      if (!ashtray) return;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects([ashtray, ...particles], true);
      hovered = hit.length ? hit[0].object : null;
      if (hovered) {
        while (hovered!.parent && hovered!.parent !== scene) hovered = hovered!.parent;
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', () => (hovered = null));

    /* ---- animation ---- */
    const animate = (t: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (ashtray) {
        ashtray.rotation.x += 0.01;
        ashtray.rotation.y += 0.015;
      }
      particles.forEach((p, i) => {
        const o = (p as any).orbit;
        o.ang += o.s;
        p.position.set(
          Math.cos(o.ang) * o.d,
          o.oy + Math.sin(t * 0.001 + i) * 0.5,
          Math.sin(o.ang) * o.d * o.e
        );
        const s = p === hovered ? 1.1 : 1;
        p.scale.setScalar(THREE.MathUtils.lerp(p.scale.x, s, 0.1));
      });
      renderer.render(scene, camera);
    };
    animate(0);

    /* ---- resize ---- */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = isMobile() ? 85 : 75;
      camera.position.z = getCameraDistance();
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (ashtray) ashtray.scale.setScalar(getScale());
    };
    window.addEventListener('resize', onResize);

    /* ---- cleanup ---- */
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', () => (hovered = null));
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      renderer.dispose();
    };
  }, []);

  /* ----------- JSX returned via portal ----------- */
  return createPortal(
    <div
      ref={mountRef}
      className="three-overlay"
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1s',
      }}
    />,
    document.body
  );
};

export default Floating3DObjects;
