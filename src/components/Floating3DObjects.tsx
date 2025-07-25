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
          console.warn('Could not import GLTFLoader, creating geometric fallback:', importError);
          const scene = this.createGeometricAshtray();
          onLoad({ scene });
        });
    }

    createGeometricAshtray() {
      const group = new THREE.Group();
      const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xf8f8f8, shininess: 15, specular: 0x888888 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.25;
      group.add(body);

      const innerGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.3, 32);
      const innerMaterial = new THREE.MeshPhongMaterial({ color: 0xe8e8e8, shininess: 10 });
      const inner = new THREE.Mesh(innerGeometry, innerMaterial);
      inner.position.y = 0.35;
      group.add(inner);

      for (let i = 0; i < 3; i++) {
        const notchGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const notch = new THREE.Mesh(notchGeometry, bodyMaterial.clone());
        const angle = (i / 3) * Math.PI * 2;
        notch.position.x = Math.cos(angle) * 2.2;
        notch.position.z = Math.sin(angle) * 2.2;
        notch.position.y = 0.4;
        group.add(notch);
      }
      return group;
    }
  }
  return GLTFLoader;
})();

const Floating3DObjects: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>();

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const isMobileScreen = () => window.innerWidth < 768;
    const SCALE_FACTOR = 0.512;
    const BASE_MOBILE = 15.0;
    const BASE_DESKTOP = 24.0;
    const getScale = () => (isMobileScreen() ? BASE_MOBILE : BASE_DESKTOP) * SCALE_FACTOR;

    const checkMobile = () => setIsMobile(isMobileScreen());
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 85 : 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Position camera for the hero section view
    const getCameraDistance = () => {
      if (window.innerWidth < 480) return 45;
      if (window.innerWidth < 768) return 40;
      if (window.innerWidth < 1024) return 35;
      return 30;
    };
    
    camera.position.set(0, 0, getCameraDistance());
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // CRITICAL: Size to match the container, not the full viewport
    const containerRect = mountRef.current.getBoundingClientRect();
    renderer.setSize(containerRect.width, containerRect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Color space
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace ?? undefined;
    if ((renderer as any).outputEncoding !== undefined) {
      (renderer as any).outputEncoding = THREE.sRGBEncoding;
    }
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    // CRITICAL: Position within the container, not fixed to viewport
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.pointerEvents = 'none';
    
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xf0f0f0, isMobile ? 0.8 : 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 1.0 : 1.2);
    directionalLight.position.set(15, 15, 10);
    if (!isMobile) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.set(1024, 1024);
    }
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xe8e8e8, 0.4);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xd0d0d0, 0.3);
    accentLight.position.set(0, 10, 0);
    scene.add(accentLight);

    const loader = new GLTFLoader();
    let ashtray: THREE.Object3D | null = null;
    let hoveredObject: THREE.Object3D | null = null;
    let particles: THREE.Object3D[] = [];

    // Create Organic Blob Particles
    const createBlobGeometry = (size: number, complexity: number = 6) => {
      const geometry = new THREE.SphereGeometry(size, complexity * 2, complexity);
      const vertices = geometry.attributes.position.array;
      
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        
        const noise1 = Math.sin(x * 3 + y * 2) * Math.cos(z * 2.5) * 0.3;
        const noise2 = Math.cos(x * 2.5 + z * 3) * Math.sin(y * 1.8) * 0.25;
        const noise3 = Math.sin(x * 1.5 + y * 2.8 + z * 2.2) * 0.2;
        
        const deformation = (noise1 + noise2 + noise3) * size * 0.4;
        const length = Math.sqrt(x * x + y * y + z * z);
        const scale = (length + deformation) / length;
        
        vertices[i] = x * scale;
        vertices[i + 1] = y * scale;
        vertices[i + 2] = z * scale;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      return geometry;
    };

    const createParticles = (baseMaterial: THREE.MeshStandardMaterial) => {
      const particleConfigs = [
        { size: 0.8, distance: 12, speed: 0.015, offsetY: 2, eccentricity: 0.7 },
        { size: 0.6, distance: 15, speed: -0.012, offsetY: -3, eccentricity: 0.8 },
        { size: 1.4, distance: 18, speed: 0.008, offsetY: 1, eccentricity: 0.6 },
        { size: 2.2, distance: 22, speed: -0.006, offsetY: -1.5, eccentricity: 0.9 },
        { size: 1.0, distance: 14, speed: 0.011, offsetY: 3.5, eccentricity: 0.75 },
        { size: 1.6, distance: 20, speed: -0.009, offsetY: -2.5, eccentricity: 0.65 }
      ];

      return particleConfigs.map((config, index) => {
        const blobGeometry = createBlobGeometry(config.size, isMobile ? 4 : 6);
        const particleMaterial = baseMaterial.clone();
        particleMaterial.transparent = false;
        particleMaterial.opacity = 1.0;
        particleMaterial.roughness = 0.9;
        particleMaterial.metalness = 0.02;
        
        const particle = new THREE.Mesh(blobGeometry, particleMaterial);
        
        const angle = (index / particleConfigs.length) * Math.PI * 2;
        particle.position.x = Math.cos(angle) * config.distance;
        particle.position.z = Math.sin(angle) * config.distance * config.eccentricity;
        particle.position.y = config.offsetY;
        
        (particle as any).orbitProps = {
          distance: config.distance,
          speed: config.speed,
          baseY: config.offsetY,
          eccentricity: config.eccentricity,
          angleOffset: angle,
          currentAngle: angle,
          bobSpeed: (Math.random() - 0.5) * 0.02,
          bobAmplitude: 0.5 + Math.random() * 0.5
        };
        
        if (!isMobile) {
          particle.castShadow = true;
          particle.receiveShadow = true;
        }
        
        scene.add(particle);
        return particle;
      });
    };

    // Load model and textures
    const loadModel = async () => {
      try {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');
        
        const loadTexture = (url: string) => 
          new Promise<THREE.Texture | null>((resolve) => {
            textureLoader.load(
              url, 
              (texture) => {
                if ('colorSpace' in texture) (texture as any).colorSpace = THREE.SRGBColorSpace;
                else if ('encoding' in texture) (texture as any).encoding = THREE.sRGBEncoding;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 2);
                texture.needsUpdate = true;
                resolve(texture);
              },
              undefined,
              () => resolve(null)
            );
          });

        const [diffuseTexture, normalTexture, roughnessTexture, displacementTexture] = await Promise.all([
          loadTexture('/textures/anthracite-diff.jpg'),
          loadTexture('/textures/anthracite-normal.exr'),
          loadTexture('/textures/anthracite-roughness.exr'),
          loadTexture('/textures/anthracite-disp.png')
        ]);

        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/ashtray.glb', resolve, undefined, reject);
        });

        ashtray = gltf.scene.clone();
        ashtray.position.set(0, 0, 0);
        ashtray.rotation.set(0.3, 1.2, -0.1);
        ashtray.scale.setScalar(getScale());

        const baseMaterialParams: THREE.MeshStandardMaterialParameters = {
          color: new THREE.Color('#8a8a8a'),
          roughness: 0.7,
          metalness: 0.0,
          transparent: true,
          opacity: 0
        };

        if (diffuseTexture) baseMaterialParams.map = diffuseTexture;
        if (normalTexture) {
          baseMaterialParams.normalMap = normalTexture;
          baseMaterialParams.normalScale = new THREE.Vector2(0.1, 0.1);
        }
        if (roughnessTexture) baseMaterialParams.roughnessMap = roughnessTexture;

        const templateMaterial = new THREE.MeshStandardMaterial(baseMaterialParams);

        ashtray.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = templateMaterial.clone();
            if (!isMobile) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          }
        });

        (ashtray as any).spinSpeed = {
          x: (Math.random() - 0.5) * (isMobile ? 0.015 : 0.02),
          y: (Math.random() - 0.5) * (isMobile ? 0.02 : 0.03),
          z: (Math.random() - 0.5) * (isMobile ? 0.018 : 0.025)
        };

        scene.add(ashtray);
        particles = createParticles(templateMaterial);

        // Fade-in animation
        const startTime = Date.now();
        const fadeDuration = isMobile ? 600 : 800;
        const fadeIn = () => {
          if (!ashtray) return;
          const elapsed = Date.now() - startTime;
          const p = Math.min(elapsed / fadeDuration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          
          ashtray.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.opacity = eased;
            }
          });
          
          particles.forEach((particle, index) => {
            const particleDelay = index * 200;
            const particleElapsed = Math.max(0, elapsed - particleDelay);
            const particleP = Math.min(particleElapsed / fadeDuration, 1);
            const particleEased = 1 - Math.pow(1 - particleP, 3);
            
            const mat = (particle as THREE.Mesh).material as THREE.MeshStandardMaterial;
            mat.opacity = particleEased;
          });
          
          if (p < 1) requestAnimationFrame(fadeIn);
          else {
            ashtray.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                mat.transparent = false;
                mat.opacity = 1;
              }
            });
            particles.forEach(particle => {
              const mat = (particle as THREE.Mesh).material as THREE.MeshStandardMaterial;
              mat.transparent = false;
              mat.opacity = 1.0;
            });
          }
        };
        fadeIn();

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load GLTF model:', err);
        setError('Model loading failed.');
      }
    };

    loadModel();

    // Mouse interaction (relative to container)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if (!mountRef.current) return;
      
      let clientX: number;
      let clientY: number;

      if ('touches' in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        return;
      }

      // Get mouse position relative to the container, not the viewport
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (ashtray) {
        raycaster.setFromCamera(mouse, camera);
        const allObjects = [ashtray, ...particles];
        const intersects = raycaster.intersectObjects(allObjects, true);
        hoveredObject = null;
        if (intersects.length > 0) {
          let newHovered = intersects[0].object;
          while (newHovered.parent && newHovered.parent !== scene) {
            newHovered = newHovered.parent;
          }
          if (allObjects.includes(newHovered)) hoveredObject = newHovered;
        }
      }
    };

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('touchmove', onPointerMove, { passive: true });

    // Animation loop
    const animate = (time: number) => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (ashtray) {
        const spin = (ashtray as any).spinSpeed;
        if (ashtray !== hoveredObject) {
          ashtray.rotation.x += spin.x;
          ashtray.rotation.y += spin.y;
          ashtray.rotation.z += spin.z;
        } else {
          const damping = isMobile ? 0.2 : 0.3;
          ashtray.rotation.x += spin.x * damping + mouse.y * 0.02;
          ashtray.rotation.y += spin.y * damping + mouse.x * 0.02;
          ashtray.rotation.z += spin.z * damping;
        }
      }

      // Animate particles
      particles.forEach((particle) => {
        const props = (particle as any).orbitProps;
        if (!props) return;

        props.currentAngle += props.speed;
        
        const x = Math.cos(props.currentAngle) * props.distance;
        const z = Math.sin(props.currentAngle) * props.distance * props.eccentricity;
        const bobOffset = Math.sin(time * 0.001) * props.bobAmplitude;
        const y = props.baseY + bobOffset;

        particle.position.set(x, y, z);

        particle.rotation.x += 0.005;
        particle.rotation.y += 0.007;
        particle.rotation.z += 0.003;

        // Removed hover scale effect - keep particles at normal size
        particle.scale.setScalar(1.0);
      });

      renderer.render(scene, camera);
    };
    animate(0);

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.fov = window.innerWidth < 768 ? 85 : 75;
      camera.updateProjectionMatrix();

      renderer.setSize(rect.width, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (ashtray) {
        ashtray.scale.setScalar(getScale());
      }

      setIsMobile(isMobileScreen());
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };
    window.addEventListener('resize', throttledResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('touchmove', onPointerMove);

      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (resizeTimeout) clearTimeout(resizeTimeout);

      if (ashtray) {
        ashtray.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
            else mesh.material.dispose();
          }
        });
      }

      particles.forEach(particle => {
        particle.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
            else mesh.material.dispose();
          }
        });
        scene.remove(particle);
      });

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', 
        zIndex: 1,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1s'
      }}
    />
  );
};

export default Floating3DObjects;
