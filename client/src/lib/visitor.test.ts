import { describe, expect, it } from "vitest";
import { toVisitorCsv } from "./visitor";

describe("toVisitorCsv", () => {
  it("creates a UTF-8 BOM CSV with headers", () => {
    const csv = toVisitorCsv([{ name: "김서윤", company: "NOVA Studio", phone: "010-1234", purpose: "전시 관람", createdAt: "10:24" }]);
    expect(csv.startsWith("\ufeff이름,소속".replace("이름,소속", '"이름","소속"'))).toBe(true);
    expect(csv).toContain('"김서윤","NOVA Studio","010-1234","전시 관람","10:24"');
  });

  it("escapes quotes and commas safely", () => {
    const csv = toVisitorCsv([{ name: 'A "B"', company: "Studio, Inc.", phone: "", purpose: "기타", createdAt: "09:00" }]);
    expect(csv).toContain('"A ""B""","Studio, Inc.","","기타","09:00"');
  });
});
