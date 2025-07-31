import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const GLTFLoader = (() => {
  if (typeof window !== 'undefined' && (window as any).THREE) {
    return (window as any).THREE.GLTFLoader;
  }
  class GLTFLoader {
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (p: any) => void, onError?: (e: any) => void) {
      import('three/examples/jsm/loaders/GLTFLoader.js')
        .then((module) => {
          const loader = new module.GLTFLoader();
          loader.load(url, onLoad, onProgress, onError);
        })
        .catch((importError) => {
          console.warn('Could not import GLTFLoader:', importError);
          if (onError) onError(importError);
        });
    }
  }
  return GLTFLoader;
})();

interface Logo3DProps {
  onClick?: () => void;
  size?: number; // Size in pixels
}

const Logo3D: React.FC<Logo3DProps> = ({ onClick, size = 64 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();
  const logoRef = useRef<THREE.Object3D | null>(null);
  const rotationSpeedRef = useRef({ x: 0, y: 0, z: 0 });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      45,
      1, // Square aspect ratio
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Color space
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace ?? undefined;
    if ((renderer as any).outputEncoding !== undefined) {
      (renderer as any).outputEncoding = THREE.sRGBEncoding;
    }
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = onClick ? 'pointer' : 'default';
    
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(512, 512);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-1, -1, 1);
    scene.add(fillLight);

    // Load the logo model
    const loadLogo = async () => {
      const loader = new GLTFLoader();
      
      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/logo.glb', resolve, undefined, reject);
        });

        const logo = gltf.scene.clone();
        
        // Calculate bounding box to center and scale the model
        const box = new THREE.Box3().setFromObject(logo);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        logo.position.sub(center);
        
        // Scale to fit nicely in view
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDimension; // Adjust this value to make logo bigger/smaller
        logo.scale.setScalar(scale);
        
        // Set random rotation speeds
        rotationSpeedRef.current = {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        };

        // Enable shadows
        logo.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Enhance material if needed
            if (mesh.material && (mesh.material as any).isMeshStandardMaterial) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              material.needsUpdate = true;
            }
          }
        });

        logoRef.current = logo;
        scene.add(logo);
        setIsLoaded(true);

      } catch (error) {
        console.error('Failed to load logo model:', error);
      }
    };

    loadLogo();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (logoRef.current) {
        const logo = logoRef.current;
        const speed = rotationSpeedRef.current;
        
        if (isHovered) {
          // Slower rotation when hovered
          logo.rotation.x += speed.x * 0.3;
          logo.rotation.y += speed.y * 0.3;
          logo.rotation.z += speed.z * 0.3;
        } else {
          // Normal random rotation
          logo.rotation.x += speed.x;
          logo.rotation.y += speed.y;
          logo.rotation.z += speed.z;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Click handler
    const handleClick = (event: MouseEvent) => {
      if (onClick) {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }
    };

    if (onClick) {
      renderer.domElement.addEventListener('click', handleClick);
    }

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (onClick) {
        renderer.domElement.removeEventListener('click', handleClick);
      }

      if (logoRef.current) {
        logoRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      }

      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onClick, size, isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      ref={mountRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};

export default Logo3D;
