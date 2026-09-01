import { describe, expect, it } from "vitest";

describe("browser Supabase configuration", () => {
  it("can reach the configured REST endpoint", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required");
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    expect([200, 401, 404]).toContain(response.status);
  }, 15000);
});
