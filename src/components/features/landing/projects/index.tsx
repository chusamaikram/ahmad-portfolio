"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import useProjects from "@/src/api/hooks/useProjects";


const categories = ["All", "Full-Stack", "Frontend", "Backend"];

// ── Three.js floating grid background ────────────────────────────────────────
function GridBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth, H = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 6);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(1);
    mount.appendChild(renderer.domElement);

    // Floating grid dots
    const count = 180;
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      speeds[i] = 0.002 + Math.random() * 0.004;
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x7c3aed, size: 0.04, transparent: true, opacity: 0.5 }));
    scene.add(points);

    // Horizontal grid lines
    for (let i = -6; i <= 6; i++) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, i * 1.1, -2), new THREE.Vector3(12, i * 1.1, -2)]);
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.04 })));
    }
    for (let i = -10; i <= 10; i++) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.2, -8, -2), new THREE.Vector3(i * 1.2, 8, -2)]);
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.04 })));
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= speeds[i];
        if (pos[i * 3 + 1] < -7) pos[i * 3 + 1] = 7;
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
}

// ── 3D tilt card ─────────────────────────────────────────────────────────────
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current!;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale3d(1.03,1.03,1.03)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)"; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`tilt-card ${className}`} style={{ transition: "transform 0.15s ease", willChange: "transform" }}>
      {children}
    </div>
  );
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

export default function ProjectsView() {

  const { projects } = useProjects();
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter(p => p.category === active);

  return (
    <>
      <style>{`
        .reveal-item { opacity:0; transform:translateY(50px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .reveal-item.rv { opacity:1; transform:translateY(0); }
        .tilt-card { position:relative; overflow:hidden; }
        .tilt-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(124,58,237,0.15) 0%, transparent 65%); opacity:0; transition:opacity 0.3s; pointer-events:none; z-index:1; }
        .tilt-card:hover::before { opacity:1; }
        .neon-border { position:relative; }
        .neon-border::after { content:''; position:absolute; inset:-1px; border-radius:inherit; background:linear-gradient(135deg,#7c3aed,#06b6d4,#7c3aed); opacity:0; transition:opacity 0.4s; z-index:-1; }
        .neon-border:hover::after { opacity:1; }
        @keyframes badge-pop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 70%{transform:scale(1.15) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        .badge-anim { animation: badge-pop 0.4s cubic-bezier(.34,1.56,.64,1) forwards; opacity:0; }
        @keyframes count-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .count-anim { animation: count-up 0.6s ease forwards; }
        .filter-btn { position:relative; overflow:hidden; }
        .filter-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#7c3aed,#06b6d4); opacity:0; transition:opacity 0.3s; z-index:-1; border-radius:inherit; }
        .filter-btn.active::after, .filter-btn:hover::after { opacity:1; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .shimmer-text { background:linear-gradient(90deg,#a78bfa,#fff,#06b6d4,#a78bfa); background-size:200%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-20 relative overflow-hidden transition-colors duration-300">
        <GridBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          {/* Header */}
          <Reveal>
            <div className="text-center mb-4">
              <Link href="/" className="inline-flex items-center gap-2 text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 text-sm mb-8 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Home
              </Link>
              <h1 className="text-5xl md:text-7xl font-black mb-4 shimmer-text">All Projects</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">A complete collection of {projects.length}+ projects I've built</p>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-8 my-12">
              {[["12+", "Projects"], ["4", "Categories"], ["20+", "Technologies"], ["3+", "Years"]].map(([num, label], i) => (
                <div key={label} className="text-center count-anim" style={{ animationDelay: `${i * 100}ms` }}>
                  <p className="text-4xl font-black text-violet-500 dark:text-violet-400">{num}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Filter tabs */}
          <Reveal delay={150}>
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActive(cat)}
                  className={`filter-btn px-6 py-2.5 rounded-full text-sm font-semibold border transition-all z-10 ${active === cat ? "active border-transparent text-white" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-white"}`}>
                  {cat}
                  <span className="ml-2 text-xs opacity-70">
                    {cat === "All" ? projects.length : projects.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* Projects grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <TiltCard className="neon-border h-full">
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-2xl p-6 h-full flex flex-col group">

                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      {/* <span className={`text-xs px-3 py-1 rounded-full font-medium ${p.status === "live" || p.status === "archived" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800" : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800"}`}>
                        {p.status === "live" ? "● Live" : p.status === "archived" ? "● archived" : "◐ In Progress"}
                      </span> */}
                      <span className="text-xs text-gray-400 dark:text-gray-600">{p.year}</span>
                    </div>

                    {/* Category tag */}
                    <span className="text-xs text-violet-500 dark:text-violet-400 font-medium mb-2 uppercase tracking-widest">{p.category}</span>

                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors">{p.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5 flex-1">{p.desc}</p>

                    {/* Tech badges */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {p.tech.map((t, ti) => (
                        <span key={t} className="badge-anim text-xs bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 px-2.5 py-1 rounded-full border border-violet-300 dark:border-violet-800/50"
                          style={{ animationDelay: `${ti * 60}ms` }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <a href={p.github} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                        Code
                      </a>
                      <a href={p.live}
                        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Live Demo
                      </a>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
