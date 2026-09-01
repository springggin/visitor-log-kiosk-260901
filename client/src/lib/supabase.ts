import type { VisitorRecord } from "./visitor";

const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const headers = () => ({ apikey: anonKey ?? "", Authorization: `Bearer ${anonKey ?? ""}`, "Content-Type": "application/json" });

export async function saveVisitorToSupabase(visitor: VisitorRecord & { id: string; photo?: string; createdDay?: string }) {
  if (!baseUrl || !anonKey) return false;
  try {
    let photoPath: string | null = null;
    if (visitor.photo) {
      const response = await fetch(visitor.photo);
      const imageBlob = await response.blob();
      photoPath = `${visitor.id}.jpg`;
      const upload = await fetch(`${baseUrl.replace(/\/$/, "")}/storage/v1/object/visitors/${photoPath}`, {
        method: "POST",
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "image/jpeg", "x-upsert": "true" },
        body: imageBlob,
      });
      if (!upload.ok) throw new Error("photo upload failed");
    }
    const result = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/v1/visitors`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify({ id: visitor.id, name: visitor.name, company: visitor.company, phone: visitor.phone, purpose: visitor.purpose, photo_path: photoPath, created_day: visitor.createdDay, created_at: new Date().toISOString() }),
    });
    if (!result.ok) throw new Error("visitor insert failed");
    return true;
  } catch {
    return false;
  }
}
