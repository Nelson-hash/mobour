import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Import GLTFLoader from the CDN-hosted examples
const GLTFLoader = (() => {
  if (typeof window !== 'undefined' && (window as any).THREE) {
    return (window as any).THREE.GLTFLoader;
  }
  
  class GLTFLoader {
    load(
      url: string,
      onLoad: (gltf: any) => void,
      onProgress?: (progress: any) => void,
      onError?: (error: any) => void
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
      
      // Main body - cylinder
      const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
      const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xf8f8f8,
        shininess: 15,
        specular: 0x888888
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.25;
      group.add(body);
      
      // Inner depression
      const innerGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
      const innerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe8e8e8,
        shininess: 10
      });
      const inner = new THREE.Mesh(innerGeometry, innerMaterial);
      inner.position.y = 0.35;
      group.add(inner);
      
      // Notches
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

    // --- Helpers ---
    const isMobileScreen = () => window.innerWidth < 768;
    const getScale = () => {
      const BASE_MOBILE = 15.0;
      const BASE_DESKTOP = 24.0;
    return (isMobileScreen() ? BASE_MOBILE : BASE_DESKTOP) * 0.64; // 36% of original reduction
    };


    // Detect mobile/tablet
    const checkMobile = () => {
      setIsMobile(isMobileScreen());
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

    // Lighting
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

    // Camera distance
    const getCameraDistance = () => {
      if (window.innerWidth < 480) return 45;
      if (window.innerWidth < 768) return 40;
      if (window.innerWidth < 1024) return 35;
      return 30;
    };
    camera.position.z = getCameraDistance();

    // GLTF loader & model
    const loader = new GLTFLoader();
    let ashtray: THREE.Object3D | null = null;
    let hoveredObject: THREE.Object3D | null = null;

    const loadModel = async () => {
      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/models/ashtray.glb',
            resolve,
            undefined,
            reject
          );
        });

        const originalModel = gltf.scene;
        ashtray = originalModel.clone();

        ashtray.position.set(0, 0, 0);
        ashtray.rotation.set(0.3, 1.2, -0.1);

        // 20% reduction done inside getScale()
        ashtray.scale.setScalar(getScale());

        // Material
        const anthraciteMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x2c2c2c,
          shininess: 8,
          specular: 0x404040,
          transparent: true,
          opacity: 0
        });

        ashtray.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = anthraciteMaterial.clone();
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

        const fadeIn = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fadeDuration, 1);
          const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
          const eased = easeOutCubic(progress);

          ashtray!.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
              mat.opacity = eased;
            }
          });

          if (progress < 1) {
            requestAnimationFrame(fadeIn);
          } else {
            ashtray!.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
                mat.transparent = false;
                mat.opacity = 1;
              }
            });
          }
        };

        fadeIn();
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load GLTF model:', err);
        setError('Model loading failed. Please ensure /models/ashtray.glb exists in your public folder.');
      }
    };

    loadModel();

    // Raycasting & pointer events
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isTouch = false;

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      let clientX: number | undefined, clientY: number | undefined;
      
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

          hoveredObject = null;
          if (intersects.length > 0) {
            let newHovered = intersects[0].object;
            while (newHovered.parent && newHovered.parent !== scene) {
              newHovered = newHovered.parent;
            }
            if (newHovered === ashtray) {
              hoveredObject = newHovered;
            }
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

    // Animation loop (throttled on mobile)
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const interval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (isMobile && currentTime - lastTime < interval) {
        return;
      }
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
          targetRotation.setFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)
          );
          
          const rotationSpeed = isMobile ? 0.015 : 0.02;
          ashtray.rotation.x += (targetRotation.x - ashtray.rotation.x) * rotationSpeed;
          ashtray.rotation.y += (targetRotation.y - ashtray.rotation.y) * rotationSpeed;
        }
      }

      renderer.render(scene, camera);
    };

    animate(0);

    // Resize handling (also rescale the object)
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.fov = width < 768 ? 85 : 75;
      camera.position.z = getCameraDistance();
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Update ashtray scale responsively
      if (ashtray) {
        ashtray.scale.setScalar(getScale());
      }

      // Update mobile state
      const newIsMobile = isMobileScreen();
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
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
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (resizeTimeout) clearTimeout(resizeTimeout);

      if (ashtray) {
        ashtray.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
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
        className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: 'none', zIndex: 1 }}
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
