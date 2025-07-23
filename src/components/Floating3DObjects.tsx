import React, { useRef, useEffect, useState, useCallback } from 'react';

// Simple device detection
const isMobileDevice = () => {
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if device can handle 3D
const canHandle3D = () => {
  if (window.innerWidth < 480) return false;
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!gl;
};

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number>();
  const ashtraytRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if we should render 3D
    const should3D = canHandle3D();
    setShouldRender(should3D);
    
    if (!should3D || !mountRef.current) {
      setIsLoaded(true);
      return;
    }

    let cleanup: (() => void) | null = null;

    const init3D = async () => {
      try {
        // Load Three.js
        const THREE = await import('three');
        const isMobile = isMobileDevice();
        
        // Basic scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
          antialias: !isMobile, 
          alpha: true 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.setClearColor(0x000000, 0);
        
        sceneRef.current = scene;
        rendererRef.current = renderer;
        mountRef.current?.appendChild(renderer.domElement);

        // Simple lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Position camera
        camera.position.z = isMobile ? 40 : 30;

        // Try to load GLTF, fallback to geometry
        let ashtray: any = null;
        
        try {
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
          const loader = new GLTFLoader();
          
          const gltf = await new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
            loader.load('/models/ashtray.glb', 
              (result) => {
                clearTimeout(timeout);
                resolve(result);
              },
              undefined,
              (error) => {
                clearTimeout(timeout);
                reject(error);
              }
            );
          });
          
          ashtray = gltf.scene.clone();
        } catch {
          // Create simple fallback geometry
          const geometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 16);
          const material = new THREE.MeshLambertMaterial({ color: 0xf8f8f8 });
          ashtray = new THREE.Mesh(geometry, material);
        }

        // Setup ashtray
        ashtray.position.set(0, 0, 0);
        ashtray.rotation.set(0.3, 1.2, -0.1);
        ashtray.scale.setScalar(isMobile ? 4 : 6);

        // Add spin properties
        ashtray.spinSpeed = {
          x: 0.01,
          y: 0.015,
          z: 0.012
        };

        scene.add(ashtray);
        ashtraytRef.current = ashtray;

        // Mouse interaction (desktop only)
        let mouseX = 0;
        let mouseY = 0;
        
        const onMouseMove = (event: MouseEvent) => {
          if (isMobile) return;
          mouseX = (event.clientX / window.innerWidth) * 2 - 1;
          mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        if (!isMobile) {
          window.addEventListener('mousemove', onMouseMove);
        }

        // Animation loop
        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate);
          
          if (ashtraytRef.current) {
            // Basic rotation
            ashtraytRef.current.rotation.x += ashtraytRef.current.spinSpeed.x;
            ashtraytRef.current.rotation.y += ashtraytRef.current.spinSpeed.y;
            ashtraytRef.current.rotation.z += ashtraytRef.current.spinSpeed.z;
            
            // Mouse influence (desktop only)
            if (!isMobile) {
              ashtraytRef.current.rotation.x += mouseY * 0.01;
              ashtraytRef.current.rotation.y += mouseX * 0.01;
            }
          }
          
          renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        setIsLoaded(true);

        // Cleanup function
        cleanup = () => {
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          
          window.removeEventListener('resize', handleResize);
          if (!isMobile) {
            window.removeEventListener('mousemove', onMouseMove);
          }
          
          if (ashtraytRef.current) {
            if (ashtraytRef.current.geometry) {
              ashtraytRef.current.geometry.dispose();
            }
            if (ashtraytRef.current.material) {
              ashtraytRef.current.material.dispose();
            }
          }
          
          if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
          }
          
          renderer.dispose();
        };

      } catch (error) {
        console.warn('3D initialization failed:', error);
        setIsLoaded(true);
      }
    };

    init3D();

    return cleanup || (() => {});
  }, []);

  if (!shouldRender) {
    return null;
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
