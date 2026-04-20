"use client";

import React from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import useProjects from "@/src/api/hooks/useProjects"
import { GitHubIcon, ExternalLinkIcon, ArrowRightIcon } from "@/src/assets/icons";

export default function ProjectsSection() {
  const { projects,loading } = useProjects();
  const displayed = projects.slice(0, 4);
  return (
    <section id="projects" className="py-24 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><h2 className="text-4xl font-bold text-center mb-3">My <span className="text-violet-500">Projects</span></h2></Reveal>
        <Reveal delay={100}><p className="text-center text-gray-500 dark:text-gray-400 mb-10">Some of my recent work</p></Reveal>
        <Reveal delay={120}>
          <div className="flex justify-center mb-12">
            <Link href="/projects" className="inline-flex items-center gap-2 border border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all">
              View All Projects
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-6">
          {loading && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-48 animate-pulse" />
            ))
          )}
          {!loading && displayed.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-violet-600 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-900/20 h-full">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{p.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tech.map((t) => (
                    <span key={t} className="text-xs bg-violet-900/40 text-violet-300 px-3 py-1 rounded-full border border-violet-800">{t}</span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a href={p.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-colors">
                    <GitHubIcon className="w-4 h-4" />
                    GitHub
                  </a>
                  <a href={p.live} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-400 transition-colors">
                    <ExternalLinkIcon className="w-4 h-4" />
                    Live Demo
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
