export type VisitorRecord = {
  name: string;
  company: string;
  phone: string;
  purpose: string;
  createdAt: string;
};

export function toVisitorCsv(visitors: VisitorRecord[]) {
  const rows = [["이름", "소속", "연락처", "방문 목적", "등록 시간"], ...visitors.map(v => [v.name, v.company, v.phone, v.purpose, v.createdAt])];
  return "\ufeff" + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}
