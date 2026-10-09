import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clothByKey } from '../data/cloth.js';
import { paintPattern } from '../lib/fabric.js';

const MODEL_URL = '/models/fabric-garment.glb';
const HALF_H = 0.35; // the garment is 0.70 tall, 0.30 wide

function Rig({ spin }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const fov = 24;
    camera.fov = fov;
    const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const fitH = (HALF_H * 1.14) / t;
    const fitW = (0.25 * 1.25) / (t * (size.width / size.height));
    camera.position.set(0, 0.01, Math.max(fitH, fitW));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  void spin;
  return null;
}

function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.55;
    return () => { scene.environment = null; target.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

function Garment({ fabric, spin }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const group = useRef(null);
  const state = useRef({ matte: null, weave: null, generated: null, upload: null });

  // one cotton material of our own, built from the GLB's weave + normal map
  useEffect(() => {
    scene.position.set(0, 0, 0);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    scene.position.sub(box.getCenter(new THREE.Vector3()));

    let source = null;
    const cottons = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.frustumCulled = false;
      if (child.material?.name === 'cotton') { source = source || child.material; cottons.push(child); }
    });
    if (!source) return undefined;

    const weave = source.map;
    const normal = source.normalMap;
    [weave, normal].forEach((t) => {
      if (!t) return;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
    });
    if (weave) weave.colorSpace = THREE.SRGBColorSpace;

    const matte = new THREE.MeshPhysicalMaterial({
      map: weave,
      normalMap: normal,
      vertexColors: source.vertexColors, // the baked fold shadows
      side: THREE.DoubleSide,
      sheen: 1,
      metalness: 0
    });
    cottons.forEach((m) => { m.material = matte; });
    state.current.matte = matte;
    state.current.weave = weave;
    state.current.normal = normal;
    state.current.ready = (state.current.ready || 0) + 1;
    return () => { matte.dispose(); state.current.matte = null; };
  }, [scene]);

  // apply the chosen fabric
  const { color, accent, pattern, cloth: clothKey, imageUrl, scale } = fabric;
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(Boolean(state.current.matte)); }, [scene]);

  useEffect(() => {
    const s = state.current;
    const mat = s.matte;
    if (!mat) return undefined;
    const cloth = clothByKey(clothKey);
    const weaveScale = (cloth.repeat / 26) * (scale || 1);

    mat.roughness = cloth.roughness;
    mat.sheen = cloth.sheen;
    mat.sheenColor = new THREE.Color(cloth.sheenColor);
    mat.sheenRoughness = cloth.sheenRoughness;
    mat.normalScale.set(cloth.normalScale, cloth.normalScale);
    if (s.normal) s.normal.repeat.set(weaveScale, weaveScale);

    if (s.generated) { s.generated.dispose(); s.generated = null; }
    let cancelled = false;

    const useTexture = (tex, tint) => {
      mat.map = tex;
      mat.color.set(tint);
      mat.needsUpdate = true;
    };

    if (imageUrl) {
      new THREE.TextureLoader().setCrossOrigin('anonymous').load(imageUrl, (tex) => {
        if (cancelled) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.flipY = false;
        tex.anisotropy = 8;
        tex.repeat.set(0.4 * (scale || 1), 0.4 * (scale || 1));
        s.generated = tex;
        useTexture(tex, '#ffffff');
      });
    } else if (pattern && pattern !== 'plain') {
      const size = 1024;
      const cv = document.createElement('canvas');
      cv.width = size;
      cv.height = size;
      const ctx = cv.getContext('2d');
      paintPattern(ctx, size, pattern, color, accent);
      const img = s.weave?.image;
      if (img) { // the weave, multiplied over the print so it still reads as cloth
        ctx.globalCompositeOperation = 'multiply';
        for (let y = 0; y < 2; y += 1) for (let x = 0; x < 2; x += 1) ctx.drawImage(img, x * size / 2, y * size / 2, size / 2, size / 2);
      }
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.flipY = false;
      tex.anisotropy = 8;
      const rep = 0.5 * (scale || 1);
      tex.repeat.set(rep, rep);
      s.generated = tex;
      useTexture(tex, '#ffffff');
    } else {
      if (s.weave) s.weave.repeat.set(weaveScale, weaveScale);
      useTexture(s.weave, color);
    }
    return () => { cancelled = true; };
  }, [ready, color, accent, pattern, clothKey, imageUrl, scale]);

  useEffect(() => () => { state.current.generated?.dispose(); }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 1 / 30);
    const d = spin.current;
    if (!d.down) {
      d.vel *= Math.exp(-3.2 * dt);
      d.yaw += d.vel * dt;
      d.idle += dt;
      if (d.auto && d.idle > 1.6) d.yaw += Math.min((d.idle - 1.6) * 0.5, 1) * 0.35 * dt;
    }
    group.current.rotation.y = d.yaw;
  });

  return <group ref={group}><primitive object={scene} /></group>;
}

export default function FabricViewer({ fabric, autoRotate = true, className = '' }) {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const spin = useRef({ yaw: -0.35, vel: 0, down: false, lastX: 0, lastT: 0, idle: 0, auto: autoRotate });

  useEffect(() => { spin.current.auto = autoRotate; }, [autoRotate]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const down = (e) => {
    const d = spin.current;
    d.down = true; d.lastX = e.clientX; d.lastT = performance.now(); d.vel = 0; d.idle = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    const d = spin.current;
    if (!d.down) return;
    const now = performance.now();
    const dx = e.clientX - d.lastX;
    const dtm = Math.max(now - d.lastT, 1) / 1000;
    d.yaw += dx * 0.011;
    d.vel = THREE.MathUtils.clamp((dx * 0.011) / dtm, -9, 9) * 0.6 + d.vel * 0.4;
    d.lastX = e.clientX; d.lastT = now; d.idle = 0;
  };
  const up = () => { spin.current.down = false; spin.current.idle = 0; };
  const key = (e) => {
    if (e.key === 'ArrowLeft') { spin.current.vel = -2.2; spin.current.idle = 0; }
    if (e.key === 'ArrowRight') { spin.current.vel = 2.2; spin.current.idle = 0; }
  };

  return (
    <div
      ref={wrap}
      className={`fabricview ${className}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      tabIndex={0}
      role="img"
      aria-label="3D garment, drag to turn it"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 24, near: 0.05, far: 20, position: [0, 0, 3] }}
        gl={{ alpha: true, antialias: true, stencil: false, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.NeutralToneMapping; // keeps a chosen colour looking like itself
          gl.toneMappingExposure = 1;
        }}
      >
        <Rig spin={spin} />
        <Studio />
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#fffaf1', '#b8aa96', 0.35]} />
        <directionalLight position={[2, 3, 4]} intensity={2.1} />
        <directionalLight position={[-3, 1.5, 2]} intensity={0.7} />
        <directionalLight position={[0, 2, -3]} intensity={0.8} />
        <Suspense fallback={null}>
          <Garment fabric={fabric} spin={spin} />
        </Suspense>
      </Canvas>
      <span className="fabricview__hint" aria-hidden="true">Drag to turn</span>
    </div>
  );
}
