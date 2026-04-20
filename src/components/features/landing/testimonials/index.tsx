"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import usePublicTestimonials from "@/src/api/hooks/usePublicTestimonials";

const avatarColors = ["from-violet-600 to-purple-800", "from-cyan-600 to-blue-800", "from-pink-600 to-rose-800", "from-emerald-600 to-teal-800", "from-amber-600 to-orange-800"];

// ── Three.js floating orbs background ────────────────────────────────────────
function OrbBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth, H = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 8;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(W, H); renderer.setPixelRatio(1);
    mount.appendChild(renderer.domElement);

    // Floating orbs
    const orbData: { mesh: THREE.Mesh; speed: number; offset: number }[] = [];
    const orbColors = [0x7c3aed, 0x06b6d4, 0xa78bfa, 0x4c1d95, 0x0e7490];
    for (let i = 0; i < 12; i++) {
      const r = 0.15 + Math.random() * 0.35;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 16),
        new THREE.MeshBasicMaterial({ color: orbColors[i % orbColors.length], transparent: true, opacity: 0.06 + Math.random() * 0.08 })
      );
      mesh.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 4);
      scene.add(mesh);
      orbData.push({ mesh, speed: 0.003 + Math.random() * 0.005, offset: Math.random() * Math.PI * 2 });
    }

    // Scattered stars
    const starCount = 300;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 30;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.3 })));

    // Connecting arcs between orbs
    orbData.forEach((a, i) => {
      if (i % 3 !== 0) return;
      const b = orbData[(i + 3) % orbData.length];
      const curve = new THREE.QuadraticBezierCurve3(
        a.mesh.position.clone(),
        new THREE.Vector3(0, 0, 0),
        b.mesh.position.clone()
      );
      const pts = curve.getPoints(30);
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.05 })));
    });

    let t = 0, animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.01;
      orbData.forEach(({ mesh, speed, offset }) => {
        mesh.position.y += Math.sin(t * speed * 60 + offset) * 0.003;
        mesh.position.x += Math.cos(t * speed * 40 + offset) * 0.002;
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("rv"); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="reveal-item" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? "text-amber-400" : "text-gray-300 dark:text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export default function TestimonialsView() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { publictestimonials, loading, error } = usePublicTestimonials();

  return (
    <>
      <style>{`
        .reveal-item { opacity:0; transform:translateY(50px) scale(0.97); transition:opacity 0.65s ease, transform 0.65s ease; }
        .reveal-item.rv { opacity:1; transform:translateY(0) scale(1); }
        .t-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .t-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 30px 60px -10px rgba(124,58,237,0.35); }
        @keyframes quote-drop { 0%{transform:translateY(-20px) rotate(-10deg);opacity:0} 100%{transform:translateY(0) rotate(0);opacity:1} }
        .quote-anim { animation: quote-drop 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .shimmer-text { background:linear-gradient(90deg,#a78bfa,#fff,#06b6d4,#a78bfa); background-size:200%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
        .avatar-ring { box-shadow: 0 0 0 2px rgba(124,58,237,0.5), 0 0 20px rgba(124,58,237,0.3); }
        @keyframes ring-pulse { 0%,100%{box-shadow:0 0 0 2px rgba(124,58,237,0.5),0 0 20px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 0 4px rgba(124,58,237,0.8),0 0 35px rgba(124,58,237,0.5)} }
        .avatar-ring-active { animation: ring-pulse 2s ease-in-out infinite; }
        .neon-line { height:1px; background:linear-gradient(90deg,transparent,#7c3aed,#06b6d4,transparent); }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-20 relative overflow-hidden transition-colors duration-300">
        <OrbBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          {/* Header */}
          <Reveal>
            <div className="text-center mb-16">
              <Link href="/" className="inline-flex items-center gap-2 text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 text-sm mb-8 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Home
              </Link>
              <h1 className="text-5xl md:text-7xl font-black mb-4 shimmer-text">Client Stories</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">Real feedback from real clients I've worked with</p>
              <div className="neon-line max-w-xs mx-auto" />
            </div>
          </Reveal>

          {/* Stats bar */}
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-12 mb-16">
              {[[`12+`, "Happy Clients"], ["100%", "Satisfaction Rate"], ["5★", "Average Rating"], ["30+", "Projects Delivered"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-4xl font-black text-violet-500 dark:text-violet-400">{val}</p>
                  <p className="text-gray-500 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 space-y-4 animate-pulse">
                <div className="h-6 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/6" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-2.5 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}

            {error && (
              <p className="col-span-3 text-center text-gray-400 dark:text-gray-600 py-12">Failed to load testimonials.</p>
            )}

            {!loading && !error && publictestimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 70}>
                <div
                  className="t-card bg-gray-50 dark:bg-gray-900/70 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-2xl p-7 flex flex-col h-full cursor-default"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className={`text-6xl font-black leading-none mb-4 quote-anim ${hovered === i ? "text-violet-500 dark:text-violet-400" : "text-violet-200 dark:text-violet-800"} transition-colors duration-300`}
                    style={{ animationDelay: `${i * 60}ms` }}>
                    "
                  </div>
                  <div className="mb-4"><Stars count={t.rating} /></div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-6">{t.text}</p>
                  <div className={`neon-line mb-5 transition-opacity duration-300 ${hovered === i ? "opacity-100" : "opacity-30"}`} />
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 avatar-ring ${hovered === i ? "avatar-ring-active" : ""}`}>
                      {getInitials(t.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-violet-500 dark:text-violet-400 text-xs">{t.role} @ {t.company}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={200}>
            <div className="text-center mt-20">
              <p className="text-gray-500 dark:text-gray-400 mb-6">Want to work together?</p>
              <Link href="/#contact"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-violet-700/40 hover:-translate-y-1">
                Let's Talk
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
}
