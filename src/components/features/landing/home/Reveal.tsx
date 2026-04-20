"use client";

import React from "react";
import { useReveal } from "./_hooks";

export default function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal-box ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
