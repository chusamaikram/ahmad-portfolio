"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useTypewriter } from "./_hooks";
import { techIcons } from "./_data";
import { LinkedInIcon, GitHubIcon } from "@/src/assets/icons";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {techIcons.map((icon) => (
        <div
          key={icon.label}
          className="orbit-icon"
          style={{ "--r": icon.r, "--dur": icon.dur, "--start": icon.start } as React.CSSProperties}
        >
          <div
            className="icon-float -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/10"
            style={{ background: icon.bg, boxShadow: `0 0 12px 2px ${icon.color}40` }}
            title={icon.label}
          >
            {icon.svg}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HeroSection() {
  const role = useTypewriter();

  return (
    <section id="home" className="min-h-screen flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="hero-text">
          <p className="text-violet-400 font-medium mb-3 tracking-wide">👋 Hello, I'm</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            Muhammad <span className="text-violet-500">Ahmad</span>
          </h1>
          <h2 className="text-2xl text-gray-500 dark:text-gray-400 font-medium mb-6 flex items-center gap-2 min-h-[2rem]">
            <span className="typewriter text-violet-300">{role}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
            3+ years of experience building modern, responsive web applications with{" "}
            <span className="text-violet-400">ReactJS</span>, <span className="text-violet-400">NextJS</span>, and
            full-stack capabilities in <span className="text-violet-400">Django</span> &{" "}
            <span className="text-violet-400">Laravel</span>. Delivered 30+ successful projects.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">View Projects</a>
            <a href="#contact" className="border border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors">Hire Me</a>
          </div>
          <div className="flex gap-4 mt-8">
            <a href="https://linkedin.com/in/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-colors text-sm">
              <LinkedInIcon />
              LinkedIn
            </a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-colors text-sm">
              <GitHubIcon />
              GitHub
            </a>
          </div>
        </div>

        <div className="hidden md:flex justify-center hero-canvas">
          <div className="relative w-80 h-80">
            <div className="glow-ring absolute inset-0 rounded-full border border-violet-500/20" />
            <div className="glow-ring absolute inset-[-20px] rounded-full border border-violet-500/10" style={{ animationDelay: "0.5s" }} />
            <div className="glow-ring absolute inset-[-40px] rounded-full border border-violet-500/5" style={{ animationDelay: "1s" }} />
            <FloatingIcons />
            <div className="absolute inset-0 pulse-glow rounded-full overflow-hidden">
              <HeroCanvas />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
