import ClientScripts from "@/components/ClientScripts";
import type { Metadata } from "next";
export const metadata: Metadata = {
  "title": "Google Calendar Connector for Data Studio | vizstudio",
  "description": "Bring your Google Calendar data into Data Studio. Add multiple calendars by calendar ID (sales and holiday calendars in one report) and see which events made sales skyrocket.",
  "alternates": {
    "canonical": "https://vizstudio.io/google-calendar-connector"
  },
  "openGraph": {
    "type": "website",
    "url": "https://vizstudio.io/google-calendar-connector",
    "title": "Google Calendar Connector for Data Studio | vizstudio",
    "description": "Bring your Google Calendar data into Data Studio. Add multiple calendars by calendar ID (sales and holiday calendars in one report) and see which events made sales skyrocket.",
    "images": [
      "https://vizstudio.io/screenshots/data-studio-big-calendar-events-vizstudio.png"
    ]
  },
  "twitter": {
    "card": "summary_large_image",
    "images": [
      "https://vizstudio.io/screenshots/data-studio-big-calendar-events-vizstudio.png"
    ]
  }
};

// Structured data: the connector app, its FAQ, and breadcrumbs.
const CONNECTOR_JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Google Calendar Connector for Looker Studio",
    "url": "https://vizstudio.io/google-calendar-connector",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "A community connector that brings Google Calendar data into Looker Studio (Data Studio). Add multiple calendars by calendar ID and blend events with your sales data.",
    "image": "https://vizstudio.io/screenshots/data-studio-big-calendar-events-vizstudio.png",
    "isPartOf": {
      "@type": "SoftwareApplication",
      "name": "vizstudio",
      "url": "https://vizstudio.io/"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "50",
      "highPrice": "500",
      "url": "https://vizstudio.io/pricing"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Does my calendar data pass through vizstudio servers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The connector runs in Google's own Apps Script infrastructure and talks directly to the Google Calendar API. Your events go from Google to Google. We never see them."
        }
      },
      {
        "@type": "Question",
        "name": "Can I connect more than one calendar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, enter multiple Calendar IDs (your own, shared team calendars, a sales or holiday calendar, room resources) and each event row carries its calendar name. Link them all to one report and split or blend them however you like."
        }
      },
      {
        "@type": "Question",
        "name": "Can I overlay calendar events on my sales data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, that's the headline use case. Blend the connector with your sales source on date, and events from your sales and holiday calendars line up against revenue. When a number skyrockets, the event that caused it is right there in the chart."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need the vizstudio charts to use the connector?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, connector data works with every native Data Studio chart. But calendars are awkward in stock charts, which is why the plan ships both together."
        }
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
        "name": "Google Calendar Connector",
        "item": "https://vizstudio.io/google-calendar-connector"
      }
    ]
  }
];

const BODY = "<div class=\"blobs\"><span class=\"blob blob-1\"></span><span class=\"blob blob-2\"></span><span class=\"blob blob-3\"></span></div>\n<div id=\"site-nav\"></div>\n\n<main>\n<div class=\"wrap\">\n  <div class=\"crumbs\"><a href=\"/\">vizstudio</a><span>/</span><span>Google Calendar Connector</span></div>\n</div>\n\n<section class=\"chart-hero\">\n  <div class=\"wrap\">\n    <div class=\"chart-hero-grid\">\n      <div>\n        <div class=\"chart-title-row\">\n          <span class=\"chart-hero-icon\"><img src=\"/icons/google-calendar.svg\" alt=\"Google Calendar\" width=\"96\" height=\"96\"></span>\n          <h1 class=\"chart-title\">Google Calendar Connector</h1>\n        </div>\n        <div class=\"chart-eyebrow\">A community connector for Data Studio, formerly known as Looker Studio.</div>\n        <p class=\"chart-tagline\">Bring your Google Calendar data into Data Studio. Add as many calendars as you like by calendar ID: link your sales and holiday calendars to the same report and see exactly which events made sales skyrocket.</p>\n        <div class=\"chart-cta-row\">\n          <a class=\"btn btn-primary\" href=\"/get-started\">Get the connector →</a>\n          <a class=\"btn\" href=\"#charts\">See the calendar charts</a>\n        </div>\n        <div class=\"chart-trust\">\n          <span>20+ fields</span>\n          <span>Multiple calendars</span>\n          <span>Free trial</span>\n        </div>\n      </div>\n      <div>\n        <div class=\"chart-preview\">\n          <div class=\"preview-bar\"><span class=\"dot\"></span><span class=\"dot\"></span><span class=\"dot\"></span></div>\n          <img class=\"preview-img\" src=\"/screenshots/data-studio-big-calendar-events-vizstudio.webp\" alt=\"Google Calendar events in the Big Calendar chart for Data Studio\" loading=\"lazy\">\n        </div>\n      </div>\n    </div>\n  </div>\n</section>\n\n<section class=\"content\">\n  <div class=\"wrap\">\n    <div class=\"content-grid\">\n      <div class=\"prose\">\n        <h2>What it is</h2>\n        <p>A Data Studio community connector that treats Google Calendar like the data source it secretly is. Add multiple calendars by calendar ID (your sales calendar, your holiday calendar, the promo schedule, team calendars) and every event arrives as a row: title, start, end, duration, attendees, location, calendar name. From there it behaves like any other source: blend it, filter it, chart it.</p>\n\n        <h2>Put events next to your numbers</h2>\n        <p>Sales spiked on the 14th. Was that the flash sale, the email send, or a long weekend? Link your sales and holiday calendars to the same report your revenue lives in, and the answer stops being a guess. Blend calendar events with your sales source by date and every spike gets a label. The events that made sales skyrocket become the easiest thing on the page to see, and to repeat.</p>\n\n        <h2>What else you can answer with it</h2>\n        <p>How many hours did the team spend in meetings last month? Which day of the week is quietest for deep work? What share of invites get declined? Calendar questions stop being vibes and start being charts.</p>\n\n        <h2>Three ways teams use it</h2>\n        <div class=\"use-cases\">\n          <div class=\"use-case\"><div class=\"tag\">Sales &amp; Marketing</div><div class=\"body\">Sales + holiday + promo calendars blended with revenue: every spike traced to the event that caused it.</div></div>\n          <div class=\"use-case\"><div class=\"tag\">Leadership</div><div class=\"body\">Meeting-load dashboard per team: hours in meetings vs. focus time, trending weekly.</div></div>\n          <div class=\"use-case\"><div class=\"tag\">Ops</div><div class=\"body\">Room and resource utilization, which calendars are saturated, which sit empty.</div></div>\n        </div>\n\n        <h2>Fields you get</h2>\n        <div class=\"field-cols\">\n          <div class=\"field-col\">\n            <h3>Dimensions</h3>\n            <ul>\n              <li>Event title &amp; calendar name</li>\n              <li>Start / end date &amp; time</li>\n              <li>Day of week, start hour &amp; minute</li>\n              <li>Event status &amp; event type</li>\n              <li>Location, creator &amp; organizer email</li>\n              <li>My response status &amp; visibility</li>\n              <li>Is all-day · is recurring</li>\n              <li>Video meeting link &amp; event link</li>\n            </ul>\n          </div>\n          <div class=\"field-col\">\n            <h3>Metrics</h3>\n            <ul>\n              <li>Duration: seconds, minutes, hours</li>\n              <li>Attendee count</li>\n              <li>Event count</li>\n            </ul>\n          </div>\n        </div>\n\n        <h2>Set up in two minutes</h2>\n        <ol class=\"steps-list\">\n          <li><a href=\"/get-started\" style=\"color: var(--acc-4);\">Request access</a> and we'll send your connector link and license key by email.</li>\n          <li>Open the link, enter your key, and authorize Google Calendar when prompted.</li>\n          <li>Enter your Calendar IDs: add as many as you like, like <strong>primary</strong> plus your sales and holiday calendars, and click <strong>Connect</strong>.</li>\n          <li>Build: your events are now rows in Data Studio, ready to blend with your sales data or feed any chart below.</li>\n        </ol>\n      </div>\n    </div>\n\n    <div class=\"related\" id=\"charts\">\n      <div class=\"section-eyebrow\" style=\"margin-bottom: 6px;\">Made for each other</div>\n      <h2 style=\"margin: 0 0 10px;\">Calendar charts that finish the job.</h2>\n      <p style=\"color: var(--text-dim); max-width: 640px; margin: 0 0 20px;\">The connector gets your events in; these four render them the way a calendar deserves, as days, weeks, and hours, not as a bar chart wearing a costume.</p>\n      <div class=\"grid\">\n        <a class=\"card\" href=\"charts/bigcalendar-viz\">\n          <div class=\"card-icon\"><img src=\"/icons/bigcalendar-viz.png\" alt=\"\" onerror=\"this.style.opacity=.2\"></div>\n          <div class=\"card-name\">Big Calendar</div>\n          <div class=\"card-desc\">Full calendar grid: event volume painted across every cell. Month or year at a glance.</div>\n          <div class=\"card-foot\"><span>TABLES, CALENDARS &amp; COMBO</span><span class=\"card-arrow\">→</span></div>\n        </a>\n        <a class=\"card\" href=\"charts/calendarHeatmap\">\n          <div class=\"card-icon\"><img src=\"/icons/calendarHeatmap.png\" alt=\"\" onerror=\"this.style.opacity=.2\"></div>\n          <div class=\"card-name\">Mini Calendar</div>\n          <div class=\"card-desc\">Compact monthly calendar: one cell, one number, instant pattern.</div>\n          <div class=\"card-foot\"><span>TABLES, CALENDARS &amp; COMBO</span><span class=\"card-arrow\">→</span></div>\n        </a>\n        <a class=\"card\" href=\"charts/convheatmap-viz\">\n          <div class=\"card-icon\"><img src=\"/icons/convheatmap-viz.png\" alt=\"\" onerror=\"this.style.opacity=.2\"></div>\n          <div class=\"card-name\">Conversion Heatmap</div>\n          <div class=\"card-desc\">Day-of-week × hour heatmap: see exactly when your week fills up.</div>\n          <div class=\"card-foot\"><span>TABLES, CALENDARS &amp; COMBO</span><span class=\"card-arrow\">→</span></div>\n        </a>\n        <a class=\"card\" href=\"charts/engageheatmap-viz\">\n          <div class=\"card-icon\"><img src=\"/icons/engageheatmap-viz.png\" alt=\"\" onerror=\"this.style.opacity=.2\"></div>\n          <div class=\"card-name\">Engagement Heatmap</div>\n          <div class=\"card-desc\">Row × column matrix: meeting load by person, team, or calendar.</div>\n          <div class=\"card-foot\"><span>TABLES, CALENDARS &amp; COMBO</span><span class=\"card-arrow\">→</span></div>\n        </a>\n      </div>\n    </div>\n\n    <div class=\"related\" id=\"pricing\">\n      <div class=\"section-eyebrow\" style=\"margin-bottom: 6px;\">Pricing</div>\n      <h2 style=\"margin: 0 0 10px;\">Included in your vizstudio plan.</h2>\n      <div class=\"price-band\">\n        <div>\n          <div class=\"amounts\">\n            <div class=\"amt\"><span class=\"val\">$50</span><span class=\"per\">/ month</span></div>\n            <div class=\"amt\"><span class=\"or\">or</span></div>\n            <div class=\"amt\"><span class=\"val\">$500</span><span class=\"per\">/ year</span></div>\n          </div>\n          <p>One plan, everything in it: the Google Calendar Connector plus the full library of 75+ charts. No per-seat upcharges, no metering. The free trial includes the connector with your last 7 days of events, so you can build a real dashboard before paying a cent.</p>\n        </div>\n        <div class=\"cta-side\">\n          <a class=\"btn btn-primary\" href=\"/get-started\">Start free →</a>\n          <div class=\"micro\">No credit card required.</div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"related faq-mini\">\n      <div class=\"section-eyebrow\" style=\"margin-bottom: 16px;\">FAQ</div>\n      <details><summary>Does my calendar data pass through vizstudio servers?</summary><p>No. The connector runs in Google's own Apps Script infrastructure and talks directly to the Google Calendar API. Your events go from Google to Google. We never see them.</p></details>\n      <details><summary>Can I connect more than one calendar?</summary><p>Yes, enter multiple Calendar IDs (your own, shared team calendars, a sales or holiday calendar, room resources) and each event row carries its calendar name. Link them all to one report and split or blend them however you like.</p></details>\n      <details><summary>Can I overlay calendar events on my sales data?</summary><p>Yes, that's the headline use case. Blend the connector with your sales source on date, and events from your sales and holiday calendars line up against revenue. When a number skyrockets, the event that caused it is right there in the chart.</p></details>\n      <details><summary>Do I need the vizstudio charts to use the connector?</summary><p>No, connector data works with every native Data Studio chart. But calendars are awkward in stock charts, which is why the plan ships both together.</p></details>\n    </div>\n  </div>\n</section>\n</main>\n\n<div id=\"site-footer\"><footer class=\"footer-fallback\"><nav aria-label=\"Footer\"><a href=\"/\">Home</a> · <a href=\"/#library\">Charts</a> · <a href=\"/get-started\">Get Started</a> · <a href=\"/suggest\">Suggest a Chart</a> · <a href=\"/privacy\">Privacy</a> · <a href=\"/terms\">Terms of Service</a></nav><p>© vizstudio, premium D3 community visualizations for Data Studio.</p></footer></div>";
const STYLES = "\n/* page-local: field table + pricing band (pricing CSS lives in index.html, not style.css) */\n.field-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 18px 0 8px; }\n.field-col { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg, 16px); padding: 20px 22px; }\n.field-col h3 { margin: 0 0 12px; font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-dim); }\n.field-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: var(--text); }\n.field-col li::before { content: \"·\"; color: var(--acc-4, #22d3ee); margin-right: 8px; font-weight: 700; }\n.steps-list { color: var(--text-dim); padding-left: 18px; }\n.steps-list li { margin-bottom: 8px; }\n.price-band { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg, 16px); padding: 32px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; align-items: center; margin-top: 8px; }\n.price-band .amounts { display: flex; gap: 28px; align-items: baseline; flex-wrap: wrap; }\n.price-band .amt { display: flex; align-items: baseline; gap: 6px; }\n.price-band .amt .val { font-size: 40px; font-weight: 700; letter-spacing: -0.03em; }\n.price-band .amt .per { color: var(--text-dim); font-size: 14px; }\n.price-band .amt .or { color: var(--muted, var(--text-dim)); font-size: 14px; }\n.price-band p { color: var(--text-dim); font-size: 14px; margin: 10px 0 0; }\n.price-band .cta-side { text-align: center; }\n.price-band .cta-side .btn { width: 100%; justify-content: center; }\n.price-band .cta-side .micro { margin-top: 10px; font-size: 12px; color: var(--text-dim); }\n.faq-mini details { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; margin-bottom: 10px; }\n.faq-mini summary { cursor: pointer; font-weight: 600; font-size: 15px; }\n.faq-mini p { color: var(--text-dim); font-size: 14px; margin: 10px 0 2px; }\n@media (max-width: 760px) { .field-cols, .price-band { grid-template-columns: 1fr; } }\n\n";

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CONNECTOR_JSONLD) }}
        key="ld"
      />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
      <ClientScripts srcs={["/assets/partials.js"]} />
    </>
  );
}
