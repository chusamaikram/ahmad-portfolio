"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import useServices from "@/src/api/hooks/useServices";
import FormField from "@/src/components/shared/FormField";
import type { Service, ServicePayload } from "@/src/api/services/services";
import { useUserStore } from "@/src/store/useUserStore";

const GRADIENT_OPTIONS = [
  { label: "Violet → Purple", value: "violet_purple", css: "linear-gradient(135deg, #7c3aed, #4f46e5)" },
  { label: "Blue → Indigo", value: "blue_indigo", css: "linear-gradient(135deg, #3b82f6, #6366f1)" },
  { label: "Pink → Rose", value: "pink_rose", css: "linear-gradient(135deg, #ec4899, #f43f5e)" },
  { label: "Emerald → Teal", value: "emerald_teal", css: "linear-gradient(135deg, #10b981, #14b8a6)" },
  { label: "Amber → Orange", value: "amber_orange", css: "linear-gradient(135deg, #f59e0b, #f97316)" },
  { label: "Cyan → Sky", value: "cyan_sky", css: "linear-gradient(135deg, #06b6d4, #0ea5e9)" },
];

function getGradientCss(value: string) {
  return GRADIENT_OPTIONS.find((o) => o.value === value)?.css ?? value;
}

type ServiceForm = Omit<ServicePayload, "features"> & { featuresInput: string };

const rules = {
  title: { required: "Title is required" },
  description: { required: "Description is required" },
  color_gradient: { required: "Gradient is required" },
  featuresInput: { required: "At least one feature is required" },
};

function ServiceFormModal({ defaultValues, onSave, onCancel, submitLabel }: {
  defaultValues: ServiceForm;
  onSave: (data: ServiceForm) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const { control, handleSubmit, watch, formState: { errors, isValid, isDirty } } = useForm<ServiceForm>({
    defaultValues,
    mode: "onChange",
  });

  const gradientValue = watch("color_gradient");

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
      <Controller control={control} name="title" rules={rules.title}
        render={({ field }) => <FormField label="Title" value={field.value} onChange={field.onChange} error={errors.title?.message} />} />
      <Controller control={control} name="description" rules={rules.description}
        render={({ field }) => <FormField as="textarea" rows={3} label="Description" value={field.value} onChange={field.onChange} error={errors.description?.message} />} />
      <Controller control={control} name="featuresInput" rules={rules.featuresInput}
        render={({ field }) => <FormField label="Features (Comma Separated)" placeholder="React & Next.js, Tailwind CSS" value={field.value} onChange={field.onChange} error={errors.featuresInput?.message} />} />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Color Gradient</label>
        <Controller control={control} name="color_gradient" rules={rules.color_gradient}
          render={({ field }) => (
            <select
            aria-label="gradient selector"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:border-violet-500 focus:ring-violet-500/30 transition-all"
            >
              {GRADIENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )} />
        <div className="h-1.5 rounded-full mt-1" style={{ background: getGradientCss(gradientValue) }} />
      </div>

      <Controller control={control} name="visible"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <button aria-label="visible toggle" type="button" onClick={() => field.onChange(!field.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${field.value ? "bg-violet-600" : "bg-gray-600"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">Visible on landing page</span>
          </div>
        )} />

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={!isValid || !isDirty}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminServicesView() {
  const { services, filtered, search, setSearch, loading, error, handleAdd, handleUpdate, handleDelete, handleToggleVisible } = useServices();
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const user = useUserStore((s) => s.user);

  const openAdd = () => { setSelected(null); setModal("add"); };
  const openEdit = (s: Service) => { setSelected(s); setModal("edit"); };
  const openDelete = (s: Service) => { setSelected(s); setModal("delete"); };

  const getDefaultValues = (s?: Service | null): ServiceForm => ({
    title: s?.title ?? "",
    description: s?.description ?? "",
    featuresInput: Array.isArray(s?.features) ? s.features.join(", ") : "",
    color_gradient: s?.color_gradient ?? "violet_purple",
    visible: s?.visible ?? true,
  });

  const handleSave = async (data: ServiceForm) => {
    setSaving(true);
    try {
      const { featuresInput, ...rest } = data;
      const features = featuresInput.trim();
      if (modal === "add") await handleAdd({ ...rest, features });
      else if (modal === "edit" && selected) await handleUpdate(selected.id, { ...rest, features });
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (selected) await handleDelete(selected.id);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500 w-56"
        />
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </button>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Service</th>
                <th className="text-left px-5 py-3">Features</th>
                <th className="text-left px-5 py-3">Gradient</th>
                <th className="text-left px-5 py-3">Visible</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-600">Loading...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-600">No services found</td></tr>
              )}
              {!loading && filtered.map((s) => {
                const features = Array.isArray(s.features) ? s.features : String(s.features ?? "").split(",").map(f => f.trim()).filter(Boolean);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex-shrink-0"
                          style={{ background: getGradientCss(s.color_gradient) }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{s.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{s.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {features.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs bg-violet-950/60 text-violet-300 px-2 py-0.5 rounded border border-violet-800/50">{f}</span>
                        ))}
                        {features.length > 2 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">+{features.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-16 h-5 rounded-full" style={{ background: getGradientCss(s.color_gradient) }} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                      aria-label="visible toggler"
                        onClick={() => handleToggleVisible(s.id, s.visible)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${s.visible ? "bg-violet-600" : "bg-gray-600"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.visible ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} title="Edit"
                          className="p-1.5 text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        { user?.role === "super_admin" &&
                          <button onClick={() => openDelete(s)} title="Delete"
                            className={` p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600">
          Showing {filtered.length} of {services.length} services
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            {(modal === "add" || modal === "edit") && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {modal === "add" ? "Add Service" : "Edit Service"}
                  </h2>
                  <button aria-label="model controler" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ServiceFormModal
                  defaultValues={getDefaultValues(selected)}
                  onSave={handleSave}
                  onCancel={() => setModal(null)}
                  submitLabel={saving ? "Saving..." : modal === "add" ? "Add Service" : "Save Changes"}
                />
              </div>
            )}

            {modal === "delete" && selected && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Service?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Are you sure you want to delete <span className="text-gray-900 dark:text-white font-medium">"{selected.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Delete</button>
                  <button onClick={() => setModal(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
