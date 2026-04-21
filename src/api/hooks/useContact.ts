import { useState } from "react";
import { toast } from "react-toastify";
import { sendContactMessage, type ContactPayload } from "../services/contact";

export default function useContact() {
  const [loading, setLoading] = useState(false);

  const submitContact = async (payload: ContactPayload): Promise<boolean> => {
    setLoading(true);
    try {
      await sendContactMessage(payload);
      toast.success("Message sent! I'll get back to you within 24 hours.");
      return true;
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message ?? "Failed to send message. Please try again.";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitContact, loading };
}
