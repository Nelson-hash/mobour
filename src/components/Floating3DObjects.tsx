import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
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

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90a4, 0.4);
    pointLight.position.set(-10, 5, 5);
    scene.add(pointLight);

    camera.position.z = 15;

    // Load GLTF model
    const loader = new GLTFLoader();
    const objects: THREE.Object3D[] = [];

    const loadModel = async () => {
      try {
        console.log('Loading ashtray model...');
        
        // Load the ashtray model
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/models/ashtray.glb',
            (gltf) => {
              console.log('Model loaded successfully:', gltf);
              resolve(gltf);
            },
            (progress) => {
              const percentComplete = progress.total ? (progress.loaded / progress.total) * 100 : 0;
              setLoadingProgress(percentComplete);
              console.log('Loading progress:', percentComplete + '%');
            },
            (error) => {
              console.error('Error loading model:', error);
              reject(error);
            }
          );
        });

        const originalModel = gltf.scene;
        console.log('Original model:', originalModel);
        
        // Create multiple instances of the ashtray
        for (let i = 0; i < 8; i++) {
          const ashtray = originalModel.clone();
          
          // Random positions
          ashtray.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
          );
          
          // Varied scale
          const scale = 0.5 + Math.random() * 0.8;
          ashtray.scale.setScalar(scale);
          
          // Random initial rotation
          ashtray.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          );

          // Apply different materials for variety
          const materials = [
            new THREE.MeshPhongMaterial({ 
              color: 0x2c2c2c, // Dark anthracite
              shininess: 40,
              specular: 0x444444
            }),
            new THREE.MeshPhongMaterial({ 
              color: 0x1a1a1a, // Deep black
              shininess: 20,
              specular: 0x222222
            }),
            new THREE.MeshPhongMaterial({ 
              color: 0x4a90a4, // Steel blue
              shininess: 80,
              specular: 0x6bb0c4,
              emissive: 0x0a2a34,
              emissiveIntensity: 0.05
            }),
            new THREE.MeshPhongMaterial({ 
              color: 0xb8b8b8, // Brushed metal
              shininess: 120,
              specular: 0xffffff
            }),
          ];

          // Apply material to all meshes in the model
          ashtray.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = materials[i % materials.length];
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          
          // Animation properties
          (ashtray as any).initialY = ashtray.position.y;
          (ashtray as any).floatSpeed = Math.random() * 0.02 + 0.01;
          (ashtray as any).rotationSpeed = {
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.015,
          };
          
          scene.add(ashtray);
          objects.push(ashtray);
        }

        console.log('All ashtrays added to scene:', objects.length);
        setIsLoaded(true);

      } catch (err) {
        console.error('Failed to load GLTF model:', err);
        setError(`Model loading failed: ${err}`);
        // DO NOT create fallback objects - only show ashtrays
      }
    };

    // Start loading the model
    loadModel();

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: THREE.Object3D | null = null;

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects, true);

      // Reset previous hovered object
      if (hoveredObject) {
        hoveredObject.scale.divideScalar(1.4);
        hoveredObject = null;
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
          hoveredObject.scale.multiplyScalar(1.4);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      objects.forEach((object, index) => {
        // Floating animation
        object.position.y = (object as any).initialY + 
          Math.sin(Date.now() * (object as any).floatSpeed + index * 0.8) * 1.2;
        
        // Rotation animation
        if (object !== hoveredObject) {
          object.rotation.x += (object as any).rotationSpeed.x;
          object.rotation.y += (object as any).rotationSpeed.y;
          object.rotation.z += (object as any).rotationSpeed.z;
        } else {
          // Faster rotation when hovered
          object.rotation.x += (object as any).rotationSpeed.x * 3;
          object.rotation.y += (object as any).rotationSpeed.y * 3;
          object.rotation.z += (object as any).rotationSpeed.z * 3;
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
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-gray-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Loading ashtrays...</p>
            {loadingProgress > 0 && (
              <p className="text-sm text-gray-500">{Math.round(loadingProgress)}%</p>
            )}
          </div>
        </div>
      )}
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
