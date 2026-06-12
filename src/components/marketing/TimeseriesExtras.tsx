// Chart-specific extras for the Time Series with Annotations page.
// The icon set below is extracted 1:1 from the viz's ICON_LIBRARY (script.js),
// so the page always shows exactly what ships in the chart.

type IconDef = { key: string; label: string; viewBox: string; path: string };

const ICONS: IconDef[] = [
  { key: "sale", label: "Sale", viewBox: "0 0 24 24", path: "M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14.8l.1-.4L8.5 12h7.5c.8 0 1.5-.4 1.8-1.1l3.5-6.3c.2-.3.2-.7 0-1-.2-.4-.5-.6-.9-.6H5.2l-.7-1.5H1v2h2l3.6 7.6L5.2 13c-.1.3-.2.6-.2 1 0 1.1.9 2 2 2h12v-2H7.4c-.1 0-.2-.1-.2-.2z" },
  { key: "error", label: "Error", viewBox: "0 0 24 24", path: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" },
  { key: "note", label: "Note", viewBox: "0 0 24 24", path: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" },
  { key: "launch", label: "Launch", viewBox: "0 0 24 24", path: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" },
  { key: "campaign", label: "Campaign", viewBox: "0 0 24 24", path: "M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 6V3L5 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" },
  { key: "alert", label: "Alert", viewBox: "0 0 24 24", path: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" },
  { key: "milestone", label: "Milestone", viewBox: "0 0 24 24", path: "M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" },
  { key: "bug", label: "Bug", viewBox: "0 0 24 24", path: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" },
  { key: "holiday", label: "Holiday", viewBox: "0 0 24 24", path: "M12 2c-.5 1.5-1.5 2.5-3 3 1 .3 1.8 1 2.2 2l.8 12h2l.8-12c.4-1 1.2-1.7 2.2-2-1.5-.5-2.5-1.5-3-3zM9 7C7 7.5 5 9 5 9s1.5 1.5 4 1.8L9 7zm6 0l0 3.8c2.5-.3 4-1.8 4-1.8s-2-1.5-4-2.8zM7 10c-2 .5-4 2-4 2s2 2 5 2l-1-4zm10 0l-1 4c3 0 5-2 5-2s-2-1.5-4-2zM6 20c0 0 2 2 6 2s6-2 6-2c0 0-2.5 1-6 1s-6-1-6-1z" },
  { key: "info", label: "Info", viewBox: "0 0 24 24", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" },
  { key: "fish", label: "Fish", viewBox: "0 0 24 24", path: "M12 12c3.5-3.5 8-4 8-4s-.5 4.5-4 8c-1-1-2.5-2.5-4-4zm-1 1c-1.5 1.5-2.5 4-2.5 4s2.5-1 4-2.5L11 13zM7.5 11c0 0-2 1-3.5 3.5C5.5 13 7.5 11 7.5 11zM17 3.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" },
  { key: "plane", label: "Plane", viewBox: "0 0 24 24", path: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" },
  { key: "money", label: "Money", viewBox: "0 0 24 24", path: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" },
  { key: "star", label: "Star", viewBox: "0 0 24 24", path: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" },
  { key: "heart", label: "Heart", viewBox: "0 0 24 24", path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
  { key: "check", label: "Check", viewBox: "0 0 24 24", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
  { key: "clock", label: "Clock", viewBox: "0 0 24 24", path: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" },
  { key: "gift", label: "Gift", viewBox: "0 0 24 24", path: "M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" },
  { key: "mail", label: "Mail", viewBox: "0 0 24 24", path: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
  { key: "trophy", label: "Trophy", viewBox: "0 0 24 24", path: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" },
  { key: "lightbulb", label: "Idea", viewBox: "0 0 24 24", path: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" },
  { key: "rocket", label: "Release", viewBox: "0 0 24 24", path: "M13.13 22.19l-1.63-3.83c1.81-.66 3.51-1.55 5.05-2.61l-3.42 6.44zM5.64 12.5l-3.83-1.63L8.25 7.45c-1.06 1.54-1.95 3.24-2.61 5.05zM21.61 2.39S16.66.269 11 5.93c-2.19 2.19-3.5 4.6-4.35 6.92-.28.78-.07 1.65.55 2.27l1.69 1.68c.61.61 1.48.83 2.26.55 2.33-.84 4.74-2.16 6.93-4.35 5.66-5.66 3.53-10.61 3.53-10.61zm-7.07 7.07c-.78-.78-.78-2.05 0-2.83.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83-.78.78-2.05.78-2.83 0zM5.5 17c-.83 0-1.5.67-1.5 1.5 0 1.5-3 4-3 4s2.5 1 4 1c1.83 0 3-1.17 3-3 0-.83-.67-1.5-1.5-1.5z" },
  { key: "lock", label: "Security", viewBox: "0 0 24 24", path: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" },
  { key: "target", label: "Goal", viewBox: "0 0 24 24", path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" },
  { key: "calendar", label: "Calendar", viewBox: "0 0 24 24", path: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" },
  { key: "sunny", label: "Sunny", viewBox: "0 0 24 24", path: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" },
  { key: "cloudy", label: "Cloudy", viewBox: "0 0 24 24", path: "M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z" },
  { key: "rain", label: "Rain", viewBox: "0 0 24 24", path: "M17.5 13c2.49 0 4.5-2.01 4.5-4.5S19.99 4 17.5 4c-.94 0-1.81.29-2.53.78C13.74 2.79 11.53 1.5 9 1.5 5.41 1.5 2.5 4.41 2.5 8c0 .19.01.39.03.58C1.04 9.27 0 10.76 0 12.5 0 14.99 2.01 17 4.5 17h13zM6 19l-1.5 3h2l1.5-3H6zm4 0l-1.5 3h2l1.5-3h-2zm4 0l-1.5 3h2l1.5-3h-2z" },
  { key: "snow", label: "Snow", viewBox: "0 0 24 24", path: "M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L15.83 13H22z" },
  { key: "storm", label: "Storm", viewBox: "0 0 24 24", path: "M7 2v11h3v9l7-12h-4l4-8z" },
];

export default function TimeseriesExtras() {
  return (
    <>
      <h2>30 icons, ready to go</h2>
      <p>
        Every annotation gets an icon, a color, and a label, pinned to the exact
        date it happened. Pick from 30 built-in icons &mdash; a cart for sales, a
        rocket for releases, a storm cloud for the day everything went sideways
        &mdash; or choose <strong>Custom</strong> and type any emoji.
      </p>
      <div
        className="ts-icon-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))",
          gap: 10,
          margin: "18px 0 8px",
        }}
      >
        {ICONS.map((icon) => (
          <div
            key={icon.key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "14px 6px 10px",
              borderRadius: 12,
              border: "1px solid var(--border, rgba(255,255,255,.08))",
              background: "var(--card, rgba(255,255,255,.03))",
            }}
          >
            <svg
              viewBox={icon.viewBox}
              width={22}
              height={22}
              aria-hidden="true"
              style={{ fill: "var(--accent, #7c6cff)", opacity: 0.9 }}
            >
              <path d={icon.path} />
            </svg>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              {icon.label}
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
        Need something that isn&apos;t here? The 31st option is{" "}
        <strong>Custom</strong>: any emoji or short text becomes a marker.
      </p>

      <h2>Add icons to your chart</h2>
      <p>
        Icons are keyword-matched, so your data stays simple: a date, a label,
        and a one-word type. The chart does the rest.
      </p>
      <ol
        style={{
          color: "var(--text-dim)",
          paddingLeft: 18,
          listStyleType: "decimal",
        }}
      >
        <li>
          Bind your date and metrics as usual, then add an{" "}
          <strong>Annotation Label</strong> and an{" "}
          <strong>Annotation Type</strong> dimension from your events data.
        </li>
        <li>
          In the <strong>Style</strong> panel, set up to{" "}
          <strong>10 annotation types</strong>. Each type gets a keyword (say,{" "}
          <em>launch</em>), an icon, and a color.
        </li>
        <li>
          Any event whose type matches a keyword shows up on the timeline with
          that icon. Hover for the full label.
        </li>
      </ol>

      <h2>Easy ways to link annotations</h2>
      <p>
        Annotations come from data, so there&apos;s nothing to redraw when plans
        change. Two setups our customers love:
      </p>
      <div className="use-cases">
        <div className="use-case">
          <div className="tag">Google Sheets blend</div>
          <div className="body">
            Keep a simple sheet &mdash; date, label, type &mdash; and blend it
            with your metrics on the date field. Anyone on the team can add an
            event by typing one row. No chart edits, ever.
          </div>
        </div>
        <div className="use-case">
          <div className="tag">Google Calendar Connector</div>
          <div className="body">
            Point our{" "}
            <a href="/google-calendar-connector">Google Calendar Connector</a>{" "}
            at a shared events calendar and launches, campaigns, and holidays
            land on your chart automatically &mdash; the calendar you already
            keep becomes the annotation layer.
          </div>
        </div>
      </div>
    </>
  );
}
