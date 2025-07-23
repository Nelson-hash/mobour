import React, { useRef, useEffect, useState, useCallback } from 'react';

// Lazy import Three.js to avoid blocking the main bundle
const loadThreeJS = async () => {
  try {
    const THREE = await import('three');
    return THREE;
  } catch (error) {
    console.warn('Failed to load Three.js:', error);
    return null;
  }
};

// Lazy import GLTFLoader
const loadGLTFLoader = async () => {
  try {
    const module = await import('three/examples/jsm/loaders/GLTFLoader.js');
    return module.GLTFLoader;
  } catch (error) {
    console.warn('Failed to load GLTFLoader:', error);
    return null;
  }
};

interface Floating3DObjectsProps {
  className?: string;
}

const Floating3DObjects: React.FC<Floating3DObjectsProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number>();
  const objectsRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRender3D, setShouldRender3D] = useState(false);

  // Device and performance detection
  const checkShouldRender3D = useCallback(() => {
    // Don't render on very small screens
    if (window.innerWidth < 480) return false;
    
    // Don't render on mobile devices with low memory
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    if (isMobile && isLowEnd) return false;
    
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
    
    return true;
  }, []);

  useEffect(() => {
    const shouldRender = checkShouldRender3D();
    setShouldRender3D(shouldRender);
    
    if (!shouldRender) {
      setIsLoaded(true);
      return;
    }

    let cleanup: (() => void) | null = null;

    const initializeThreeJS = async () => {
      if (!mountRef.current) return;

      try {
        // Load Three.js dynamically
        const THREE = await loadThreeJS();
        if (!THREE) {
          throw new Error('Failed to load Three.js');
        }

        const isMobile = window.innerWidth < 768;
        
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(
          isMobile ? 90 : 75,
          window.innerWidth / window.innerHeight,
          0.1,
          100
        );
        
        const renderer = new THREE.WebGLRenderer({ 
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          precision: isMobile ? 'mediump' : 'highp'
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.setClearColor(0x000000, 0);
        
        // Only enable shadows on desktop
        if (!isMobile) {
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFShadowMap;
        }
        
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xf0f0f0, isMobile ? 1.0 : 0.7);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 0.8 : 1.2);
        directionalLight.position.set(15, 15, 10);
        
        if (!isMobile) {
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 512;
          directionalLight.shadow.mapSize.height = 512;
          directionalLight.shadow.camera.far = 50;
        }
        scene.add(directionalLight);

        // Camera positioning
        const getCameraDistance = () => {
          if (isMobile) return 50;
          if (window.innerWidth < 1024) return 40;
          return 30;
        };

        camera.position.z = getCameraDistance();

        // Try to load the GLTF model
        const GLTFLoader = await loadGLTFLoader();
        const maxObjects = isMobile ? 3 : 5;

        if (GLTFLoader) {
          try {
            const loader = new GLTFLoader();
            
            // Load model with timeout
            const loadModelWithTimeout = (url: string, timeout = 5000) => {
              return Promise.race([
                new Promise((resolve, reject) => {
                  loader.load(url, resolve, undefined, reject);
                }),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Model loading timeout')), timeout)
                )
              ]);
            };

            const gltf = await loadModelWithTimeout('/models/ashtray.glb');
            const originalModel = (gltf as any).scene;
            
            // Create positions - Only 1 central ashtray
            const getPositions = () => {
              return [
                { x: 0, y: 0, z: 0, rotX: 0.3, rotY: 1.2, rotZ: -0.1 } // Only center position
              ];
            };

            const positions = getPositions();
            const maxObjects = 1; // Only 1 object
            let loadedCount = 0;

            // Create objects
            for (let i = 0; i < Math.min(maxObjects, positions.length); i++) {
              const ashtray = originalModel.clone();
              const pos = positions[i];
              
              ashtray.position.set(pos.x, pos.y, pos.z);
              ashtray.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
              
              // Make it bigger since it's the only one
              const scale = isMobile ? 4.0 : 6.0;
              ashtray.scale.setScalar(scale);

              // Apply materials
              const material = new THREE.MeshLambertMaterial({ 
                color: 0xf8f8f8,
                transparent: true,
                opacity: 0
              });

              ashtray.traverse((child: any) => {
                if (child.isMesh) {
                  child.material = material.clone();
                  if (!isMobile) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                }
              });
              
              // Animation properties
              (ashtray as any).spinSpeed = {
                x: (Math.random() - 0.5) * (isMobile ? 0.01 : 0.015),
                y: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
                z: (Math.random() - 0.5) * (isMobile ? 0.012 : 0.018)
              };

              scene.add(ashtray);
              objectsRef.current.push(ashtray);

              // Fade in animation - No delay needed for single ashtray
              const startTime = Date.now();
              const fadeDuration = isMobile ? 400 : 600;

              const fadeIn = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / fadeDuration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                ashtray.traverse((child: any) => {
                  if (child.isMesh && child.material && 'opacity' in child.material) {
                    child.material.opacity = easedProgress;
                  }
                });

                if (progress < 1) {
                  requestAnimationFrame(fadeIn);
                } else {
                  ashtray.traverse((child: any) => {
                    if (child.isMesh && child.material) {
                      child.material.transparent = false;
                      child.material.opacity = 1;
                    }
                  });
                  setIsLoaded(true);
                }
              };
              
              fadeIn();
            }

          } catch (modelError) {
            console.warn('GLTF model loading failed, creating fallback geometry:', modelError);
            
            // Create geometric fallback
            const createFallbackAshtray = (position: any, index: number) => {
              const group = new THREE.Group();
              
              const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 16);
              const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xf8f8f8,
                transparent: true,
                opacity: 0
              });
              const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
              body.position.y = 0.25;
              group.add(body);
              
              group.position.set(position.x, position.y, position.z);
              group.rotation.set(position.rotX, position.rotY, position.rotZ);
              group.scale.setScalar(isMobile ? 2.5 : 3.5 + (index * 0.05));
              
              (group as any).spinSpeed = {
                x: (Math.random() - 0.5) * (isMobile ? 0.01 : 0.015),
                y: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
                z: (Math.random() - 0.5) * (isMobile ? 0.012 : 0.018)
              };
              
              return group;
            };

            // Create geometric fallback - Only 1 central ashtray
            const createFallbackAshtray = () => {
              const group = new THREE.Group();
              
              const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 16);
              const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xf8f8f8,
                transparent: true,
                opacity: 0
              });
              const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
              body.position.y = 0.25;
              group.add(body);
              
              group.position.set(0, 0, 0); // Center position
              group.rotation.set(0.3, 1.2, -0.1);
              group.scale.setScalar(isMobile ? 4.0 : 6.0); // Bigger single ashtray
              
              (group as any).spinSpeed = {
                x: (Math.random() - 0.5) * (isMobile ? 0.01 : 0.015),
                y: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
                z: (Math.random() - 0.5) * (isMobile ? 0.012 : 0.018)
              };
              
              return group;
            };

            const fallbackAshtray = createFallbackAshtray();
            scene.add(fallbackAshtray);
            objectsRef.current.push(fallbackAshtray);

            // Fade in fallback - Only 1 ashtray
            const startTime = Date.now();
            const fadeDuration = isMobile ? 400 : 600;

            const fadeIn = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / fadeDuration, 1);
              const easedProgress = 1 - Math.pow(1 - progress, 3);
              
              fallbackAshtray.traverse((child: any) => {
                if (child.isMesh && child.material && 'opacity' in child.material) {
                  child.material.opacity = easedProgress;
                }
              });

              if (progress < 1) {
                requestAnimationFrame(fadeIn);
              } else {
                fallbackAshtray.traverse((child: any) => {
                  if (child.isMesh && child.material) {
                    child.material.transparent = false;
                    child.material.opacity = 1;
                  }
                });
                setIsLoaded(true);
              }
            };
            
            fadeIn();
          }
        }

        // Mouse interaction (desktop only)
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredObject: any = null;

        const onMouseMove = (event: MouseEvent) => {
          if (isMobile || objectsRef.current.length === 0) return;

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

        if (!isMobile) {
          window.addEventListener('mousemove', onMouseMove, { passive: true });
        }

        // Animation loop
        let lastTime = 0;
        const targetFPS = isMobile ? 30 : 60;
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
            } else if (!isMobile) {
              object.rotation.x += spinSpeed.x * 0.3;
              object.rotation.y += spinSpeed.y * 0.3;
              object.rotation.z += spinSpeed.z * 0.3;
            }
          });
          
          renderer.render(scene, camera);
        };

        animate(0);

        // Resize handler
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          camera.aspect = width / height;
          camera.fov = width < 768 ? 90 : 75;
          camera.position.z = getCameraDistance();
          camera.updateProjectionMatrix();
          
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        };

        const throttledResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(handleResize, 150);
        };

        window.addEventListener('resize', throttledResize, { passive: true });

        // Cleanup function
        cleanup = () => {
          window.removeEventListener('resize', throttledResize);
          if (!isMobile) {
            window.removeEventListener('mousemove', onMouseMove);
          }
          
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }
          
          objectsRef.current.forEach(object => {
            object.traverse((child: any) => {
              if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((mat: any) => mat.dispose());
                  } else {
                    child.material.dispose();
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

      } catch (error) {
        console.error('Three.js initialization failed:', error);
        setError('3D rendering unavailable');
        setIsLoaded(true);
      }
    };

    // Initialize with a small delay
    const timer = setTimeout(initializeThreeJS, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [checkShouldRender3D]);

  // Don't render anything if 3D is not supported
  if (!shouldRender3D) {
    return null;
  }

  return (
    <>
      <div 
        ref={mountRef} 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{ 
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-50 pointer-events-none">
          <div className="text-center bg-white bg-opacity-90 px-4 py-2 rounded text-xs">
            <p className="text-gray-600">3D view unavailable</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Floating3DObjects;
