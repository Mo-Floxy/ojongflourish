import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const STATES = {
  idle: { distort: 0.28, speed: 1.2, spin: 0.14, pulse: 0.035, waves: 0.5 },
  listening: { distort: 0.44, speed: 2.4, spin: 0.42, pulse: 0.075, waves: 1.1 },
  processing: { distort: 0.68, speed: 4.2, spin: 0.95, pulse: 0.055, waves: 1.8 },
  speaking: { distort: 0.4, speed: 2, spin: 0.5, pulse: 0.11, waves: 1.35 },
};

function ParticleCloud({ count, radius, color, size, spin, reducedMotion }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius[0] + Math.random() * (radius[1] - radius[0]);
      data[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      data[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      data[i * 3 + 2] = r * Math.cos(phi);
    }
    return data;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y += delta * spin;
    ref.current.rotation.x += delta * spin * 0.35;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EnergyRing({ rotation, color, radius, tube, opacity, speed, reducedMotion }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.z += delta * speed;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, tube, 8, 160]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function OrbCore({ state, reducedMotion, mobile }) {
  const group = useRef();
  const shell = useRef();
  const inner = useRef();
  const distortMaterial = useRef();
  const wave = useRef();
  const waveMaterial = useRef();
  const current = useRef({ ...STATES.idle });

  useFrame((frameState, delta) => {
    const t = frameState.clock.getElapsedTime();
    const target = STATES[state] || STATES.idle;
    const lerp = THREE.MathUtils.lerp;
    const smooth = reducedMotion ? 1 : Math.min(1, delta * 3.2);

    current.current.distort = lerp(current.current.distort, target.distort, smooth);
    current.current.speed = lerp(current.current.speed, target.speed, smooth);
    current.current.spin = lerp(current.current.spin, target.spin, smooth);
    current.current.pulse = lerp(current.current.pulse, target.pulse, smooth);
    current.current.waves = lerp(current.current.waves, target.waves, smooth);

    if (distortMaterial.current) {
      distortMaterial.current.distort = reducedMotion ? 0.12 : current.current.distort;
      distortMaterial.current.speed = reducedMotion ? 0.2 : current.current.speed;
    }

    if (group.current) {
      const breathing = reducedMotion ? 1 : 1 + Math.sin(t * (1.4 + current.current.waves)) * current.current.pulse;
      group.current.scale.setScalar(breathing);
      group.current.rotation.y = lerp(group.current.rotation.y, frameState.pointer.x * 0.22, 0.045);
      group.current.rotation.x = lerp(group.current.rotation.x, -frameState.pointer.y * 0.16, 0.045);
    }

    if (shell.current && !reducedMotion) {
      shell.current.rotation.y -= delta * current.current.spin * 0.5;
      shell.current.rotation.z += delta * current.current.spin * 0.18;
    }

    if (inner.current && !reducedMotion) {
      inner.current.rotation.y += delta * current.current.spin * 0.8;
    }

    if (wave.current && !reducedMotion) {
      const phase = (t * current.current.waves * 0.28) % 1;
      wave.current.scale.setScalar(1 + phase * 0.9);
      if (waveMaterial.current) waveMaterial.current.opacity = Math.max(0, 0.34 * (1 - phase));
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[2.5, 2, 3]} color="#60a5fa" intensity={22} distance={12} />
      <pointLight position={[-2.5, -1.5, 2]} color="#8b5cf6" intensity={16} distance={12} />
      <pointLight position={[0, 0, -3]} color="#22d3ee" intensity={10} distance={10} />

      <group ref={group} rotation={[0.1, 0, 0]}>
        {/* Core */}
        <mesh>
          <sphereGeometry args={[1.02, mobile ? 48 : 72, mobile ? 48 : 72]} />
          <MeshDistortMaterial
            ref={distortMaterial}
            color="#3b82f6"
            emissive="#1d4ed8"
            emissiveIntensity={1.15}
            roughness={0.16}
            metalness={0.45}
            transparent
            opacity={0.94}
          />
        </mesh>

        {/* Inner light */}
        <mesh ref={inner} scale={0.74}>
          <icosahedronGeometry args={[1, 3]} />
          <meshBasicMaterial
            color="#cbeaff"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Energy shell */}
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.42, 2]} />
          <meshBasicMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.24}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Orbital rings */}
        <EnergyRing rotation={[1.15, 0.3, 0]} color="#60a5fa" radius={1.65} tube={0.011} opacity={0.55} speed={0.22} reducedMotion={reducedMotion} />
        <EnergyRing rotation={[0.4, 1.1, 0.6]} color="#a78bfa" radius={1.86} tube={0.009} opacity={0.42} speed={-0.18} reducedMotion={reducedMotion} />
        <EnergyRing rotation={[1.6, 0.8, 1.2]} color="#22d3ee" radius={1.5} tube={0.007} opacity={0.38} speed={0.3} reducedMotion={reducedMotion} />

        {/* Expanding wave */}
        <mesh ref={wave} rotation={[Math.PI / 2.35, 0, 0]}>
          <torusGeometry args={[1.18, 0.018, 8, 128]} />
          <meshBasicMaterial
            ref={waveMaterial}
            color="#7dd3fc"
            transparent
            opacity={0.25}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <ParticleCloud count={mobile ? 160 : 420} radius={[1.65, 3.1]} color="#60a5fa" size={0.022} spin={0.08} reducedMotion={reducedMotion} />
        <ParticleCloud count={mobile ? 90 : 260} radius={[1.85, 3.4]} color="#c4b5fd" size={0.016} spin={-0.06} reducedMotion={reducedMotion} />
      </group>
    </>
  );
}

function Scene({ state, reducedMotion, mobile }) {
  return (
    <Float
      speed={reducedMotion ? 0 : 1.1}
      rotationIntensity={reducedMotion ? 0 : 0.12}
      floatIntensity={reducedMotion ? 0 : 0.35}
    >
      <OrbCore state={state} reducedMotion={reducedMotion} mobile={mobile} />
    </Float>
  );
}

/**
 * Signature AETHRA holographic orb.
 * `state` drives idle / listening / processing / speaking animations.
 */
export default function AIOrb({ state = 'idle', compact = false, className = '' }) {
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setSupportsWebGL(Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      setSupportsWebGL(false);
    }

    const mq = window.matchMedia('(max-width: 768px)');
    const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setMobile(mq.matches);
      setReducedMotion(rmq.matches);
    };
    sync();
    mq.addEventListener?.('change', sync);
    rmq.addEventListener?.('change', sync);
    return () => {
      mq.removeEventListener?.('change', sync);
      rmq.removeEventListener?.('change', sync);
    };
  }, []);

  const classes = [
    'ai-orb',
    `ai-orb--${state}`,
    compact ? 'ai-orb--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!supportsWebGL) {
    return (
      <div className={classes} role="img" aria-label="AETHRA AI orb">
        <div className="ai-orb__fallback" />
      </div>
    );
  }

  return (
    <div className={classes} role="img" aria-label={`AETHRA assistant is ${state}`}>
      <Canvas
        dpr={[1, mobile ? 1.25 : 1.8]}
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene state={state} reducedMotion={reducedMotion} mobile={mobile} />
      </Canvas>
    </div>
  );
}
