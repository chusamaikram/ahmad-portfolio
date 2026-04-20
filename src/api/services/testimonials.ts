import api, { publicApi } from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface TestimonialPayload {
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  status: "Published" | "Hidden";
}

export interface TestimonialResponse extends TestimonialPayload {
  id: number;
}

// Maps our internal shape → backend field names
const toApi = (p: TestimonialPayload) => ({
  name: p.name,
  role: p.role,
  company: p.company,
  rating: p.rating,
  review_text: p.text,
  status: p.status,
});

// Maps backend response → our internal shape
const fromApi = (d: any): TestimonialResponse => ({
  id: d.id,
  name: d.name,
  role: d.role,
  company: d.company,
  rating: d.rating,
  text: d.review_text ?? d.text,
  status: d.status,
});

export const fetchTestimonials = async (): Promise<TestimonialResponse[]> => {
  const res = await api.get(API_ENDPOINTS.TESTIMONIALS.GET_ALL);
  const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
  return list.map(fromApi);
};

export const fetchPublishedTestimonials = async (): Promise<TestimonialResponse[]> => {
  const res = await api.get(API_ENDPOINTS.TESTIMONIALS.GET_ALL);
  const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
  return list.map(fromApi).filter((t: TestimonialResponse) => t.status === "Published");
};

export const createTestimonial = async (payload: TestimonialPayload): Promise<TestimonialResponse> => {
  const res = await api.post(API_ENDPOINTS.TESTIMONIALS.SEND, toApi(payload));
  return fromApi(res.data);
};

export const updateTestimonial = async (id: number, payload: TestimonialPayload): Promise<TestimonialResponse> => {
  const res = await api.put(API_ENDPOINTS.TESTIMONIALS.UPDATE(id), toApi(payload));
  return fromApi(res.data);
};

export const deleteTestimonial = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.TESTIMONIALS.DELETE(id));
};

export const toggleTestimonialStatus = async (
  id: number,
  current: "Published" | "Hidden"
): Promise<TestimonialResponse> => {
  const res = await api.patch(API_ENDPOINTS.TESTIMONIALS.UPDATE(id), {
    status: current === "Published" ? "Hidden" : "Published",
  });
  return fromApi(res.data);
};
