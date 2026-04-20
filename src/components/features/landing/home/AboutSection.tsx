"use client";

import React from "react";
import Reveal from "./Reveal";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><h2 className="text-4xl font-bold text-center mb-3">About <span className="text-violet-500">Me</span></h2></Reveal>
        <Reveal delay={100}><p className="text-center text-gray-500 dark:text-gray-400 mb-16">A little bit about who I am</p></Reveal>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal delay={150}>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Frontend Developer & Full-Stack Enthusiast</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                I'm Muhammad Ahmad, a passionate web developer with <strong className="dark:text-white text-gray-900">3+ years of experience</strong> crafting
                high-quality web applications. I specialize in building fast, accessible, and visually appealing frontends.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                With <strong className="dark:text-white text-gray-900">30+ projects</strong> under my belt, I've worked with startups and businesses to bring
                their ideas to life. I also handle backend development using Django and Laravel when needed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[["Experience", "3+ Years"], ["Projects", "30+"], ["Frontend", "HTML, CSS, JS, React, Next"], ["Backend", "Django, Laravel"]].map(([label, value], i) => (
                  <div key={label} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 float-anim" style={{ animationDelay: `${i * 0.2}s` }}>
                    <p className="text-violet-400 text-sm font-medium">{label}</p>
                    <p className="text-gray-900 dark:text-white font-semibold mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={250}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { skill: "React / Next", level: 90, color: "#7c3aed" },
                  { skill: "HTML & CSS", level: 95, color: "#8b5cf6" },
                  { skill: "JavaScript", level: 88, color: "#a78bfa" },
                  { skill: "Django / Laravel", level: 75, color: "#6d28d9" },
                ].map(({ skill, level, color }) => {
                  const r = 36;
                  const circ = 2 * Math.PI * r;
                  const offset = circ - (level / 100) * circ;
                  return (
                    <div key={skill} className="bg-gray-200/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 hover:border-violet-600 transition-all hover:shadow-lg hover:shadow-violet-900/30 group">
                      <div className="relative flex-shrink-0">
                        <svg width="88" height="88" viewBox="0 0 88 88">
                          <circle cx="44" cy="44" r={r} fill="none" stroke="#1f2937" strokeWidth="7" />
                          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
                            strokeDasharray={circ} strokeDashoffset={circ} transform="rotate(-90 44 44)"
                            className="ring-anim" style={{ "--full": circ, "--offset": offset } as React.CSSProperties} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white">{level}%</span>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-semibold text-sm group-hover:text-violet-300 transition-colors">{skill}</p>
                        <div className="mt-1.5 h-1 w-16 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                          <div className="h-1 rounded-full skill-bar" style={{ background: color, "--w": `${level}%`, width: `${level}%` } as React.CSSProperties} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-200/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-2xl p-5">
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "TypeScript", color: "bg-blue-900/50 text-blue-300 border-blue-700" },
                    { name: "Tailwind CSS", color: "bg-cyan-900/50 text-cyan-300 border-cyan-700" },
                    { name: "PostgreSQL", color: "bg-sky-900/50 text-sky-300 border-sky-700" },
                    { name: "REST APIs", color: "bg-violet-900/50 text-violet-300 border-violet-700" },
                    { name: "Git & GitHub", color: "bg-orange-900/50 text-orange-300 border-orange-700" },
                    { name: "Docker", color: "bg-teal-900/50 text-teal-300 border-teal-700" },
                    { name: "MySQL", color: "bg-yellow-900/50 text-yellow-300 border-yellow-700" },
                    { name: "Figma", color: "bg-pink-900/50 text-pink-300 border-pink-700" },
                  ].map(({ name, color }, i) => (
                    <span key={name}
                      className={`badge-pop text-xs font-medium px-3 py-1.5 rounded-full border ${color} hover:scale-110 transition-transform cursor-default`}
                      style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
