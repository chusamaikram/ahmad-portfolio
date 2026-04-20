import { Suspense } from "react";
import AdminContactQueriesView from "@/src/components/features/admin/contact-queries";

export const dynamic = "force-dynamic";

export default function AdminContactQueriesPage() {
  return (
    <Suspense>
      <AdminContactQueriesView />
    </Suspense>
  );
}
