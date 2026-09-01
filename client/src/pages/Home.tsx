import { useEffect, useMemo, useRef, useState } from "react";
import { toVisitorCsv } from "@/lib/visitor";
import { saveVisitorToSupabase } from "@/lib/supabase";
import { Link } from "wouter";
import {
  BarChart3,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type Visitor = {
  id: string;
  name: string;
  company: string;
  phone: string;
  purpose: string;
  photo?: string;
  createdAt: string;
  createdDay?: string;
};

const STORAGE_KEY = "visitor-log-kiosk-visitors";
const initialVisitors: Visitor[] = [
  { id: "1", name: "김서윤", company: "NOVA Studio", phone: "010-1234-5678", purpose: "전시 관람", createdAt: "10:24" },
  { id: "2", name: "이준호", company: "하이브리드랩", phone: "010-2222-3333", purpose: "비즈니스 미팅", createdAt: "10:18" },
  { id: "3", name: "박민지", company: "Creative Plus", phone: "010-3333-4444", purpose: "전시 관람", createdAt: "10:12" },
  { id: "4", name: "최우진", company: "Alpha Design", phone: "010-4444-5555", purpose: "파트너 미팅", createdAt: "10:05" },
  { id: "5", name: "정하린", company: "어반테크", phone: "010-5555-6666", purpose: "전시 관람", createdAt: "09:58" },
  { id: "6", name: "강태현", company: "NextWave", phone: "010-6666-7777", purpose: "비즈니스 상담", createdAt: "09:51" },
  { id: "7", name: "오세연", company: "Light & Co.", phone: "010-7777-8888", purpose: "전시 관람", createdAt: "09:45" },
];

function loadVisitors(): Visitor[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialVisitors;
  } catch {
    return initialVisitors;
  }
}

function Logo() {
  return <div className="brand">VISITOR <span>LOG</span></div>;
}

function KioskHeader({ count, onAdmin }: { count: number; onAdmin: () => void }) {
  return (
    <header className="topbar">
      <Logo />
      <div className="topbar-actions">
        <div className="count-chip"><BarChart3 size={16} /> 오늘의 등록 <strong>{count}</strong>명</div>
        <button className="icon-button" aria-label="관리자 대시보드" onClick={onAdmin}><Menu size={22} /></button>
      </div>
    </header>
  );
}

function CameraCapture({ photo, confirmed, onPhotoChange, onConfirm }: { photo?: string; confirmed: boolean; onPhotoChange: (photo?: string) => void; onConfirm: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  };

  useEffect(() => {
    void startCamera();
    return () => streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onPhotoChange(canvas.toDataURL("image/jpeg", 0.82));
  };

  return (
    <div className="camera-column">
      <div className="camera-frame">
        {photo ? <img src={photo} alt="촬영한 방문객 사진" className="captured-photo" /> : <video ref={videoRef} autoPlay playsInline muted />}
        <div className="viewfinder" />
        {!photo && <div className="camera-helper" aria-live="polite">{cameraError ? "카메라 권한을 허용해 주세요" : "얼굴이 잘 보이도록 맞춰 주세요"}</div>}
        {cameraError && !photo && <button className="camera-retry" onClick={startCamera}>카메라 다시 연결</button>}
      </div>
      <div className="camera-actions">
        {photo ? (
          <>
            {confirmed ? <button className="round-camera secondary" onClick={() => onPhotoChange(undefined)} aria-label="사진 재촬영"><RotateCcw size={25} /></button> : <button className="round-camera" onClick={onConfirm} aria-label="사진 확정"><Check size={28} /></button>}
            <span>{confirmed ? "재촬영" : "사진 확정"}</span>
          </>
        ) : (
          <>
            <button className="round-camera" onClick={takePhoto} aria-label="사진 촬영"><Camera size={28} /></button>
            <span>사진 촬영</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [visitors, setVisitors] = useState<Visitor[]>(loadVisitors);
  const [form, setForm] = useState({ name: "", company: "", phone: "", purpose: "전시 관람" });
  const [photo, setPhoto] = useState<string>();
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors)), [visitors]);

  const update = (field: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const canSubmit = form.name.trim() && form.phone.trim() && photo && photoConfirmed;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const now = new Date();
    const visitor: Visitor = { id: crypto.randomUUID(), ...form, photo, createdAt: now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), createdDay: now.toISOString().slice(0, 10) };
    await saveVisitorToSupabase(visitor);
    setVisitors(prev => [visitor, ...prev]);
    setSubmitted(true);
    window.setTimeout(() => { setForm({ name: "", company: "", phone: "", purpose: "전시 관람" }); setPhoto(undefined); setPhotoConfirmed(false); setSubmitted(false); }, 2600);
  };

  return (
    <main className="kiosk-shell">
      <section className="kiosk-card">
        <KioskHeader count={visitors.length} onAdmin={() => { window.location.href = "/admin"; }} />
        {submitted ? (
          <div className="success-state"><div className="success-icon"><Check size={38} /></div><p className="eyebrow">REGISTRATION COMPLETE</p><h1>등록이 완료되었습니다.</h1><p>방문해 주셔서 감사합니다.<br />잠시 후 다음 방문객을 위해 초기화됩니다.</p><div className="success-loader" /></div>
        ) : (
          <form onSubmit={submit} className="kiosk-content">
            <div className="intro-column"><p className="eyebrow">WELCOME</p><h1>방문을<br /><em>환영합니다.</em></h1><p className="subcopy">정보를 입력하고 사진을 촬영해 주세요.</p>
              <div className="form-grid">
                <label>이름 <b>*</b><input value={form.name} onChange={e => update("name", e.target.value)} placeholder="이름을 입력하세요" autoComplete="name" /></label>
                <label>소속 / 회사<input value={form.company} onChange={e => update("company", e.target.value)} placeholder="소속 또는 회사를 입력하세요" /></label>
                <label>연락처 <b>*</b><input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="휴대폰 번호를 입력하세요" inputMode="tel" autoComplete="tel" /></label>
                <fieldset><legend>방문 목적</legend><div className="purpose-list">{["전시 관람", "비즈니스 미팅", "파트너 미팅", "기타"].map(purpose => <button type="button" key={purpose} className={form.purpose === purpose ? "purpose selected" : "purpose"} onClick={() => update("purpose", purpose)}>{purpose}{form.purpose === purpose && <Check size={18} />}</button>)}</div></fieldset>
              </div>
            </div>
            <CameraCapture photo={photo} confirmed={photoConfirmed} onPhotoChange={(value) => { setPhoto(value); setPhotoConfirmed(false); }} onConfirm={() => setPhotoConfirmed(true)} />
            <button className="submit-button" type="submit" disabled={!canSubmit}>등록하기 <ChevronRight size={24} /></button>
            <div className="stepper"><span className="active"><i>1</i> 정보 입력</span><b /> <span className={photo ? "active" : ""}><i>2</i> 사진 촬영</span><b /> <span><i>3</i> 등록 완료</span></div>
          </form>
        )}
      </section>
    </main>
  );
}

export function Admin() {
  const [visitors] = useState<Visitor[]>(loadVisitors);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "today">("all");
  const today = new Date().toISOString().slice(0, 10);
  const todayVisitors = visitors.filter(v => !v.createdDay || v.createdDay === today);
  const filtered = useMemo(() => visitors.filter(v => (mode === "today" ? (!v.createdDay || v.createdDay === today) : true) && `${v.name} ${v.company}`.toLowerCase().includes(query.toLowerCase())), [visitors, query, mode, today]);
  const photoRate = visitors.length ? Math.round(visitors.filter(v => v.photo).length / visitors.length * 100) : 0;
  const exportCsv = () => { const blob = new Blob([toVisitorCsv(filtered)], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "visitor-log.csv"; a.click(); URL.revokeObjectURL(url); };
  return <main className="admin-shell"><section className="admin-card"><header className="topbar"><Link href="/" className="brand-link"><Logo /></Link><button className="icon-button"><Menu size={22} /></button></header><div className="admin-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>방문객 관리</h1></div><div className="segmented"><button className={mode === "all" ? "active" : ""} onClick={() => setMode("all")}>전체</button><button className={mode === "today" ? "active" : ""} onClick={() => setMode("today")}>오늘</button></div></div><div className="stats"><div><span>총 등록</span><strong>{visitors.length}<small>명</small></strong></div><div><span>오늘</span><strong>{todayVisitors.length}<small>명</small></strong></div><div><span>사진 등록률</span><strong>{photoRate}<small>%</small></strong></div></div><div className="toolbar"><div className="search-box"><Search size={18} /><input placeholder="이름 또는 회사 검색" value={query} onChange={e => setQuery(e.target.value)} /></div><button className="export-button" onClick={exportCsv}><Download size={17} /> CSV 내보내기</button></div><div className="table-wrap"><table><thead><tr><th>이름</th><th>소속</th><th>방문 목적</th><th>등록 시간</th></tr></thead><tbody>{filtered.map(visitor => <tr key={visitor.id}><td><div className="visitor-name">{visitor.photo ? <img src={visitor.photo} alt="" /> : <div className="avatar-fallback"><Users size={15} /></div>}<strong>{visitor.name}</strong></div></td><td>{visitor.company || "-"}</td><td><span className="purpose-tag">{visitor.purpose}</span></td><td>{visitor.createdAt}</td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty">검색 결과가 없습니다.</div>}</div><footer className="admin-footer"><span>전체 {filtered.length}명</span><div className="pagination"><button><ChevronLeft size={16} /></button><button className="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button><ChevronRight size={16} /></button></div><Link href="/" className="back-kiosk"><ShieldCheck size={16} /> 키오스크로 돌아가기</Link></footer></section></main>;
}
