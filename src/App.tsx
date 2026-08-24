import { useEffect, useState } from "react";

const TARGET = "Main.html";

export default function App() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || "#home";
    const t = window.setTimeout(() => {
      setLeaving(true);
      window.location.replace(`${TARGET}${hash}`);
    }, 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1100px 520px at 50% -10%, #16304f 0%, #0a1626 58%, #081120 100%)",
        transition: "opacity .35s ease",
        opacity: leaving ? 0 : 1,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <svg viewBox="0 0 64 64" width="84" height="84" aria-hidden="true" style={{ animation: "fppPulse 1.6s ease-in-out infinite" }}>
          <circle cx="32" cy="32" r="29" fill="none" stroke="#f5b942" strokeWidth="3.5" />
          <path
            d="M32 13c-8 0-14 6-14 13 0 5 3 9 7 11v6l4-2 3 3 3-3 4 2v-6c4-2 7-6 7-11 0-7-6-13-14-13z"
            fill="#f5b942"
          />
        </svg>
        <div
          style={{
            fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif",
            fontSize: "clamp(30px, 6vw, 44px)",
            letterSpacing: "0.06em",
            color: "#f5b942",
            marginTop: 14,
          }}
        >
          FPP <span style={{ color: "#e8eef7" }}>v2</span>
        </div>
        <p style={{ color: "#8fa3bf", fontSize: 13, margin: "10px 0 26px" }}>
          원피스 파이팅패스 커뮤니티를 불러오는 중…
        </p>
        <div style={{ width: 190, height: 4, borderRadius: 99, background: "#16283f", margin: "0 auto", overflow: "hidden" }}>
          <div
            style={{
              width: "42%",
              height: "100%",
              borderRadius: 99,
              background: "linear-gradient(90deg,#f5b942,#ffd98a)",
              animation: "fppBar 1.1s ease-in-out infinite",
            }}
          />
        </div>
        <a
          href={`${TARGET}${window.location.hash || "#home"}`}
          style={{
            display: "inline-block",
            marginTop: 26,
            color: "#f5b942",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            border: "1px solid rgba(245,185,66,.45)",
            borderRadius: 999,
            padding: "9px 22px",
            background: "rgba(245,185,66,.08)",
          }}
        >
          지금 이동하기 →
        </a>
      </div>
      <style>{`
        @keyframes fppPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes fppBar { 0% { transform: translateX(-110%); } 100% { transform: translateX(320%); } }
      `}</style>
    </div>
  );
}
