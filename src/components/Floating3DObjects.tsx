import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
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

    // Lighting setup for industrial objects
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90a4, 0.3); // Steel blue accent
    pointLight.position.set(-10, 5, 5);
    scene.add(pointLight);

    camera.position.z = 15;

    // Load ashtray.glb model
    const loadAshtrayModels = async () => {
      try {
        // Import GLTFLoader from CDN (no local installation needed)
        const { GLTFLoader } = await import('https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js');
        
        const loader = new GLTFLoader();
        const objects: THREE.Object3D[] = [];

        // Load the ashtray.glb model
        loader.load(
          '/models/ashtray.glb',
          (gltf) => {
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
              const scale = 0.2 + Math.random() * 0.3;
              ashtray.scale.setScalar(scale);
              
              // Random initial rotation
              ashtray.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
              );

              // Apply industrial materials
              ashtray.traverse((child) => {
                if (child.isMesh) {
                  const mesh = child as THREE.Mesh;
                  
                  // Industrial materials based on index
                  const materials = [
                    new THREE.MeshLambertMaterial({ color: 0x2c2c2c }), // Anthracite
                    new THREE.MeshLambertMaterial({ color: 0x1a1a1a }), // Matte black
                    new THREE.MeshLambertMaterial({ color: 0x4a90a4 }), // Steel blue
                    new THREE.MeshLambertMaterial({ color: 0xb8b8b8 }), // Brushed metal
                  ];
                  
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

            objectsRef.current = objects;

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
              if (hoveredObject && !intersects.find(i => i.object.parent === hoveredObject || i.object === hoveredObject)) {
                hoveredObject.scale.divideScalar(1.3);
                hoveredObject = null;
              }

              // Handle new hover
              if (intersects.length > 0) {
                let newHovered = intersects[0].object;
                
                // Find parent object (complete ashtray)
                while (newHovered.parent && newHovered.parent !== scene) {
                  newHovered = newHovered.parent;
                }

                if (newHovered !== hoveredObject && objects.includes(newHovered)) {
                  if (hoveredObject) hoveredObject.scale.divideScalar(1.3);
                  hoveredObject = newHovered;
                  hoveredObject.scale.multiplyScalar(1.3);
                }
              }
            };

            window.addEventListener('mousemove', onMouseMove);

            // Animation loop
            const animate = () => {
              animationIdRef.current = requestAnimationFrame(animate);

              objects.forEach((ashtray, index) => {
                // Floating animation
                ashtray.position.y = (ashtray as any).initialY + 
                  Math.sin(Date.now() * (ashtray as any).floatSpeed + index * 0.5) * 0.8;
                
                // Rotation animation
                if (ashtray !== hoveredObject) {
                  ashtray.rotation.x += (ashtray as any).rotationSpeed.x;
                  ashtray.rotation.y += (ashtray as any).rotationSpeed.y;
                  ashtray.rotation.z += (ashtray as any).rotationSpeed.z;
                } else {
                  // Faster rotation when hovered
                  ashtray.rotation.x += (ashtray as any).rotationSpeed.x * 4;
                  ashtray.rotation.y += (ashtray as any).rotationSpeed.y * 4;
                  ashtray.rotation.z += (ashtray as any).rotationSpeed.z * 4;
                }
              });

              renderer.render(scene, camera);
            };

            animate();
            setIsLoaded(true);

            // Cleanup for event listeners
            return () => {
              window.removeEventListener('mousemove', onMouseMove);
            };
          },
          (progress) => {
            console.log('Loading ashtray.glb:', Math.round((progress.loaded / progress.total) * 100) + '%');
          },
          (error) => {
            console.error('Error loading ashtray.glb:', error);
            setError('Unable to load 3D model. Check that ashtray.glb is in /public/models/');
          }
        );

      } catch (err) {
        console.error('GLTFLoader error:', err);
        setError('Error loading GLTFLoader');
      }
    };

    loadAshtrayModels();

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
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      objectsRef.current.forEach(object => {
        object.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.dispose) child.material.dispose();
          }
        });
      });
      
      renderer.dispose();
    };
  }, []);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white z-20">
        <div className="bg-red-600 p-4 rounded-lg max-w-md text-center">
          <h3 className="font-bold mb-2">Erreur 3D</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 opacity-75">
            Vérifiez que ashtray.glb est dans /public/models/
          </p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default Floating3DObjects;
