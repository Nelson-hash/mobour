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

    camera.position.z = 15;

    // Load GLTF model
    const loader = new GLTFLoader();
    const objects: THREE.Object3D[] = [];
    let hoveredObject: THREE.Object3D | null = null;

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
        
        // Create exactly 5 white ashtrays in specific positions and orientations
        const positions = [
          { x: -8, y: 2, z: -3, rotX: 0.2, rotY: 0.5, rotZ: 0 },      // Top left
          { x: 6, y: 1, z: -2, rotX: 0, rotY: -0.8, rotZ: 0.1 },      // Top right  
          { x: -2, y: -1, z: 2, rotX: 0.3, rotY: 1.2, rotZ: -0.1 },   // Center
          { x: -9, y: -3, z: 1, rotX: -0.1, rotY: 0.3, rotZ: 0.2 },   // Bottom left
          { x: 7, y: -2, z: 3, rotX: 0.1, rotY: -0.6, rotZ: -0.2 }    // Bottom right
        ];

        for (let i = 0; i < 5; i++) {
          const ashtray = originalModel.clone();
          const pos = positions[i];
          
          // Set specific positions
          ashtray.position.set(pos.x, pos.y, pos.z);
          
          // Set specific orientations for variety
          ashtray.rotation.set(pos.rotX, pos.rotY, pos.rotZ);
          
          // Slightly varied scales for natural look
          const scale = 0.8 + (i * 0.1); // Scales from 0.8 to 1.2
          ashtray.scale.setScalar(scale);

          // Apply ceramic-like white material
          const ceramicMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf8f8f8, // Slightly off-white like ceramic
            shininess: 15,   // Lower shininess for matte ceramic look
            specular: 0x888888, // Subtle specular highlights
            transparent: false,
            opacity: 1.0
          });

          // Apply ceramic material to all meshes in the model
          ashtray.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = ceramicMaterial;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });
          
          // Store original rotation for smooth transitions
          (ashtray as any).originalRotation = {
            x: ashtray.rotation.x,
            y: ashtray.rotation.y,
            z: ashtray.rotation.z
          };
          
          scene.add(ashtray);
          objects.push(ashtray);
        }

        console.log('5 ceramic ashtrays added to scene');
        setIsLoaded(true);

      } catch (err) {
        console.error('Failed to load GLTF model:', err);
        setError(`Model loading failed: ${err}`);
      }
    };

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

      // Reset previous hovered object to original rotation
      if (hoveredObject) {
        const original = (hoveredObject as any).originalRotation;
        // Smooth transition back to original rotation
        hoveredObject.rotation.x += (original.x - hoveredObject.rotation.x) * 0.1;
        hoveredObject.rotation.y += (original.y - hoveredObject.rotation.y) * 0.1;
        hoveredObject.rotation.z += (original.z - hoveredObject.rotation.z) * 0.1;
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
          
          // Calculate direction from object to mouse position in 3D space
          const mousePosition3D = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 5);
          const objectPosition = hoveredObject.position;
          
          // Create a direction vector from object to mouse
          const direction = new THREE.Vector3().subVectors(mousePosition3D, objectPosition).normalize();
          
          // Calculate rotation to face the mouse
          const targetRotation = new THREE.Euler();
          targetRotation.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1), // Default forward direction
            direction
          ));
          
          // Apply smooth rotation towards mouse
          hoveredObject.rotation.x += (targetRotation.x - hoveredObject.rotation.x) * 0.05;
          hoveredObject.rotation.y += (targetRotation.y - hoveredObject.rotation.y) * 0.05;
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation loop (only for smooth transitions, no continuous animation)
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Only animate the hovered object's rotation transitions
      // No floating or continuous rotation - objects stay static
      
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
