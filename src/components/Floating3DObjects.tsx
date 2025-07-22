import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup optimized for white objects on concrete
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.7); // Slightly warm ambient light
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Stronger directional light
    directionalLight.position.set(15, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Secondary light from the opposite side for fill lighting
    const fillLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    // Subtle colored accent light for depth
    const accentLight = new THREE.PointLight(0xd0d0d0, 0.3);
    accentLight.position.set(0, 10, 0);
    scene.add(accentLight);

    camera.position.z = 30; // Moved camera even further back to see all 7 ashtrays including top corners

    // Load GLTF model
    const loader = new GLTFLoader();
    const objects: THREE.Object3D[] = [];
    let hoveredObject: THREE.Object3D | null = null;

    const loadModel = async () => {
      try {
        console.log('Loading ashtray model...');
        
        // Load the ashtray model once
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/models/ashtray.glb',
            (gltf) => {
              console.log('Model loaded successfully:', gltf);
              resolve(gltf);
            },
            undefined, // No progress callback
            (error) => {
              console.error('Error loading model:', error);
              reject(error);
            }
          );
        });

        const originalModel = gltf.scene;
        
        // Create exactly 7 white ashtrays in specific positions and orientations
        const positions = [
          { x: -32, y: 15, z: -8, rotX: 0.1, rotY: 0.3, rotZ: 0.2 },    // Far top left
          { x: 30, y: 16, z: -6, rotX: -0.2, rotY: -0.4, rotZ: 0.1 },   // Far top right
          { x: -20, y: 8, z: -12, rotX: 0.2, rotY: 0.5, rotZ: 0 },      // Top left
          { x: 18, y: 6, z: -10, rotX: 0, rotY: -0.8, rotZ: 0.1 },      // Top right  
          { x: -3, y: -2, z: 5, rotX: 0.3, rotY: 1.2, rotZ: -0.1 },     // Center
          { x: -22, y: -12, z: 8, rotX: -0.1, rotY: 0.3, rotZ: 0.2 },   // Bottom left
          { x: 20, y: -8, z: 12, rotX: 0.1, rotY: -0.6, rotZ: -0.2 }    // Bottom right
        ];

        // Create all ashtrays with simple fade-in
        for (let i = 0; i < 7; i++) {
          const ashtray = originalModel.clone();
          const pos = positions[i];
          
          // Set final positions immediately
          ashtray.position.set(pos.x, pos.y, pos.z);
          ashtray.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
          
          const baseScale = 4.0;
          const scale = baseScale + (i * 0.1);
          ashtray.scale.setScalar(scale);

          // Apply ceramic material
          const ceramicMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf8f8f8,
            shininess: 15,
            specular: 0x888888,
            transparent: true, // Enable transparency for fade
            opacity: 0 // Start invisible
          });

          ashtray.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = ceramicMaterial;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          
          // Store properties
          (ashtray as any).originalRotation = {
            x: ashtray.rotation.x,
            y: ashtray.rotation.y,
            z: ashtray.rotation.z
          };

          (ashtray as any).spinSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.03,
            z: (Math.random() - 0.5) * 0.025
          };

          scene.add(ashtray);
          objects.push(ashtray);

          // Simple fade-in with delay
          setTimeout(() => {
            const startTime = Date.now();
            const fadeDuration = 800; // 800ms fade

            const fadeIn = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / fadeDuration, 1);
              
              // Update opacity of all materials in the ashtray
              ashtray.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                  const material = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
                  material.opacity = progress;
                }
              });

              if (progress < 1) {
                requestAnimationFrame(fadeIn);
              } else {
                // Fade complete - disable transparency for better performance
                ashtray.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
                    const material = (child as THREE.Mesh).material as THREE.MeshPhongMaterial;
                    material.transparent = false;
                    material.opacity = 1;
                  }
                });
              }
            };
            
            fadeIn();
          }, i * 200); // 200ms delay between each ashtray
        }

        setIsLoaded(true);

    // Start loading the model
    loadModel();

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      // Update mouse position
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Cast ray from camera through mouse position
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects, true);

      // Reset previous hovered object (let it continue normal spinning)
      if (hoveredObject) {
        hoveredObject = null; // Just clear hover, spinning continues in animate loop
      }

      // Handle new hover
      if (intersects.length > 0) {
        let newHovered = intersects[0].object;
        
        // Find parent group or model
        while (newHovered.parent && newHovered.parent !== scene) {
          newHovered = newHovered.parent;
        }

        if (objects.includes(newHovered)) {
          hoveredObject = newHovered;
          // Mouse interaction logic is now handled in the animate loop
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop with space spinning
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Constant spinning animation for all ashtrays
      objects.forEach((object, index) => {
        const spinSpeed = (object as any).spinSpeed;
        
        if (object !== hoveredObject) {
          // Normal space-like spinning
          object.rotation.x += spinSpeed.x;
          object.rotation.y += spinSpeed.y;
          object.rotation.z += spinSpeed.z;
        } else {
          // When hovered, still spin but also follow mouse
          object.rotation.x += spinSpeed.x * 0.3; // Slower spin when hovered
          object.rotation.y += spinSpeed.y * 0.3;
          object.rotation.z += spinSpeed.z * 0.3;
          
          // Add mouse-following behavior on top of spinning
          const mousePosition3D = new THREE.Vector3(mouse.x * 15, mouse.y * 15, 8);
          const objectPosition = object.position;
          const direction = new THREE.Vector3().subVectors(mousePosition3D, objectPosition).normalize();
          
          const targetRotation = new THREE.Euler();
          targetRotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            direction
          ));
          
          // Gently influence rotation towards mouse (mixed with spinning)
          object.rotation.x += (targetRotation.x - object.rotation.x) * 0.02;
          object.rotation.y += (targetRotation.y - object.rotation.y) * 0.02;
        }
      });
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
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
            <p className="text-red-600 font-medium mb-2">3D Model Error</p>
            <p className="text-sm text-gray-600 mb-4">Check console for details</p>
            <p className="text-xs text-gray-500">Make sure ashtray.glb is in /public/models/</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Floating3DObjects;
