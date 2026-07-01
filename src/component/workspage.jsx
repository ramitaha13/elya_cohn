import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // התאם את הנתיב למיקום firebase.js שלך
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

/**
 * דף ציבורי המציג את כל היצירות לקוראים.
 * ---------------------------------------------------------------
 * הוסיפו route בקובץ ה-App שלכם:
 *    <Route path="/works" element={<WorksPage />} />
 *
 * הדף שואב את כל המסמכים מקולקשן "works" ב-Firestore בזמן אמת,
 * וכן את רשימת "תחומי היצירה" ממסמך profile/main כדי לבנות את
 * כפתורי הסינון לפי קטגוריה (אותה רשימה שמוגדרת בדשבורד תחת
 * "פרופיל" → "תחומי יצירה").
 * לחיצה על יצירה ברשימה פותחת את התוכן המלא שלה באותו דף.
 */

const BRAND = {
  name: "אילייה כהן",
  initials: "א.כ",
};

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

export default function WorksPage() {
  const navigate = useNavigate();

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // היצירה שנפתחה לקריאה
  const [category, setCategory] = useState("הכול");
  const [disciplines, setDisciplines] = useState([]);

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
            category: v.category || "שיר",
            year: v.year || "—",
            excerpt: v.excerpt || "",
            content: v.content || "",
            featured: !!v.featured,
            imageUrl: v.imageUrl || "",
          };
        });
        setWorks(data);
        setLoading(false);
      },
      (err) => {
        console.error("שגיאה בטעינת יצירות:", err);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  // טעינת תחומי היצירה מהפרופיל — אותה רשימה שמנוהלת בדשבורד
  // תחת "פרופיל" → "תחומי יצירה", כך שכפתורי הסינון כאן תמיד מסונכרנים.
  // שימוש ב-onSnapshot (במקום getDoc חד-פעמי) כדי להציג נתונים מה-cache
  // המקומי כמעט מיידית, ולא להמתין לתשובה מהשרת.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "profile", "main"),
      (snap) => {
        if (snap.exists()) {
          setDisciplines(snap.data().disciplines || []);
        }
      },
      (err) => {
        console.error("שגיאה בטעינת תחומי יצירה:", err);
      },
    );
    return () => unsubscribe();
  }, []);

  // הקטגוריות לסינון נשאבות מתחומי היצירה שהוגדרו בפרופיל
  const categories = ["הכול", ...disciplines.map((d) => d.he).filter(Boolean)];

  const filteredWorks =
    category === "הכול" ? works : works.filter((w) => w.category === category);

  const openWork = (w) => {
    setSelected(w);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeWork = () => {
    setSelected(null);
  };

  return (
    <div dir="rtl" lang="he" className="works-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=Heebo:wght@300;400;500;600;700&display=swap');

        :root{
          --ink:#16231F;
          --ink-2:#1F2F29;
          --parchment:#F4EDDD;
          --parchment-2:#ECE2CB;
          --gold:#C9A646;
          --gold-soft:#E2C879;
          --wine:#7A2E3A;
          --muted:#9C9484;
          --muted-2:#5C6760;
        }

        .works-root{
          background:var(--parchment);
          color:var(--ink);
          font-family:'Heebo', sans-serif;
          min-height:100vh;
        }
        .font-display{ font-family:'Frank Ruhl Libre', serif; }
        .text-muted{ color:var(--muted); }

        /* Topbar */
        .works-topbar{
          background:var(--ink);
          color:var(--parchment);
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:16px 28px;
          border-bottom:1px solid rgba(201,166,70,0.25);
        }
        .works-brand{ display:flex; align-items:center; gap:14px; cursor:pointer; }
        .works-brand-name{ font-size:15px; }
        .works-brand-sub{ font-size:11px; color:var(--muted); }
        .seal-ring-outer{ fill:none; stroke:var(--gold); stroke-width:1.4; }
        .seal-ring-inner{ fill:none; stroke:var(--gold); stroke-width:0.7; opacity:0.7; }
        .seal-text{ font-family:'Frank Ruhl Libre', serif; font-size:20px; fill:var(--gold-soft); }

        .home-link{
          border:1px solid rgba(201,166,70,0.4);
          color:var(--gold-soft);
          background:transparent;
          padding:8px 16px;
          font-size:12px;
          cursor:pointer;
          transition:background-color .25s ease, color .25s ease;
        }
        .home-link:hover{ background:var(--gold); color:var(--ink); }

        .works-main{
          max-width:880px;
          margin:0 auto;
          padding:48px 28px 80px;
        }

        .page-title{
          font-size:34px;
          margin-bottom:8px;
        }
        .page-sub{
          font-size:14px;
          color:var(--muted-2);
          margin-bottom:36px;
        }

        /* Filters */
        .cat-filters{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          margin-bottom:32px;
        }
        .cat-pill{
          padding:7px 16px;
          font-size:12px;
          background:transparent;
          border:1px solid rgba(122,46,58,0.3);
          color:var(--muted-2);
          cursor:pointer;
          transition:all .2s ease;
        }
        .cat-pill:hover{ border-color:var(--wine); color:var(--wine); }
        .cat-pill.is-active{
          background:var(--wine);
          border-color:var(--wine);
          color:#fff;
        }

        /* List */
        .works-list{ display:flex; flex-direction:column; }
        .work-item{
          display:flex;
          align-items:center;
          gap:18px;
          padding:22px 4px;
          border-bottom:1px solid rgba(0,0,0,0.08);
          background:none;
          border-right:none;
          border-left:none;
          border-top:none;
          width:100%;
          text-align:right;
          cursor:pointer;
          transition:padding-right .2s ease;
        }
        .work-item:hover{
          padding-right:14px;
        }
        .work-item:hover .work-item-title{ color:var(--wine); }
        .work-item-thumb{
          width:46px;
          height:46px;
          object-fit:cover;
          flex-shrink:0;
          border:1px solid rgba(0,0,0,0.08);
        }
        .work-item-title{
          font-size:20px;
          color:var(--ink);
          transition:color .2s ease;
          flex-shrink:0;
        }
        .work-item-meta{
          font-size:12px;
          color:var(--muted);
          flex-shrink:0;
        }
        .work-item-excerpt{
          font-size:13px;
          color:var(--muted-2);
          flex:1;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .work-item-arrow{
          color:var(--gold);
          font-size:16px;
          flex-shrink:0;
        }

        .empty-state{
          text-align:center;
          color:var(--muted);
          padding:60px 0;
          font-size:14px;
        }

        /* Detail view */
        .detail-back{
          display:inline-flex;
          align-items:center;
          gap:6px;
          background:none;
          border:none;
          color:var(--wine);
          font-size:13px;
          cursor:pointer;
          margin-bottom:28px;
          padding:0;
        }
        .detail-back:hover{ text-decoration:underline; }

        .detail-meta{
          display:flex;
          gap:10px;
          align-items:center;
          margin-bottom:6px;
        }
        .detail-category{
          font-size:11px;
          letter-spacing:.04em;
          color:var(--wine);
          border:1px solid rgba(122,46,58,0.3);
          padding:2px 10px;
        }
        .detail-year{ font-size:12px; color:var(--muted); }

        .detail-title{
          font-size:38px;
          margin:10px 0 28px;
          line-height:1.25;
        }

        .detail-image-wrap{
          width:100%;
          max-width:420px;
          max-height:300px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:var(--parchment-2);
          margin-bottom:28px;
          border:1px solid rgba(0,0,0,0.08);
          overflow:hidden;
        }
        .detail-image{
          max-width:100%;
          max-height:300px;
          width:auto;
          height:auto;
          object-fit:contain;
          display:block;
        }

        .detail-divider{
          width:64px;
          height:2px;
          background:var(--gold);
          margin-bottom:32px;
        }

        .detail-content{
          font-size:17px;
          line-height:2;
          color:var(--ink-2);
          white-space:pre-wrap;
        }
        .detail-content-empty{
          font-size:14px;
          color:var(--muted);
          font-style:italic;
        }
      `}</style>

      <div className="works-topbar">
        <div className="works-brand" onClick={() => navigate("/")}>
          <Seal size={40} />
          <div>
            <p className="works-brand-name font-display">{BRAND.name}</p>
            <p className="works-brand-sub">יצירות</p>
          </div>
        </div>
        <button className="home-link" onClick={() => navigate("/")}>
          חזרה לדף הבית
        </button>
      </div>

      <main className="works-main">
        {selected ? (
          <div>
            <button className="detail-back" onClick={closeWork}>
              ← חזרה לרשימת היצירות
            </button>
            <div className="detail-meta">
              <span className="detail-category">{selected.category}</span>
              <span className="detail-year">{selected.year}</span>
            </div>
            <h1 className="detail-title font-display">{selected.title}</h1>
            {selected.imageUrl && (
              <div className="detail-image-wrap">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="detail-image"
                />
              </div>
            )}
            <div className="detail-divider" />
            {selected.content ? (
              <p className="detail-content">{selected.content}</p>
            ) : (
              <p className="detail-content-empty">
                התוכן המלא של היצירה יתעדכן בקרוב.
              </p>
            )}
          </div>
        ) : (
          <div>
            <h1 className="page-title font-display">היצירות</h1>
            <p className="page-sub">
              {loading
                ? "טוען יצירות..."
                : `${works.length} יצירות · לחצו על יצירה כדי לקרוא אותה במלואה`}
            </p>

            {!loading && categories.length > 1 && (
              <div className="cat-filters">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`cat-pill ${category === c ? "is-active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="empty-state">טוען יצירות...</p>
            ) : filteredWorks.length === 0 ? (
              <p className="empty-state">אין עדיין יצירות להצגה.</p>
            ) : (
              <div className="works-list">
                {filteredWorks.map((w) => (
                  <button
                    key={w.id}
                    className="work-item"
                    onClick={() => openWork(w)}
                  >
                    {w.imageUrl && (
                      <img
                        src={w.imageUrl}
                        alt=""
                        className="work-item-thumb"
                      />
                    )}
                    <span className="work-item-title font-display">
                      {w.title}
                    </span>
                    <span className="work-item-meta">
                      {w.category} · {w.year}
                    </span>
                    {w.excerpt && (
                      <span className="work-item-excerpt">{w.excerpt}</span>
                    )}
                    <span className="work-item-arrow">←</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
