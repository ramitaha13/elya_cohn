import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * דף ראשי ליוצר/ת (Dashboard) — מוצג לאחר התחברות מוצלחת.
 * ---------------------------------------------------------------
 * הוסיפו route בקובץ ה-App שלכם:
 *    <Route path="/dashboard" element={<DashboardPage />} />
 *
 * הנתונים כאן (יצירות, הודעות) הם דמה (mock) לתצוגה בלבד.
 * כדי לחבר נתונים אמיתיים: יש להחליף את ה-state ההתחלתי בקריאת API,
 * ואת הפעולות (הוספה/מחיקה/שמירה) בקריאות PUT/POST/DELETE בהתאם.
 */

const BRAND = {
  name: "אילייה כהן",
  initials: "א.כ",
};

const INITIAL_WORKS = [
  { id: 1, title: "אור בין הצלעות", category: "שיר", year: "2024" },
  { id: 2, title: "הבית שלא נמכר", category: "סיפור", year: "2023" },
  { id: 3, title: "כמו שעון בלי מחוגים", category: "מילים לשיר", year: "2023" },
  { id: 4, title: "שלוש דקות של חורף", category: "שיר", year: "2022" },
  { id: 5, title: "האיש שספר את הצעדים", category: "סיפור", year: "2021" },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    name: "נועה לוי",
    email: "noa.levi@example.com",
    message: "שלום, אהבתי מאוד את 'אור בין הצלעות'. אפשר לקבוע שיחה?",
    date: "22.06.2026",
    read: false,
  },
  {
    id: 2,
    name: "דניאל ברק",
    email: "daniel.barak@example.com",
    message: "מחפש כותב למילים לאלבום הבא שלנו, נשמח לשמוע אם זה מעניין אותך.",
    date: "18.06.2026",
    read: false,
  },
  {
    id: 3,
    name: "מיכל אברהם",
    email: "michal.a@example.com",
    message: "האם הסיפור 'הבית שלא נמכר' פורסם גם בכתב עת?",
    date: "10.06.2026",
    read: true,
  },
];

const NAV_ITEMS = [
  { id: "overview", label: "סקירה" },
  { id: "works", label: "יצירות" },
  { id: "messages", label: "הודעות" },
  { id: "profile", label: "פרופיל" },
];

function Seal({ size = 56 }) {
  return (
    <div
      className="seal"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="47" className="seal-ring-outer" />
        <circle cx="50" cy="50" r="40" className="seal-ring-inner" />
        <text x="50" y="58" textAnchor="middle" className="seal-text">
          {BRAND.initials}
        </text>
      </svg>
    </div>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <p className="stat-value font-display">{value}</p>
      <p className="stat-label">{label}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}

function OverviewTab({ works, messages, onGoTo }) {
  const unread = messages.filter((m) => !m.read).length;
  return (
    <div>
      <div className="grid-stats">
        <StatCard label="יצירות פורסמו" value={works.length} />
        <StatCard
          label="הודעות שלא נקראו"
          value={unread}
          hint={unread > 0 ? "יש הודעות חדשות" : "הכול נקרא"}
        />
        <StatCard label="צפיות בדף (30 יום)" value="1,284" hint="דמו" />
      </div>

      <div className="panel mt-8">
        <div className="panel-head">
          <h3 className="font-display text-xl">הודעות אחרונות</h3>
          <button className="link-btn" onClick={() => onGoTo("messages")}>
            לכל ההודעות ←
          </button>
        </div>
        <ul className="msg-mini-list">
          {messages.slice(0, 3).map((m) => (
            <li key={m.id} className={`msg-mini ${m.read ? "" : "is-unread"}`}>
              <span className="msg-mini-name">{m.name}</span>
              <span className="msg-mini-text">{m.message}</span>
              <span className="msg-mini-date">{m.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorksTab({ works, setWorks }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", category: "שיר", year: "" });

  const removeWork = (id) => {
    // TODO: לחבר קריאת DELETE לשרת
    setWorks((prev) => prev.filter((w) => w.id !== id));
  };

  const addWork = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    // TODO: לחבר קריאת POST לשרת ולקבל id אמיתי בתגובה
    setWorks((prev) => [
      {
        id: Date.now(),
        title: draft.title,
        category: draft.category,
        year: draft.year || "—",
      },
      ...prev,
    ]);
    setDraft({ title: "", category: "שיר", year: "" });
    setAdding(false);
  };

  return (
    <div>
      <div className="panel-head">
        <h3 className="font-display text-xl">היצירות שלי</h3>
        <button
          className="btn-fill px-4 py-2 text-xs"
          onClick={() => setAdding((v) => !v)}
        >
          {adding ? "ביטול" : "+ יצירה חדשה"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addWork} className="add-work-form">
          <input
            className="form-input"
            placeholder="כותרת"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <select
            className="form-input"
            value={draft.category}
            onChange={(e) =>
              setDraft((d) => ({ ...d, category: e.target.value }))
            }
          >
            <option>שיר</option>
            <option>סיפור</option>
            <option>מילים לשיר</option>
            <option>מחזה</option>
          </select>
          <input
            className="form-input"
            placeholder="שנה"
            value={draft.year}
            onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
          />
          <button type="submit" className="btn-fill px-5 py-2 text-xs">
            שמירה
          </button>
        </form>
      )}

      <div className="work-table">
        {works.map((w) => (
          <div key={w.id} className="work-row">
            <span className="work-title font-display">{w.title}</span>
            <span className="work-meta">
              {w.category} · {w.year}
            </span>
            <div className="work-actions">
              <button className="link-btn">עריכה</button>
              <button
                className="link-btn link-btn-danger"
                onClick={() => removeWork(w.id)}
              >
                מחיקה
              </button>
            </div>
          </div>
        ))}
        {works.length === 0 && (
          <p className="text-muted text-sm py-6 text-center">
            אין עדיין יצירות. הוסיפו את הראשונה.
          </p>
        )}
      </div>
    </div>
  );
}

function MessagesTab({ messages, setMessages }) {
  const markRead = (id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
    );
  };
  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <h3 className="font-display text-xl mb-6">הודעות מהאתר</h3>
      <div className="msg-list">
        {messages.map((m) => (
          <div key={m.id} className={`msg-card ${m.read ? "" : "is-unread"}`}>
            <div className="msg-card-head">
              <div>
                <p className="msg-card-name font-display">{m.name}</p>
                <a href={`mailto:${m.email}`} className="msg-card-email">
                  {m.email}
                </a>
              </div>
              <span className="msg-card-date">{m.date}</span>
            </div>
            <p className="msg-card-body">{m.message}</p>
            <div className="msg-card-actions">
              {!m.read && (
                <button className="link-btn" onClick={() => markRead(m.id)}>
                  סמן כנקרא
                </button>
              )}
              <a href={`mailto:${m.email}`} className="link-btn">
                השב במייל
              </a>
              <button
                className="link-btn link-btn-danger"
                onClick={() => deleteMessage(m.id)}
              >
                מחיקה
              </button>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-muted text-sm py-6 text-center">
            אין הודעות חדשות.
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileTab() {
  const [profile, setProfile] = useState({
    name: BRAND.name,
    tagline: "מילים שנעות בין שיר לסיפור לציור",
    bio: "אילייה כהן הוא יוצר רב־תחומי המתמחה ביצירה מקורית...",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSaved(false);
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: לחבר קריאת PUT לשרת לשמירת הפרופיל
    setSaved(true);
  };

  return (
    <div>
      <h3 className="font-display text-xl mb-6">פרטי פרופיל</h3>
      <form onSubmit={handleSave} className="profile-form">
        <div className="form-row">
          <label className="form-label">שם תצוגה</label>
          <input
            name="name"
            className="form-input"
            value={profile.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label className="form-label">תקציר / Tagline</label>
          <input
            name="tagline"
            className="form-input"
            value={profile.tagline}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label className="form-label">ביוגרפיה</label>
          <textarea
            name="bio"
            rows={5}
            className="form-input form-textarea"
            value={profile.bio}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn-fill px-6 py-3 text-sm">
          שמירת שינויים
        </button>
        {saved && <span className="saved-pill">נשמר ✓</span>}
      </form>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [works, setWorks] = useState(INITIAL_WORKS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const handleLogout = () => {
    // TODO: לנקות טוקן/סשן אמיתי כאן (localStorage / cookie / context)
    navigate("/");
  };

  return (
    <div dir="rtl" lang="he" className="dash-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Heebo:wght@300;400;500;600;700&display=swap');

        :root{
          --ink:#16231F;
          --ink-2:#1F2F29;
          --ink-3:#26392F;
          --parchment:#F4EDDD;
          --parchment-2:#ECE2CB;
          --gold:#C9A646;
          --gold-soft:#E2C879;
          --wine:#7A2E3A;
          --muted:#9C9484;
          --muted-2:#5C6760;
        }

        .dash-root{
          background:var(--parchment);
          color:var(--ink);
          font-family:'Heebo', sans-serif;
          min-height:100vh;
        }
        .font-display{ font-family:'Frank Ruhl Libre', serif; }
        .text-muted{ color:var(--muted); }

        /* Topbar */
        .dash-topbar{
          background:var(--ink);
          color:var(--parchment);
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:16px 28px;
          border-bottom:1px solid rgba(201,166,70,0.25);
        }
        .dash-brand{ display:flex; align-items:center; gap:14px; }
        .dash-brand-name{ font-size:15px; }
        .dash-brand-sub{ font-size:11px; color:var(--muted); }
        .seal-ring-outer{ fill:none; stroke:var(--gold); stroke-width:1.4; }
        .seal-ring-inner{ fill:none; stroke:var(--gold); stroke-width:0.7; opacity:0.7; }
        .seal-text{ font-family:'Frank Ruhl Libre', serif; font-size:20px; fill:var(--gold-soft); }

        .logout-btn{
          border:1px solid rgba(201,166,70,0.4);
          color:var(--gold-soft);
          background:transparent;
          padding:8px 16px;
          font-size:12px;
          cursor:pointer;
          transition:background-color .25s ease, color .25s ease;
        }
        .logout-btn:hover{ background:var(--gold); color:var(--ink); }

        .view-site-link{
          color:var(--muted);
          font-size:12px;
          margin-left:14px;
        }
        .view-site-link:hover{ color:var(--gold-soft); }

        /* Tabs nav */
        .dash-tabs{
          display:flex;
          gap:6px;
          max-width:1100px;
          margin:0 auto;
          padding:22px 28px 0;
        }
        .dash-tab{
          padding:10px 18px;
          font-size:13px;
          color:var(--muted-2);
          background:transparent;
          border:none;
          border-bottom:2px solid transparent;
          cursor:pointer;
          transition:color .25s ease, border-color .25s ease;
        }
        .dash-tab:hover{ color:var(--ink); }
        .dash-tab.is-active{
          color:var(--wine);
          border-bottom-color:var(--wine);
          font-weight:600;
        }

        .dash-main{
          max-width:1100px;
          margin:0 auto;
          padding:28px;
        }

        /* Stat cards */
        .grid-stats{
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
          gap:18px;
        }
        .stat-card{
          background:var(--parchment-2);
          border:1px solid rgba(122,46,58,0.12);
          padding:22px 20px;
        }
        .stat-value{ font-size:32px; color:var(--ink); }
        .stat-label{ font-size:12px; color:var(--muted-2); margin-top:4px; }
        .stat-hint{ font-size:11px; color:var(--wine); margin-top:8px; }

        /* Panel */
        .panel{
          background:#fff;
          border:1px solid rgba(0,0,0,0.06);
          padding:22px 24px;
        }
        .panel-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-bottom:16px;
        }
        .link-btn{
          background:none;
          border:none;
          color:var(--wine);
          font-size:12px;
          cursor:pointer;
          padding:0;
        }
        .link-btn:hover{ text-decoration:underline; }
        .link-btn-danger{ color:#9C4A4A; }

        .msg-mini-list{ display:flex; flex-direction:column; gap:12px; }
        .msg-mini{
          display:flex;
          gap:12px;
          align-items:baseline;
          font-size:13px;
          padding-bottom:10px;
          border-bottom:1px solid rgba(0,0,0,0.05);
        }
        .msg-mini.is-unread .msg-mini-name{ color:var(--wine); font-weight:600; }
        .msg-mini-name{ flex-shrink:0; font-weight:500; }
        .msg-mini-text{ color:var(--muted-2); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .msg-mini-date{ flex-shrink:0; color:var(--muted); font-size:11px; }

        /* Works tab */
        .add-work-form{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          background:var(--parchment-2);
          padding:16px;
          margin-bottom:18px;
        }
        .add-work-form .form-input{ flex:1; min-width:140px; }
        .form-input{
          background:#fff;
          border:1px solid rgba(0,0,0,0.12);
          color:var(--ink);
          padding:10px 12px;
          font-family:'Heebo', sans-serif;
          font-size:13px;
        }
        .form-input:focus{ outline:none; border-color:var(--gold); }
        .form-textarea{ resize:vertical; }

        .work-table{ border-top:1px solid rgba(0,0,0,0.08); }
        .work-row{
          display:flex;
          align-items:center;
          gap:16px;
          padding:14px 4px;
          border-bottom:1px solid rgba(0,0,0,0.08);
        }
        .work-title{ font-size:16px; flex-shrink:0; }
        .work-meta{ color:var(--muted); font-size:12px; flex:1; }
        .work-actions{ display:flex; gap:14px; flex-shrink:0; }

        /* Messages tab */
        .msg-list{ display:flex; flex-direction:column; gap:14px; }
        .msg-card{
          background:#fff;
          border:1px solid rgba(0,0,0,0.08);
          border-right:3px solid transparent;
          padding:18px 20px;
        }
        .msg-card.is-unread{ border-right-color:var(--wine); }
        .msg-card-head{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
        .msg-card-name{ font-size:16px; }
        .msg-card-email{ font-size:12px; color:var(--muted); }
        .msg-card-date{ font-size:11px; color:var(--muted); }
        .msg-card-body{ font-size:14px; color:var(--muted-2); line-height:1.6; margin-bottom:12px; }
        .msg-card-actions{ display:flex; gap:16px; }

        /* Profile tab */
        .profile-form{ max-width:480px; }
        .form-row{ display:flex; flex-direction:column; margin-bottom:16px; }
        .form-label{ font-size:12px; color:var(--muted-2); margin-bottom:6px; }
        .saved-pill{
          margin-right:14px;
          font-size:12px;
          color:var(--wine);
        }

        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible{
          outline:2px solid var(--gold);
          outline-offset:2px;
        }
      `}</style>

      <div className="dash-topbar">
        <div className="dash-brand">
          <Seal size={40} />
          <div>
            <p className="dash-brand-name font-display">{BRAND.name}</p>
            <p className="dash-brand-sub">אזור יוצר</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button className="logout-btn" onClick={handleLogout}>
            התנתקות
          </button>
        </div>
      </div>

      <nav className="dash-tabs">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`dash-tab ${tab === item.id ? "is-active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="dash-main">
        {tab === "overview" && (
          <OverviewTab works={works} messages={messages} onGoTo={setTab} />
        )}
        {tab === "works" && <WorksTab works={works} setWorks={setWorks} />}
        {tab === "messages" && (
          <MessagesTab messages={messages} setMessages={setMessages} />
        )}
        {tab === "profile" && <ProfileTab />}
      </main>
    </div>
  );
}
