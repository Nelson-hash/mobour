import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

// Simplified GLTFLoader with better error handling
const GLTFLoader = (() => {
  class GLTFLoader {
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (progress: any) => void, onError?: (error: any) => void) {
      // Try dynamic import first
      import('three/examples/jsm/loaders/GLTFLoader.js')
        .then((module) => {
          const loader = new module.GLTFLoader();
          loader.load(url, onLoad, onProgress, onError);
        })
        .catch(() => {
          // Fallback to geometric ashtray
          console.log('Using geometric fallback');
          const scene = this.createFallbackAshtray();
          onLoad({ scene });
        });
    }
    
    createFallbackAshtray() {
      const group = new THREE.Group();
      
      // Simplified geometry for better performance
      const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 16); // Reduced segments
      const bodyMaterial = new THREE.MeshLambertMaterial({ // Lambert is faster than Phong
        color: 0xf8f8f8
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.25;
      group.add(body);
      
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
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Memoized device detection
  const checkDevice = useCallback(() => {
    const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
    return mobile;
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const isMobileDevice = checkDevice();
    
    // Early return for very small screens or low-end devices
    if (window.innerWidth < 480) {
      setIsLoaded(true);
      return;
    }

    // Scene setup with performance optimizations
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      isMobileDevice ? 90 : 75,
      window.innerWidth / window.innerHeight,
      0.1,
      100 // Reduced far plane
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobileDevice, // Disable AA on mobile
      alpha: true,
      powerPreference: "high-performance",
      precision: isMobileDevice ? 'mediump' : 'highp' // Lower precision on mobile
    });
    
    // Performance settings
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    
    // Disable shadows on mobile entirely
    if (!isMobileDevice) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap; // Faster than PCFSoft
    }
    
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Simplified lighting for mobile
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, isMobileDevice ? 1.0 : 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobileDevice ? 0.8 : 1.2);
    directionalLight.position.set(15, 15, 10);
    
    if (!isMobileDevice) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 512; // Reduced shadow map size
      directionalLight.shadow.mapSize.height = 512;
      directionalLight.shadow.camera.far = 50; // Reduced shadow distance
    }
    scene.add(directionalLight);

    // Camera positioning based on device
    const getCameraDistance = () => {
      if (isMobileDevice) return 50;
      if (window.innerWidth < 1024) return 40;
      return 30;
    };

    camera.position.z = getCameraDistance();

    // Load models with reduced count on mobile
    const loader = new GLTFLoader();
    const maxObjects = isMobileDevice ? 3 : 5; // Fewer objects on mobile
    let loadedCount = 0;

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
        
        // Reduced positioning array for mobile
        const getPositions = () => {
          const scale = isMobileDevice ? 0.8 : 1;
          const positions = [
            { x: 0, y: 0, z: 0, rotX: 0.3, rotY: 1.2, rotZ: -0.1 }, // Center
            { x: -25 * scale, y: 10 * scale, z: -5 * scale, rotX: 0.1, rotY: 0.3, rotZ: 0.2 },
            { x: 25 * scale, y: 12 * scale, z: -4 * scale, rotX: -0.2, rotY: -0.4, rotZ: 0.1 }
          ];
          
          if (!isMobileDevice) {
            positions.push(
              { x: -18 * scale, y: -6 * scale, z: 8 * scale, rotX: -0.1, rotY: 0.3, rotZ: 0.2 },
              { x: 18 * scale, y: -8 * scale, z: 10 * scale, rotX: 0.1, rotY: -0.6, rotZ: -0.2 }
            );
          }
          
          return positions;
        };

        const positions = getPositions();

        // Create objects with performance optimizations
        for (let i = 0; i < maxObjects && i < positions.length; i++) {
          const ashtray = originalModel.clone();
          const pos = positions[i];
          
          ashtray.position.set(pos.x, pos.y, pos.z);
          ashtray.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
          
          const scale = isMobileDevice ? 2.5 : 3.5 + (i * 0.05);
          ashtray.scale.setScalar(scale);

          // Simplified materials for performance
          const material = new THREE.MeshLambertMaterial({ 
            color: 0xf8f8f8,
            transparent: true,
            opacity: 0
          });

          ashtray.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              
              // Reduce geometry complexity on mobile
              if (isMobileDevice && mesh.geometry) {
                mesh.geometry = mesh.geometry.clone();
                if ('simplify' in mesh.geometry) {
                  // Simplify geometry if the method exists
                }
              }
              
              mesh.material = material.clone();
              
              if (!isMobileDevice) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
              }
            }
          });
          
          // Store animation properties
          (ashtray as any).spinSpeed = {
            x: (Math.random() - 0.5) * (isMobileDevice ? 0.01 : 0.015),
            y: (Math.random() - 0.5) * (isMobileDevice ? 0.015 : 0.02),
            z: (Math.random() - 0.5) * (isMobileDevice ? 0.012 : 0.018)
          };

          scene.add(ashtray);
          objectsRef.current.push(ashtray);

          // Staggered fade-in
          setTimeout(() => {
            const startTime = Date.now();
            const fadeDuration = isMobileDevice ? 400 : 600;

            const fadeIn = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / fadeDuration, 1);
              const easedProgress = 1 - Math.pow(1 - progress, 3);
              
              ashtray.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                  const material = (child as THREE.Mesh).material as THREE.Material;
                  if ('opacity' in material) {
                    (material as any).opacity = easedProgress;
                  }
                }
              });

              if (progress < 1) {
                requestAnimationFrame(fadeIn);
              } else {
                ashtray.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    const material = (child as THREE.Mesh).material as THREE.Material;
                    if ('transparent' in material) {
                      (material as any).transparent = false;
                      (material as any).opacity = 1;
                    }
                  }
                });
                loadedCount++;
                if (loadedCount === maxObjects) {
                  setIsLoaded(true);
                }
              }
            };
            
            fadeIn();
          }, i * (isMobileDevice ? 100 : 150));
        }

      } catch (err) {
        console.error('Model loading failed:', err);
        setError('3D model loading failed');
        setIsLoaded(true);
      }
    };

    loadModel();

    // Optimized mouse interaction (disabled on mobile for performance)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: THREE.Object3D | null = null;

    const onMouseMove = (event: MouseEvent) => {
      if (isMobileDevice || objectsRef.current.length === 0) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objectsRef.current, true);

      hoveredObject = null;
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== scene) {
          obj = obj.parent;
        }
        if (objectsRef.current.includes(obj)) {
          hoveredObject = obj;
        }
      }
    };

    if (!isMobileDevice) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    // Optimized animation loop
    let lastTime = 0;
    const targetFPS = isMobileDevice ? 30 : 60;
    const interval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      objectsRef.current.forEach((object) => {
        const spinSpeed = (object as any).spinSpeed;
        
        if (object !== hoveredObject) {
          object.rotation.x += spinSpeed.x;
          object.rotation.y += spinSpeed.y;
          object.rotation.z += spinSpeed.z;
        } else if (!isMobileDevice) {
          // Hover interaction only on desktop
          object.rotation.x += spinSpeed.x * 0.3;
          object.rotation.y += spinSpeed.y * 0.3;
          object.rotation.z += spinSpeed.z * 0.3;
        }
      });
      
      renderer.render(scene, camera);
    };

    animate(0);

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.fov = width < 768 ? 90 : 75;
      camera.position.z = getCameraDistance();
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2));
    };

    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', throttledResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize);
      if (!isMobileDevice) {
        window.removeEventListener('mousemove', onMouseMove);
      }
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      objectsRef.current.forEach(object => {
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.dispose());
              } else {
                mesh.material.dispose();
              }
            }
          }
        });
      });
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [checkDevice]);

  // Don't render 3D on very small screens
  if (window.innerWidth < 480) {
    return null;
  }

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
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-50">
          <div className="text-center bg-white bg-opacity-90 px-4 py-2 rounded text-xs">
            <p className="text-gray-600">3D view unavailable</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Floating3DObjects;
