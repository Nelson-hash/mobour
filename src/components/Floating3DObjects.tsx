import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

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
      isMobile ? 85 : 75, // Wider FOV on mobile
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" // Better performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile; // Disable shadows on mobile for performance
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);

    // Responsive lighting setup
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, isMobile ? 0.8 : 0.7);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 1.0 : 1.2);
    directionalLight.position.set(15, 15, 10);
    if (!isMobile) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024; // Reduced for better performance
      directionalLight.shadow.mapSize.height = 1024;
    }
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xd0d0d0, 0.3);
    accentLight.position.set(0, 10, 0);
    scene.add(accentLight);

    // Responsive camera positioning
    const getCameraDistance = () => {
      if (window.innerWidth < 480) return 45; // Phone
      if (window.innerWidth < 768) return 40; // Small tablet
      if (window.innerWidth < 1024) return 35; // Tablet
      return 30; // Desktop
    };

    camera.position.z = getCameraDistance();

    // Create simple geometric ashtrays instead of loading GLTF
    const objects: THREE.Object3D[] = [];
    let hoveredObject: THREE.Object3D | null = null;

    const createAshtray = () => {
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
      
      // Small notches for cigarettes (3 of them)
      for (let i = 0; i < 3; i++) {
        const notchGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const notch = new THREE.Mesh(notchGeometry, bodyMaterial);
        const angle = (i / 3) * Math.PI * 2;
        notch.position.x = Math.cos(angle) * 2.2;
        notch.position.z = Math.sin(angle) * 2.2;
        notch.position.y = 0.4;
        group.add(notch);
      }
      
      if (!isMobile) {
        body.castShadow = true;
        body.receiveShadow = true;
        inner.castShadow = true;
        inner.receiveShadow = true;
      }
      
      return group;
    };

    const loadModel = async () => {
      try {
        console.log('Creating geometric ashtrays...');

        // Responsive positioning - only 5 ashtrays (center + 4 corners)
        const getResponsivePositions = () => {
          const scale = window.innerWidth < 768 ? 0.7 : 1; // Closer on mobile
          return [
            { x: -32 * scale, y: 15 * scale, z: -8 * scale, rotX: 0.1, rotY: 0.3, rotZ: 0.2 }, // Top left
            { x: 30 * scale, y: 16 * scale, z: -6 * scale, rotX: -0.2, rotY: -0.4, rotZ: 0.1 }, // Top right
            { x: -3 * scale, y: -2 * scale, z: 5 * scale, rotX: 0.3, rotY: 1.2, rotZ: -0.1 }, // Center
            { x: -22 * scale, y: -6 * scale, z: 8 * scale, rotX: -0.1, rotY: 0.3, rotZ: 0.2 }, // Bottom left
            { x: 20 * scale, y: -8 * scale, z: 12 * scale, rotX: 0.1, rotY: -0.6, rotZ: -0.2 } // Bottom right
          ];
        };

        const positions = getResponsivePositions();

        // Create 5 ashtrays with simple fade-in
        for (let i = 0; i < 5; i++) {
          const ashtray = createAshtray();
          const pos = positions[i];
          
          // Set final positions immediately
          ashtray.position.set(pos.x, pos.y, pos.z);
          ashtray.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
          
          // Responsive scaling - smaller on mobile
          const getResponsiveScale = (index: number) => {
            const baseScale = window.innerWidth < 768 ? 3.0 : 4.0; // Smaller on mobile
            return baseScale + (index * 0.08);
          };

          const scale = getResponsiveScale(i);
          ashtray.scale.setScalar(scale);

          // Set initial opacity to 0
          ashtray.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const material = mesh.material as THREE.MeshPhongMaterial;
              material.transparent = true;
              material.opacity = 0;
            }
          });
          
          // Store properties
          (ashtray as any).originalRotation = {
            x: ashtray.rotation.x,
            y: ashtray.rotation.y,
            z: ashtray.rotation.z
          };

          // Responsive spin speeds - slower on mobile for better performance
          (ashtray as any).spinSpeed = {
            x: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
            y: (Math.random() - 0.5) * (isMobile ? 0.02 : 0.03),
            z: (Math.random() - 0.5) * (isMobile ? 0.018 : 0.025)
          };

          scene.add(ashtray);
          objects.push(ashtray);

          // Responsive fade-in timing - faster on mobile
          setTimeout(() => {
            const startTime = Date.now();
            const fadeDuration = isMobile ? 600 : 800; // Faster on mobile

            const fadeIn = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / fadeDuration, 1);
              
              // Smooth easing function
              const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
              const easedProgress = easeOutCubic(progress);
              
              ashtray.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  const material = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
                  material.opacity = easedProgress;
                }
              });

              if (progress < 1) {
                requestAnimationFrame(fadeIn);
              } else {
                ashtray.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh) {
                    const material = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
                    material.transparent = false;
                    material.opacity = 1;
                  }
                });
              }
            };
            
            fadeIn();
          }, i * (isMobile ? 150 : 200)); // Faster stagger on mobile
        }

        setIsLoaded(true);

      } catch (err) {
        console.error('Failed to create ashtrays:', err);
        setError(`Ashtray creation failed: ${err}`);
      }
    };

    // Start creating the ashtrays
    loadModel();

    // Responsive mouse/touch interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isTouch = false;

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      
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

      // Only do raycast interaction on desktop or when touch is active
      if (!isMobile || isTouch) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects, true);

        if (hoveredObject) {
          hoveredObject = null;
        }

        if (intersects.length > 0) {
          let newHovered = intersects[0].object;
          
          while (newHovered.parent && newHovered.parent !== scene) {
            newHovered = newHovered.parent;
          }

          if (objects.includes(newHovered)) {
            hoveredObject = newHovered;
          }
        }
      }
    };

    // Add both mouse and touch event listeners
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    
    // Reset hover on touch end
    const onTouchEnd = () => {
      hoveredObject = null;
      isTouch = false;
    };
    window.addEventListener('touchend', onTouchEnd);

    // Smooth responsive animation loop
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60; // Lower FPS on mobile for better performance
    const interval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Throttle frame rate on mobile
      if (currentTime - lastTime < interval && isMobile) {
        return;
      }
      lastTime = currentTime;

      objects.forEach((object, index) => {
        const spinSpeed = (object as any).spinSpeed;
        
        if (object !== hoveredObject) {
          object.rotation.x += spinSpeed.x;
          object.rotation.y += spinSpeed.y;
          object.rotation.z += spinSpeed.z;
        } else {
          // Smoother hover interaction
          const hoverDamping = isMobile ? 0.2 : 0.3;
          object.rotation.x += spinSpeed.x * hoverDamping;
          object.rotation.y += spinSpeed.y * hoverDamping;
          object.rotation.z += spinSpeed.z * hoverDamping;
          
          // Responsive mouse following sensitivity
          const mouseSensitivity = isMobile ? 10 : 15;
          const mousePosition3D = new THREE.Vector3(mouse.x * mouseSensitivity, mouse.y * mouseSensitivity, 8);
          const objectPosition = object.position;
          const direction = new THREE.Vector3().subVectors(mousePosition3D, objectPosition).normalize();
          
          const targetRotation = new THREE.Euler();
          targetRotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            direction
          ));
          
          // Smoother rotation interpolation
          const rotationSpeed = isMobile ? 0.015 : 0.02;
          object.rotation.x += (targetRotation.x - object.rotation.x) * rotationSpeed;
          object.rotation.y += (targetRotation.y - object.rotation.y) * rotationSpeed;
        }
      });
      
      renderer.render(scene, camera);
    };

    animate(0);

    // Smooth responsive resize handling
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.fov = width < 768 ? 85 : 75; // Adjust FOV based on screen size
      camera.position.z = getCameraDistance(); // Update camera distance
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Update mobile state
      const newIsMobile = width < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
    };

    // Throttled resize for better performance
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
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      objects.forEach(object => {
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      });
      
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
            <p className="text-red-600 font-medium mb-2">3D Creation Error</p>
            <p className="text-sm text-gray-600 mb-4">Check console for details</p>
            <p className="text-xs text-gray-500">Geometric ashtrays creation failed</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Floating3DObjects;
