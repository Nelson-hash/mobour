import React, { useRef, useEffect, useState, Suspense } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Floating3DObjectsGLTF: React.FC = () => {
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

    // Lighting setup for industrial objects
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90a4, 0.3);
    pointLight.position.set(-10, 5, 5);
    scene.add(pointLight);

    camera.position.z = 15;

    // Load GLTF models
    const loader = new GLTFLoader();
    const objects: THREE.Object3D[] = [];

    const loadModel = async () => {
      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/models/ashtray.glb',
            (gltf) => resolve(gltf),
            (progress) => {
              const percentComplete = (progress.loaded / progress.total) * 100;
              setLoadingProgress(percentComplete);
            },
            (error) => reject(error)
          );
        });

        const originalModel = gltf.scene;
        
        // Create multiple instances of the ashtray
        for (let i = 0; i < 6; i++) {
          const ashtray = originalModel.clone();
          
          // Random positions
          ashtray.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
          );
          
          // Varied scale
          const scale = 0.3 + Math.random() * 0.4;
          ashtray.scale.setScalar(scale);
          
          // Random initial rotation
          ashtray.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );

          // Apply industrial materials
          const materials = [
            new THREE.MeshPhongMaterial({ 
              color: 0x2c2c2c,
              shininess: 30,
              specular: 0x222222
            }),
            new THREE.MeshPhongMaterial({ 
              color: 0x1a1a1a,
              shininess: 10,
              specular: 0x111111
            }),
            new THREE.MeshPhongMaterial({ 
              color: 0x4a90a4,
              shininess: 80,
              specular: 0x4a90a4,
              emissive: 0x1a3a4a,
              emissiveIntensity: 0.1
            }),
            new THREE.MeshPhongMaterial({ 
              color: 0xb8b8b8,
              shininess: 100,
              specular: 0xffffff,
              metalness: 0.8
            }),
          ];

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
          (ashtray as any).floatSpeed = Math.random() * 0.015 + 0.01;
          (ashtray as any).rotationSpeed = {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.01,
          };
          
          scene.add(ashtray);
          objects.push(ashtray);
        }

        setIsLoaded(true);

      } catch (err) {
        console.error('Error loading GLTF:', err);
        setError('Unable to load 3D model');
        // Fallback to basic shapes
        createFallbackObjects();
      }
    };

    const createFallbackObjects = () => {
      // Create simple geometric shapes as fallback
      for (let i = 0; i < 6; i++) {
        const geometry = new THREE.CylinderGeometry(1, 1.2, 0.3, 32);
        const material = new THREE.MeshPhongMaterial({
          color: i % 2 === 0 ? 0x2c2c2c : 0x4a90a4,
          shininess: 50
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        );
        
        const scale = 0.5 + Math.random() * 0.5;
        mesh.scale.setScalar(scale);
        
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        (mesh as any).initialY = mesh.position.y;
        (mesh as any).floatSpeed = Math.random() * 0.015 + 0.01;
        (mesh as any).rotationSpeed = {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.01,
        };
        
        scene.add(mesh);
        objects.push(mesh);
      }
      setIsLoaded(true);
    };

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

      if (hoveredObject) {
        hoveredObject.scale.divideScalar(1.3);
        hoveredObject = null;
      }

      if (intersects.length > 0) {
        let newHovered = intersects[0].object;
        
        while (newHovered.parent && newHovered.parent !== scene) {
          newHovered = newHovered.parent;
        }

        if (objects.includes(newHovered)) {
          hoveredObject = newHovered;
          hoveredObject.scale.multiplyScalar(1.3);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      objects.forEach((object, index) => {
        object.position.y = (object as any).initialY + 
          Math.sin(Date.now() * (object as any).floatSpeed + index * 0.5) * 0.8;
        
        if (object !== hoveredObject) {
          object.rotation.x += (object as any).rotationSpeed.x;
          object.rotation.y += (object as any).rotationSpeed.y;
          object.rotation.z += (object as any).rotationSpeed.z;
        } else {
          object.rotation.x += (object as any).rotationSpeed.x * 4;
          object.rotation.y += (object as any).rotationSpeed.y * 4;
          object.rotation.z += (object as any).rotationSpeed.z * 4;
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D models... {Math.round(loadingProgress)}%</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-gray-500 bg-white bg-opacity-90 px-4 py-2 rounded">
            {error}
          </div>
        </div>
      )}
    </>
  );
};

export default Floating3DObjectsGLTF;
