import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";
import { parsePaginated, type PaginatedResponse } from "../types";
import type { Project } from "@/src/store/useProjectStore";

type ProjectPayload = Omit<Project, "id">;

const base64ToFile = (base64: string, filename = "image.jpg"): File => {
  const [meta, data] = base64.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  return new File([bytes], filename, { type: mime });
};

const toApi = (p: ProjectPayload): FormData => {
  const fd = new FormData();
  fd.append("title", p.title);
  fd.append("category", p.category);
  fd.append("tech_stack", p.tech.join(", "));
  fd.append("status", p.status);
  fd.append("year", p.year);
  fd.append("github_url", p.github);
  fd.append("live_url", p.live);
  fd.append("description", p.desc);
  if (p.image && p.image.startsWith("data:")) {
    fd.append("image", base64ToFile(p.image));
  } else if (p.image) {
    fd.append("image", p.image);
  }
  return fd;
};

const fromApi = (d: any): Project => ({
  id: d.id,
  title: d.title,
  category: d.category,
  tech: typeof d.tech_stack === "string"
    ? d.tech_stack.split(",").map((t: string) => t.trim()).filter(Boolean)
    : d.tech_stack ?? d.tech ?? [],
  status: d.status,
  year: String(d.year),
  github: d.github_url ?? d.github ?? "",
  live: d.live_url ?? d.live ?? "",
  desc: d.description ?? d.desc ?? "",
  image: d.image ?? undefined,
});

export const fetchProjects = async (page = 1, search = "", status = "", category = ""): Promise<PaginatedResponse<Project>> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (category) params.set("category", category);
  const res = await api.get(`${API_ENDPOINTS.PROJECTS.GET_ALL}?${params}`);
  return parsePaginated(res.data, fromApi);
};

export const createProject = async (payload: ProjectPayload): Promise<Project> => {
  const res = await api.post(API_ENDPOINTS.PROJECTS.SEND, toApi(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return fromApi(res.data);
};

export const updateProject = async (id: number, payload: ProjectPayload): Promise<Project> => {
  const res = await api.put(API_ENDPOINTS.PROJECTS.UPDATE(id), toApi(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return fromApi(res.data);
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
};
