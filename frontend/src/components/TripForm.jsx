import { useState } from "react";

const STYLES = [
  { id: "culture", label: "🏛️ Culture" },
  { id: "adventure", label: "🧗 Adventure" },
  { id: "food", label: "🍜 Food & Drink" },
  { id: "nature", label: "🌿 Nature" },
  { id: "relaxation", label: "🏖️ Relaxation" },
  { id: "shopping", label: "🛍️ Shopping" },
  { id: "nightlife", label: "🎶 Nightlife" },
  { id: "history", label: "🏺 History" },
];

const BUDGETS = [
  { id: "Budget ($0–$100/day)", label: "Budget", icon: "🏕️", sub: "$0–$100/day" },
  { id: "Mid-range ($100–$250/day)", label: "Mid-range", icon: "🏨", sub: "$100–$250/day" },
  { id: "Luxury ($250+/day)", label: "Luxury", icon: "✨", sub: "$250+/day" },
];

const DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 14];

const DIETARY = [
  { id: "Vegetarian", label: "🥦 Vegetarian" },
  { id: "Vegan", label: "🌱 Vegan" },
  { id: "Halal", label: "☪️ Halal" },
  { id: "Gluten-free", label: "🌾 Gluten-free" },
  { id: "Kosher", label: "✡️ Kosher" },
  { id: "Dairy-free", label: "🥛 Dairy-free" },
];

export default function TripForm({ onSubmit, loading }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState("Mid-range ($100–$250/day)");
  const [styles, setStyles] = useState(["culture", "food"]);
  const [travelers, setTravelers] = useState(2);
  const [dietary, setDietary] = useState([]);

  function toggleDietary(id) {
    setDietary((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function toggleStyle(id) {
    setStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!destination.trim() || loading) return;
    onSubmit({ destination: destination.trim(), days, budget, styles, travelers, dietary });
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {/* Logo */}
      <div style={s.header}>
        <div style={s.logoWrap}>
          <span style={s.logoEmoji}>✈️</span>
        </div>
        <div>
          <div style={s.logoTitle}>Trip Planner</div>
          <div style={s.logoSub}>AI-powered itineraries</div>
        </div>
      </div>

      <div style={s.divider} />

      {/* Destination */}
      <div style={s.field}>
        <label style={s.label}>Destination</label>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}>📍</span>
          <input
            style={s.input}
            type="text"
            placeholder="Tokyo, Paris, Bali…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Duration */}
      <div style={s.field}>
        <label style={s.label}>Duration</label>
        <div style={s.dayGrid}>
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              style={days === d ? s.dayBtnActive : s.dayBtn}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Travelers */}
      <div style={s.field}>
        <label style={s.label}>Travelers</label>
        <div style={s.stepRow}>
          <button type="button" style={s.stepBtn} onClick={() => setTravelers((v) => Math.max(1, v - 1))}>−</button>
          <span style={s.stepVal}>
            {travelers} {travelers === 1 ? "person" : "people"}
          </span>
          <button type="button" style={s.stepBtn} onClick={() => setTravelers((v) => Math.min(20, v + 1))}>+</button>
        </div>
      </div>

      {/* Budget */}
      <div style={s.field}>
        <label style={s.label}>Budget</label>
        <div style={s.budgetRow}>
          {BUDGETS.map((b) => (
            <button
              key={b.id}
              type="button"
              style={budget === b.id ? s.budgetCardActive : s.budgetCard}
              onClick={() => setBudget(b.id)}
            >
              <span style={s.budgetIcon}>{b.icon}</span>
              <span style={s.budgetLabel}>{b.label}</span>
              <span style={s.budgetSub}>{b.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Style */}
      <div style={s.field}>
        <label style={s.label}>Travel style</label>
        <div style={s.styleGrid}>
          {STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              style={styles.includes(st.id) ? s.chipActive : s.chip}
              onClick={() => toggleStyle(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary */}
      <div style={s.field}>
        <label style={s.label}>Dietary preferences</label>
        <div style={s.styleGrid}>
          {DIETARY.map((d) => (
            <button
              key={d.id}
              type="button"
              style={dietary.includes(d.id) ? s.chipActive : s.chip}
              onClick={() => toggleDietary(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button style={loading ? s.submitLoading : s.submit} type="submit" disabled={loading || !destination.trim()}>
        {loading ? (
          <span style={s.submitInner}>
            <span style={s.spinner} /> Planning…
          </span>
        ) : (
          "Plan My Trip ✈️"
        )}
      </button>

      <style>{`
        input::placeholder { color: #4b5563; }
        input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}

const s = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
    padding: "28px 22px 32px",
    height: "100%",
    overflowY: "auto",
  },
  header: { display: "flex", alignItems: "center", gap: 12 },
  logoWrap: {
    width: 42, height: 42,
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20,
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  logoEmoji: { fontSize: 20 },
  logoTitle: { fontSize: 16, fontWeight: 700, color: "#f9fafb" },
  logoSub: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  divider: { height: 1, background: "#1f2937" },
  field: { display: "flex", flexDirection: "column", gap: 9 },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: 12, top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14, pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 14px 10px 36px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 10,
    color: "#f9fafb",
    fontSize: 14,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  dayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
  },
  dayBtn: {
    padding: "8px 4px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 8,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  dayBtnActive: {
    padding: "8px 4px",
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    border: "1px solid transparent",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
  },
  stepRow: { display: "flex", alignItems: "center", gap: 0, background: "#111827", borderRadius: 10, border: "1px solid #1f2937", overflow: "hidden" },
  stepBtn: {
    width: 40, height: 40,
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: 20,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  },
  stepVal: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "#f9fafb",
  },
  budgetRow: { display: "flex", gap: 6 },
  budgetCard: {
    flex: 1,
    padding: "10px 6px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    transition: "all 0.15s",
  },
  budgetCardActive: {
    flex: 1,
    padding: "10px 6px",
    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2))",
    border: "1px solid #6366f1",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    boxShadow: "0 0 12px rgba(99,102,241,0.2)",
  },
  budgetIcon: { fontSize: 18 },
  budgetLabel: { fontSize: 12, fontWeight: 700, color: "#f9fafb" },
  budgetSub: { fontSize: 10, color: "#6b7280" },
  styleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
  },
  chip: {
    padding: "8px 10px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 8,
    color: "#6b7280",
    fontSize: 12,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },
  chipActive: {
    padding: "8px 10px",
    background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(59,130,246,0.25))",
    border: "1px solid #6366f1",
    borderRadius: 8,
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
  submit: {
    marginTop: 4,
    padding: "13px",
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
    transition: "opacity 0.2s, transform 0.1s",
  },
  submitLoading: {
    marginTop: 4,
    padding: "13px",
    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
    color: "rgba(255,255,255,0.7)",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "not-allowed",
  },
  submitInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  spinner: {
    width: 16, height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
};
