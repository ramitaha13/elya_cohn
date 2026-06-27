import React, { useEffect, useState, useRef } from "react";
// ייבוא התמונה כמודול - כך זה עובד נכון ב-Vite/CRA בלי קשר למיקום התיקייה
import writerPhoto from "../assets/IMG_8080.jpg";

/**
 * דף נחיתה ליוצר/ת - שירה, סיפורת ויצירה רב-תחומית
 * -------------------------------------------------
 * תוכן זה הוא תוכן הדגמה (Placeholder) — יש להחליף:
 *  1. WRITER.name / WRITER.tagline / WRITER.bio
 *  2. את תמונת היוצר/ת — חפשו את ההערה "TODO: תמונה" והחליפו את ה-placeholder ב-<img src="..." />
 *  3. את הרשימה WORKS ביצירות האמיתיות
 */

const WRITER = {
  name: "אילייה כהן",
  initials: "א.כ",
  tagline: "מילים שנעות בין שיר לסיפור",
  role: "יוצר רב־תחומי · שירה · סיפורת · כתיבה למוזיקה",
  excerpt:
    "״כל שיר הוא דלת, וכל סיפור הוא חדר שמעבר לה. אני רק מחזיקה את המפתח.״",
  bio: [
    "אילייה כהן הוא יוצר רב־תחומי המתמחה ביצירה מקורית המשלבת בין רעיונות חדשניים, חשיבה יצירתית ודיוק מקצועי. עבודותיו מתאפיינות בסגנון ייחודי, תשומת לב לפרטים ויכולת להפוך רעיונות לחוויות בעלות משמעות ואסתטיקה.",
    "בכל פרויקט אילייה שם דגש על איכות, אמינות ומקצועיות, תוך הקפדה על תהליך עבודה מסודר ושיתוף פעולה מלא עם לקוחותיו. היצירתיות, האחריות והמחויבות שלו למצוינות מאפשרות לו ליצור עבודות מקוריות ומרשימות, המשקפות את החזון של כל פרויקט בצורה המדויקת והטובה ביותר.",
  ],
};

const DISCIPLINES = [
  { he: "שירה", sub: "Poetry" },
  { he: "סיפורת קצרה", sub: "Short fiction" },
  { he: "מילים לשירים", sub: "Lyrics" },
  { he: "כתיבת מחזות", sub: "Playwriting" },
  { he: "סדנאות כתיבה", sub: "Workshops" },
];

const WORKS = [
  {
    title: "אור בין הצלעות",
    category: "שיר",
    year: "2024",
    excerpt:
      "שיר קצר שנכתב בעקבות אובדן ושיקום, על האור שממשיך לחדור גם כשהחלון סדוק.",
  },
  {
    title: "הבית שלא נמכר",
    category: "סיפור",
    year: "2023",
    excerpt:
      "סיפור קצר על משפחה שמתעקשת לא למכור בית ריק, ועל מה שבאמת אי אפשר למכור.",
  },
  {
    title: "כמו שעון בלי מחוגים",
    category: "מילים לשיר",
    year: "2023",
    excerpt:
      "טקסט שנכתב בהזמנה לאלבום של להקה ישראלית עצמאית, על זמן שמפסיק להיות מדויק.",
  },
  {
    title: "שלוש דקות של חורף",
    category: "שיר",
    year: "2022",
    excerpt: "מחזור שירים קצרים שנכתב בעיצומו של חורף אחד ארוך מהרגיל.",
  },
  {
    title: "האיש שספר את הצעדים",
    category: "סיפור",
    year: "2021",
    excerpt:
      "סיפור על שגרה, על מדידה אובססיבית של זמן, ועל הרגע שבו מפסיקים לספור.",
  },
];

const NAV_LINKS = [
  { id: "about", label: "אודות" },
  { id: "disciplines", label: "תחומי יצירה" },
  { id: "works", label: "יצירות" },
  { id: "contact", label: "צור קשר" },
];

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Flourish({ className = "" }) {
  return (
    <div className={`flourish ${className}`} aria-hidden="true">
      <span className="flourish-line" />
      <span className="flourish-diamond" />
      <span className="flourish-line" />
    </div>
  );
}

function Seal({ size = 96 }) {
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
          {WRITER.initials}
        </text>
      </svg>
    </div>
  );
}

export default function WriterLandingPage() {
  const scrolled = useScrolled();
  const [openWork, setOpenWork] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div dir="rtl" lang="he" className="page-root">
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

        .page-root{
          background:var(--parchment);
          color:var(--ink);
          font-family:'Heebo', sans-serif;
          overflow-x:hidden;
        }
        .font-display{ font-family:'Frank Ruhl Libre', serif; }

        .bg-ink{ background:var(--ink); }
        .bg-ink-2{ background:var(--ink-2); }
        .bg-parchment{ background:var(--parchment); }
        .bg-parchment-2{ background:var(--parchment-2); }
        .text-parchment{ color:var(--parchment); }
        .text-gold{ color:var(--gold); }
        .text-gold-soft{ color:var(--gold-soft); }
        .text-wine{ color:var(--wine); }
        .text-muted{ color:var(--muted); }
        .text-muted-2{ color:var(--muted-2); }
        .border-gold{ border-color:var(--gold); }
        .border-muted{ border-color:var(--muted); }

        /* Nav */
        .nav-shell{
          transition:background-color .4s ease, padding .4s ease, box-shadow .4s ease;
        }
        .nav-shell.is-solid{
          background:rgba(22,35,31,0.92);
          backdrop-filter: blur(8px);
          box-shadow:0 1px 0 rgba(201,166,70,0.25);
        }
        .nav-link{
          position:relative;
          color:var(--parchment);
          opacity:0.85;
        }
        .nav-link:after{
          content:"";
          position:absolute;
          right:0; left:0; bottom:-6px;
          height:1px;
          background:var(--gold);
          transform:scaleX(0);
          transform-origin:center;
          transition:transform .3s ease;
        }
        .nav-link:hover{ opacity:1; }
        .nav-link:hover:after{ transform:scaleX(1); }

        /* Flourish divider */
        .flourish{ display:flex; align-items:center; justify-content:center; gap:10px; }
        .flourish-line{ width:64px; height:1px; background:linear-gradient(to var(--dir,left), transparent, var(--gold), transparent); }
        .flourish-diamond{ width:6px; height:6px; background:var(--gold); transform:rotate(45deg); flex-shrink:0; }

        /* Seal */
        .seal-ring-outer{ fill:none; stroke:var(--gold); stroke-width:1.4; }
        .seal-ring-inner{ fill:none; stroke:var(--gold); stroke-width:0.7; opacity:0.7; }
        .seal-text{ font-family:'Frank Ruhl Libre', serif; font-size:22px; fill:var(--gold-soft); }

        /* Hero portrait frame */
        .portrait-frame{
          position:relative;
          border:1px solid var(--gold);
          padding:10px;
        }
        .portrait-frame:before{
          content:"";
          position:absolute;
          inset:-10px;
          border:1px solid rgba(201,166,70,0.35);
          pointer-events:none;
        }
        .portrait-inner{
          aspect-ratio: 4/5;
          background:linear-gradient(160deg, var(--ink-3), var(--ink-2));
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          overflow:hidden;
        }
        .portrait-placeholder-text{
          font-family:'Heebo', sans-serif;
          font-size:11px;
          letter-spacing:.08em;
          color:var(--muted);
        }

        /* Hero entrance animation */
        @keyframes riseIn{
          from{ opacity:0; transform:translateY(18px); }
          to{ opacity:1; transform:translateY(0); }
        }
        .rise-in{ animation:riseIn .9s ease both; }
        .delay-1{ animation-delay:.12s; }
        .delay-2{ animation-delay:.26s; }
        .delay-3{ animation-delay:.4s; }
        .delay-4{ animation-delay:.55s; }

        .underline-grow{
          position:relative;
          display:inline-block;
        }
        .underline-grow:after{
          content:"";
          position:absolute;
          right:0; bottom:-6px; left:0;
          height:1px;
          background:var(--gold);
          transform:scaleX(0);
          transform-origin:right;
          transition:transform .5s ease;
        }
        .underline-grow.is-on:after{ transform:scaleX(1); }

        /* Buttons */
        .btn-gold{
          border:1px solid var(--gold);
          color:var(--gold-soft);
          transition:background-color .3s ease, color .3s ease;
        }
        .btn-gold:hover{ background:var(--gold); color:var(--ink); }
        .btn-fill{
          background:var(--gold);
          color:var(--ink);
          transition:background-color .3s ease, transform .2s ease;
        }
        .btn-fill:hover{ background:var(--gold-soft); }

        /* Discipline chip */
        .chip{
          border:1px solid rgba(201,166,70,0.4);
          transition:border-color .3s ease, transform .3s ease;
        }
        .chip:hover{ border-color:var(--gold); transform:translateY(-2px); }

        /* Works — table of contents style */
        .toc-row{
          cursor:pointer;
          transition:background-color .25s ease;
        }
        .toc-row:hover{ background:rgba(201,166,70,0.06); }
        .toc-leader{
          flex:1 1 auto;
          border-bottom:1.5px dotted var(--muted);
          margin:0 14px;
          transform:translateY(-5px);
          min-width:24px;
        }
        .toc-title{
          font-family:'Frank Ruhl Libre', serif;
          transition:color .25s ease;
        }
        .toc-row:hover .toc-title{ color:var(--wine); }
        .chevron{
          transition:transform .3s ease;
        }
        .chevron.is-open{ transform:rotate(90deg); }
        .work-excerpt{
          max-height:0;
          overflow:hidden;
          transition:max-height .4s ease;
        }
        .work-excerpt.is-open{ max-height:200px; }

        /* Pull quote mark */
        .quote-mark{
          font-family:'Frank Ruhl Libre', serif;
          line-height:0.5;
        }

        /* Focus visibility */
        a:focus-visible, button:focus-visible{
          outline:2px solid var(--gold);
          outline-offset:3px;
        }

        @media (prefers-reduced-motion: reduce){
          .rise-in, .toc-row, .chip, .underline-grow:after, .chevron, .work-excerpt, .nav-shell, .btn-gold, .btn-fill{
            animation:none !important;
            transition:none !important;
          }
        }
      `}</style>

      {/* NAV */}
      <nav
        className={`nav-shell fixed top-0 right-0 left-0 z-50 ${
          scrolled ? "is-solid py-3" : "py-6"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => scrollTo("hero")}
            className="font-display text-lg text-parchment"
          >
            {WRITER.name}
          </button>
          <ul className="hidden md:flex items-center gap-8 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <button onClick={() => scrollTo(l.id)} className="nav-link">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => scrollTo("contact")}
            className="btn-gold hidden md:inline-block px-4 py-2 text-xs"
          >
            צרו קשר
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header
        id="hero"
        className="bg-ink text-parchment min-h-screen flex items-center pt-28 pb-16"
      >
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center w-full">
          {/* Text side */}
          <div className="order-2 md:order-1">
            <p className="rise-in text-xs tracking-widest text-muted mb-5">
              {WRITER.role}
            </p>
            <h1 className="rise-in delay-1 font-display text-5xl md:text-6xl leading-[1.15] mb-6">
              {WRITER.name}
            </h1>
            <p className="rise-in delay-2 font-display text-xl text-gold-soft mb-8">
              {WRITER.tagline}
            </p>
            <p className="rise-in delay-3 text-muted text-base leading-relaxed border-r-2 border-gold pr-4 mb-10 max-w-md">
              {WRITER.excerpt}
            </p>
            <div className="rise-in delay-4 flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo("works")}
                className="btn-fill px-6 py-3 text-sm font-medium"
              >
                קריאת יצירות
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="btn-gold px-6 py-3 text-sm font-medium"
              >
                צרו קשר
              </button>
            </div>
          </div>

          {/* Image side */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="portrait-frame w-64 md:w-80">
              <div className="portrait-inner">
                <img
                  src={writerPhoto}
                  alt={WRITER.name || "תמונת היוצר/ת"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section id="about" className="bg-parchment py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Flourish className="mb-16" />
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <p className="text-xs tracking-widest text-wine mb-3">אודות</p>
              <h2 className="font-display text-4xl leading-tight">
                כתיבה כמרחב בין שיר לסיפור
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              {WRITER.bio.map((p, i) => (
                <p
                  key={i}
                  className="text-muted-2 leading-loose text-[17px] mb-5"
                >
                  {p}
                </p>
              ))}
              <div className="flex items-start gap-4 mt-10 bg-parchment-2 p-6 border-r-2 border-wine">
                <span className="quote-mark text-5xl text-wine">”</span>
                <p className="font-display text-xl leading-relaxed pt-2">
                  {WRITER.excerpt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISCIPLINES */}
      <section id="disciplines" className="bg-ink-2 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest text-gold mb-3">
              אמנות רב־תחומית
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-parchment">
              תחומי יצירה
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {DISCIPLINES.map((d) => (
              <div
                key={d.he}
                className="chip px-6 py-4 text-center min-w-[150px]"
              >
                <p className="font-display text-lg text-parchment">{d.he}</p>
                <p className="text-[11px] tracking-wider text-muted mt-1">
                  {d.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKS — table of contents */}
      <section id="works" className="bg-parchment py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-wine mb-3">
              ביבליוגרפיה
            </p>
            <h2 className="font-display text-4xl">יצירות נבחרות</h2>
          </div>

          <div className="border-t border-muted">
            {WORKS.map((w, i) => {
              const isOpen = openWork === i;
              return (
                <div key={w.title} className="border-b border-muted">
                  <button
                    onClick={() => setOpenWork(isOpen ? null : i)}
                    className="toc-row w-full flex items-center py-5 text-right"
                    aria-expanded={isOpen}
                  >
                    <span className="toc-title text-lg md:text-xl whitespace-nowrap">
                      {w.title}
                    </span>
                    <span className="toc-leader" />
                    <span className="text-sm text-muted whitespace-nowrap">
                      {w.category} · {w.year}
                    </span>
                    <svg
                      className={`chevron ${isOpen ? "is-open" : ""} mr-3 flex-shrink-0`}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="text-wine"
                      />
                    </svg>
                  </button>
                  <div className={`work-excerpt ${isOpen ? "is-open" : ""}`}>
                    <p className="text-muted-2 leading-relaxed text-[15px] pb-6 pr-1 max-w-xl">
                      {w.excerpt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-ink py-28 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <Seal size={64} />
          <p className="font-display text-2xl md:text-3xl text-parchment leading-relaxed mt-8">
            {WRITER.excerpt}
          </p>
          <Flourish className="my-10" />
          <button
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-fill px-8 py-3 text-sm font-medium"
          >
            רוצים לשתף פעולה? דברו איתי
          </button>
        </div>
      </section>

      {/* CONTACT / FOOTER */}
      <footer id="contact" className="bg-ink-2 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-14">
            <div>
              <h3 className="font-display text-2xl text-parchment mb-3">
                {WRITER.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {WRITER.role}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gold mb-4">צרו קשר</p>
              <a
                href="mailto:writer@example.com"
                className="underline-grow text-parchment text-sm block mb-2 hover:opacity-90"
                onMouseEnter={(e) => e.currentTarget.classList.add("is-on")}
                onMouseLeave={(e) => e.currentTarget.classList.remove("is-on")}
              >
                writer@example.com
              </a>
              <p className="text-muted text-sm">050-000-0000</p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gold mb-4">עקבו</p>
              <div className="flex gap-4">
                {["פמה חדשה"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-muted text-sm hover:text-gold-soft transition-colors"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-[rgba(201,166,70,0.2)] pt-6 flex flex-col md:flex-row justify-between gap-3">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} {WRITER.name}. כל הזכויות שמורות.
            </p>
            <p className="text-xs text-muted">נבנה באהבה למילים.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
