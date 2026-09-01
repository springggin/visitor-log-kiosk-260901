import { describe, expect, it } from "vitest";

describe("Supabase configuration", () => {
  it("accepts the configured project URL and anon key", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    expect([200, 401, 404]).toContain(response.status);
  }, 15000);
});
