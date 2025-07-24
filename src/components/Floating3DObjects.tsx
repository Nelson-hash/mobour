import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Import GLTFLoader from the CDN-hosted examples (your existing fallback logic)
const GLTFLoader = (() => {
  if (typeof window !== 'undefined' && (window as any).THREE) {
    return (window as any).THREE.GLTFLoader;
  }

  class GLTFLoader {
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (progress: any) => void, onError?: (error: any) => void) {
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
      const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf8f8f8,
        shininess: 15,
        specular: 0x888888
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.25;
      group.add(body);

      const innerGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
      const innerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe8e8e8,
        shininess: 10
      });
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

  return GLTFLoader;
})();

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Detect mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 85 : 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, isMobile ? 0.8 : 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 1.0 : 1.2);
    directionalLight.position.set(15, 15, 10);
    if (!isMobile) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
    }
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xd0d0d0, 0.3);
    accentLight.position.set(0, 10, 0);
    scene.add(accentLight);

    const getCameraDistance = () => {
      if (window.innerWidth < 480) return 45;
      if (window.innerWidth < 768) return 40;
      if (window.innerWidth < 1024) return 35;
      return 30;
    };
    camera.position.z = getCameraDistance();

    // Load GLTF model + textures
    const loader = new GLTFLoader();
    const texLoader = new THREE.TextureLoader();

    let ashtray: THREE.Object3D | null = null;
    let hoveredObject: THREE.Object3D | null = null;

    const loadTextures = async () => {
      const base = texLoader.load('/models/anthracite-texture.jpg');
      const normal = texLoader.load('/models/anthracite-normal.jpg');
      const roughness = texLoader.load('/models/anthracite-roughness.jpg');

      // Color space settings (Three r152+)
      // Base/Diffuse -> sRGB; others stay linear
      base.colorSpace = THREE.SRGBColorSpace;

      // If you see seams/flip issues, try:
      // base.flipY = normal.flipY = roughness.flipY = false;

      return { base, normal, roughness };
    };

    const createAnthraciteMaterial = (maps: { base: THREE.Texture; normal: THREE.Texture; roughness: THREE.Texture }) => {
      const mat = new THREE.MeshStandardMaterial({
        map: maps.base,
        normalMap: maps.normal,
        roughnessMap: maps.roughness,
        metalness: 0.0,
        roughness: 1.0,
        transparent: true, // to allow the fade-in
        opacity: 0
      });
      return mat;
    };

    const loadModel = async () => {
      try {
        const maps = await loadTextures();

        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/models/ashtray.glb',
            (gltf) => resolve(gltf),
            undefined,
            (err) => reject(err)
          );
        });

        const originalModel = gltf.scene;
        ashtray = originalModel.clone();

        ashtray.position.set(0, 0, 0);
        ashtray.rotation.set(0.3, 1.2, -0.1);

        const scale = window.innerWidth < 768 ? 15.0 : 24.0;
        ashtray.scale.setScalar(scale);

        const anthraciteMaterial = createAnthraciteMaterial(maps);

        ashtray.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = anthraciteMaterial.clone();
            // If your model has a second UV set, you can plug AO/Lightmaps here.
            if (!isMobile) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          }
        });

        (ashtray as any).originalRotation = {
          x: ashtray.rotation.x,
          y: ashtray.rotation.y,
          z: ashtray.rotation.z
        };

        (ashtray as any).spinSpeed = {
          x: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
          y: (Math.random() - 0.5) * (isMobile ? 0.02 : 0.03),
          z: (Math.random() - 0.5) * (isMobile ? 0.018 : 0.025)
        };

        scene.add(ashtray);

        // Fade-in
        const startTime = Date.now();
        const fadeDuration = isMobile ? 600 : 800;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const fadeIn = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fadeDuration, 1);
          const eased = easeOutCubic(progress);

          ashtray!.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              material.opacity = eased;
            }
          });

          if (progress < 1) {
            requestAnimationFrame(fadeIn);
          } else {
            ashtray!.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                material.transparent = false;
                material.opacity = 1;
              }
            });
          }
        };

        fadeIn();
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load GLTF model or textures:', err);
        setError('Model or textures failed to load. Check /models/ paths.');
      }
    };

    loadModel();

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isTouch = false;

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;

      if ('touches' in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
        isTouch = true;
      } else if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
        isTouch = false;
      } else {
        return;
      }

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      if (!isMobile || isTouch) {
        if (ashtray) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects([ashtray], true);

          hoveredObject = intersects.length > 0 ? intersects[0].object : null;
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

    // Animation loop
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const interval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (currentTime - lastTime < interval && isMobile) return;
      lastTime = currentTime;

      if (ashtray) {
        const spinSpeed = (ashtray as any).spinSpeed;

        if (ashtray !== hoveredObject) {
          ashtray.rotation.x += spinSpeed.x;
          ashtray.rotation.y += spinSpeed.y;
          ashtray.rotation.z += spinSpeed.z;
        } else {
          const hoverDamping = isMobile ? 0.2 : 0.3;
          ashtray.rotation.x += spinSpeed.x * hoverDamping;
          ashtray.rotation.y += spinSpeed.y * hoverDamping;
          ashtray.rotation.z += spinSpeed.z * hoverDamping;

          const mouseSensitivity = isMobile ? 10 : 15;
          const mousePosition3D = new THREE.Vector3(mouse.x * mouseSensitivity, mouse.y * mouseSensitivity, 8);
          const direction = new THREE.Vector3().subVectors(mousePosition3D, ashtray.position).normalize();

          const targetRotation = new THREE.Euler();
          targetRotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            direction
          ));

          const rotationSpeed = isMobile ? 0.015 : 0.02;
          ashtray.rotation.x += (targetRotation.x - ashtray.rotation.x) * rotationSpeed;
          ashtray.rotation.y += (targetRotation.y - ashtray.rotation.y) * rotationSpeed;
        }
      }

      renderer.render(scene, camera);
    };

    animate(0);

    // Resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.fov = width < 768 ? 85 : 75;
      camera.position.z = getCameraDistance();
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const newIsMobile = width < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
    };

    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (resizeTimeout) clearTimeout(resizeTimeout);

      if (ashtray) {
        ashtray.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              (mesh.material as THREE.Material).dispose();
            }
          }
        });
      }

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center bg-white bg-opacity-90 px-6 py-4 rounded-lg shadow-lg">
            <p className="text-red-600 font-medium mb-2">3D Model Error</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500">Using geometric fallback instead</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Floating3DObjects;
