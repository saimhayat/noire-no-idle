import { createContext, Suspense, useContext, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const MODEL_URL = '/models/shalwar-kameez.glb';

/* The garment's footprint in world units (measured from the GLB: 1.903 tall,
   1.327 wide including the sleeves, times the 1.05 group scale below). The camera frames this box,
   never the canvas, so the garment's on-screen size depends only on the pixel
   size of its container. */
export const MODEL_HEIGHT = 1.903 * 1.05;
export const MODEL_WIDTH = 1.327 * 1.05;
const FILL = 0.94; // how much of the canvas the garment may occupy

/* Pixels per world unit for a container of the given size ("contain" fit). */
export function getPixelsPerUnit(width, height) {
  return Math.min((width * FILL) / MODEL_WIDTH, (height * FILL) / MODEL_HEIGHT);
}

/* Rendered height in CSS pixels of the garment in a container of this size. */
export function getModelPixelHeight(width, height) {
  return getPixelsPerUnit(width, height) * MODEL_HEIGHT;
}

function StableOrthoCamera() {
  const { camera, size } = useThree();
  const wake = useContext(WakeContext);

  useEffect(() => {
    // Frustum measured in CSS pixels and zoom = pixels per world unit, so the
    // garment is contained in the canvas whatever its aspect ratio, and
    // perspective can never make it grow while it turns.
    camera.left = -size.width / 2;
    camera.right = size.width / 2;
    camera.top = size.height / 2;
    camera.bottom = -size.height / 2;
    camera.zoom = getPixelsPerUnit(size.width, size.height);
    camera.near = -50;
    camera.far = 50;
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    wake();
  }, [camera, size.width, size.height, wake]);

  return null;
}

/* Soft studio reflections: the cotton's sheen and the shadows inside the folds
   come from this environment, not from the (deliberately gentle) lamps. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  const wake = useContext(WakeContext);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.75;
    wake();
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose?.();
    };
  }, [gl, scene, wake]);

  return null;
}

/* One clock for everything. The canvas never runs its own requestAnimationFrame
   loop: it is drawn from gsap's ticker, straight after Lenis has moved the page
   and FloatingGarment has moved the DOM, so the page, the garment's position and
   the 3D rotation are all updated in the SAME frame (no one-frame lag between
   them, which is what reads as judder). It only draws while something is
   changing; a settled or hidden garment costs nothing. */
const WakeContext = createContext(() => {});

function TickerDriver({ needsRef }) {
  const { advance } = useThree();

  useEffect(() => {
    const tick = () => {
      if (needsRef.current <= 0) return;
      needsRef.current -= 1;
      advance(performance.now() / 1000, true);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance, needsRef]);

  return null;
}

function GarmentModel({ stateRef, staticRotationY = 0 }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const groupRef = useRef(null);
  const wake = useContext(WakeContext);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    // The GLB ships four intensity-10 directional lights that would blow the
    // garment out; the scene is lit by the canvas lights only.
    const lights = [];
    scene.traverse((child) => { if (child.isLight) lights.push(child); });
    lights.forEach((light) => light.removeFromParent());

    // Centre the mesh on the origin so it turns about its own axis.
    scene.position.set(0, 0, 0); // idempotent under StrictMode double-effects
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const centre = box.getCenter(new THREE.Vector3());
    scene.position.sub(centre);

    scene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = false;
      child.receiveShadow = false;
      child.frustumCulled = false;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        if (material.map) {
          material.map.colorSpace = THREE.SRGBColorSpace;
          material.map.anisotropy = 4;
          material.map.needsUpdate = true;
        }
        // Metalness / roughness come from the GLB (matte linen, satin buttons).
        material.needsUpdate = true;
      });
    });
    wake();
  }, [scene, wake]);

  // let the page ask for a frame the moment the scroll target changes
  useEffect(() => {
    if (stateRef?.current) stateRef.current.wake = wake;
    return () => { if (stateRef?.current) stateRef.current.wake = null; };
  }, [stateRef, wake]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const targetRadians = THREE.MathUtils.degToRad(stateRef?.current?.rotationY ?? staticRotationY);
    const current = groupRef.current.rotation.y;

    // Frame-rate independent (exponential) damping, with a clamped step so a
    // slow frame can never make the turn jump. Keep drawing until it settles.
    if (Math.abs(current - targetRadians) < 2e-4) {
      groupRef.current.rotation.y = targetRadians;
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.damp(current, targetRadians, 9, Math.min(delta, 1 / 30));
      wake();
    }
  });

  return (
    <group ref={groupRef} scale={1.05}>
      <primitive object={scene} />
    </group>
  );
}

export default function ShalwarKameezCanvas({ stateRef, staticRotationY = 0, className = '' }) {
  const needsRef = useRef(3);
  const wake = useMemo(() => () => { needsRef.current = 3; }, []);

  return (
    <Canvas
      className={className}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 10], zoom: 100, near: -50, far: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false, depth: true }}
      frameloop="never"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <WakeContext.Provider value={wake}>
        <TickerDriver needsRef={needsRef} />
        <StableOrthoCamera />
        <StudioEnvironment />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={['#fffaf1', '#b8aa96', 0.45]} />
        <directionalLight position={[2.5, 3.5, 4]} intensity={2.2} />
        <directionalLight position={[-2.5, 1.5, 2]} intensity={0.8} />
        <directionalLight position={[0, 1.5, -3]} intensity={0.7} />
        <Suspense fallback={null}>
          <GarmentModel stateRef={stateRef} staticRotationY={staticRotationY} />
        </Suspense>
      </WakeContext.Provider>
    </Canvas>
  );
}
