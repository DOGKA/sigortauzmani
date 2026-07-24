import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./HeroScene.css";

const FOG_COLOR = 0xe9f1fd;
const BRAND_LIGHT = 0x2d7ef5;
const BRAND_DARK = 0x0b48c8;

/** Grid resolution of the wave plane */
const GRID_W = 90;
const GRID_H = 50;

interface FloatingShape {
  mesh: THREE.LineSegments;
  baseY: number;
  rotSpeedX: number;
  rotSpeedY: number;
  driftSpeed: number;
  driftPhase: number;
}

interface HeroSceneProps {
  /** Mirror the scene vertically (footer: wave plane becomes a ceiling) */
  flip?: boolean;
}

export default function HeroScene({ flip = false }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(FOG_COLOR, 18, 46);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    camera.position.set(0, 3.4, 14);
    camera.lookAt(0, 1.2, 0);

    /* ---- wave plane (calm, breathing surface toward the horizon) ---- */
    const planeGeo = new THREE.PlaneGeometry(70, 34, GRID_W, GRID_H);
    planeGeo.rotateX(-Math.PI / 2);
    const basePositions = planeGeo.attributes.position.array.slice() as Float32Array;

    const pointsMat = new THREE.PointsMaterial({
      color: BRAND_LIGHT,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const wavePoints = new THREE.Points(planeGeo, pointsMat);
    wavePoints.position.set(0, -2.2, -6);
    scene.add(wavePoints);

    const wireMat = new THREE.MeshBasicMaterial({
      color: BRAND_LIGHT,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    });
    const waveWire = new THREE.Mesh(planeGeo, wireMat);
    waveWire.position.copy(wavePoints.position);
    scene.add(waveWire);

    /* ---- floating wireframe shapes at different depths ---- */
    const shapes: FloatingShape[] = [];
    const shapeSpecs = [
      { geo: new THREE.IcosahedronGeometry(2.6, 0), pos: [-11, 4.6, -14], color: BRAND_LIGHT, opacity: 0.12 },
      { geo: new THREE.IcosahedronGeometry(1.7, 0), pos: [10.5, 5.4, -10], color: BRAND_DARK, opacity: 0.1 },
      { geo: new THREE.OctahedronGeometry(1.3, 0), pos: [-6.5, 6.8, -20], color: BRAND_LIGHT, opacity: 0.09 },
      { geo: new THREE.IcosahedronGeometry(3.4, 1), pos: [7, 7.5, -26], color: BRAND_LIGHT, opacity: 0.06 },
      { geo: new THREE.OctahedronGeometry(0.9, 0), pos: [13.5, 2.8, -6], color: BRAND_DARK, opacity: 0.13 },
    ] as const;

    for (const spec of shapeSpecs) {
      const edges = new THREE.EdgesGeometry(spec.geo);
      const mat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        depthWrite: false,
      });
      const mesh = new THREE.LineSegments(edges, mat);
      mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      shapes.push({
        mesh,
        baseY: spec.pos[1],
        rotSpeedX: 0.02 + Math.random() * 0.03,
        rotSpeedY: 0.03 + Math.random() * 0.04,
        driftSpeed: 0.1 + Math.random() * 0.12,
        driftPhase: Math.random() * Math.PI * 2,
      });
      spec.geo.dispose();
    }

    /* ---- sizing ---- */
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (prefersReducedMotion) renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    /* ---- subtle mouse parallax (heavily damped) ---- */
    const targetOffset = { x: 0, y: 0 };
    const currentOffset = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetOffset.x = nx * 0.55;
      targetOffset.y = ny * 0.3;
    };

    /* ---- animation ---- */
    const timer = new THREE.Timer();
    timer.connect(document);
    let rafId = 0;
    let running = false;

    const updateWave = (t: number) => {
      const positions = planeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = basePositions[i];
        const z = basePositions[i + 2];
        positions[i + 1] =
          Math.sin(x * 0.28 + t * 0.35) * 0.34 +
          Math.cos(z * 0.32 + t * 0.25) * 0.28;
      }
      planeGeo.attributes.position.needsUpdate = true;
    };

    const renderFrame = (timestamp?: number) => {
      timer.update(timestamp);
      const t = timer.getElapsed();
      updateWave(t);

      for (const s of shapes) {
        s.mesh.rotation.x += s.rotSpeedX * 0.016;
        s.mesh.rotation.y += s.rotSpeedY * 0.016;
        s.mesh.position.y =
          s.baseY + Math.sin(t * s.driftSpeed + s.driftPhase) * 0.45;
      }

      currentOffset.x += (targetOffset.x - currentOffset.x) * 0.03;
      currentOffset.y += (targetOffset.y - currentOffset.y) * 0.03;
      camera.position.x = currentOffset.x;
      camera.position.y = 3.4 - currentOffset.y;
      camera.lookAt(0, 1.2, 0);

      renderer.render(scene, camera);
    };

    const loop = (timestamp: number) => {
      renderFrame(timestamp);
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || prefersReducedMotion) return;
      running = true;
      timer.reset();
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    if (prefersReducedMotion) {
      // Static frame: gentle fixed wave, no loop.
      updateWave(1.5);
      renderer.render(scene, camera);
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      planeGeo.dispose();
      pointsMat.dispose();
      wireMat.dispose();
      for (const s of shapes) {
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.Material).dispose();
      }
      timer.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={flip ? "hero-scene hero-scene--flip" : "hero-scene"}
      aria-hidden="true"
    />
  );
}
