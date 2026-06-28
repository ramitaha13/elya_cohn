import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // התאם את הנתיב למיקום firebase.js שלך
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

/**
 * דף ראשי ליוצר/ת (Dashboard) — מוצג לאחר התחברות מוצלחת.
 * ---------------------------------------------------------------
 * הוסיפו route בקובץ ה-App שלכם:
 *    <Route path="/dashboard" element={<DashboardPage />} />
 *
 * הנתונים כאן מגיעים מ-Firestore:
 *  - "works"   — קולקשן יצירות (כל יצירה = דוקומנט)
 *  - "messages"— קולקשן הודעות מהאתר (נכתב על-ידי טופס יצירת הקשר)
 *  - "profile/main" — דוקומנט יחיד עם פרטי הפרופיל
 *
 * הגנת כניסה (client-side):
 *  - בעת טעינת הדף נבדק אם קיים "userName" ב-localStorage (נשמר ב-LoginPage
 *    לאחר התחברות מוצלחת). אם הוא חסר — מי שניגש לדף הזה לא התחבר, ומועברים
 *    אוטומטית ל-"/login".
 *  - בלחיצה על "התנתקות" נמחקים מ-localStorage גם "userName" וגם
 *    "currentUser", ואז מתבצע ניווט לדף הבית.
 *  ⚠️ זו הגנה בצד הלקוח בלבד (קל לעקוף ע"י מי שמתעסק ב-DevTools). היא טובה
 *  כדי לשלוט בחוויית המשתמש (לא לתת לראות את הדשבורד בלי "להתחבר"), אבל לא
 *  מחליפה הרשאות אמיתיות בצד השרת/ב-Firestore Rules.
 */

const BRAND = {
  name: "אילייה כהן",
  initials: "א.כ",
};

const DEFAULT_PROFILE = {
  name: BRAND.name,
  tagline: "מילים שנעות בין שיר לסיפור לציור",
  bio: "אילייה כהן הוא יוצר רב־תחומי המתמחה ביצירה מקורית...",
};

const NAV_ITEMS = [
  { id: "overview", label: "סקירה" },
  { id: "works", label: "יצירות" },
  { id: "messages", label: "הודעות" },
  { id: "profile", label: "פרופיל" },
];

function formatDate(ts) {
  if (!ts) return "—";
  // Firestore Timestamp -> Date
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

function OverviewTab({ works, messages, loading, visitsCount, onGoTo }) {
  const unread = messages.filter((m) => !m.read).length;
  return (
    <div>
      <div className="grid-stats">
        <StatCard
          label="יצירות פורסמו"
          value={loading.works ? "…" : works.length}
        />
        <StatCard
          label="הודעות שלא נקראו"
          value={loading.messages ? "…" : unread}
          hint={
            !loading.messages && unread > 0
              ? "יש הודעות חדשות"
              : !loading.messages
                ? "הכול נקרא"
                : null
          }
        />
        <StatCard
          label="ביקורים בשבוע האחרון"
          value={loading.visits ? "…" : visitsCount}
          hint="נספר אוטומטית מהאתר"
        />
      </div>

      <div className="panel mt-8">
        <div className="panel-head">
          <h3 className="font-display text-xl">הודעות אחרונות</h3>
          <button className="link-btn" onClick={() => onGoTo("messages")}>
            לכל ההודעות ←
          </button>
        </div>
        {loading.messages ? (
          <p className="text-muted text-sm py-4 text-center">טוען הודעות...</p>
        ) : (
          <ul className="msg-mini-list">
            {messages.slice(0, 3).map((m) => (
              <li
                key={m.id}
                className={`msg-mini ${m.read ? "" : "is-unread"}`}
              >
                <span className="msg-mini-name">{m.name}</span>
                <span className="msg-mini-text">{m.message}</span>
                <span className="msg-mini-date">{m.date}</span>
              </li>
            ))}
            {messages.length === 0 && (
              <p className="text-muted text-sm py-4 text-center">
                אין עדיין הודעות.
              </p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

function WorksTab({
  works,
  loading,
  onAdd,
  onRemove,
  onUpdate,
  onToggleFeatured,
}) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    category: "שיר",
    year: "",
    excerpt: "",
    content: "",
    featured: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [viewingId, setViewingId] = useState(null);

  const handleRemove = async (work) => {
    const confirmed = window.confirm(
      `למחוק את היצירה "${work.title}"?\nלא ניתן לשחזר את היצירה לאחר המחיקה.`,
    );
    if (!confirmed) return;
    try {
      await onRemove(work.id);
    } catch (err) {
      console.error("שגיאה במחיקת יצירה:", err);
      alert("מחיקת היצירה נכשלה, נסו שוב.");
    }
  };

  const handleToggleFeatured = async (work) => {
    try {
      await onToggleFeatured(work.id, !work.featured);
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס נבחרת:", err);
      alert("העדכון נכשל, נסו שוב.");
    }
  };

  const addWork = async (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        title: draft.title,
        category: draft.category,
        year: draft.year || "—",
        excerpt: draft.excerpt,
        content: draft.content,
        featured: draft.featured,
      });
      setDraft({
        title: "",
        category: "שיר",
        year: "",
        excerpt: "",
        content: "",
        featured: false,
      });
      setAdding(false);
    } catch (err) {
      console.error("שגיאה בהוספת יצירה:", err);
      alert("הוספת היצירה נכשלה, נסו שוב.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (w) => {
    setViewingId(null);
    setEditingId(w.id);
    setEditDraft({
      title: w.title || "",
      category: w.category || "שיר",
      year: w.year || "",
      excerpt: w.excerpt || "",
      content: w.content || "",
      featured: !!w.featured,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editDraft.title.trim()) return;
    setUpdating(true);
    try {
      await onUpdate(editingId, editDraft);
      setEditingId(null);
      setEditDraft(null);
    } catch (err) {
      console.error("שגיאה בעדכון יצירה:", err);
      alert("עדכון היצירה נכשל, נסו שוב.");
    } finally {
      setUpdating(false);
    }
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
      <p className="text-muted text-xs mb-4">
        רק יצירות שמסומנות כ"נבחרת" יוצגו בעמוד "יצירות נבחרות" בדף הנחיתה. שאר
        היצירות נשמרות כאן בלבד.
      </p>

      {adding && (
        <form onSubmit={addWork} className="add-work-form">
          <div className="work-form-row">
            <input
              className="form-input"
              placeholder="כותרת"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
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
              onChange={(e) =>
                setDraft((d) => ({ ...d, year: e.target.value }))
              }
            />
          </div>
          <textarea
            className="form-input form-textarea excerpt-input"
            placeholder="תקציר (אופציונלי, יוצג בדף הנחיתה)"
            rows={3}
            value={draft.excerpt}
            onChange={(e) =>
              setDraft((d) => ({ ...d, excerpt: e.target.value }))
            }
          />
          <label className="featured-check">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) =>
                setDraft((d) => ({ ...d, featured: e.target.checked }))
              }
            />
            יצירה נבחרת (תוצג בדף הנחיתה)
          </label>
          <textarea
            className="form-input form-textarea work-content-input"
            placeholder="תוכן היצירה המלא (השיר/הסיפור עצמו)"
            rows={10}
            value={draft.content}
            onChange={(e) =>
              setDraft((d) => ({ ...d, content: e.target.value }))
            }
          />
          <button
            type="submit"
            className="btn-fill px-5 py-2 text-xs"
            disabled={saving}
          >
            {saving ? "שומר..." : "שמירה"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted text-sm py-6 text-center">טוען יצירות...</p>
      ) : (
        <div className="work-table">
          {works.map((w) => {
            const isEditing = editingId === w.id;
            const isViewing = viewingId === w.id;

            if (isEditing) {
              return (
                <form key={w.id} onSubmit={saveEdit} className="edit-work-form">
                  <div className="work-form-row">
                    <input
                      className="form-input"
                      placeholder="כותרת"
                      value={editDraft.title}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, title: e.target.value }))
                      }
                    />
                    <select
                      className="form-input"
                      value={editDraft.category}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          category: e.target.value,
                        }))
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
                      value={editDraft.year}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, year: e.target.value }))
                      }
                    />
                  </div>
                  <textarea
                    className="form-input form-textarea excerpt-input"
                    placeholder="תקציר (אופציונלי, יוצג בדף הנחיתה)"
                    rows={3}
                    value={editDraft.excerpt}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, excerpt: e.target.value }))
                    }
                  />
                  <label className="featured-check">
                    <input
                      type="checkbox"
                      checked={editDraft.featured}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          featured: e.target.checked,
                        }))
                      }
                    />
                    יצירה נבחרת (תוצג בדף הנחיתה)
                  </label>
                  <textarea
                    className="form-input form-textarea work-content-input"
                    placeholder="תוכן היצירה המלא (השיר/הסיפור עצמו)"
                    rows={10}
                    value={editDraft.content}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, content: e.target.value }))
                    }
                  />
                  <div className="edit-actions">
                    <button
                      type="submit"
                      className="btn-fill px-5 py-2 text-xs"
                      disabled={updating}
                    >
                      {updating ? "מעדכן..." : "שמירת שינויים"}
                    </button>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={cancelEdit}
                    >
                      ביטול
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={w.id} className="work-row-block">
                <div className="work-row">
                  <button
                    className="work-title font-display work-title-btn"
                    onClick={() => setViewingId(isViewing ? null : w.id)}
                    title="הצג/הסתר את תוכן היצירה"
                  >
                    {w.title}
                  </button>
                  <span className="work-meta">
                    {w.category} · {w.year}
                  </span>
                  {w.featured && <span className="featured-pill">נבחרת</span>}
                  <div className="work-actions">
                    <button
                      className="link-btn"
                      onClick={() => handleToggleFeatured(w)}
                    >
                      {w.featured ? "הסר מהנבחרות" : "הצג כנבחרת"}
                    </button>
                    <button className="link-btn" onClick={() => startEdit(w)}>
                      עריכה
                    </button>
                    <button
                      className="link-btn link-btn-danger"
                      onClick={() => handleRemove(w)}
                    >
                      מחיקה
                    </button>
                  </div>
                </div>
                {isViewing && (
                  <div className="work-content-view">
                    {w.content ? (
                      <p>{w.content}</p>
                    ) : (
                      <p className="text-muted">
                        עדיין לא נכתב תוכן ליצירה זו. לחצו "עריכה" כדי להוסיף.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {works.length === 0 && (
            <p className="text-muted text-sm py-6 text-center">
              אין עדיין יצירות. הוסיפו את הראשונה.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MessagesTab({ messages, loading, onMarkRead, onDelete }) {
  const markRead = async (id) => {
    try {
      await onMarkRead(id);
    } catch (err) {
      console.error("שגיאה בעדכון הודעה:", err);
    }
  };
  const deleteMessage = async (m) => {
    const confirmed = window.confirm(
      `למחוק את ההודעה מ-"${m.name}"?\nלא ניתן לשחזר את ההודעה לאחר המחיקה.`,
    );
    if (!confirmed) return;
    try {
      await onDelete(m.id);
    } catch (err) {
      console.error("שגיאה במחיקת הודעה:", err);
      alert("מחיקת ההודעה נכשלה, נסו שוב.");
    }
  };

  return (
    <div>
      <h3 className="font-display text-xl mb-6">הודעות מהאתר</h3>
      {loading ? (
        <p className="text-muted text-sm py-6 text-center">טוען הודעות...</p>
      ) : (
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
                  onClick={() => deleteMessage(m)}
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
      )}
    </div>
  );
}

function ProfileTab({ profile, loading, onSave }) {
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // מסנכרן את הטופס עם הנתונים שנטענו מ-Firestore (בטעינה הראשונית)
  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleChange = (e) => {
    setSaved(false);
    setDraft((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(draft);
      setSaved(true);
    } catch (err) {
      console.error("שגיאה בשמירת פרופיל:", err);
      alert("שמירת הפרופיל נכשלה, נסו שוב.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-muted text-sm py-6 text-center">טוען פרופיל...</p>
    );
  }

  return (
    <div>
      <h3 className="font-display text-xl mb-6">פרטי פרופיל</h3>
      <form onSubmit={handleSave} className="profile-form">
        <div className="form-row">
          <label className="form-label">שם תצוגה</label>
          <input
            name="name"
            className="form-input"
            value={draft.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label className="form-label">תקציר / Tagline</label>
          <input
            name="tagline"
            className="form-input"
            value={draft.tagline}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label className="form-label">ביוגרפיה</label>
          <textarea
            name="bio"
            rows={5}
            className="form-input form-textarea"
            value={draft.bio}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="btn-fill px-6 py-3 text-sm"
          disabled={saving}
        >
          {saving ? "שומר..." : "שמירת שינויים"}
        </button>
        {saved && <span className="saved-pill">נשמר ✓</span>}
      </form>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [works, setWorks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [visitsCount, setVisitsCount] = useState(0);

  const [loading, setLoading] = useState({
    works: true,
    messages: true,
    profile: true,
    visits: true,
  });

  // --- הגנת כניסה: אם אין userName ב-localStorage, מי שניגש לדף הזה לא ---
  // --- התחבר (או שהתנתק) → מועברים אוטומטית לדף ההתחברות, ולא נטען הדשבורד ---
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      navigate("/login", { replace: true });
      return;
    }
    setCheckingAuth(false);
  }, [navigate]);

  // --- האזנה בזמן אמת ליצירות (works) ---
  useEffect(() => {
    if (checkingAuth) return; // לא טוענים דאטה לפני שאישרנו שיש משתמש מחובר
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
          };
        });
        setWorks(data);
        setLoading((prev) => ({ ...prev, works: false }));
      },
      (err) => {
        console.error("שגיאה בטעינת יצירות:", err);
        setLoading((prev) => ({ ...prev, works: false }));
      },
    );
    return () => unsubscribe();
  }, [checkingAuth]);

  // --- האזנה בזמן אמת להודעות (messages) ---
  useEffect(() => {
    if (checkingAuth) return;
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const v = d.data();
          return {
            id: d.id,
            name: v.name || "",
            email: v.email || "",
            message: v.message || "",
            date: formatDate(v.createdAt),
            read: !!v.read,
          };
        });
        setMessages(data);
        setLoading((prev) => ({ ...prev, messages: false }));
      },
      (err) => {
        console.error("שגיאה בטעינת הודעות:", err);
        setLoading((prev) => ({ ...prev, messages: false }));
      },
    );
    return () => unsubscribe();
  }, [checkingAuth]);

  // --- האזנה בזמן אמת לביקורים בשבוע האחרון (visits) ---
  // כל טעינה של דף הבית (WriterLandingPage) רושמת דוקומנט בקולקשן "visits".
  // כאן סופרים כמה דוקומנטים כאלה נוצרו ב-7 הימים האחרונים.
  useEffect(() => {
    if (checkingAuth) return;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const q = query(
      collection(db, "visits"),
      where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVisitsCount(snapshot.size);
        setLoading((prev) => ({ ...prev, visits: false }));
      },
      (err) => {
        console.error("שגיאה בטעינת ביקורים:", err);
        setLoading((prev) => ({ ...prev, visits: false }));
      },
    );
    return () => unsubscribe();
  }, [checkingAuth]);

  // --- טעינת פרופיל חד-פעמית ---
  useEffect(() => {
    if (checkingAuth) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "profile", "main"));
        if (snap.exists()) {
          setProfile({ ...DEFAULT_PROFILE, ...snap.data() });
        } else {
          // אין עדיין דוקומנט פרופיל — שומרים את הדפולט הראשוני
          await setDoc(doc(db, "profile", "main"), DEFAULT_PROFILE);
          setProfile(DEFAULT_PROFILE);
        }
      } catch (err) {
        console.error("שגיאה בטעינת פרופיל:", err);
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    })();
  }, [checkingAuth]);

  // --- פעולות יצירות ---
  const handleAddWork = async (workData) => {
    await addDoc(collection(db, "works"), {
      ...workData,
      createdAt: serverTimestamp(),
    });
  };
  const handleRemoveWork = async (id) => {
    await deleteDoc(doc(db, "works", id));
  };
  const handleUpdateWork = async (id, data) => {
    await updateDoc(doc(db, "works", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };
  const handleToggleFeatured = async (id, featured) => {
    await updateDoc(doc(db, "works", id), { featured });
  };

  // --- פעולות הודעות ---
  const handleMarkRead = async (id) => {
    await updateDoc(doc(db, "messages", id), { read: true });
  };
  const handleDeleteMessage = async (id) => {
    await deleteDoc(doc(db, "messages", id));
  };

  // --- פעולת פרופיל ---
  const handleSaveProfile = async (newProfile) => {
    await setDoc(doc(db, "profile", "main"), newProfile, { merge: true });
    setProfile(newProfile);
  };

  // --- התנתקות: מנקה את כל פרטי המשתמש מ-localStorage ומחזירה לדף הבית ---
  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  // כל עוד לא אישרנו שיש משתמש מחובר, לא מציגים את הדשבורד בכלל
  // (מונע "הבזק" של תוכן הדשבורד לפני ההפניה לדף ההתחברות)
  if (checkingAuth) {
    return null;
  }

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
          flex-direction:column;
          gap:12px;
          background:var(--parchment-2);
          padding:16px;
          margin-bottom:18px;
          width:100%;
          box-sizing:border-box;
        }
        .work-form-row{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          width:100%;
        }
        .work-form-row .form-input{ flex:1; min-width:140px; }
        .form-input{
          background:#fff;
          border:1px solid rgba(0,0,0,0.12);
          color:var(--ink);
          padding:10px 12px;
          font-family:'Heebo', sans-serif;
          font-size:13px;
          box-sizing:border-box;
        }
        .form-input:focus{ outline:none; border-color:var(--gold); }
        .form-textarea{ resize:vertical; }

        .work-table{ border-top:1px solid rgba(0,0,0,0.08); }
        .work-row-block{ border-bottom:1px solid rgba(0,0,0,0.08); }
        .work-row{
          display:flex;
          align-items:center;
          gap:16px;
          padding:14px 4px;
        }
        .work-title{ font-size:16px; flex-shrink:0; }
        .work-title-btn{
          background:none;
          border:none;
          padding:0;
          cursor:pointer;
          text-align:right;
          color:var(--ink);
          transition:color .2s ease;
        }
        .work-title-btn:hover{ color:var(--wine); }
        .work-content-view{
          background:var(--parchment-2);
          padding:14px 16px 18px;
          margin:0 4px 14px;
          font-size:14px;
          line-height:1.8;
          color:var(--muted-2);
          white-space:pre-wrap;
        }
        .work-meta{ color:var(--muted); font-size:12px; flex:1; }
        .work-actions{ display:flex; gap:14px; flex-shrink:0; }
        .featured-check{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:12px;
          color:var(--muted-2);
          width:100%;
        }
        .featured-pill{
          font-size:10px;
          letter-spacing:.04em;
          color:var(--wine);
          border:1px solid rgba(122,46,58,0.3);
          padding:2px 8px;
          flex-shrink:0;
        }
        .work-content-input,
        .excerpt-input{
          width:100%;
          box-sizing:border-box;
          display:block;
        }
        .edit-work-form{
          display:flex;
          flex-direction:column;
          gap:12px;
          background:rgba(201,166,70,0.06);
          padding:16px;
          border-bottom:1px solid rgba(0,0,0,0.08);
          width:100%;
          box-sizing:border-box;
        }
        .edit-actions{
          display:flex;
          align-items:center;
          gap:16px;
          width:100%;
        }

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
            <p className="dash-brand-name font-display">
              {profile.name || BRAND.name}
            </p>
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
          <OverviewTab
            works={works}
            messages={messages}
            loading={loading}
            visitsCount={visitsCount}
            onGoTo={setTab}
          />
        )}
        {tab === "works" && (
          <WorksTab
            works={works}
            loading={loading.works}
            onAdd={handleAddWork}
            onRemove={handleRemoveWork}
            onUpdate={handleUpdateWork}
            onToggleFeatured={handleToggleFeatured}
          />
        )}
        {tab === "messages" && (
          <MessagesTab
            messages={messages}
            loading={loading.messages}
            onMarkRead={handleMarkRead}
            onDelete={handleDeleteMessage}
          />
        )}
        {tab === "profile" && (
          <ProfileTab
            profile={profile}
            loading={loading.profile}
            onSave={handleSaveProfile}
          />
        )}
      </main>
    </div>
  );
}
