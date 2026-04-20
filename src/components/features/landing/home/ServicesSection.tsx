"use client";

import React from "react";
import Reveal from "./Reveal";
import { services } from "./_data";
import { CheckIcon } from "@/src/assets/icons";

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-white dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><h2 className="text-4xl font-bold text-center mb-3">My <span className="text-violet-500">Services</span></h2></Reveal>
        <Reveal delay={100}><p className="text-center text-gray-500 dark:text-gray-400 mb-16">What I can do for you</p></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="flip-card h-72 w-full cursor-pointer">
                <div className="flip-card-inner">
                  <div className="flip-card-front relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.gradient}`} />
                    <span className="absolute top-4 right-4 text-xs font-bold text-gray-700">0{i + 1}</span>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white mb-5 shadow-lg float-anim`} style={{ animationDelay: `${i * 0.4}s` }}>
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{s.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                    <p className={`mt-auto text-xs font-medium bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>Hover to see more →</p>
                  </div>
                  <div className={`flip-card-back relative bg-gradient-to-br ${s.gradient} rounded-2xl p-6 flex flex-col justify-between overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div>
                      <span className="text-white/60 text-xs font-bold">0{i + 1}</span>
                      <h3 className="text-xl font-bold text-white mt-1 mb-4">{s.title}</h3>
                      <ul className="flex flex-col gap-3">
                        {s.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                            <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-xs mt-4">
                      {s.icon}
                      <span>Available for hire</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
