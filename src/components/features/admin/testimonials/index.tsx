"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import FormField from "@/src/components/shared/FormField";
import useTestimonials from "@/src/api/hooks/useTestimonials";
import type { Testimonial } from "@/src/store/useTestimonialStore";
import { useUserStore } from "@/src/store/useUserStore";

type TestimonialForm = Omit<Testimonial, "id">;

const rules = {
  name: { required: "Name is required", minLength: { value: 2, message: "At least 2 characters" } },
  company: { required: "Company is required" },
  role: { required: "Role is required" },
  text: { required: "Review text is required", minLength: { value: 10, message: "At least 10 characters" }, maxLength: { value: 500, message: "Max 500 characters" } },
  status: { required: "Status is required" },
};

function Stars({ count, onChange }: { count: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange?.(i + 1)}
          className={`${i < count ? "text-amber-400" : "text-gray-700"} ${onChange ? "hover:text-amber-300 cursor-pointer" : "cursor-default"} transition-colors`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        </button>
      ))}
    </div>
  );
}

function TestimonialFormModal({ defaultValues, onSave, onCancel, submitLabel }: {
  defaultValues: TestimonialForm;
  onSave: (data: TestimonialForm) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const { control, handleSubmit, setValue, watch, formState: { errors, isValid, isDirty } } = useForm<TestimonialForm>({
    defaultValues,
    mode: "onChange",
  });

  const rating = watch("rating");

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Controller control={control} name="name" rules={rules.name}
          render={({ field }) => <FormField label="Name" value={field.value} onChange={field.onChange} error={errors.name?.message} />} />
        <Controller control={control} name="company" rules={rules.company}
          render={({ field }) => <FormField label="Company" value={field.value} onChange={field.onChange} error={errors.company?.message} />} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Controller control={control} name="role" rules={rules.role}
          render={({ field }) => <FormField label="Role" value={field.value} onChange={field.onChange} error={errors.role?.message} />} />
        <Controller control={control} name="status" rules={rules.status}
          render={({ field }) => <FormField as="select" label="Status" value={field.value} onChange={field.onChange} error={errors.status?.message}
            options={[{ label: "Published", value: "Published" }, { label: "Hidden", value: "Hidden" }]} />} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Rating</label>
        <Stars count={rating} onChange={(n) => setValue("rating", n, { shouldDirty: true })} />
      </div>
      <Controller control={control} name="text" rules={rules.text}
        render={({ field }) => <FormField as="textarea" label="Review Text" rows={3} value={field.value} onChange={field.onChange} error={errors.text?.message} />} />
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={!isValid || !isDirty}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
      </div>
    </form>
  );
}

export default function AdminTestimonialsView() {
  const {
    testimonials, filtered, search, filterStatus, loading, error,
    setSearch, setFilterStatus,
    handleAdd, handleUpdate, handleDelete, handleToggleStatus,
  } = useTestimonials();
  const [modal, setModal] = useState<"add" | "edit" | "view" | "delete" | null>(null);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setSelected(null); setModal("add"); };
  const openEdit = (t: Testimonial) => { setSelected(t); setModal("edit"); };
  const openView = (t: Testimonial) => { setSelected(t); setModal("view"); };
  const openDelete = (t: Testimonial) => { setSelected(t); setModal("delete"); };

  const user = useUserStore(state => state.user)

  const handleSave = async (data: TestimonialForm) => {
    setSaving(true);
    try {
      if (modal === "add") await handleAdd(data);
      else if (modal === "edit" && selected) await handleUpdate(selected.id, data);
      setModal(null);
    } catch {
      // toast already shown in hook
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (selected) await handleDelete(selected.id);
    setModal(null);
  };

  const getDefaultValues = (t?: Testimonial | null): TestimonialForm => ({
    name: t?.name ?? "", role: t?.role ?? "", company: t?.company ?? "",
    rating: t?.rating ?? 5, text: t?.text ?? "", status: t?.status ?? "Published",
  });

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search testimonials..."
            className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500 w-56" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-violet-500">
            {["All", "Published", "Hidden"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Testimonial
        </button>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3">Review</th>
                <th className="text-left px-5 py-3">Rating</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-600">Loading...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 dark:text-gray-600">No testimonials found</td></tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} @ {t.company}</p>
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{t.text}</p>
                  </td>
                  <td className="px-5 py-4"><Stars count={t.rating} /></td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleStatus(t.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${t.status === "Published" ? "bg-emerald-900/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/70" : "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                      {t.status}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(t)} title="View" className="p-1.5 text-gray-400 hover:text-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => openEdit(t)} title="Edit" className="p-1.5 text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => openDelete(t)} title="Delete" className={` ${user?.role != "super_admin" ? "hidden" : "block"} p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600">
          Showing {filtered.length} of {testimonials.length} testimonials
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>

            {modal === "view" && selected && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                    <p className="text-violet-500 dark:text-violet-400 text-sm">{selected.role} @ {selected.company}</p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <Stars count={selected.rating} />
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-4 mb-6">"{selected.text}"</p>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(selected)} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Edit</button>
                  <button onClick={() => setModal(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm transition-colors">Close</button>
                </div>
              </div>
            )}

            {(modal === "add" || modal === "edit") && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{modal === "add" ? "Add Testimonial" : "Edit Testimonial"}</h2>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <TestimonialFormModal
                  defaultValues={getDefaultValues(selected)}
                  onSave={handleSave}
                  onCancel={() => setModal(null)}
                  submitLabel={saving ? "Saving..." : modal === "add" ? "Add Testimonial" : "Save Changes"}
                />
              </div>
            )}

            {modal === "delete" && selected && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Testimonial?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Remove testimonial from <span className="text-gray-900 dark:text-white font-medium">{selected.name}</span>? This cannot be undone.</p>
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
