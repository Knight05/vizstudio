import ClientScripts from "@/components/ClientScripts";
import type { Metadata } from "next";
export const metadata: Metadata = {
  "title": "How to Add a Community Chart to Data Studio | vizstudio",
  "description": "Step-by-step guide with screenshots: add any vizstudio community visualization to a Data Studio report in under 4 minutes, no code required.",
  "alternates": { "canonical": "https://vizstudio.io/how-to-add-a-chart" },
  "openGraph": {
    "type": "article",
    "url": "https://vizstudio.io/how-to-add-a-chart",
    "title": "How to Add a Community Chart to Data Studio | vizstudio",
    "description": "Step-by-step guide with screenshots: add any vizstudio community visualization to a Data Studio report in under 4 minutes, no code required.",
    "images": ["https://vizstudio.io/images/guide/02-toolbar-community-button.png"]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "How to Add a Community Chart to Data Studio | vizstudio",
    "description": "Add any vizstudio community visualization to a Data Studio report in under 4 minutes, no code required."
  }
};

// HowTo structured data generated from the 10 steps below.
const GUIDE_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to add a community chart to Data Studio (formerly Looker Studio)",
    "description": "Step-by-step guide: add any vizstudio community visualization to a Data Studio report in under 4 minutes, no code required.",
    "totalTime": "PT4M",
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Google Data Studio (formerly Looker Studio) report with edit access"
      },
      {
        "@type": "HowToTool",
        "name": "vizstudio manifest path (gs:// bucket path)"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Open a report in Edit mode",
        "text": "Sign in at datastudio.google.com and open the report you want the chart in. If it opens in view mode, click Edit (top-right) to start editing. You'll know you're in when the File / Edit / View menu bar and the toolbar appear, and the top-right button now reads View.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Click the Community visualizations button",
        "text": "On the toolbar, just right of Add a chart and left of Add a control, click the small Community visualizations and components button, a grid of squares with a plus, next to a dropdown caret. It looks like this: Hover it and the tooltip confirms “Community visualizations and components”.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Choose “+ Explore more”",
        "text": "A dropdown panel opens with three areas:",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Pick “Build your own visualization”",
        "text": "A Community Gallery sheet slides up from the bottom. Click the top-left tile, Build your own visualization (the wrench icon). Don't worry, you're not building anything; this is just how Data Studio loads charts from a path.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Paste the manifest path and Submit",
        "text": "The sheet switches to Community Visualization Developers with a single Manifest path field. Paste your path, for example gs://your-bucket-id, and click Submit.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 6,
        "name": "Pick your chart",
        "text": "After Submit, every chart in the library appears as a card: name, thumbnail, description, all 75+ of them. Click a card to add it to your report.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 7,
        "name": "Grant consent to the chart",
        "text": "The first time you add a vizstudio chart, Data Studio opens a Grant consent dialog naming the visualization: for example Interactive Globe (3D Chart), by vizstudio.io. It explains that by selecting Allow you:",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 8,
        "name": "Drop in dimensions and metrics",
        "text": "Select the chart on the canvas. The right panel becomes Community visualization properties with two tabs: Setup and Style. In Setup:",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 9,
        "name": "Turn on Community visualizations access for your data source",
        "text": "A community chart can only read a data source that has opted in, and that setting is off by default. If your chart sits blank or shows a “this data source doesn't allow community visualizations” message, this is almost always why.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      },
      {
        "@type": "HowToStep",
        "position": 10,
        "name": "Style it your way",
        "text": "Click the Style tab. Every vizstudio chart ships a panel section per concern: colors, fonts, axes, legend, tooltips, labels, plus chart-specific toggles. Charts inherit your report theme by default, so they match the rest of your dashboard out of the box; override anything you like. Resize with the selection handles: every chart is fully responsive.",
        "url": "https://vizstudio.io/how-to-add-a-chart"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://vizstudio.io/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "How to add a chart",
        "item": "https://vizstudio.io/how-to-add-a-chart"
      }
    ]
  }
];

const BODY = "<div class=\"blobs\"><span class=\"blob blob-1\"></span><span class=\"blob blob-2\"></span><span class=\"blob blob-3\"></span></div>\n\n<div id=\"site-nav\"></div>\n\n<main>\n<section class=\"guide-hero\">\n  <div class=\"wrap\">\n    <div class=\"eyebrow\">Guide</div>\n    <h1>Add a community chart to <span class=\"gradient-text\">Data Studio</span></h1>\n    <p class=\"sub\">From a blank report to a fully styled vizstudio chart in ten steps. No code, no extensions, just the manifest path we send you when you get access.</p>\n  </div>\n</section>\n\n<section class=\"guide-body wrap\">\n\n  <div class=\"callout\">\n    <strong>Before you start:</strong> you'll need edit access to a Data Studio report, at least one connected data source, and your vizstudio manifest path. It looks like <code>gs://your-bucket-id</code> and arrives with your welcome email. In this guide we use the placeholder <code>gs://your-bucket-id</code>; swap in your real path wherever you see it.\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">1</span><h2>Open a report in Edit mode</h2></div>\n    <p>Sign in at <strong>datastudio.google.com</strong> and open the report you want the chart in. If it opens in view mode, click <strong>Edit</strong> (top-right) to start editing. You'll know you're in when the File / Edit / View menu bar and the toolbar appear, and the top-right button now reads <strong>View</strong>.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/01-open-report-edit-mode.webp\" type=\"image/webp\"><img src=\"/images/guide/01-open-report-edit-mode.png\" alt=\"Data Studio report in view mode with the Edit button highlighted at the top-right\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">2</span><h2>Click the Community visualizations button</h2></div>\n    <p>On the toolbar, just right of <strong>Add a chart</strong> and left of <strong>Add a control</strong>, click the small <strong>Community visualizations and components</strong> button, a grid of squares with a plus, next to a dropdown caret. It looks like this: <span class=\"ds-btn\" role=\"img\" aria-label=\"Data Studio Community visualizations and components button\"><svg width=\"31\" height=\"20\" viewBox=\"0 0 34 22\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"8\" height=\"8\" rx=\"1.6\" fill=\"#5f6368\"/><rect x=\"12\" y=\"2\" width=\"8\" height=\"8\" rx=\"1.6\" fill=\"#5f6368\"/><rect x=\"2\" y=\"12\" width=\"8\" height=\"8\" rx=\"1.6\" fill=\"#5f6368\"/><rect x=\"12\" y=\"15\" width=\"8\" height=\"2.4\" rx=\"1.2\" fill=\"#5f6368\"/><rect x=\"14.8\" y=\"12\" width=\"2.4\" height=\"8\" rx=\"1.2\" fill=\"#5f6368\"/><path d=\"M25 9 L31 9 L28 13 Z\" fill=\"#5f6368\"/></svg></span> Hover it and the tooltip confirms &ldquo;Community visualizations and components&rdquo;.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/02-toolbar-community-button.webp\" type=\"image/webp\"><img src=\"/images/guide/02-toolbar-community-button.png\" alt=\"Toolbar with the grid-with-a-plus Community visualizations and components button highlighted, between Add a chart and Add a control\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n    <div class=\"callout\">Heads-up: the old route via <strong>Insert → Community visualizations</strong> no longer exists. The toolbar button is the only way in.</div>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">3</span><h2>Choose &ldquo;+ Explore more&rdquo;</h2></div>\n    <p>A dropdown panel opens with three areas:</p>\n    <ul>\n      <li><strong>Featured</strong>: Google and partner promoted charts</li>\n      <li><strong>Added report resources</strong>: chart libraries already loaded into <em>this</em> report. If vizstudio is already here, click a chart and jump to step 8.</li>\n      <li><strong>+ Explore more</strong>: at the very bottom. Click it to load new charts.</li>\n    </ul>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/03-community-dropdown.webp\" type=\"image/webp\"><img src=\"/images/guide/03-community-dropdown.png\" alt=\"Community visualizations dropdown showing Featured, Added report resources, and Explore more\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">4</span><h2>Pick &ldquo;Build your own visualization&rdquo;</h2></div>\n    <p>A <strong>Community Gallery</strong> sheet slides up from the bottom. Click the top-left tile, <strong>Build your own visualization</strong> (the wrench icon). Don't worry, you're not building anything; this is just how Data Studio loads charts from a path.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/04-community-gallery.webp\" type=\"image/webp\"><img src=\"/images/guide/04-community-gallery.png\" alt=\"Community Gallery sheet with the Build your own visualization tile highlighted\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">5</span><h2>Paste the manifest path and Submit</h2></div>\n    <p>The sheet switches to <strong>Community Visualization Developers</strong> with a single <strong>Manifest path</strong> field. Paste your path, for example <code>gs://your-bucket-id</code>, and click <strong>Submit</strong>.</p>\n    <p>Two things to get right: it's the bucket path only (Data Studio appends <code>/manifest.json</code> automatically), and there's no trailing slash.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/05-manifest-path.webp\" type=\"image/webp\"><img src=\"/images/guide/05-manifest-path.png\" alt=\"Manifest path field with a gs:// placeholder path entered and the Submit button highlighted\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">6</span><h2>Pick your chart</h2></div>\n    <p>After Submit, every chart in the library appears as a card: name, thumbnail, description, all 75+ of them. Click a card to add it to your report.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/06-chart-picker.webp\" type=\"image/webp\"><img src=\"/images/guide/06-chart-picker.png\" alt=\"Chart picker showing community visualization cards after submitting the manifest path\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n    <div class=\"callout\">The moment you pick a chart, Data Studio asks you to <strong>grant consent</strong>, that's the next step.</div>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">7</span><h2>Grant consent to the chart</h2></div>\n    <p>The first time you add a vizstudio chart, Data Studio opens a <strong>Grant consent</strong> dialog naming the visualization: for example <em>Interactive Globe (3D Chart), by vizstudio.io</em>. It explains that by selecting <strong>Allow</strong> you:</p>\n    <ul>\n      <li>Grant the visualization access to your data, and to render it in this report</li>\n      <li>Accept the visualization's Terms of Service and Privacy Policy</li>\n      <li>Accept the Data Studio Gallery Terms of Service</li>\n    </ul>\n    <p>Click <strong>Allow</strong> and the chart drops onto your page, ready for data.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/grant-consent.webp\" type=\"image/webp\"><img src=\"/images/guide/grant-consent.png\" alt=\"Grant consent dialog naming the Waffle Chart by vizstudio.io, with Cancel and Allow buttons\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n    <div class=\"callout\">It's a one-time, per-chart, per-user consent, the standard gate for any community visualization. Once you've allowed it, the dialog won't return for this chart on your account.</div>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">8</span><h2>Drop in dimensions and metrics</h2></div>\n    <p>Select the chart on the canvas. The right panel becomes <strong>Community visualization properties</strong> with two tabs: <strong>Setup</strong> and <strong>Style</strong>. In Setup:</p>\n    <ul>\n      <li>Confirm the <strong>Data source</strong></li>\n      <li>Drag a categorical field into the <strong>Dimension</strong> slot(s)</li>\n      <li>Drag a numeric field into the <strong>Metric</strong> slot(s)</li>\n      <li>Add a Sort, Filter, or Date range as needed</li>\n      <li>Flip on <strong>Cross-filtering</strong> under Chart interactions to let clicks filter the rest of the page</li>\n    </ul>\n    <p>The chart re-renders within a second of each change.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/07-setup-panel.webp\" type=\"image/webp\"><img src=\"/images/guide/07-setup-panel.png\" alt=\"Setup tab with dimension and metric slots and the cross-filtering toggle\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">9</span><h2>Turn on Community visualizations access for your data source</h2></div>\n    <p>A community chart can only read a data source that has <strong>opted in</strong>, and that setting is <strong>off by default</strong>. If your chart sits blank or shows a &ldquo;this data source doesn't allow community visualizations&rdquo; message, this is almost always why.</p>\n    <ul>\n      <li>Open <strong>Resource → Manage added data sources</strong>, then click <strong>Edit</strong> beside the source (or click the pencil on the data source in the Setup panel).</li>\n      <li>In the data-source field editor, click <strong>Community visualization access</strong> in the top bar.</li>\n      <li>Switch it to <strong>Community visualizations access: ON</strong>, then click <strong>Done</strong> to return to your report.</li>\n    </ul>\n    <div class=\"callout\">You flip this <strong>once per data source</strong> (you'll need edit rights on that source). Every vizstudio chart that uses the same source then inherits the access, no need to repeat it. This is separate from the per-chart <strong>Grant consent</strong> dialog back in step 7.</div>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"step-head\"><span class=\"step-num\">10</span><h2>Style it your way</h2></div>\n    <p>Click the <strong>Style</strong> tab. Every vizstudio chart ships a panel section per concern: colors, fonts, axes, legend, tooltips, labels, plus chart-specific toggles. Charts inherit your <strong>report theme by default</strong>, so they match the rest of your dashboard out of the box; override anything you like. Resize with the selection handles: every chart is fully responsive.</p>\n    <figure class=\"shot\"><picture><source srcset=\"images/guide/08-style-panel.webp\" type=\"image/webp\"><img src=\"/images/guide/08-style-panel.png\" alt=\"Style tab showing color, font, axis, and legend options for the community chart\" loading=\"lazy\" decoding=\"async\"></picture></figure>\n  </div>\n\n  <div class=\"guide-cta\">\n    <h2>Ready to try it with real charts?</h2>\n    <p>Get your manifest path and all 75+ charts: free to start, no credit card.</p>\n    <div class=\"cta-row\" style=\"justify-content:center;\">\n      <a class=\"btn btn-primary\" href=\"/get-started\">Get Started →</a>\n      <a class=\"btn\" href=\"/#library\">Browse the library</a>\n    </div>\n  </div>\n\n</section>\n</main>\n\n<div id=\"site-footer\"><footer class=\"footer-fallback\"><nav aria-label=\"Footer\"><a href=\"/\">Home</a> · <a href=\"/#library\">Charts</a> · <a href=\"/get-started\">Get Started</a> · <a href=\"/suggest\">Suggest a Chart</a> · <a href=\"/privacy\">Privacy</a> · <a href=\"/terms\">Terms of Service</a></nav><p>© vizstudio, premium D3 community visualizations for Data Studio.</p></footer></div>";
const STYLES = "\n/* ── guide page ── */\n.guide-hero { padding: 72px 0 24px; text-align: center; }\n.guide-hero h1 { font-family: var(--display); font-size: clamp(30px, 5vw, 46px); font-weight: 700; letter-spacing: -0.02em; margin: 14px 0 12px; }\n.guide-hero .sub { color: var(--text-dim); font-size: 17px; line-height: 1.6; max-width: 640px; margin: 0 auto; }\n.guide-meta { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 22px; }\n.guide-meta .chip { font-family: var(--mono); font-size: 12px; color: var(--text-dim); border: 1px solid var(--border-strong); border-radius: 999px; padding: 6px 14px; background: var(--surface); }\n\n.guide-body { max-width: 880px; margin: 0 auto; padding: 24px 0 40px; }\n\n.step { margin: 0 0 56px; }\n.step-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 10px; }\n.step-num { font-family: var(--mono); font-size: 13px; font-weight: 500; color: #fff; background: var(--accent-grad); border-radius: 999px; min-width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; flex: none; transform: translateY(4px); }\n.step h2 { font-family: var(--display); font-size: 24px; font-weight: 700; letter-spacing: -0.015em; margin: 0; }\n.step p { color: var(--text-dim); font-size: 16px; line-height: 1.65; margin: 0 0 14px; }\n.step strong { color: var(--text); font-weight: 600; }\n.step ul { padding-left: 18px; color: var(--text-dim); font-size: 16px; line-height: 1.65; margin: 0 0 14px; }\n.step li { margin-bottom: 6px; }\n.step code { font-family: var(--mono); font-size: 13.5px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 2px 7px; color: var(--acc-4); }\n/* inline mock of the Data Studio toolbar button */\n.ds-btn { display: inline-flex; align-items: center; gap: 5px; vertical-align: middle; background: #fff; border: 1px solid #dadce0; border-radius: 8px; padding: 5px 9px; margin: 0 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.22); }\n.ds-btn svg { display: block; }\n\n.shot { margin: 18px 0 0; border: 1px solid var(--border-strong); border-radius: var(--r-lg); overflow: hidden; background: #fff; box-shadow: 0 20px 50px -30px rgba(0,0,0,0.8); }\n.shot img { display: block; width: 100%; height: auto; }\n.shot-cap { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 10px; }\n\n.callout { border: 1px solid var(--border-strong); border-left: 3px solid var(--acc-2); border-radius: var(--r-md); background: var(--surface); padding: 14px 18px; margin: 16px 0; color: var(--text-dim); font-size: 15px; line-height: 1.6; }\n.callout strong { color: var(--text); }\n\n.routes { width: 100%; border-collapse: collapse; margin: 16px 0 8px; font-size: 15px; }\n.routes th { text-align: left; font-family: var(--mono); font-size: 12px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; padding: 10px 14px; border-bottom: 1px solid var(--border-strong); }\n.routes td { color: var(--text-dim); padding: 12px 14px; border-bottom: 1px solid var(--border); line-height: 1.55; }\n.routes td:first-child { color: var(--text); font-weight: 600; white-space: nowrap; }\n\n.trouble { border: 1px solid var(--border); border-radius: var(--r-md); background: var(--surface); margin: 0 0 10px; }\n.trouble summary { cursor: pointer; padding: 14px 18px; font-weight: 600; color: var(--text); font-size: 15.5px; list-style: none; display: flex; justify-content: space-between; align-items: center; }\n.trouble summary::after { content: '+'; font-family: var(--mono); color: var(--muted); font-size: 18px; }\n.trouble[open] summary::after { content: '–'; }\n.trouble div { padding: 0 18px 16px; color: var(--text-dim); font-size: 15px; line-height: 1.6; }\n\n.guide-cta { text-align: center; border: 1px solid var(--border-strong); border-radius: var(--r-xl); background: var(--surface); padding: 44px 28px; margin: 56px 0 72px; }\n.guide-cta h2 { font-family: var(--display); font-size: 28px; font-weight: 700; margin: 0 0 10px; }\n.guide-cta p { color: var(--text-dim); margin: 0 0 22px; }\n@media (max-width: 640px) {\n  .guide-hero { padding-top: 48px; }\n  .step h2 { font-size: 20px; }\n}\n\n";

export default function Page() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" key="l0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" key="l1" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" key="l2" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap" key="l3" />
      <link rel="stylesheet" href="/assets/style.css" key="l4" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(GUIDE_JSONLD) }}
        key="ld"
      />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
      <ClientScripts srcs={["/assets/partials.js"]} />
    </>
  );
}
