// src/components/Custom3DModel.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Note: Pour utiliser GLTFLoader, vous devrez l'importer depuis un CDN
// ou l'installer avec npm install three-gltf-loader

interface Custom3DModelProps {
  modelUrl: string; // Chemin vers votre fichier .glb ou .gltf
  count?: number;   // Nombre d'objets à afficher
}

const Custom3DModel: React.FC<Custom3DModelProps> = ({ 
  modelUrl, 
  count = 5 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
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
    
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    camera.position.z = 15;

    // Chargeur GLTF - Alternative avec fetch pour GLB
    const loadModel = async () => {
      try {
        // Méthode simple pour charger un modèle GLB/GLTF
        // Vous devrez adapter cette partie selon votre modèle
        
        // Si vous avez un fichier .obj, utilisez OBJLoader
        const loader = new THREE.ObjectLoader();
        
        // Pour GLB/GLTF, vous devriez utiliser:
        // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
        // const loader = new GLTFLoader();
        
        const objects: THREE.Object3D[] = [];
        
        // Créer plusieurs instances de votre modèle
        for (let i = 0; i < count; i++) {
          // Exemple avec une géométrie simple en attendant votre modèle
          const geometry = new THREE.IcosahedronGeometry(1, 0);
          const material = new THREE.MeshLambertMaterial({ 
            color: i % 2 === 0 ? 0x2c2c2c : 0x4a90a4,
            wireframe: Math.random() > 0.5
          });
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position aléatoire
          mesh.position.x = (Math.random() - 0.5) * 20;
          mesh.position.y = (Math.random() - 0.5) * 10;
          mesh.position.z = (Math.random() - 0.5) * 10;
          
          // Propriétés d'animation
          (mesh as any).initialY = mesh.position.y;
          (mesh as any).floatSpeed = Math.random() * 0.02 + 0.01;
          (mesh as any).rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02,
          };
          
          scene.add(mesh);
          objects.push(mesh);
        }

        // Animation et interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredObject: THREE.Object3D | null = null;

        const onMouseMove = (event: MouseEvent) => {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(objects);

          // Reset previous hovered object
          if (hoveredObject && !intersects.find(i => i.object === hoveredObject)) {
            hoveredObject.scale.setScalar(1);
            hoveredObject = null;
          }

          // Handle new hover
          if (intersects.length > 0) {
            const newHovered = intersects[0].object;
            if (newHovered !== hoveredObject) {
              if (hoveredObject) hoveredObject.scale.setScalar(1);
              hoveredObject = newHovered;
              hoveredObject.scale.setScalar(1.3);
            }
          }
        };

        window.addEventListener('mousemove', onMouseMove);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);

          objects.forEach((object, index) => {
            // Floating animation
            object.position.y = (object as any).initialY + 
              Math.sin(Date.now() * (object as any).floatSpeed + index) * 0.8;
            
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

        // Cleanup function
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          objects.forEach(object => {
            scene.remove(object);
          });
        };

      } catch (err) {
        setError('Erreur lors du chargement du modèle 3D');
        console.error('3D Model loading error:', err);
      }
    };

    loadModel();

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
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [modelUrl, count]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-red-500 bg-white p-4 rounded">
          {error}
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

export default Custom3DModel;

/* 
=== INSTRUCTIONS D'UTILISATION ===

1. **Formats recommandés** :
   - GLB (recommandé) : Format binaire, plus rapide
   - GLTF : Format JSON, plus facile à debugger
   - OBJ : Format simple, pas d'animations

2. **Comment intégrer votre fichier** :
   - Placez votre fichier .glb dans /public/models/
   - Exemple : /public/models/mon-objet.glb

3. **Utilisation dans Hero.tsx** :
   ```tsx
   import Custom3DModel from './Custom3DModel';
   
   // Dans le composant Hero :
   <Custom3DModel 
     modelUrl="/models/mon-objet.glb" 
     count={6} 
   />
   ```

4. **Installation GLTFLoader** (si besoin) :
   npm install three-gltf-loader

5. **Code pour GLTFLoader** :
   ```typescript
   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
   
   const loader = new GLTFLoader();
   loader.load(modelUrl, (gltf) => {
     const model = gltf.scene;
     // Votre logique ici
   });
   ```
*/
