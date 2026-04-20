"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import FormField from "@/src/components/shared/FormField";
import useRoles from "@/src/api/hooks/useRoles";
import type { RoleUser, Role, Status } from "@/src/store/useRolesStore";

const ROLES: Role[] = ["support_staff", "content_creator"];

const ROLE_COLORS: Record<Role, string> = {
    support_staff: "bg-transparent border border-violet-500 text-violet-400",
    content_creator: "bg-transparent border border-purple-500 text-purple-400",
    super_admin: "bg-transparent border border-blue-500 text-blue-400",
};

const formatRole = (role: string) =>
    role.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function RolesManagementView() {
    const {
        users, filtered, search, roleFilter, statusFilter,
        loading, error,
        setSearch, setRoleFilter, setStatusFilter,
        handleAdd, handleUpdate, handleDelete, handleToggleStatus,
    } = useRoles();

    const [addModal, setAddModal] = useState(false);
    const [editTarget, setEditTarget] = useState<RoleUser | null>(null);
    const [viewTarget, setViewTarget] = useState<RoleUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RoleUser | null>(null);
    const [statusTarget, setStatusTarget] = useState<RoleUser | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const openAdd = () => setAddModal(true);

    const openEdit = (u: RoleUser) => setEditTarget(u);

    const handleSaveAdd = async (data: typeof form) => {
        setSubmitting(true);
        try { await handleAdd(data); setAddModal(false); } catch {} finally { setSubmitting(false); }
    };

    const handleSaveEdit = async (data: typeof form) => {
        if (!editTarget) return;
        setSubmitting(true);
        try { await handleUpdate(editTarget.id, data); setEditTarget(null); } catch {} finally { setSubmitting(false); }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        await handleDelete(deleteTarget.id);
        setDeleteTarget(null);
    };

    const confirmToggleStatus = async () => {
        if (!statusTarget) return;
        await handleToggleStatus(statusTarget.id);
        setStatusTarget(null);
    };

    const selectClass = "bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 appearance-none pr-8 cursor-pointer";

    if (loading) return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />
            ))}
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Try again</button>
        </div>
    );

    return (
        <div className="space-y-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500 w-64"
                />
                <div className="relative">
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={selectClass}>
                        <option>All Roles</option>
                        {ROLES.map(r => <option key={r} value={r}>{formatRole(r)}</option>)}
                    </select>
                    <svg className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="relative">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Revoked</option>
                    </select>
                    <svg className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <button onClick={openAdd} className="ml-auto flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add User
                </button>
            </div>

            {/* Table */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="text-left px-6 py-3">Name</th>
                                <th className="text-left px-6 py-3">Email</th>
                                <th className="text-left px-6 py-3">Role</th>
                                <th className="text-left px-6 py-3">Status</th>
                                <th className="text-left px-6 py-3">Added</th>
                                <th className="text-right px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-600">No users found</td></tr>
                            )}
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-3 py-1 whitespace-nowrap rounded-full capitalize ${ROLE_COLORS[u.role]}`}>{formatRole(u.role)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-3 py-1 rounded-full border ${u.status === "Active" ? "border-emerald-700 text-emerald-400" : "border-gray-600 text-gray-400"}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{u.added}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setViewTarget(u)} title="View" className="p-1.5 text-gray-500 hover:text-cyan-400 hover:bg-gray-800 rounded transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 text-gray-500 hover:text-violet-400 hover:bg-gray-800 rounded transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => setStatusTarget(u)} title="Toggle Status" className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-gray-800 rounded transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2} strokeLinecap="round" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
                                            </button>
                                            <button onClick={() => setDeleteTarget(u)} title="Delete" className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-800 text-xs text-gray-600">
                    Showing {filtered.length} of {users.length} users
                </div>
            </div>

            {/* Add Modal */}
            {addModal && (
                <Modal title="Add User" onClose={() => setAddModal(false)}>
                    <UserForm
                        defaultValues={{ name: "", email: "", role: ROLES[0], status: "Active" }}
                        onSave={handleSaveAdd}
                        onCancel={() => setAddModal(false)}
                        submitLabel={submitting ? "Saving..." : "Add User"}
                    />
                </Modal>
            )}

            {/* Edit Modal */}
            {editTarget && (
                <Modal title="Edit User" onClose={() => setEditTarget(null)}>
                    <UserForm
                        defaultValues={{ name: editTarget.name, email: editTarget.email, role: editTarget.role, status: editTarget.status }}
                        onSave={handleSaveEdit}
                        onCancel={() => setEditTarget(null)}
                        submitLabel={submitting ? "Saving..." : "Save Changes"}
                    />
                </Modal>
            )}

            {/* View Modal */}
            {viewTarget && (
                <Modal title="User Details" onClose={() => setViewTarget(null)}>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center"><span className="w-16 text-gray-500">Name</span><span className="text-white font-semibold">{viewTarget.name}</span></div>
                        <div className="flex items-center"><span className="w-16 text-gray-500">Email</span><span className="text-white font-semibold">{viewTarget.email}</span></div>
                        <div className="flex items-center">
                            <span className="w-16 text-gray-500">Role</span>
                            <span className={`text-xs px-3 py-1 rounded-full border capitalize ${ROLE_COLORS[viewTarget.role]}`}>{formatRole(viewTarget.role)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-16 text-gray-500">Status</span>
                            <span className={`text-xs px-3 py-1 rounded-full border ${viewTarget.status === "Active" ? "border-emerald-700 text-emerald-400" : "border-gray-600 text-gray-400"}`}>{viewTarget.status}</span>
                        </div>
                        <div className="flex items-center"><span className="w-16 text-gray-500">Added</span><span className="text-white font-semibold">{viewTarget.added}</span></div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => { setViewTarget(null); openEdit(viewTarget); }} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Edit</button>
                        <button onClick={() => setViewTarget(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Close</button>
                    </div>
                </Modal>
            )}

            {/* Toggle Status Confirm */}
            {statusTarget && (
                <ConfirmModal
                    icon={<svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>}
                    iconBg="bg-amber-900/30"
                    title={`${statusTarget.status === "Active" ? "Revoke" : "Activate"} Access?`}
                    message={<>Change <span className="text-white font-medium">{statusTarget.name}</span>&apos;s status to <span className="text-white font-medium">{statusTarget.status === "Active" ? "Revoked" : "Active"}</span>?</>}
                    onConfirm={confirmToggleStatus}
                    onCancel={() => setStatusTarget(null)}
                    confirmLabel={statusTarget.status === "Active" ? "Revoke" : "Activate"}
                    confirmClass={statusTarget.status === "Active" ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
                />
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <ConfirmModal
                    icon={<svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    iconBg="bg-red-900/30"
                    title="Delete User?"
                    message={<>Remove <span className="text-white font-medium">{deleteTarget.name}</span> from roles? This cannot be undone.</>}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                    confirmLabel="Delete"
                    confirmClass="bg-red-600 hover:bg-red-500 text-white"
                />
            )}
        </div>
    );
}

/* ── Sub-components ── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

type UserFormValues = { name: string; email: string; role: Role; status: Status };

function UserForm({ defaultValues, onSave, onCancel, submitLabel }: {
    defaultValues: UserFormValues;
    onSave: (data: UserFormValues) => void;
    onCancel: () => void;
    submitLabel: string;
}) {
    const { control, handleSubmit, formState: { errors, isValid, isDirty } } = useForm<UserFormValues>({
        defaultValues,
        mode: "onChange",
    });

    return (
        <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4">
            <Controller control={control} name="name"
                rules={{ required: "Name is required", minLength: { value: 2, message: "At least 2 characters" } }}
                render={({ field }) => (
                    <FormField label="Name" placeholder="Full name" value={field.value} onChange={field.onChange} error={errors.name?.message} />
                )} />
            <Controller control={control} name="email"
                rules={{
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                }}
                render={({ field }) => (
                    <FormField label="Email" placeholder="email@example.com" value={field.value} onChange={field.onChange} error={errors.email?.message} />
                )} />
            <Controller control={control} name="role"
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                    <FormField as="select" label="Role" value={field.value} onChange={field.onChange} error={errors.role?.message}
                        options={ROLES.map(r => ({ label: formatRole(r), value: r }))} />
                )} />
            <Controller control={control} name="status"
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                    <FormField as="select" label="Status" value={field.value} onChange={field.onChange} error={errors.status?.message}
                        options={[{ label: "Active", value: "Active" }, { label: "Revoked", value: "Revoked" }]} />
                )} />
            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={!isValid || !isDirty}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    {submitLabel}
                </button>
                <button type="button" onClick={onCancel} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
        </form>
    );
}

function ConfirmModal({ icon, iconBg, title, message, onConfirm, onCancel, confirmLabel, confirmClass }: {
    icon: React.ReactNode; iconBg: string; title: string; message: React.ReactNode;
    onConfirm: () => void; onCancel: () => void; confirmLabel: string; confirmClass: string;
}) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>{icon}</div>
                <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${confirmClass}`}>{confirmLabel}</button>
                    <button onClick={onCancel} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
}
