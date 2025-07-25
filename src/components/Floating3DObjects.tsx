import React, { useRef, useEffect, useState, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';

/* ----------  GLTFLoader with geometric fallback ---------- */
const GLTFLoader = (() => {
  if (typeof window !== 'undefined' && (window as any).THREE?.GLTFLoader) {
    return (window as any).THREE.GLTFLoader;
  }
  class GLTFLoaderFallback {
    load(
      url: string,
      onLoad: (gltf: any) => void,
      onProgress?: (p: any) => void,
      onError?: (e: any) => void
    ) {
      import('three/examples/jsm/loaders/GLTFLoader.js')
        .then((module) => {
          const loader = new module.GLTFLoader();
          loader.load(url, onLoad, onProgress, onError);
        })
        .catch((importError) => {
          console.warn('Could not import GLTFLoader, creating geometric fallback:', importError);
          const scene = this.createGeometricAshtray();
          onLoad({ scene });
        });
    }

    createGeometricAshtray() {
      const group = new THREE.Group();
      const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xf8f8f8, shininess: 15, specular: 0x888888 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.25;
      group.add(body);

      const innerGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
      const innerMaterial = new THREE.MeshPhongMaterial({ color: 0xe8e8e8, shininess: 10 });
      const inner = new THREE.Mesh(innerGeometry, innerMaterial);
      inner.position.y = 0.35;
      group.add(inner);

      for (let i = 0; i < 3; i++) {
        const notchGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const notch = new THREE.Mesh(notchGeometry, bodyMaterial.clone());
        const angle = (i / 3) * Math.PI * 2;
        notch.position.x = Math.cos(angle) * 2.2;
        notch.position.z = Math.sin(angle) * 2.2;
        notch.position.y = 0.4;
        group.add(notch);
      }
      return group;
    }
  }
  return GLTFLoaderFallback;
})();

/* --------------------------------------------------------- */
const Floating3DObjects: React.FC = (): ReactElement => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  /* ===================  EFFECT  =================== */
  useEffect(() => {
    if (!mountRef.current) return;

    /* ----- helpers & device info ----- */
    const isMobileScreen = () => window.innerWidth < 768;
    const SCALE_FACTOR = 0.512;
    const BASE_MOBILE = 15.0;
    const BASE_DESKTOP = 24.0;
    const getScale = () => (isMobileScreen() ? BASE_MOBILE : BASE_DESKTOP) * SCALE_FACTOR;

    const checkMobile = () => setIsMobile(isMobileScreen());
    checkMobile();
    window.addEventListener('resize', checkMobile);

    /* ----- scene / camera / renderer ----- */
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 85 : 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const getCameraDistance = () => {
      if (window.innerWidth < 480) return 45;
      if (window.innerWidth < 768) return 40;
      if (window.innerWidth < 1024) return 35;
      return 30;
    };
    camera.position.z = getCameraDistance();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace ?? undefined;
    if ((renderer as any).outputEncoding !== undefined) {
      (renderer as any).outputEncoding = THREE.sRGBEncoding;
    }
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    /* ---- style still applied on the canvas element ---- */
    renderer.domElement.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 1 !important;
      pointer-events: none !important;
    `;

    /* --------------- mount canvas --------------- */
    mountRef.current.appendChild(renderer.domElement);

    /* --------------- lights --------------------- */
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, isMobile ? 0.8 : 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 1.0 : 1.2);
    directionalLight.position.set(15, 15, 10);
    if (!isMobile) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.set(1024, 1024);
    }
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xd0d0d0, 0.3);
    accentLight.position.set(0, 10, 0);
    scene.add(accentLight);

    /* -------- load model + textures -------- */
    const loader = new GLTFLoader();
    let ashtray: THREE.Object3D | null = null;
    let hoveredObject: THREE.Object3D | null = null;
    let particles: THREE.Object3D[] = [];

    /* --- create organic blob particles helper --- */
    const createBlobGeometry = (size: number, complexity: number = 6) => {
      const geometry = new THREE.SphereGeometry(size, complexity * 2, complexity);
      const vertices = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];

        const noise1 = Math.sin(x * 3 + y * 2) * Math.cos(z * 2.5) * 0.3;
        const noise2 = Math.cos(x * 2.5 + z * 3) * Math.sin(y * 1.8) * 0.25;
        const noise3 = Math.sin(x * 1.5 + y * 2.8 + z * 2.2) * 0.2;

        const deformation = (noise1 + noise2 + noise3) * size * 0.4;
        const length = Math.sqrt(x * x + y * y + z * z);
        const scale = (length + deformation) / length;

        vertices[i] = x * scale;
        vertices[i + 1] = y * scale;
        vertices[i + 2] = z * scale;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      return geometry;
    };

    const createParticles = (baseMaterial: THREE.MeshStandardMaterial) => {
      const particleConfigs = [
        { size: 0.8, distance: 12, speed: 0.015, offsetY: 2, eccentricity: 0.7 },
        { size: 0.6, distance: 15, speed: -0.012, offsetY: -3, eccentricity: 0.8 },
        { size: 1.4, distance: 18, speed: 0.008, offsetY: 1, eccentricity: 0.6 },
        { size: 2.2, distance: 22, speed: -0.006, offsetY: -1.5, eccentricity: 0.9 },
        { size: 1.0, distance: 14, speed: 0.011, offsetY: 3.5, eccentricity: 0.75 },
        { size: 1.6, distance: 20, speed: -0.009, offsetY: -2.5, eccentricity: 0.65 }
      ];

      return particleConfigs.map((config, index) => {
        const blobGeometry = createBlobGeometry(config.size, isMobile ? 4 : 6);
        const particleMaterial = baseMaterial.clone();
        particleMaterial.transparent = false;
        particleMaterial.opacity = 1.0;
        particleMaterial.roughness = 0.9;
        particleMaterial.metalness = 0.02;

        const particle = new THREE.Mesh(blobGeometry, particleMaterial);

        const angle = (index / particleConfigs.length) * Math.PI * 2;
        particle.position.x = Math.cos(angle) * config.distance;
        particle.position.z = Math.sin(angle) * config.distance * config.eccentricity;
        particle.position.y = config.offsetY;

        (particle as any).orbitProps = {
          distance: config.distance,
          speed: config.speed,
          baseY: config.offsetY,
          eccentricity: config.eccentricity,
          angleOffset: angle,
          currentAngle: angle,
          bobSpeed: (Math.random() - 0.5) * 0.02,
          bobAmplitude: 0.5 + Math.random() * 0.5
        };

        if (!isMobile) {
          particle.castShadow = true;
          particle.receiveShadow = true;
        }

        scene.add(particle);
        return particle;
      });
    };

    /* ---- textures ---- */
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    let diffuseTexture: THREE.Texture | null = null;
    let normalTexture: THREE.Texture | null = null;
    let roughnessTexture: THREE.Texture | null = null;
    let displacementTexture: THREE.Texture | null = null;

    const loadTextures = () =>
      new Promise<void>((resolve) => {
        let loadedCount = 0;
        const totalTextures = 4;
        const checkComplete = () => {
          loadedCount++;
          if (loadedCount >= totalTextures) resolve();
        };
        const handleError = (type: string) => (err: any) => {
          console.warn(`${type} texture load error:`, err);
          checkComplete();
        };

        textureLoader.load(
          '/textures/anthracite-diff.jpg',
          (t) => {
            ('colorSpace' in t ? (t as any).colorSpace = THREE.SRGBColorSpace : (t as any).encoding = THREE.sRGBEncoding);
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(2, 2);
            diffuseTexture = t;
            checkComplete();
          },
          undefined,
          handleError('Diffuse')
        );

        textureLoader.load(
          '/textures/anthracite-normal.exr',
          (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(2, 2);
            normalTexture = t;
            checkComplete();
          },
          undefined,
          handleError('Normal')
        );

        textureLoader.load(
          '/textures/anthracite-roughness.exr',
          (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(2, 2);
            roughnessTexture = t;
            checkComplete();
          },
          undefined,
          handleError('Roughness')
        );

        textureLoader.load(
          '/textures/anthracite-disp.png',
          (t) => {
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(2, 2);
            displacementTexture = t;
            checkComplete();
          },
          undefined,
          handleError('Displacement')
        );
      });

    const loadModel = async () => {
      try {
        await loadTextures();

        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/ashtray.glb', resolve, undefined, reject);
        });

        ashtray = gltf.scene.clone();
        ashtray.position.set(0, 0, 0);
        ashtray.rotation.set(0.3, 1.2, -0.1);
        ashtray.scale.setScalar(getScale());

        const baseParams: THREE.MeshStandardMaterialParameters = {
          color: new THREE.Color('#8a8a8a'),
          roughness: 0.7,
          metalness: 0.0,
          transparent: true,
          opacity: 0
        };
        if (diffuseTexture) baseParams.map = diffuseTexture;
        if (normalTexture) {
          baseParams.normalMap = normalTexture;
          baseParams.normalScale = new THREE.Vector2(0.1, 0.1);
        }
        if (roughnessTexture) baseParams.roughnessMap = roughnessTexture;

        const templateMat = new THREE.MeshStandardMaterial(baseParams);

        ashtray.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const m = templateMat.clone();
            (c as THREE.Mesh).material = m;
            if (!isMobile) {
              (c as THREE.Mesh).castShadow = true;
              (c as THREE.Mesh).receiveShadow = true;
            }
          }
        });

        (ashtray as any).spinSpeed = {
          x: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
          y: (Math.random() - 0.5) * (isMobile ? 0.02 : 0.03),
          z: (Math.random() - 0.5) * (isMobile ? 0.018 : 0.025)
        };

        scene.add(ashtray);

        particles = createParticles(templateMat);

        /* fade‑in */
        const start = Date.now();
        const fadeDuration = isMobile ? 600 : 800;
        const fadeIn = () => {
          if (!ashtray) return;
          const elapsed = Date.now() - start;
          const p = Math.min(elapsed / fadeDuration, 1);
          const eased = 1 - Math.pow(1 - p, 3);

          ashtray.traverse((c) => {
            if ((c as THREE.Mesh).isMesh) {
              ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = eased;
            }
          });
          particles.forEach((particle, index) => {
            const delay = index * 200;
            const partElapsed = Math.max(0, elapsed - delay);
            const partP = Math.min(partElapsed / fadeDuration, 1);
            const partEased = 1 - Math.pow(1 - partP, 3);
            ((particle as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = partEased;
          });

          if (p < 1) requestAnimationFrame(fadeIn);
          else {
            ashtray.traverse((c) => {
              if ((c as THREE.Mesh).isMesh) {
                const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
                m.transparent = false;
                m.opacity = 1;
              }
            });
            particles.forEach((p) => {
              const m = (p as THREE.Mesh).material as THREE.MeshStandardMaterial;
              m.transparent = false;
              m.opacity = 1.0;
            });
          }
        };
        fadeIn();

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load GLTF model:', err);
        setError('Model loading failed. Check /models/ashtray.glb.');
      }
    };
    loadModel();

    /* ------------- Interaction ------------- */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isTouch = false;

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      let clientX: number | undefined;
      let clientY: number | undefined;

      if ('touches' in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
        isTouch = true;
      } else if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
        isTouch = false;
      } else return;

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      if (!isMobile || isTouch) {
        if (ashtray) {
          raycaster.setFromCamera(mouse, camera);
          const allObjects = [ashtray, ...particles];
          const intersects = raycaster.intersectObjects(allObjects, true);
          hoveredObject = null;
          if (intersects.length > 0) {
            let newHovered = intersects[0].object;
            while (newHovered.parent && newHovered.parent !== scene) {
              newHovered = newHovered.parent;
            }
            if (allObjects.includes(newHovered)) hoveredObject = newHovered;
          }
        }
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    const onTouchEnd = () => {
      hoveredObject = null;
      isTouch = false;
    };
    window.addEventListener('touchend', onTouchEnd);

    /* ------------- Animation loop ------------- */
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const interval = 1000 / targetFPS;

    const animate = (time: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (isMobile && time - lastTime < interval) return;
      lastTime = time;

      if (ashtray) {
        const spin = (ashtray as any).spinSpeed;
        if (ashtray !== hoveredObject) {
          ashtray.rotation.x += spin.x;
          ashtray.rotation.y += spin.y;
          ashtray.rotation.z += spin.z;
        } else {
          const damping = isMobile ? 0.2 : 0.3;
          ashtray.rotation.x += spin.x * damping;
          ashtray.rotation.y += spin.y * damping;
          ashtray.rotation.z += spin.z * damping;

          const sensitivity = isMobile ? 10 : 15;
          const mousePos3D = new THREE.Vector3(mouse.x * sensitivity, mouse.y * sensitivity, 8);
          const dir = new THREE.Vector3().subVectors(mousePos3D, ashtray.position).normalize();
          const targetRot = new THREE.Euler();
          targetRot.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
          const rotSpeed = isMobile ? 0.015 : 0.02;
          ashtray.rotation.x += (targetRot.x - ashtray.rotation.x) * rotSpeed;
          ashtray.rotation.y += (targetRot.y - ashtray.rotation.y) * rotSpeed;
        }
      }

      particles.forEach((particle, index) => {
        const props = (particle as any).orbitProps;
        if (!props) return;

        props.currentAngle += props.speed;

        const x = Math.cos(props.currentAngle) * props.distance;
        const z = Math.sin(props.currentAngle) * props.distance * props.eccentricity;
        const bobOffset = Math.sin(time * 0.001 * (1 + index * 0.3)) * props.bobAmplitude;
        const y = props.baseY + bobOffset;

        particle.position.x += (x - particle.position.x) * 0.02;
        particle.position.z += (z - particle.position.z) * 0.02;
        particle.position.y += (y - particle.position.y) * 0.03;

        if (particles.indexOf(particle) !== hoveredObject) {
          particle.rotation.x += 0.005 + index * 0.001;
          particle.rotation.y += 0.007 - index * 0.0015;
          particle.rotation.z += 0.003 + index * 0.002;
        }

        const targetScale = particle === hoveredObject ? 1.1 : 1.0;
        const currentScale = particle.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.1;
        particle.scale.setScalar(newScale);
      });

      renderer.render(scene, camera);
    };
    animate(0);

    /* ------------- Resize handler ------------- */
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.fov = width < 768 ? 85 : 75;
      camera.position.z = getCameraDistance();
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (ashtray) {
        ashtray.scale.setScalar(getScale());
      }

      const newIsMobile = isMobileScreen();
      if (newIsMobile !== isMobile) setIsMobile(newIsMobile);
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };
    window.addEventListener('resize', throttledResize);

    /* ------------- cleanup ------------- */
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (resizeTimeout) clearTimeout(resizeTimeout);

      if (ashtray) {
        ashtray.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const mesh = c as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
            else mesh.material.dispose();
          }
        });
      }

      particles.forEach((particle) => {
        particle.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const mesh = c as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
            else mesh.material.dispose();
          }
        });
        scene.remove(particle);
      });

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  /* ==============   JSX (via portal)   ============== */
  return createPortal(
    <>
      <div
        ref={mountRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s'
        }}
      />
      {error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <p style={{ color: '#dc2626', fontWeight: '500', marginBottom: '8px' }}>3D Model Error</p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
            <p style={{ color: '#9ca3af', fontSize: '12px' }}>Using geometric fallback instead</p>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default Floating3DObjects;
