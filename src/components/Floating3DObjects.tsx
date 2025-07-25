import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const Floating3DObjects: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const animationIdRef = useRef<number>();

  useEffect(() => {
    console.log('🎯 STARTING 3D SETUP');
    
    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // CRITICAL: Get the canvas and style it BRUTALLY
    const canvas = renderer.domElement;
    
    // LOG CURRENT STYLES
    console.log('🔍 Canvas computed styles BEFORE:', {
      position: getComputedStyle(canvas).position,
      top: getComputedStyle(canvas).top,
      left: getComputedStyle(canvas).left,
      transform: getComputedStyle(canvas).transform,
      zIndex: getComputedStyle(canvas).zIndex
    });

    // BRUTAL STYLING - NUCLEAR APPROACH
    canvas.style.cssText = `
      position: fixed !important;
      top: 0px !important;
      left: 0px !important;
      right: 0px !important;
      bottom: 0px !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
      pointer-events: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 5px solid lime !important;
      transform: none !important;
      will-change: auto !important;
      isolation: isolate !important;
      contain: none !important;
      background: rgba(255, 0, 0, 0.1) !important;
    `;

    // APPEND DIRECTLY TO BODY - BYPASS ALL CONTAINERS
    document.body.appendChild(canvas);
    
    console.log('🔍 Canvas computed styles AFTER:', {
      position: getComputedStyle(canvas).position,
      top: getComputedStyle(canvas).top,
      left: getComputedStyle(canvas).left,
      transform: getComputedStyle(canvas).transform,
      zIndex: getComputedStyle(canvas).zIndex,
      parent: canvas.parentElement?.tagName
    });

    // LOG BODY AND HTML STYLES THAT MIGHT INTERFERE
    console.log('🔍 BODY styles:', {
      position: getComputedStyle(document.body).position,
      transform: getComputedStyle(document.body).transform,
      overflow: getComputedStyle(document.body).overflow
    });

    console.log('🔍 HTML styles:', {
      position: getComputedStyle(document.documentElement).position,
      transform: getComputedStyle(document.documentElement).transform,
      overflow: getComputedStyle(document.documentElement).overflow
    });

    // Create a simple spinning cube for testing
    const geometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lighting
    const light = new THREE.AmbientLight(0x404040, 1);
    scene.add(light);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
      renderer.render(scene, camera);
    };
    animate();

    setIsLoaded(true);

    // Log scroll events to see if canvas moves
    let scrollCount = 0;
    const handleScroll = () => {
      scrollCount++;
      if (scrollCount % 10 === 0) { // Log every 10th scroll event
        const canvasRect = canvas.getBoundingClientRect();
        console.log('📜 SCROLL EVENT - Canvas position:', {
          top: canvasRect.top,
          left: canvasRect.left,
          scrollY: window.scrollY
        });
        
        // If canvas top is not 0, it's moving with scroll!
        if (canvasRect.top !== 0) {
          console.error('🚨 CANVAS IS MOVING WITH SCROLL! Top should be 0, but is:', canvasRect.top);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (canvas && document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      zIndex: 10000,
      fontSize: '12px',
      pointerEvents: 'none'
    }}>
      <div>🎯 3D Debug Mode</div>
      <div>Loaded: {isLoaded ? 'YES' : 'NO'}</div>
      <div>Look for LIME border around viewport</div>
      <div>Check console for scroll logs</div>
      <div>If lime border moves = ISSUE FOUND</div>
    </div>
  );
};

export default Floating3DObjects;
