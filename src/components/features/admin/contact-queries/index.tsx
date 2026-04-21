"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useContactQueryStore, type ContactQuery as Query } from "@/src/store/useContactQueryStore";
import useContactQueries from "@/src/api/hooks/useContactQueries";
import PaginationBar from "@/src/components/shared/PaginationBar";
import TableSkeleton from "@/src/components/shared/TableSkeleton";
import { useUserStore } from "@/src/store/useUserStore";

export default function AdminContactQueriesView() {
  const { queries, toggleRead } = useContactQueryStore();
  const { loading, error, pagination, page, search, filterRead, setSearch, setFilterRead, handlePageChange, handleMarkRead, handleMarkAllRead, handleDelete } = useContactQueries();

  // server already filters; queries is the current page result
  const filtered = queries;
  const [selected, setSelected] = useState<Query | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Query | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const openedFromUrl = useRef(false);

  const user = useUserStore(state => state.user)

  // Auto-open query from notification click — only once
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || !queries.length || openedFromUrl.current) return;
    const query = queries.find((q) => q.id === Number(id));
    if (query) {
      openedFromUrl.current = true;
      openView(query);
    }
  }, [searchParams, queries]);

  const closeModal = () => {
    setSelected(null);
    // Clear the ?id= param from URL without navigation
    if (searchParams.get("id")) router.replace("/admin/contact-queries");
  };

  const unreadCount = queries.filter(q => q.status === "unread").length;

  const openView = (q: Query) => { setSelected(q); handleMarkRead(q.id); };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-red-400 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
        Try again
      </button>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 flex-1 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queries..."
            className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500 w-56" />
          <select aria-label="filter selector" value={filterRead} onChange={e => setFilterRead(e.target.value)}
            className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-violet-500">
            {["All", "Unread", "Read"].map(s => <option key={s}>{s}</option>)}
          </select>
          {unreadCount > 0 && (
            <span className="text-xs bg-violet-900/40 text-violet-400 border border-violet-800 px-3 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 w-4"></th>
                <th className="text-left px-5 py-3">Sender</th>
                <th className="text-left px-5 py-3">Subject</th>
                <th className="text-left px-5 py-3">Message</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading && <TableSkeleton cols={7} />}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-600">No queries found</td></tr>
              )}
              {!loading && filtered.map(q => (
                <tr key={q.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${q.status === "unread" ? "bg-violet-50 dark:bg-violet-950/10" : ""}`}>
                  <td className="pl-5 py-4">
                    {q.status === "unread" && <span className="w-2 h-2 rounded-full bg-violet-500 block" />}
                  </td>
                  <td className="px-5 py-4">
                    <p className={`font-medium ${q.status === "unread" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>{q.name}</p>
                    <a href={`mailto:${q.email}`} className="text-xs text-violet-500 dark:text-violet-400 hover:underline">{q.email}</a>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs max-w-[120px] truncate">{q.subject}</td>
                  <td className="px-5 py-4 max-w-sm">
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{q.message}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{formatDate(q.created_at)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => q.status === "unread" ? handleMarkRead(q.id) : toggleRead(q.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${q.status === "read" ? "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700" : "bg-violet-900/40 text-violet-400 border-violet-800 hover:bg-violet-900/70"}`}>
                      {q.status === "read" ? "Read" : "Unread"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openView(q)} title="View" className="p-1.5 text-gray-400 hover:text-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <a href={`mailto:${q.email}`} title="Reply" className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                      </a>
                      {user?.role === "super_admin" &&
                        <button onClick={() => setDeleteTarget(q)} title="Delete" className={`p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar pagination={pagination} totalFiltered={filtered.length} onPageChange={handlePageChange} label="queries" />
      </div>

      {/* View modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-violet-500 dark:text-violet-400 text-sm hover:underline">{selected.email}</a>
                </div>
                <button aria-label="selector button" onClick={closeModal} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Subject</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">{selected.subject}</p>
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4 mb-5">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{selected.message}</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mb-5">Received: {formatDate(selected.created_at)}</p>
              <div className="flex gap-3">
                <a href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  Reply
                </a>
                <button onClick={() => { setDeleteTarget(selected); closeModal(); }}
                  className="flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900 px-4 py-2.5 rounded-lg text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete
                </button>
                <button onClick={closeModal} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Query?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Delete message from <span className="text-gray-900 dark:text-white font-medium">{deleteTarget.name}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
