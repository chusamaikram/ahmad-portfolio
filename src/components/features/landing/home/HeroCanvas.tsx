"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth, H = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ── Lights ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const light1 = new THREE.PointLight(0x7c3aed, 6, 12);
    light1.position.set(3, 3, 3);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x06b6d4, 4, 12);
    light2.position.set(-3, -2, 2);
    scene.add(light2);

    // ── DNA Double Helix ────────────────────────────────────────────────────
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    const strandCount = 28;
    const helixRadius = 1.0;
    const helixHeight = 3.2;
    const sphereGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const rodGeo = new THREE.CylinderGeometry(0.018, 0.018, 1, 8);

    const matA = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x4c1d95, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.8 });
    const matB = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0e7490, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.8 });
    const matRod = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, roughness: 0.5 });

    for (let i = 0; i < strandCount; i++) {
      const t = (i / strandCount) * Math.PI * 4;
      const y = (i / strandCount) * helixHeight - helixHeight / 2;

      // Strand A
      const sA = new THREE.Mesh(sphereGeo, matA);
      sA.position.set(Math.cos(t) * helixRadius, y, Math.sin(t) * helixRadius);
      helixGroup.add(sA);

      // Strand B (offset by π)
      const sB = new THREE.Mesh(sphereGeo, matB);
      sB.position.set(Math.cos(t + Math.PI) * helixRadius, y, Math.sin(t + Math.PI) * helixRadius);
      helixGroup.add(sB);

      // Connecting rod every other node
      if (i % 2 === 0) {
        const rod = new THREE.Mesh(rodGeo, matRod);
        const pA = sA.position, pB = sB.position;
        rod.position.copy(pA).lerp(pB, 0.5);
        rod.scale.y = pA.distanceTo(pB);
        rod.lookAt(pB);
        rod.rotateX(Math.PI / 2);
        helixGroup.add(rod);
      }
    }

    // ── Orbiting Rings ───────────────────────────────────────────────────────
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    const ringData = [
      { r: 1.7, tube: 0.012, color: 0x7c3aed, rx: 0.4, rz: 0.2 },
      { r: 2.1, tube: 0.008, color: 0x06b6d4, rx: -0.6, rz: 0.8 },
      { r: 1.4, tube: 0.01,  color: 0xa78bfa, rx: 1.2, rz: -0.4 },
    ];
    const rings = ringData.map(({ r, tube, color, rx, rz }) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, tube, 8, 80),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.7 })
      );
      mesh.rotation.x = rx;
      mesh.rotation.z = rz;
      ringGroup.add(mesh);
      return mesh;
    });

    // ── Central morphing torus knot ──────────────────────────────────────────
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.38, 0.1, 120, 16, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x5b21b6, emissiveIntensity: 1, roughness: 0.1, metalness: 0.9, wireframe: false })
    );
    scene.add(knot);

    // ── Outer glow sphere (additive blending) ────────────────────────────────
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.08, side: THREE.BackSide })
    );
    scene.add(glowMesh);

    // ── Spring-physics mouse tracking ────────────────────────────────────────
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const onMouse = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2.5;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 2.5;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Animation ────────────────────────────────────────────────────────────
    let t = 0, animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.012;

      // Spring easing
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;

      // DNA helix slow spin + mouse tilt
      helixGroup.rotation.y = t * 0.35 + currentX * 0.25;
      helixGroup.rotation.x = currentY * 0.2;

      // Rings orbit at different speeds
      rings[0].rotation.z += 0.006;
      rings[1].rotation.x += 0.004;
      rings[2].rotation.y += 0.008;
      ringGroup.rotation.y = currentX * 0.15;
      ringGroup.rotation.x = currentY * 0.1;

      // Torus knot pulse + spin
      knot.rotation.x = t * 0.5;
      knot.rotation.y = t * 0.7;
      const pulse = 1 + Math.sin(t * 2) * 0.08;
      knot.scale.setScalar(pulse);

      // Light orbit
      light1.position.x = Math.cos(t * 0.7) * 4;
      light1.position.z = Math.sin(t * 0.7) * 4;
      light2.position.x = Math.cos(t * 0.5 + Math.PI) * 3;
      light2.position.z = Math.sin(t * 0.5 + Math.PI) * 3;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
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

  return <div ref={mountRef} className="w-full h-full" />;
}
