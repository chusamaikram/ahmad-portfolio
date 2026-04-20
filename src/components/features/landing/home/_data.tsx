import React from "react";
import {
  CodeIcon, ServerIcon, MobileIcon, BoltIcon,
  EmailIcon, PhoneIcon, LinkedInIcon, GitHubIcon,
  ReactIcon, NextjsIcon, TypeScriptIcon, DjangoIcon, TailwindIcon,
} from "@/src/assets/icons";

export const services = [
  {
    title: "Frontend Development",
    desc: "Pixel-perfect, responsive UIs with HTML, CSS, JavaScript, ReactJS & NextJS.",
    features: ["React & Next.js", "Tailwind CSS", "Animations & Transitions"],
    gradient: "from-violet-600 to-purple-700",
    glow: "hover:shadow-violet-900/40",
    icon: <CodeIcon className="w-7 h-7" />,
  },
  {
    title: "Backend Development",
    desc: "Robust REST APIs and server-side logic using Django and Laravel.",
    features: ["Django REST Framework", "Laravel APIs", "Database Design"],
    gradient: "from-blue-600 to-indigo-700",
    glow: "hover:shadow-blue-900/40",
    icon: <ServerIcon className="w-7 h-7" />,
  },
  {
    title: "Responsive Design",
    desc: "Mobile-first designs that look great on every screen size and device.",
    features: ["Mobile-First Approach", "Cross-Browser Support", "Pixel-Perfect UI"],
    gradient: "from-pink-600 to-rose-700",
    glow: "hover:shadow-pink-900/40",
    icon: <MobileIcon className="w-7 h-7" />,
  },
  {
    title: "Performance Optimization",
    desc: "Fast-loading, SEO-friendly web apps with best practices built in.",
    features: ["Core Web Vitals", "SEO Best Practices", "Code Splitting"],
    gradient: "from-emerald-600 to-teal-700",
    glow: "hover:shadow-emerald-900/40",
    icon: <BoltIcon className="w-7 h-7" />,
  },
];

export const projects = [
  { title: "E-Commerce Platform", tech: ["NextJS", "Django", "PostgreSQL"], desc: "Full-stack e-commerce app with cart, payments, and admin dashboard.", github: "https://github.com/", live: "#" },
  { title: "Real Estate App", tech: ["ReactJS", "Laravel", "MySQL"], desc: "Property listing platform with search filters and agent profiles.", github: "https://github.com/", live: "#" },
  { title: "Portfolio CMS", tech: ["NextJS", "Django REST"], desc: "Dynamic portfolio with a custom CMS for managing projects and blogs.", github: "https://github.com/", live: "#" },
  { title: "Task Management Tool", tech: ["ReactJS", "Node.js"], desc: "Kanban-style task manager with drag-and-drop and team collaboration.", github: "https://github.com/", live: "#" },
];

export const testimonials = [
  { name: "Sarah Johnson", role: "CEO, TechStart", avatar: "SJ", color: "from-violet-600 to-purple-700", rating: 5, text: "Muhammad delivered an outstanding website that exceeded our expectations. His attention to detail and communication were top-notch." },
  { name: "Ali Hassan", role: "Product Manager, DevCo", avatar: "AH", color: "from-blue-600 to-indigo-700", rating: 5, text: "Incredibly talented developer. He built our entire platform from scratch and delivered on time. Highly recommended!" },
  { name: "Emily Clarke", role: "Founder, DesignHub", avatar: "EC", color: "from-pink-600 to-rose-700", rating: 5, text: "Working with Ahmad was a pleasure. Clean code, great design sense, and always responsive to feedback." },
  { name: "James Carter", role: "CTO, BuildFast", avatar: "JC", color: "from-emerald-600 to-teal-700", rating: 5, text: "Ahmad's technical skills are exceptional. He transformed our outdated site into a blazing-fast modern web app in record time." },
];

export const techIcons = [
  { label: "React",      color: "#61dafb", bg: "#0d1f2d", dur: "10s", r: "160px", start: "0deg",   svg: <ReactIcon      className="w-5 h-5" /> },
  { label: "Next.js",    color: "#ffffff", bg: "#111",    dur: "13s", r: "160px", start: "72deg",  svg: <NextjsIcon     className="w-5 h-5" /> },
  { label: "TypeScript", color: "#3178c6", bg: "#0d1a2d", dur: "11s", r: "160px", start: "144deg", svg: <TypeScriptIcon className="w-5 h-5" /> },
  { label: "Django",     color: "#44b78b", bg: "#0d2b1e", dur: "14s", r: "160px", start: "216deg", svg: <DjangoIcon     className="w-5 h-5" /> },
  { label: "Tailwind",   color: "#38bdf8", bg: "#0c1e2e", dur: "12s", r: "160px", start: "288deg", svg: <TailwindIcon   className="w-5 h-5" /> },
];

export const contactLinks = [
  {
    label: "Email", value: "m.ahmad@email.com", href: "mailto:m.ahmad@email.com",
    gradient: "from-violet-600 to-purple-700",
    icon: <EmailIcon />,
  },
  {
    label: "LinkedIn", value: "linkedin.com/in/m-ahmad", href: "https://linkedin.com/in/",
    gradient: "from-blue-600 to-indigo-700",
    icon: <LinkedInIcon />,
  },
  {
    label: "Phone", value: "+92 304 5179551", href: "tel:+923045179551",
    gradient: "from-emerald-600 to-teal-700",
    icon: <PhoneIcon />,
  },
  {
    label: "GitHub", value: "github.com/m-ahmad", href: "https://github.com/",
    gradient: "from-gray-600 to-gray-700",
    icon: <GitHubIcon />,
  },
];
