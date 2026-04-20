"use client";

import React, { useState } from "react";
import Reveal from "./Reveal";
import { contactLinks } from "./_data";
import FormField from "@/src/components/shared/FormField";
import { useForm, Controller } from "react-hook-form";
import useContact from "@/src/api/hooks/useContact";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const rules = {
  name: {
    required: "Name is required",
    minLength: { value: 2, message: "Name must be at least 2 characters" },
    maxLength: { value: 50, message: "Name must be under 50 characters" },
  },
  email: {
    required: "Email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
  },
  subject: {
    required: "Subject is required",
    minLength: { value: 1, message: "Subject is required" },
    maxLength: { value: 150, message: "Subject must be under 150 characters" },
  },
  message: {
    required: "Message is required",
    minLength: { value: 10, message: "Message must be at least 10 characters" },
    maxLength: { value: 1000, message: "Message must be under 1000 characters" },
  },
};

export default function ContactSection() {
  const { control, handleSubmit, reset, formState: { errors, isValid, isDirty } } = useForm<FormValues>({
    defaultValues: { name: "", email: "", subject: "", message: "" },
    mode: "onChange",
  });
  const [sent, setSent] = useState(false);
  const { submitContact, loading } = useContact();

  async function onSubmit(data: FormValues) {
    const success = await submitContact(data);
    if (success) {
      setSent(true);
      reset();
    }
  }

  return (
    <section id="contact" className="py-24 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <Reveal><h2 className="text-4xl font-bold text-center mb-3">Get In <span className="text-violet-500">Touch</span></h2></Reveal>
        <Reveal delay={100}><p className="text-center text-gray-500 dark:text-gray-400 mb-4">Have a project in mind? Let's talk!</p></Reveal>
        <Reveal delay={150}>
          <div className="flex justify-center mb-14">
            <span className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Available for freelance & full-time work
            </span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <Reveal delay={150}>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-3">Let's build something <span className="text-violet-400">amazing</span> together</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                  I'm open to freelance projects, full-time roles, and exciting collaborations.
                  Drop me a message and I'll get back to you within 24 hours.
                </p>
              </div>
              {contactLinks.map(({ label, value, href, icon, gradient }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 bg-gray-200/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-2xl p-4 hover:border-violet-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-900/20 transition-all group">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-gray-900 dark:text-white text-sm font-semibold group-hover:text-violet-300 transition-colors">{value}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-violet-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={250}>
            <div className="bg-gray-200/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 rounded-t-3xl" />
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Message Sent!</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Thanks for reaching out. I'll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="mt-2 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">Send another message →</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Controller control={control} name="name" rules={rules.name}
                      render={({ field }) => <FormField label="Name" placeholder="Muhammad Ahmad" required value={field.value} onChange={field.onChange} error={errors.name?.message} />} />
                    <Controller control={control} name="email" rules={rules.email}
                      render={({ field }) => <FormField label="Email" type="email" placeholder="you@email.com" required value={field.value} onChange={field.onChange} error={errors.email?.message} />} />
                  </div>
                  <Controller control={control} name="subject" rules={rules.subject}
                    render={({ field }) => <FormField label="Subject" placeholder="Project inquiry, collaboration..." required value={field.value} onChange={field.onChange} error={errors.subject?.message} />} />
                  <Controller control={control} name="message" rules={rules.message}
                    render={({ field }) => <FormField as="textarea" label="Message" placeholder="Tell me about your project..." required rows={5} value={field.value} onChange={field.onChange} error={errors.message?.message} />} />
                  <button type="submit" disabled={!isValid || !isDirty || loading}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-indigo-600 disabled:hover:translate-y-0 disabled:hover:shadow-none text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-violet-700/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
