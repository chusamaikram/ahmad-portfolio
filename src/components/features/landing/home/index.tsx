"use client";

import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import ProjectsSection from "./ProjectsSection";
import TestimonialsSection from "./TestimonialsSection";
import ContactSection from "./ContactSection";

export default function HomeView() {
  return (
    <>
      <style>{`
        .reveal-box { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-box.revealed { opacity: 1; transform: translateY(0); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        .float-anim { animation: float 5s ease-in-out infinite; }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 30px 8px rgba(124,58,237,0.35)} 50%{box-shadow:0 0 60px 20px rgba(124,58,237,0.6)} }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        @keyframes slide-in-left { from{opacity:0;transform:translateX(-60px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slide-in-right { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
        .hero-text { animation: slide-in-left 0.9s ease forwards; }
        .hero-canvas { animation: slide-in-right 0.9s ease forwards; }
        @keyframes bar-fill { from{width:0} to{width:var(--w)} }
        .skill-bar { animation: bar-fill 1.2s ease forwards; }
        @keyframes ring-fill { from{stroke-dashoffset:var(--full)} to{stroke-dashoffset:var(--offset)} }
        .ring-anim { animation: ring-fill 1.4s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes badge-pop { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        .badge-pop { animation: badge-pop 0.4s ease forwards; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-text { background: linear-gradient(90deg,#a78bfa,#7c3aed,#c4b5fd,#7c3aed,#a78bfa); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation: shimmer 3s linear infinite; }
        @keyframes blink { 0%,100%{border-color:transparent} 50%{border-color:#a78bfa} }
        .typewriter { overflow:hidden; white-space:nowrap; border-right:3px solid #a78bfa; animation: blink 1s step-end infinite; }
        @keyframes orbit { from{transform:rotate(var(--start)) translateX(var(--r)) rotate(calc(-1 * var(--start)))} to{transform:rotate(calc(var(--start) + 360deg)) translateX(var(--r)) rotate(calc(-1 * (var(--start) + 360deg)))} }
        .orbit-icon { position:absolute; top:50%; left:50%; animation: orbit var(--dur) linear infinite; transform-origin: 0 0; }
        @keyframes icon-float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.08)} }
        .icon-float { animation: icon-float 3s ease-in-out infinite; }
        @keyframes glow-ring { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.04)} }
        .glow-ring { animation: glow-ring 3s ease-in-out infinite; }
        .flip-card { perspective: 1000px; }
        .flip-card-inner { position:relative; width:100%; height:100%; transition: transform 0.7s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; }
        .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; }
        .flip-card-back { transform: rotateY(180deg); }
      `}</style>

      <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <TestimonialsSection />
        <ContactSection />
      </div>
    </>
  );
}
