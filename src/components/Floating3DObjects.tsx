import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Since GLTFLoader isn't available in the standard three package in this environment,
// we'll create a simple fallback with basic 3D shapes that match the industrial aesthetic

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);

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

    // Create industrial-looking objects as a fallback
    const createIndustrialObjects = () => {
      const objects: THREE.Object3D[] = [];

      // Create multiple instances of industrial-looking objects
      for (let i = 0; i < 6; i++) {
        const group = new THREE.Group();
        
        // Create a cylindrical base (like an ashtray)
        const baseGeometry = new THREE.CylinderGeometry(1, 1.2, 0.3, 32);
        const materials = [
          new THREE.MeshPhongMaterial({ 
            color: 0x2c2c2c, // Anthracite
            shininess: 30,
            specular: 0x222222
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a, // Matte black
            shininess: 10,
            specular: 0x111111
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0x4a90a4, // Steel blue
            shininess: 80,
            specular: 0x4a90a4,
            emissive: 0x1a3a4a,
            emissiveIntensity: 0.1
          }),
          new THREE.MeshPhongMaterial({ 
            color: 0xb8b8b8, // Brushed metal
            shininess: 100,
            specular: 0xffffff,
            metalness: 0.8
          }),
        ];
        
        const baseMesh = new THREE.Mesh(baseGeometry, materials[i % materials.length]);
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        group.add(baseMesh);
        
        // Add a rim (torus)
        const rimGeometry = new THREE.TorusGeometry(1.1, 0.1, 8, 32);
        const rimMesh = new THREE.Mesh(rimGeometry, materials[(i + 1) % materials.length]);
        rimMesh.position.y = 0.15;
        rimMesh.castShadow = true;
        group.add(rimMesh);
        
        // Add some industrial details (small cylinders as cigarette holders)
        if (i % 2 === 0) {
          for (let j = 0; j < 3; j++) {
            const angle = (j / 3) * Math.PI * 2;
            const holderGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
            const holderMesh = new THREE.Mesh(holderGeometry, materials[2]);
            holderMesh.position.set(
              Math.cos(angle) * 0.7,
              0.1,
              Math.sin(angle) * 0.7
            );
            group.add(holderMesh);
          }
        }
        
        // Random positions
        group.position.set(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        );
        
        // Varied scale
        const scale = 0.5 + Math.random() * 0.5;
        group.scale.setScalar(scale);
        
        // Random initial rotation
        group.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        // Animation properties
        (group as any).initialY = group.position.y;
        (group as any).floatSpeed = Math.random() * 0.015 + 0.01;
        (group as any).rotationSpeed = {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.01,
        };
        
        scene.add(group);
        objects.push(group);
      }

      return objects;
    };

    const objects = createIndustrialObjects();

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
        hoveredObject.scale.divideScalar(1.3);
        hoveredObject = null;
      }

      // Handle new hover
      if (intersects.length > 0) {
        let newHovered = intersects[0].object;
        
        // Find parent group
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
        // Floating animation
        object.position.y = (object as any).initialY + 
          Math.sin(Date.now() * (object as any).floatSpeed + index * 0.5) * 0.8;
        
        // Rotation animation
        if (object !== hoveredObject) {
          object.rotation.x += (object as any).rotationSpeed.x;
          object.rotation.y += (object as any).rotationSpeed.y;
          object.rotation.z += (object as any).rotationSpeed.z;
        } else {
          // Faster rotation when hovered
          object.rotation.x += (object as any).rotationSpeed.x * 4;
          object.rotation.y += (object as any).rotationSpeed.y * 4;
          object.rotation.z += (object as any).rotationSpeed.z * 4;
        }
      });

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

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
