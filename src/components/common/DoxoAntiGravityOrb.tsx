import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AntiGravityOrbState = 'idle' | 'listening' | 'processing' | 'searching' | 'executing' | 'completed';

export interface DoxoAntiGravityOrbProps {
  state?: AntiGravityOrbState;
  size?: number | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const DoxoAntiGravityOrb: React.FC<DoxoAntiGravityOrbProps> = ({
  state = 'idle',
  size = 'lg',
  className = '',
  interactive = true,
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameId = useRef<number | null>(null);

  // Determine dimension in pixels
  const getPixelSize = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 36;
      case 'md':
        return 52;
      case 'xl':
        return 120;
      case 'hero':
        return 220;
      case 'lg':
      default:
        return 80;
    }
  };

  const pixelSize = getPixelSize();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    // 2. WebGL Renderer with alpha transparency and antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(pixelSize, pixelSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.replaceChildren(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.8, 10);
    pointLight.position.set(4, 4, 4);
    scene.add(pointLight);

    const backGlowLight = new THREE.PointLight(0x625bff, 2.0, 8);
    backGlowLight.position.set(-3, -2, -2);
    scene.add(backGlowLight);

    // 4. DOXO Core Orb: Custom Shader Material with Chromatic Fresnel & Wave Deformation
    const orbGeometry = new THREE.SphereGeometry(1.0, 64, 64);
    const orbUniforms = {
      u_time: { value: 0.0 },
      u_amplitude: { value: 0.05 },
    };

    const orbMaterial = new THREE.ShaderMaterial({
      uniforms: orbUniforms,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float u_time;
        uniform float u_amplitude;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          // Organic vertex wave deformation
          vec3 newPosition = position + normal * (sin(position.y * 8.0 + u_time * 2.2) * u_amplitude);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float u_time;

        void main() {
          // Fresnel rim lighting
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

          // DOXO Color Palette: Indigo (#625BFF) -> Purple (#A855F7) -> Cyan (#38BDF8)
          vec3 indigo = vec3(0.384, 0.357, 1.0);  // #625BFF
          vec3 purple = vec3(0.658, 0.333, 0.968); // #A855F7
          vec3 cyan   = vec3(0.220, 0.741, 0.972); // #38BDF8

          vec3 color = mix(indigo, purple, intensity * 1.2);
          color = mix(color, cyan, pow(intensity, 2.8) * 0.7);

          // Subtle organic core luminescence
          float coreGlow = smoothstep(0.8, 0.0, length(vPosition.xy));
          color += indigo * (coreGlow * 0.35);

          gl_FragColor = vec4(color, 0.95);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });

    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);

    // 5. Kinetic Orbit Ring: DOXO 'D' Arc
    // Torus arc spanning Math.PI * 1.35
    const ringGeometry = new THREE.TorusGeometry(1.48, 0.024, 16, 100, Math.PI * 1.35);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.8,
      metalness: 0.85,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    // 6. Core Specular Flare (Luminous White Center)
    const flareGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const flareMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const flare = new THREE.Mesh(flareGeometry, flareMaterial);
    flare.position.set(0.12, 0.14, 0.9);
    scene.add(flare);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Localized coordinate space relative to orb center
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      mouseRef.current.targetX = Math.max(-1, Math.min(1, dx));
      mouseRef.current.targetY = Math.max(-1, Math.min(1, -dy));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 7. Animation Loop with useAGFrame mechanics
    let startTime = performance.now();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const elapsed = (performance.now() - startTime) / 1000;

      // Speed configuration based on state
      const speed =
        state === 'processing' || state === 'executing'
          ? 2.5
          : state === 'listening' || state === 'searching'
          ? 1.6
          : 1.0;

      const amplitude =
        state === 'processing' || state === 'executing' ? 0.14 : 0.045;

      // 1. Update Shader Uniforms
      orbUniforms.u_time.value = elapsed * speed;
      orbUniforms.u_amplitude.value = amplitude;

      // 2. Orb scale pulsation
      const baseScale =
        state === 'processing' || state === 'executing' ? 1.08 : 1.0;
      const pulse = Math.sin(elapsed * 2.2 * speed) * 0.035;
      orb.scale.setScalar(baseScale + pulse);

      // 3. Mouse Following (Lerp Interpolation)
      const targetX = mouseRef.current.targetX * 0.22;
      const targetY = mouseRef.current.targetY * 0.22;
      mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08;

      orb.position.x = mouseRef.current.x;
      orb.position.y = mouseRef.current.y;

      // 4. Kinetic Orbit Ring (D-Arc) rotation & tilt
      ring.rotation.y = elapsed * 0.65 * speed;
      ring.rotation.x = Math.sin(elapsed * 0.3) * 0.15 + mouseRef.current.y * 0.15;
      ring.rotation.z = Math.cos(elapsed * 0.25) * 0.1;

      // Ring follows orb position
      ring.position.copy(orb.position);

      // Flare follows orb position
      flare.position.x = orb.position.x + 0.12;
      flare.position.y = orb.position.y + 0.14;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      flareGeometry.dispose();
      flareMaterial.dispose();
      container.replaceChildren();
    };
  }, [state, pixelSize, interactive]);

  return (
    <div
      ref={mountRef}
      className={`doxo-ag-orb-container ${className}`}
      onClick={onClick}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
      title={`DOXO Anti-Gravity Orb: ${state}`}
    />
  );
};
