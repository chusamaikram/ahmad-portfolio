import { useEffect, useState } from "react";
import { fetchPublishedTestimonials, type TestimonialResponse } from "../services/testimonials";

export default function usePublicTestimonials() {
  const [publictestimonials, setPublicTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublishedTestimonials()
      .then(setPublicTestimonials)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { publictestimonials, loading, error };
}
