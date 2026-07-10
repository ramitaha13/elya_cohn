import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

const BRAND = {
  name: "אילייה כהן",
  initials: "א.כ",
};

const DEFAULT_DISCIPLINES = [
  { he: "שירה", sub: "Poetry" },
  { he: "סיפורת קצרה", sub: "Short fiction" },
  { he: "מילים לשירים", sub: "Lyrics" },
  { he: "כתיבת מחזות", sub: "Playwriting" },
  { he: "סדנאות כתיבה", sub: "Workshops" },
];

// רשימת ברירת מחדל של שמות עט, למקרה שהפרופיל עדיין לא הוגדר.
// השם הראשון ברשימה הוא שם העט הראשי (מוצג ללא כותרת קטע נפרדת),
// וכל שם נוסף מקבל בעמוד זה קטע משלו עם כותרת "יצירות וסדרות תחת שם העט...".
const DEFAULT_AUTHORS = [
  { he: "אילייה כהן" },
  { he: "ציצי מקניל", heading: "" },
];

// הופך URL-ים בתוך טקסט חופשי לקישורים לחיצים שנפתחים בטאב חדש
function linkifyText(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    let url = match[0];
    let trailing = "";
    const trailingMatch = url.match(/[).,;:!?]+$/);
    if (trailingMatch) {
      trailing = trailingMatch[0];
      url = url.slice(0, url.length - trailing.length);
    }

    const href = url.startsWith("www.") ? `https://${url}` : url;
    nodes.push(
      <a
        key={key++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="pw-content-link"
      >
        {url}
      </a>,
    );
    if (trailing) nodes.push(trailing);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function Seal({ size = 40 }) {
  return (
    <div
      className="pw-seal"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="47" className="pw-seal-ring-outer" />
        <circle cx="50" cy="50" r="40" className="pw-seal-ring-inner" />
        <text x="50" y="58" textAnchor="middle" className="pw-seal-text">
          {BRAND.initials}
        </text>
      </svg>
    </div>
  );
}

function WorkRow({ work, onOpen }) {
  return (
    <div className="pw-row">
      <button className="pw-row-head" onClick={() => onOpen(work.id)}>
        <span className="pw-row-title pw-font-display">{work.title}</span>
        <span className="pw-row-meta">
          {work.category} · {work.year}
        </span>
        {work.featured && <span className="pw-featured-pill">נבחרת</span>}
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          className="pw-arrow-icon"
          aria-hidden="true"
        >
          <path
            d="M18 12H6M6 12L11 7M6 12L11 17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}

export default function WorksPage() {
  const [works, setWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [profileName, setProfileName] = useState(BRAND.name);
  const [disciplines, setDisciplines] = useState(DEFAULT_DISCIPLINES);
  const [authors, setAuthors] = useState(DEFAULT_AUTHORS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "works"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const v = d.data();
          return {
            id: d.id,
            title: v.title || "",
            category: v.category || "",
            author: v.author || "",
            year: v.year || "—",
            excerpt: v.excerpt || "",
            content: v.content || "",
            featured: !!v.featured,
            imageUrl: v.imageUrl || "",
          };
        });
        setWorks(data);
        setLoadingWorks(false);
      },
      () => setLoadingWorks(false),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "profile", "main"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.name) setProfileName(data.name);
          if (data.disciplines && data.disciplines.length) {
            setDisciplines(data.disciplines);
          }
          if (data.authors && data.authors.length) {
            setAuthors(data.authors);
          }
        }
      } catch (err) {
        console.error("שגיאה בטעינת פרופיל:", err);
      }
    })();
  }, []);

  const filteredWorks =
    activeFilter === "all"
      ? works
      : works.filter((w) => w.category === activeFilter);

  // שם העט הראשי (הראשון ברשימת שמות העט בפרופיל). יצירות שאין להן author
  // (יצירות ישנות), או שה-author שלהן לא תואם אף שם עט נוסף, ייחשבו
  // כמשויכות לשם העט הראשי ויוצגו ברשימה העליונה ללא כותרת קטע.
  const primaryAuthorName = authors[0]?.he || profileName || BRAND.name;
  const secondaryAuthors = authors.slice(1).filter((a) => a.he);

  // מקבצים את היצירות המסוננות לפי שם העט שלהן
  const groupedByAuthor = {};
  filteredWorks.forEach((w) => {
    const match = secondaryAuthors.find((a) => a.he === w.author);
    const key = match ? match.he : primaryAuthorName;
    if (!groupedByAuthor[key]) groupedByAuthor[key] = [];
    groupedByAuthor[key].push(w);
  });

  const primaryWorks = groupedByAuthor[primaryAuthorName] || [];
  const secondaryGroups = secondaryAuthors
    .map((a) => ({
      name: a.he,
      // כותרת הקטע: אם הוגדרה כותרת מותאמת אישית בפרופיל - משתמשים בה
      // במלואה; אחרת נופלים לברירת מחדל שמבוססת על השם.
      heading:
        a.heading && a.heading.trim()
          ? a.heading
          : `יצירות וסדרות תחת שם העט ${a.he}`,
      works: groupedByAuthor[a.he] || [],
    }))
    .filter((g) => g.works.length > 0);

  const hasAnyWorks = primaryWorks.length > 0 || secondaryGroups.length > 0;

  const openWork = works.find((w) => w.id === openId) || null;
  const openWorkParagraphs = openWork
    ? (openWork.content || "").split(/\n\s*\n/).filter(Boolean)
    : [];

  return (
    <div dir="rtl" lang="he" className="pw-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Heebo:wght@300;400;500;600;700&display=swap');

        :root{
          --ink:#16231F; --ink-2:#1F2F29; --ink-3:#26392F;
          --parchment:#F4EDDD; --parchment-2:#ECE2CB;
          --gold:#C9A646; --gold-soft:#E2C879;
          --wine:#7A2E3A; --muted:#9C9484; --muted-2:#5C6760;
        }
        .pw-root{ background:var(--parchment); color:var(--ink); font-family:'Heebo', sans-serif; min-height:100vh; }
        .pw-font-display{ font-family:'Frank Ruhl Libre', serif; }
        .pw-text-muted{ color:var(--muted); }

        .pw-topbar{ background:var(--ink); color:var(--parchment); display:flex; align-items:center; justify-content:space-between; padding:16px 28px; border-bottom:1px solid rgba(201,166,70,0.25); }
        .pw-back-btn{ display:inline-block; border:1px solid rgba(201,166,70,0.4); color:var(--gold-soft); background:transparent; padding:10px 18px; font-size:12px; text-decoration:none; transition:background-color .25s, color .25s; }
        .pw-back-btn:hover{ background:var(--gold); color:var(--ink); }

        .pw-brand{ display:flex; align-items:center; gap:14px; }
        .pw-brand-text{ text-align:right; }
        .pw-brand-name{ font-size:15px; }
        .pw-brand-sub{ font-size:11px; color:var(--muted); }
        .pw-seal-ring-outer{ fill:none; stroke:var(--gold); stroke-width:1.4; }
        .pw-seal-ring-inner{ fill:none; stroke:var(--gold); stroke-width:0.7; opacity:0.7; }
        .pw-seal-text{ font-family:'Frank Ruhl Libre', serif; font-size:20px; fill:var(--gold-soft); }

        .pw-main{ max-width:1100px; margin:0 auto; padding:56px 28px 80px; }
        .pw-hero-title{ font-size:44px; margin:0 0 14px; }
        .pw-hero-sub{ font-size:14px; color:var(--muted-2); margin:0 0 34px; }

        .pw-filters{ display:flex; flex-wrap:wrap; gap:10px; margin-bottom:40px; }
        .pw-filter-pill{ padding:10px 20px; font-size:13px; background:transparent; border:1px solid rgba(0,0,0,0.15); color:var(--ink-2); cursor:pointer; transition:background-color .2s, color .2s, border-color .2s; white-space:nowrap; }
        .pw-filter-pill:hover{ border-color:var(--wine); }
        .pw-filter-pill.is-active{ background:var(--wine); border-color:var(--wine); color:#fff; }

        .pw-list{ border-top:1px solid rgba(0,0,0,0.1); }
        .pw-row{ border-bottom:1px solid rgba(0,0,0,0.1); }
        .pw-row-head{ display:flex; align-items:center; gap:18px; padding:20px 4px; cursor:pointer; background:none; border:none; width:100%; box-sizing:border-box; text-align:right; font-family:'Heebo', sans-serif; }
        .pw-row-head:hover .pw-row-title{ color:var(--wine); }
        .pw-row-title{ font-size:21px; flex-shrink:0; transition:color .2s; }
        .pw-row-meta{ font-size:13px; color:var(--muted); flex:1; }
        .pw-featured-pill{ font-size:10px; letter-spacing:.04em; color:var(--wine); border:1px solid rgba(122,46,58,0.3); padding:2px 8px; flex-shrink:0; }
        .pw-arrow-icon{ color:var(--gold); flex-shrink:0; transition:transform .2s ease; }
        .pw-row-head:hover .pw-arrow-icon{ transform:translateX(-4px); }

        .pw-empty-state{ text-align:center; padding:60px 0; color:var(--muted); font-size:14px; }

        /* ── כותרת קטע מחבר משני ── */
        .pw-section-divider{ display:flex; align-items:center; gap:16px; margin:56px 0 28px; }
        .pw-section-divider::before, .pw-section-divider::after{ content:""; flex:1; height:1px; background:rgba(0,0,0,0.12); }
        .pw-section-title{ font-size:24px; white-space:nowrap; color:var(--wine); }

        /* ── תצוגת יצירה בודדת (מחליפה את הרשימה, ללא ניווט) ── */
        .pw-single-back{ display:block; text-align:right; color:var(--wine); font-size:14px; text-decoration:none; background:none; border:none; cursor:pointer; padding:0; margin-bottom:40px; font-family:'Heebo', sans-serif; }
        .pw-single-back:hover{ text-decoration:underline; }

        .pw-single-meta-row{ display:flex; align-items:center; justify-content:flex-start; gap:12px; margin-bottom:18px; }
        .pw-single-year{ font-size:14px; color:var(--muted); }
        .pw-single-category-pill{ font-size:12px; color:var(--ink-2); border:1px solid rgba(0,0,0,0.15); padding:6px 16px; }
        .pw-single-author-pill{ font-size:12px; color:var(--wine); border:1px solid rgba(122,46,58,0.3); padding:6px 16px; }

        .pw-single-title{ font-size:40px; text-align:right; line-height:1.3; margin:0 0 26px; }

        .pw-single-divider{ width:150px; height:2px; background:var(--gold); margin:0 0 44px; }

        .pw-single-image-wrap{ width:100%; max-width:520px; max-height:360px; display:flex; align-items:center; justify-content:center; background:var(--parchment-2); margin:0 0 40px; border:1px solid rgba(0,0,0,0.08); overflow:hidden; }
        .pw-single-image{ max-width:100%; max-height:360px; width:auto; height:auto; object-fit:contain; display:block; }

        .pw-single-excerpt{ font-size:17px; font-style:italic; color:var(--wine); text-align:right; margin:0 0 40px; line-height:1.9; }

        .pw-single-content{ font-size:17px; line-height:2; color:var(--muted-2); text-align:right; max-width:900px; }
        .pw-single-content p{ margin:0 0 32px; white-space:pre-wrap; }
        .pw-content-link{ color:var(--wine); text-decoration:underline; word-break:break-all; }
        .pw-content-link:hover{ color:var(--gold); }
        .pw-single-empty{ text-align:right; color:var(--muted); font-size:14px; }

        /* ── התאמה למסך טלפון ── */
        @media (max-width: 640px){
          .pw-topbar{ padding:12px 14px; gap:10px; }
          .pw-back-btn{ padding:8px 12px; font-size:11px; }
          .pw-brand{ gap:8px; }
          .pw-brand-name{ font-size:13px; }
          .pw-brand-sub{ font-size:10px; }

          .pw-main{ padding:28px 16px 56px; }
          .pw-hero-title{ font-size:28px; margin:0 0 10px; }
          .pw-hero-sub{ font-size:12px; margin:0 0 22px; }

          .pw-filters{ gap:8px; margin-bottom:26px; }
          .pw-filter-pill{ padding:8px 14px; font-size:12px; }

          .pw-row-head{ flex-wrap:wrap; gap:6px 12px; padding:16px 2px; }
          .pw-row-title{ font-size:17px; width:100%; }
          .pw-row-meta{ font-size:12px; flex:1 1 auto; }
          .pw-featured-pill{ font-size:9px; padding:2px 6px; }
          .pw-arrow-icon{ width:16px; height:16px; }

          .pw-section-divider{ margin:36px 0 18px; gap:10px; }
          .pw-section-title{ font-size:18px; }

          .pw-single-back{ font-size:13px; margin-bottom:26px; }
          .pw-single-meta-row{ margin-bottom:14px; }
          .pw-single-year{ font-size:12px; }
          .pw-single-category-pill, .pw-single-author-pill{ font-size:11px; padding:5px 12px; }
          .pw-single-title{ font-size:24px; margin:0 0 18px; }
          .pw-single-divider{ width:90px; margin:0 0 28px; }
          .pw-single-image-wrap{ max-width:100%; max-height:220px; margin:0 0 26px; }
          .pw-single-image{ max-height:220px; }
          .pw-single-excerpt{ font-size:14px; margin:0 0 26px; }
          .pw-single-content{ font-size:15px; line-height:1.85; }
          .pw-single-content p{ margin:0 0 22px; }
        }
      `}</style>

      <div className="pw-topbar">
        <div className="pw-brand">
          <Seal size={40} />
          <div className="pw-brand-text">
            <p className="pw-brand-name pw-font-display">{profileName}</p>
            <p className="pw-brand-sub">יצירות</p>
          </div>
        </div>
        <Link to="/" className="pw-back-btn">
          חזרה לדף הבית
        </Link>
      </div>

      <main className="pw-main">
        {openWork ? (
          <>
            <button className="pw-single-back" onClick={() => setOpenId(null)}>
              חזרה לרשימת היצירות ←
            </button>

            <div className="pw-single-meta-row">
              <span className="pw-single-category-pill">
                {openWork.category}
              </span>
              <span className="pw-single-year">{openWork.year}</span>
              {openWork.author && openWork.author !== primaryAuthorName && (
                <span className="pw-single-author-pill">{openWork.author}</span>
              )}
            </div>

            <h1 className="pw-single-title pw-font-display">
              {openWork.title}
            </h1>
            <div className="pw-single-divider" />

            {openWork.imageUrl && (
              <div className="pw-single-image-wrap">
                <img
                  src={openWork.imageUrl}
                  alt={openWork.title}
                  className="pw-single-image"
                />
              </div>
            )}

            {openWork.excerpt && (
              <p className="pw-single-excerpt">{openWork.excerpt}</p>
            )}

            <div className="pw-single-content">
              {openWorkParagraphs.length > 0 ? (
                openWorkParagraphs.map((p, i) => (
                  <p key={i}>{linkifyText(p)}</p>
                ))
              ) : (
                <p className="pw-single-empty">אין עדיין תוכן ליצירה זו.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="pw-hero-title pw-font-display">היצירות</h1>
            <p className="pw-hero-sub">
              {loadingWorks ? "טוען..." : filteredWorks.length} יצירות · לחצו על
              יצירה כדי לקרוא אותה במלואה
            </p>

            <div className="pw-filters">
              <button
                className={`pw-filter-pill ${activeFilter === "all" ? "is-active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                הכל
              </button>
              {disciplines.map((d, i) => (
                <button
                  key={i}
                  className={`pw-filter-pill ${activeFilter === d.he ? "is-active" : ""}`}
                  onClick={() => setActiveFilter(d.he)}
                >
                  {d.he}
                </button>
              ))}
            </div>

            {loadingWorks ? (
              <p className="pw-empty-state">טוען יצירות...</p>
            ) : !hasAnyWorks ? (
              <p className="pw-empty-state">אין יצירות להצגה בקטגוריה זו.</p>
            ) : (
              <>
                {primaryWorks.length > 0 && (
                  <div className="pw-list">
                    {primaryWorks.map((w) => (
                      <WorkRow key={w.id} work={w} onOpen={setOpenId} />
                    ))}
                  </div>
                )}

                {secondaryGroups.map((group) => (
                  <React.Fragment key={group.name}>
                    <div className="pw-section-divider">
                      <h2 className="pw-section-title pw-font-display">
                        {group.heading}
                      </h2>
                    </div>
                    <div className="pw-list">
                      {group.works.map((w) => (
                        <WorkRow key={w.id} work={w} onOpen={setOpenId} />
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
