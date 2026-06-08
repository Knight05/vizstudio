import Script from "next/script";

const BODY = "<div class=\"card\">\n  <div class=\"code\">404</div>\n  <h1>This chart doesn't exist. Yet.</h1>\n  <p>The page you're looking for moved, was renamed, or never shipped. The 75+ charts that did ship are one click away.</p>\n  <div class=\"bars\"><span></span><span></span><span></span><span></span><span></span></div>\n  <div class=\"row\">\n    <a class=\"btn primary\" href=\"//#library\">Browse all charts</a>\n    <a class=\"btn\" href=\"/index.html\">Back to home</a>\n  </div>\n</div>";
const STYLES = "\n:root { --bg:#0a0b14; --surface:#12141f; --border:rgba(255,255,255,0.07); --text:#eef0f7; --dim:#9aa0b4; --muted:#6b718a; --acc:#6366f1; --grad:linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#ec4899 100%); }\n* { margin:0; padding:0; box-sizing:border-box; }\nbody { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; min-height:100vh; display:grid; place-items:center; padding:24px; }\n.card { text-align:center; max-width:520px; }\n.code { font-family:'JetBrains Mono',monospace; font-size:96px; font-weight:700; letter-spacing:-0.04em; background:var(--grad); -webkit-background-clip:text; background-clip:text; color:transparent; line-height:1; }\nh1 { font-size:24px; font-weight:600; margin:18px 0 10px; letter-spacing:-0.02em; }\np { color:var(--dim); font-size:15px; line-height:1.6; margin-bottom:28px; }\n.row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }\n.btn { display:inline-block; padding:11px 22px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; color:var(--text); border:1px solid var(--border); transition:border-color .2s, transform .2s; }\n.btn:hover { border-color:rgba(255,255,255,0.25); transform:translateY(-1px); }\n.btn.primary { background:var(--grad); border:none; color:#fff; box-shadow:0 8px 24px -8px rgba(139,92,246,0.5); }\n.bars { display:flex; gap:6px; justify-content:center; align-items:flex-end; height:48px; margin-bottom:28px; }\n.bars span { width:10px; border-radius:3px; background:var(--grad); opacity:.85; animation:b 1.4s ease-in-out infinite alternate; }\n.bars span:nth-child(1){height:40%} .bars span:nth-child(2){height:75%;animation-delay:.15s} .bars span:nth-child(3){height:55%;animation-delay:.3s} .bars span:nth-child(4){height:90%;animation-delay:.45s} .bars span:nth-child(5){height:30%;animation-delay:.6s}\n@keyframes b { to { transform:scaleY(0.55); } }\n\n";

export default function NotFound() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" key="l0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" key="l1" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" key="l2" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" key="l3" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />

    </>
  );
}
