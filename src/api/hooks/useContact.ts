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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitContact, loading };
}
