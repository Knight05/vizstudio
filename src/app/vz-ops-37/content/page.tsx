import { requireAdmin } from "@/lib/admin";
import { ContentEditor } from "./editor";

export const metadata = { title: "Admin · Content" };

export default async function AdminContentPage() {
  await requireAdmin();
  return <ContentEditor />;
}
