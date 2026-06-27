import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // התאם את הנתיב למיקום firebase.js שלך
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * דף כניסה (Login) — תואם לעיצוב של דף הנחיתה (Parchment / Ink / Gold)
 * ---------------------------------------------------------------
 * ⚠️ אבטחה — קריאה חשובה:
 * הדף הזה בודק התחברות ע"י שאילתה ישירה לקולקציית "users" ב-Firestore,
 * משווה username + password כטקסט גלוי (plain text) כפי שנשמרים שם כיום.
 *
 * כדי שזה יעבוד, חוקי האבטחה (Firestore Rules) של קולקציית "users" חייבים
 * לאפשר קריאה (read/list) ללא התחברות מוקדמת, לדוגמה:
 *
 *   match /databases/{database}/documents {
 *     match /users/{userId} {
 *       allow read: if true;   // נדרש כדי שהשאילתה תעבוד מהדפדפן
 *       allow write: if false; // חוסם כתיבה חופשית
 *     }
 *   }
 *
 * המשמעות בפועל: כל מי שיודע לפתוח את כלי המפתחים בדפדפן (DevTools) ולשלוח
 * שאילתת Firestore יכול לקרוא את כל קולקציית ה-users, כולל כל הסיסמאות
 * בטקסט גלוי. זה מתאים לפרויקט אישי/דמו, אבל לא בטוח לסביבת פרודקשן עם
 * משתמשים אמיתיים. החלופה הבטוחה היא Firebase Authentication, בה הסיסמאות
 * לא נשמרות בקולקציה רגילה וגם לא נגישות לקריאה. שמרתי על השיטה הזו לפי
 * בקשתך המפורשת.
 *
 * 1. הקובץ הזה משתמש ב-react-router-dom (Link, useNavigate).
 *    אם הפרויקט שלך לא משתמש ב-react-router, יש להתקין אותו:
 *       npm install react-router-dom
 */

const BRAND = {
  name: "אילייה כהן",
  initials: "א.כ",
};

function Seal({ size = 72 }) {
  return (
    <div
      className="seal"
      style={{ width: size, height: size, margin: "0 auto" }}
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

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setStatus("error");
      setErrorMsg("נא למלא שם משתמש וסיסמה.");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", "==", form.username.trim()),
        where("password", "==", form.password),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatus("error");
        setErrorMsg("שם משתמש או סיסמה שגויים.");
        return;
      }

      // התחברות הצליחה — שומרים פרטי המשתמש המחובר לשימוש מקומי באפליקציה
      const userDoc = snapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      delete userData.password; // לא שומרים את הסיסמה עצמה ב-localStorage
      localStorage.setItem("currentUser", JSON.stringify(userData));
      // שומרים גם בנפרד את השם, לנוחות שימוש מהיר בדפים אחרים (למשל ברכת "שלום X" בדשבורד)
      localStorage.setItem(
        "userName",
        userData.name || userData.username || "",
      );

      setStatus("idle");
      navigate("/dashboard");
    } catch (err) {
      console.error("שגיאה בהתחברות:", err);
      setStatus("error");
      setErrorMsg("אירעה שגיאה בהתחברות. נסו שוב.");
    }
  };

  return (
    <div dir="rtl" lang="he" className="login-root">
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

        .login-root{
          background:var(--ink);
          color:var(--parchment);
          font-family:'Heebo', sans-serif;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:32px 20px;
          position:relative;
          overflow:hidden;
        }
        .login-root:before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(ellipse 60% 50% at 50% -10%, rgba(201,166,70,0.10), transparent 60%);
          pointer-events:none;
        }

        .font-display{ font-family:'Frank Ruhl Libre', serif; }
        .text-gold{ color:var(--gold); }
        .text-gold-soft{ color:var(--gold-soft); }
        .text-muted{ color:var(--muted); }
        .text-wine{ color:var(--wine); }

        .seal-ring-outer{ fill:none; stroke:var(--gold); stroke-width:1.4; }
        .seal-ring-inner{ fill:none; stroke:var(--gold); stroke-width:0.7; opacity:0.7; }
        .seal-text{ font-family:'Frank Ruhl Libre', serif; font-size:22px; fill:var(--gold-soft); }

        .flourish{ display:flex; align-items:center; justify-content:center; gap:10px; }
        .flourish-line{ width:48px; height:1px; background:linear-gradient(to left, transparent, var(--gold), transparent); }
        .flourish-diamond{ width:6px; height:6px; background:var(--gold); transform:rotate(45deg); flex-shrink:0; }

        .login-card{
          width:100%;
          max-width:420px;
          position:relative;
          z-index:1;
        }
        .login-panel{
          border:1px solid rgba(201,166,70,0.35);
          padding:44px 36px;
          background:rgba(244,237,221,0.02);
        }

        .form-row{
          margin-bottom:18px;
          display:flex;
          flex-direction:column;
        }
        .form-label{
          font-size:12px;
          letter-spacing:.05em;
          color:var(--gold);
          margin-bottom:8px;
        }
        .form-input{
          background:transparent;
          border:1px solid rgba(201,166,70,0.35);
          color:var(--parchment);
          padding:12px 14px;
          font-family:'Heebo', sans-serif;
          font-size:14px;
          transition:border-color .25s ease, background-color .25s ease;
          width:100%;
        }
        .form-input::placeholder{ color:var(--muted); }
        .form-input:focus{
          outline:none;
          border-color:var(--gold);
          background:rgba(201,166,70,0.05);
        }

        .password-wrap{
          position:relative;
        }
        .password-wrap .form-input{
          padding-left:42px; /* משאיר מקום לכפתור העין מהצד השמאלי, גם ב-RTL */
        }
        .toggle-password{
          position:absolute;
          top:0;
          left:0;
          height:100%;
          width:40px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:none;
          border:none;
          color:var(--muted);
          cursor:pointer;
          padding:0;
          transition:color .2s ease;
        }
        .toggle-password:hover{ color:var(--gold-soft); }

        .btn-fill{
          background:var(--gold);
          color:var(--ink);
          transition:background-color .3s ease, transform .2s ease;
          border:none;
          cursor:pointer;
        }
        .btn-fill:hover{ background:var(--gold-soft); }
        .btn-fill:disabled{ opacity:.6; cursor:default; }

        .back-link{
          color:var(--muted);
          font-size:13px;
          position:relative;
          transition:color .25s ease;
        }
        .back-link:hover{ color:var(--gold-soft); }

        a:focus-visible, button:focus-visible, input:focus-visible{
          outline:2px solid var(--gold);
          outline-offset:3px;
        }

        @media (prefers-reduced-motion: reduce){
          .btn-fill, .back-link, .form-input{ transition:none !important; }
        }
      `}</style>

      <div className="login-card">
        <div className="text-center mb-8">
          <Seal size={64} />
          <h1 className="font-display text-3xl mt-6 mb-1">{BRAND.name}</h1>
          <p className="text-muted text-sm">כניסה לאזור האישי</p>
        </div>

        <div className="login-panel">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label htmlFor="lg-username" className="form-label">
                שם משתמש
              </label>
              <input
                id="lg-username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="form-input"
                placeholder="שם המשתמש שלך"
                autoComplete="username"
              />
            </div>

            <div className="form-row">
              <label htmlFor="lg-password" className="form-label">
                סיסמה
              </label>
              <div className="password-wrap">
                <input
                  id="lg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.6A10.94 10.94 0 0112 4.5c5 0 9 3.5 10.5 7.5-.6 1.6-1.5 3.05-2.65 4.27M6.1 6.1C3.9 7.5 2.2 9.6 1.5 12c1.1 3.1 3.6 5.7 7 6.9a10.9 10.9 0 003.5.6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M1.5 12C3 8 7 4.5 12 4.5S21 8 22.5 12C21 16 17 19.5 12 19.5S3 16 1.5 12z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {status === "error" && (
              <p className="text-wine text-xs mb-4 text-right">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-fill px-6 py-3 text-sm font-medium w-full mt-2"
            >
              {status === "sending" ? "מתחבר..." : "התחברות"}
            </button>
          </form>

          <div className="flourish my-7" aria-hidden="true">
            <span className="flourish-line" />
            <span className="flourish-diamond" />
            <span className="flourish-line" />
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="back-link">
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
