import { useState, useEffect } from "react";
import TripForm from "./components/TripForm.jsx";
import Itinerary from "./components/Itinerary.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";

const POPULAR = [
  { name: "Tokyo, Japan", flag: "🇯🇵" },
  { name: "Paris, France", flag: "🇫🇷" },
  { name: "Bali, Indonesia", flag: "🇮🇩" },
  { name: "New York, USA", flag: "🇺🇸" },
  { name: "Rome, Italy", flag: "🇮🇹" },
  { name: "Bangkok, Thailand", flag: "🇹🇭" },
];

function flightsUrl(destination) {
  return `https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTAxLTAxagcIARIDSk5CcgcIARIDSkZLGh4SCjIwMjUtMDEtMDhqBwgBEgNKRktyBwgBEgNKTkI&q=flights+to+${encodeURIComponent(destination)}`;
}

function hotelsUrl(destination) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
}

function airbnbUrl(destination) {
  return `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes`;
}

export default function App() {
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [tripInfo, setTripInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("visitor_id", id);
    }
    fetch(`${API}/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: id }),
    })
      .then((r) => r.json())
      .then((data) => setVisitorCount(data.unique_visitors))
      .catch(() => {});
  }, []);

  async function handleSubmit(formData) {
    setItinerary("");
    setError("");
    setTripInfo(formData);
    setLoading(true);
    setStreaming(true);
    setHeroError(false);

    try {
      const response = await fetch(`${API}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after") || "60";
          setError(`Rate limit reached. Please try again in ${retryAfter} seconds.`);
        } else {
          setError(data.detail || "Something went wrong. Please try again.");
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setItinerary((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(itinerary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const showEmpty = !itinerary && !loading && !error;
  const heroImgSrc = tripInfo
    ? `https://source.unsplash.com/1200x400/?${encodeURIComponent(tripInfo.destination)}+travel+city+landmark`
    : null;

  return (
    <div style={s.root}>
      <div style={s.mesh} aria-hidden />

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <TripForm onSubmit={handleSubmit} loading={loading} />
      </aside>

      {/* Main */}
      <main style={s.main}>

        {/* Empty state */}
        {showEmpty && (
          <div style={s.empty} className="fade-up">
            <div style={s.emptyGlow} />
            <div style={s.emptyIcon}>🌍</div>
            <h1 style={s.emptyTitle}>Where to next?</h1>
            <p style={s.emptySub}>
              Describe your dream trip and get a free personalized day-by-day itinerary in seconds — with activity bookings, restaurant links, and images.
            </p>
            <div style={s.tagRow}>
              {POPULAR.map((p) => (
                <span key={p.name} style={s.tag}>{p.flag} {p.name}</span>
              ))}
            </div>
            {visitorCount !== null && (
              <div style={s.visitorBadge}>
                👥 {visitorCount.toLocaleString()} unique {visitorCount === 1 ? "visitor" : "visitors"}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={s.errorBox} className="fade-up">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !itinerary && (
          <div style={s.loadingState} className="fade-up">
            <div style={s.loadingIcon}>✈️</div>
            <p style={s.loadingText}>Planning your perfect trip…</p>
            <div style={s.dots}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ ...s.dot, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {(itinerary || (loading && itinerary)) && (
          <div style={s.content} className="fade-up">

            {/* Hero image */}
            {tripInfo && !heroError && !streaming && (
              <div style={s.heroWrap}>
                <img
                  src={heroImgSrc}
                  alt={tripInfo.destination}
                  style={s.heroImg}
                  onError={() => setHeroError(true)}
                  loading="lazy"
                />
                <div style={s.heroOverlay} />
                <div style={s.heroContent}>
                  <h1 style={s.heroTitle}>{tripInfo.destination}</h1>
                  <div style={s.heroPills}>
                    <span style={s.heroPill}>📅 {tripInfo.days} {tripInfo.days === 1 ? "day" : "days"}</span>
                    <span style={s.heroPill}>👥 {tripInfo.travelers} {tripInfo.travelers === 1 ? "traveler" : "travelers"}</span>
                    <span style={s.heroPill}>💳 {tripInfo.budget.split(" (")[0]}</span>
                    {tripInfo.dietary?.map((d) => (
                      <span key={d} style={{ ...s.heroPill, borderColor: "#34d399", color: "#34d399" }}>🥗 {d}</span>
                    ))}
                  </div>

                  {/* Quick links */}
                  <div style={s.quickLinks}>
                    <a href={flightsUrl(tripInfo.destination)} target="_blank" rel="noopener noreferrer" style={s.quickLink}>
                      ✈️ Search Flights
                    </a>
                    <a href={hotelsUrl(tripInfo.destination)} target="_blank" rel="noopener noreferrer" style={s.quickLink}>
                      🏨 Find Hotels
                    </a>
                    <a href={airbnbUrl(tripInfo.destination)} target="_blank" rel="noopener noreferrer" style={s.quickLink}>
                      🏠 Browse Airbnb
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming header (no image yet) */}
            {tripInfo && streaming && (
              <div style={s.tripHeader}>
                <div style={s.tripHeaderRow}>
                  <div>
                    <h1 style={s.tripTitle}>{tripInfo.destination}</h1>
                    <div style={s.metaRow}>
                      <span style={s.metaPill}>📅 {tripInfo.days}d</span>
                      <span style={s.metaPill}>👥 {tripInfo.travelers}</span>
                      <span style={s.metaPill}>💳 {tripInfo.budget.split(" (")[0]}</span>
                      {tripInfo.dietary?.map((d) => (
                        <span key={d} style={{ ...s.metaPill, borderColor: "#34d399", color: "#34d399" }}>🥗 {d}</span>
                      ))}
                    </div>
                  </div>
                  <div style={s.liveTag}>
                    <span style={s.liveDot} /> Generating
                  </div>
                </div>
              </div>
            )}

            {/* Copy button */}
            {itinerary && !streaming && (
              <div style={s.toolbar}>
                <button style={copied ? s.copyBtnDone : s.copyBtn} onClick={handleCopy}>
                  {copied ? "✓ Copied!" : "📋 Copy Itinerary"}
                </button>
              </div>
            )}

            <Itinerary
              text={itinerary}
              streaming={streaming}
              destination={tripInfo?.destination || ""}
            />
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: { display: "flex", height: "100vh", overflow: "hidden", position: "relative" },
  mesh: {
    position: "fixed", inset: 0,
    background: `
      radial-gradient(ellipse 80% 50% at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 60%)
    `,
    pointerEvents: "none", zIndex: 0,
  },
  sidebar: {
    width: 340, minWidth: 340,
    background: "rgba(13,19,32,0.97)",
    borderRight: "1px solid #1f2937",
    overflowY: "auto", position: "relative", zIndex: 1,
  },
  main: {
    flex: 1, overflowY: "auto",
    padding: "40px 48px",
    position: "relative", zIndex: 1,
  },

  // Empty
  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "75vh", textAlign: "center", gap: 16, position: "relative",
  },
  emptyGlow: {
    position: "absolute", width: 500, height: 500,
    background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
    borderRadius: "50%", pointerEvents: "none",
  },
  emptyIcon: { fontSize: 80, filter: "drop-shadow(0 8px 24px rgba(99,102,241,0.3))" },
  emptyTitle: { fontSize: 40, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.02em" },
  emptySub: { fontSize: 15, color: "#6b7280", maxWidth: 480, lineHeight: 1.7 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 },
  tag: { padding: "7px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1f2937", borderRadius: 24, fontSize: 13, color: "#9ca3af" },
  visitorBadge: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 16px",
    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 20, fontSize: 12, color: "#818cf8", fontWeight: 500,
    marginTop: 4,
  },

  // Error
  errorBox: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 12, padding: "14px 18px", color: "#fca5a5",
    fontSize: 14, display: "flex", gap: 10, alignItems: "center", maxWidth: 600,
  },

  // Loading
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 },
  loadingIcon: { fontSize: 56, animation: "pulse 2s ease infinite" },
  loadingText: { fontSize: 16, color: "#6b7280", fontWeight: 500 },
  dots: { display: "flex", gap: 6 },
  dot: { width: 8, height: 8, background: "#6366f1", borderRadius: "50%", display: "inline-block", animation: "pulse 1.2s ease infinite" },

  // Content
  content: { maxWidth: 820 },

  // Hero image
  heroWrap: {
    position: "relative", borderRadius: 20, overflow: "hidden",
    height: 320, marginBottom: 28,
    border: "1px solid #1f2937",
  },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(7,11,20,0.95) 0%, rgba(7,11,20,0.5) 50%, rgba(7,11,20,0.1) 100%)",
  },
  heroContent: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: "24px 28px",
  },
  heroTitle: { fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 10 },
  heroPills: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  heroPill: {
    padding: "4px 12px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 20, fontSize: 12, color: "#e5e7eb", fontWeight: 500,
    backdropFilter: "blur(8px)",
  },
  quickLinks: { display: "flex", gap: 8, flexWrap: "wrap" },
  quickLink: {
    padding: "7px 14px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 20,
    color: "#fff", fontSize: 12, fontWeight: 600,
    textDecoration: "none",
    backdropFilter: "blur(8px)",
    transition: "background 0.2s",
  },

  // Streaming header
  tripHeader: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.05))",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 16, padding: "20px 24px", marginBottom: 24,
  },
  tripHeaderRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  tripTitle: { fontSize: 26, fontWeight: 800, color: "#f9fafb", letterSpacing: "-0.02em", marginBottom: 10 },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  metaPill: {
    padding: "4px 12px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, fontSize: 12, color: "#9ca3af", fontWeight: 500,
  },
  liveTag: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12, color: "#34d399", fontWeight: 700,
    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
    borderRadius: 20, padding: "5px 12px", whiteSpace: "nowrap",
  },
  liveDot: { width: 7, height: 7, background: "#34d399", borderRadius: "50%", display: "inline-block", animation: "livePulse 1s ease infinite" },

  // Toolbar
  toolbar: { display: "flex", gap: 10, marginBottom: 20 },
  copyBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.06)", border: "1px solid #1f2937",
    borderRadius: 10, color: "#9ca3af", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
  },
  copyBtnDone: {
    padding: "8px 16px",
    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: 10, color: "#34d399", fontSize: 13, fontWeight: 600,
    cursor: "pointer",
  },
};
