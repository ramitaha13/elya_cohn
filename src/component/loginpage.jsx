import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * דף כניסה (Login) — תואם לעיצוב של דף הנחיתה (Parchment / Ink / Gold)
 * ---------------------------------------------------------------
 * הערות שימוש:
 *  1. הקובץ הזה משתמש ב-react-router-dom (Link, useNavigate).
 *     אם הפרויקט שלך לא משתמש ב-react-router, יש להתקין אותו:
 *        npm install react-router-dom
 *     ולהוסיף route בקובץ ה-App שלך, לדוגמה (v6):
 *
 *        import { BrowserRouter, Routes, Route } from "react-router-dom";
 *        import WriterLandingPage from "./WriterLandingPage";
 *        import LoginPage from "./LoginPage";
 *
 *        function App() {
 *          return (
 *            <BrowserRouter>
 *              <Routes>
 *                <Route path="/" element={<WriterLandingPage />} />
 *                <Route path="/login" element={<LoginPage />} />
 *              </Routes>
 *            </BrowserRouter>
 *          );
 *        }
 *
 *  2. handleSubmit כרגע מדמה התחברות (setTimeout). יש לחבר קריאת API אמיתית
 *     לפי שירות האימות שלך (Firebase Auth, Supabase, JWT לבקאנד משלך וכו').
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
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setStatus("error");
      setErrorMsg("נא למלא אימייל וסיסמה.");
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    // TODO: כאן יש לחבר התחברות אמיתית. לדוגמה:
    // try {
    //   const res = await fetch("https://your-api.example.com/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(form),
    //   });
    //   if (!res.ok) throw new Error("פרטי התחברות שגויים");
    //   navigate("/dashboard");
    // } catch (err) {
    //   setStatus("error");
    //   setErrorMsg(err.message);
    // }

    setTimeout(() => {
      setStatus("idle");
      navigate("/dashboard");
    }, 700);
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
              <label htmlFor="lg-email" className="form-label">
                אימייל
              </label>
              <input
                id="lg-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                placeholder="example@mail.com"
                autoComplete="email"
              />
            </div>

            <div className="form-row">
              <label htmlFor="lg-password" className="form-label">
                סיסמה
              </label>
              <input
                id="lg-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
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

          <p className="text-center text-muted text-xs">
            אין לך חשבון?{" "}
            <Link to="/signup" className="text-gold-soft hover:underline">
              הרשמה
            </Link>
          </p>
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
