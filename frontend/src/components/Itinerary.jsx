import { useState } from "react";

const TIME_CONFIG = {
  "Morning":   { icon: "🌅", color: "#fbbf24", bg: "rgba(251,191,36,0.07)" },
  "Afternoon": { icon: "☀️", color: "#60a5fa", bg: "rgba(96,165,250,0.07)" },
  "Evening":   { icon: "🌙", color: "#a78bfa", bg: "rgba(167,139,250,0.07)" },
};

const SECTION_ICONS = {
  "💰": { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
  "🏨": { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  "🚌": { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
  "💡": { color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
  "☀️": { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
};

function extractName(text) {
  const match = text.match(/\[([^\]]+)\]/);
  return match ? match[1] : null;
}

function cleanText(text) {
  return text.replace(/\[[^\]]+\]/g, (m) => m.slice(1, -1));
}

function activityBookingUrl(name, destination) {
  return `https://www.viator.com/search?text=${encodeURIComponent(name + " " + destination)}`;
}

function restaurantUrl(name, destination) {
  return `https://www.google.com/maps/search/${encodeURIComponent(name + " " + destination + " restaurant")}`;
}

function imageUrl(keyword, w = 400, h = 220) {
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keyword)},travel`;
}

function ItemCard({ line, destination, showMedia }) {
  const isRestaurant = line.includes("🍽️");
  const isActivity = line.includes("🎯");
  const name = extractName(line);
  const display = cleanText(line).replace(/^[🎯🍽️]\s*/, "").trim();
  const [imgError, setImgError] = useState(false);

  if (!name) {
    return <li style={c.plainItem}><span style={c.chevron}>›</span><span>{display}</span></li>;
  }

  const url = isRestaurant
    ? restaurantUrl(name, destination)
    : activityBookingUrl(name, destination);

  const imgKeyword = isRestaurant ? `${name} restaurant food` : `${name} ${destination}`;
  const linkLabel = isRestaurant ? "View on Maps" : "Book Activity";
  const linkColor = isRestaurant ? "#34d399" : "#6366f1";

  return (
    <li style={c.itemCard}>
      {showMedia && !imgError && (
        <img
          src={imageUrl(imgKeyword)}
          alt={name}
          style={c.itemImg}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
      <div style={c.itemBody}>
        <div style={c.itemTop}>
          <span style={{ ...c.itemType, background: isRestaurant ? "rgba(52,211,153,0.15)" : "rgba(99,102,241,0.15)", color: isRestaurant ? "#34d399" : "#a78bfa" }}>
            {isRestaurant ? "🍽️ Restaurant" : "🎯 Activity"}
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ ...c.itemLink, color: linkColor, borderColor: linkColor + "40" }}>
            {linkLabel} ↗
          </a>
        </div>
        <div style={c.itemName}>{name}</div>
        <div style={c.itemDesc}>{display.split("—").slice(1).join("—").trim() || display}</div>
      </div>
    </li>
  );
}

function DayCard({ day, index, destination, showMedia }) {
  return (
    <div style={{ ...c.dayCard, animationDelay: `${index * 0.08}s` }} className="fade-up">
      {showMedia && (
        <div style={c.dayImgWrap}>
          <img
            src={imageUrl(`${destination} ${day.title.replace(/^Day \d+:\s*/i, "")}`, 800, 240)}
            alt={day.title}
            style={c.dayImg}
            loading="lazy"
          />
          <div style={c.dayImgOverlay} />
          <div style={c.dayImgLabel}>
            <span style={c.dayNumBadge}>Day {index + 1}</span>
            <span style={c.dayImgTitle}>{day.title.replace(/^Day \d+:\s*/i, "")}</span>
          </div>
        </div>
      )}

      {!showMedia && (
        <div style={c.dayHeader}>
          <span style={c.dayNumBadge}>Day {index + 1}</span>
          <span style={c.dayTitleText}>{day.title.replace(/^Day \d+:\s*/i, "")}</span>
        </div>
      )}

      <div style={c.periods}>
        {day.periods.map((period) => {
          const cfg = TIME_CONFIG[period.name] || {};
          return (
            <div key={period.name} style={{ ...c.period, background: cfg.bg }}>
              <div style={c.periodHeader}>
                <span style={c.periodIcon}>{cfg.icon}</span>
                <span style={{ ...c.periodName, color: cfg.color }}>{period.name}</span>
                {period.budget && (
                  <span style={c.budgetPill}>{period.budget.replace("💰 ", "")}</span>
                )}
              </div>
              <ul style={c.itemList}>
                {period.items.map((item, i) => (
                  <ItemCard key={i} line={item} destination={destination} showMedia={showMedia} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExtraCard({ section }) {
  const emoji = section.title.split(" ")[0];
  const cfg = SECTION_ICONS[emoji] || { color: "#9ca3af", bg: "rgba(156,163,175,0.06)", border: "rgba(156,163,175,0.2)" };

  return (
    <div style={{ ...c.extraCard, background: cfg.bg, borderColor: cfg.border }}>
      <div style={{ ...c.extraTitle, color: cfg.color }}>{section.title}</div>
      <ul style={c.extraItems}>
        {section.content.map((line, i) => {
          const text = cleanText(line.replace(/^[-•🎯🍽️]\s*/, "")).trim();
          if (!text) return null;
          return (
            <li key={i} style={c.extraItem}>
              <span style={{ ...c.chevron, color: cfg.color }}>›</span>
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function parseItinerary(text) {
  const sections = text.split(/\n(?=## )/).filter(Boolean);
  const days = [];
  const extras = [];

  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0].replace("## ", "").trim();

    if (/^Day \d+/i.test(header)) {
      const day = { title: header, periods: [] };
      let currentPeriod = null;

      for (const line of lines.slice(1)) {
        const trimmed = line.trim();
        const clean = trimmed.replace(/\*\*/g, "");

        if (TIME_CONFIG[clean]) {
          currentPeriod = { name: clean, items: [], budget: "" };
          day.periods.push(currentPeriod);
        } else if (currentPeriod && trimmed.startsWith("💰")) {
          currentPeriod.budget = trimmed;
        } else if (currentPeriod && (trimmed.startsWith("- ") || trimmed.startsWith("🎯") || trimmed.startsWith("🍽️"))) {
          currentPeriod.items.push(trimmed.replace(/^- /, ""));
        }
      }
      if (day.periods.length > 0) days.push(day);
    } else if (header && !header.startsWith("---")) {
      const content = lines.slice(1).filter((l) => l.trim() && l.trim() !== "---");
      extras.push({ title: header, content });
    }
  }

  return { days, extras };
}

export default function Itinerary({ text, streaming, destination }) {
  const { days, extras } = parseItinerary(text || "");
  const showMedia = !streaming && days.length > 0;
  const hasStructure = days.length > 0;

  if (!text) return null;

  if (!hasStructure) {
    return (
      <div style={c.rawText}>
        {text}
        {streaming && <span style={c.cursor}>▋</span>}
      </div>
    );
  }

  return (
    <div>
      <div style={c.dayGrid}>
        {days.map((day, i) => (
          <DayCard key={i} day={day} index={i} destination={destination} showMedia={showMedia} />
        ))}
      </div>

      {streaming && (
        <div style={c.streamTail}>
          <span style={c.cursor}>▋</span>
          <span style={{ color: "#4b5563", fontSize: 13, marginLeft: 10 }}>Writing your itinerary…</span>
        </div>
      )}

      {extras.length > 0 && !streaming && (
        <div style={c.extraGrid}>
          {extras.map((ex, i) => <ExtraCard key={i} section={ex} />)}
        </div>
      )}
    </div>
  );
}

const c = {
  dayGrid: { display: "flex", flexDirection: "column", gap: 24 },

  dayCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    overflow: "hidden",
    animation: "fadeUp 0.4s ease forwards",
    opacity: 0,
  },

  dayImgWrap: { position: "relative", height: 200, overflow: "hidden" },
  dayImg: { width: "100%", height: "100%", objectFit: "cover" },
  dayImgOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.3) 60%, transparent 100%)",
  },
  dayImgLabel: {
    position: "absolute", bottom: 16, left: 20,
    display: "flex", alignItems: "center", gap: 10,
  },
  dayNumBadge: {
    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
    color: "#fff",
    fontSize: 11, fontWeight: 800,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  dayImgTitle: { fontSize: 17, fontWeight: 700, color: "#f9fafb" },

  dayHeader: {
    padding: "16px 20px",
    display: "flex", alignItems: "center", gap: 10,
    borderBottom: "1px solid #1f2937",
    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.05))",
  },
  dayTitleText: { fontSize: 15, fontWeight: 700, color: "#e5e7eb" },

  periods: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 },

  period: { borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.04)" },
  periodHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  periodIcon: { fontSize: 15 },
  periodName: { fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" },
  budgetPill: {
    marginLeft: "auto",
    fontSize: 11, color: "#fbbf24", fontWeight: 600,
    background: "rgba(251,191,36,0.1)", padding: "2px 10px", borderRadius: 20,
  },

  itemList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 12 },

  itemCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    overflow: "hidden",
  },
  itemImg: { width: "100%", height: 160, objectFit: "cover", display: "block" },
  itemBody: { padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 },
  itemTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  itemType: {
    fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 12,
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
  itemLink: {
    fontSize: 11, fontWeight: 700,
    textDecoration: "none",
    padding: "3px 10px", borderRadius: 12,
    border: "1px solid",
    transition: "opacity 0.15s",
  },
  itemName: { fontSize: 14, fontWeight: 700, color: "#f3f4f6" },
  itemDesc: { fontSize: 12, color: "#9ca3af", lineHeight: 1.6 },

  plainItem: {
    display: "flex", gap: 8, fontSize: 13, color: "#d1d5db",
    lineHeight: 1.6, alignItems: "flex-start",
    padding: "4px 0",
  },
  chevron: { color: "#6366f1", fontWeight: 700, fontSize: 16, lineHeight: 1.4, flexShrink: 0 },

  streamTail: { display: "flex", alignItems: "center", padding: "16px 0" },
  cursor: { color: "#6366f1", animation: "blink 1s infinite", fontSize: 22 },

  extraGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16, marginTop: 28,
  },
  extraCard: {
    borderRadius: 14, padding: "18px 20px",
    border: "1px solid",
    animation: "fadeUp 0.4s ease forwards",
  },
  extraTitle: { fontSize: 14, fontWeight: 800, marginBottom: 14 },
  extraItems: { listStyle: "none", display: "flex", flexDirection: "column", gap: 10 },
  extraItem: { display: "flex", gap: 8, fontSize: 13, color: "#d1d5db", lineHeight: 1.5, alignItems: "flex-start" },

  rawText: { fontSize: 14, color: "#d1d5db", lineHeight: 1.8, whiteSpace: "pre-wrap" },
};
