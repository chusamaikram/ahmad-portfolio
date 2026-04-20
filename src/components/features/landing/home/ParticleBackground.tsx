"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = window.innerWidth, H = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(1);
    mount.appendChild(renderer.domElement);

    // ── Particles ────────────────────────────────────────────────────────────
    const COUNT = 220;
    const positions = new Float32Array(COUNT * 3);
    const velocities: THREE.Vector3[] = [];
    const origins = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 6;
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      origins[i * 3] = x; origins[i * 3 + 1] = y; origins[i * 3 + 2] = z;
      velocities.push(new THREE.Vector3());
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);

    // Custom shader for glowing round particles
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vAlpha = 0.6 + 0.4 * sin(uTime + position.x * 2.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.8 * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(0.55, 0.25, 0.95, alpha * 0.75);
        }
      `,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── Connection lines between close particles ──────────────────────────────
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(COUNT * COUNT * 6);
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeo.setAttribute("position", linePosAttr);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.12 });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // ── Mouse repulsion ───────────────────────────────────────────────────────
    const mouse3D = new THREE.Vector3(9999, 9999, 0);
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    const onMouse = (e: MouseEvent) => {
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(plane, mouse3D);
    };
    window.addEventListener("mousemove", onMouse);

    let animId: number;
    let elapsed = 0;
    const tmp = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      elapsed += 0.016;
      mat.uniforms.uTime.value = elapsed;

      let lineIdx = 0;

      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        tmp.set(positions[ix], positions[ix + 1], positions[ix + 2]);

        // Repulsion from mouse
        const diff = tmp.clone().sub(mouse3D);
        const dist = diff.length();
        if (dist < 1.8) {
          const force = (1.8 - dist) / 1.8;
          velocities[i].addScaledVector(diff.normalize(), force * 0.04);
        }

        // Spring back to origin
        const ox = origins[ix], oy = origins[ix + 1], oz = origins[ix + 2];
        velocities[i].x += (ox - positions[ix]) * 0.018;
        velocities[i].y += (oy - positions[ix + 1]) * 0.018;
        velocities[i].z += (oz - positions[ix + 2]) * 0.018;

        // Damping
        velocities[i].multiplyScalar(0.92);

        positions[ix] += velocities[i].x;
        positions[ix + 1] += velocities[i].y;
        positions[ix + 2] += velocities[i].z;

        // Connection lines
        for (let j = i + 1; j < COUNT; j++) {
          const jx = j * 3;
          const dx = positions[ix] - positions[jx];
          const dy = positions[ix + 1] - positions[jx + 1];
          const dz = positions[ix + 2] - positions[jx + 2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < 2.5) {
            linePositions[lineIdx++] = positions[ix];
            linePositions[lineIdx++] = positions[ix + 1];
            linePositions[lineIdx++] = positions[ix + 2];
            linePositions[lineIdx++] = positions[jx];
            linePositions[lineIdx++] = positions[jx + 1];
            linePositions[lineIdx++] = positions[jx + 2];
          }
        }
      }

      posAttr.needsUpdate = true;
      linePosAttr.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIdx / 3);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = window.innerWidth, nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
