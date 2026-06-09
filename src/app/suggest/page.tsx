import ClientScripts from "@/components/ClientScripts";
import type { Metadata } from "next";
export const metadata: Metadata = {
  "title": "Suggest a chart | vizstudio",
  "description": "Not seeing the chart or functionality you're looking for? Tell us. We ship new charts every week."
};

const BODY = "<div class=\"blobs\"><span class=\"blob blob-1\"></span><span class=\"blob blob-2\"></span><span class=\"blob blob-3\"></span></div>\n\n<div id=\"site-nav\"></div>\n\n<main>\n<section class=\"form-page\">\n  <div class=\"wrap\">\n    <div class=\"form-card\">\n      <div class=\"form-eyebrow\">Suggest a chart</div>\n      <h1>Not seeing the chart or functionality you're looking for?</h1>\n      <p class=\"sub\">Tell us what you'd build with it. We ship new charts every week, yours might be next on the list.</p>\n\n      <form data-form=\"suggest\" novalidate>\n        <div class=\"form-field\">\n          <label for=\"sg-name\">Chart name or type</label>\n          <input id=\"sg-name\" name=\"chart_name\" type=\"text\" required maxlength=\"120\" autocomplete=\"off\" placeholder=\"e.g. Marimekko, Sankey-with-cohorts, NPS gauge with band-history\">\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"form-field\">\n          <label for=\"sg-desc\">What would you build with it?</label>\n          <textarea id=\"sg-desc\" name=\"description\" required maxlength=\"2000\" placeholder=\"Describe the data shape, the question it answers, and where it'd live in your dashboard. The more detail, the faster we can build it. Plain text only, no links or screenshots.\"></textarea>\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"form-field\">\n          <label for=\"sg-email\">Your email <span style=\"text-transform: none; color: var(--muted);\">(so we can tell you when it ships)</span></label>\n          <input id=\"sg-email\" name=\"email\" type=\"email\" maxlength=\"254\" autocomplete=\"email\" placeholder=\"you@company.com\">\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"hp-field\" aria-hidden=\"true\" style=\"position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;\">\n          <label for=\"sg-website\">Leave this field empty</label>\n          <input id=\"sg-website\" name=\"website\" type=\"text\" tabindex=\"-1\" autocomplete=\"off\">\n        </div>\n        <div class=\"form-submit\">\n          <button type=\"submit\" class=\"btn btn-primary\">Send suggestion →</button>\n          <div class=\"micro\">No spam. We read every one.</div>\n        </div>\n      </form>\n\n      <div class=\"form-success\">\n        <div class=\"check\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></div>\n        <h2>Got it, thanks.</h2>\n        <p>We log every suggestion. If you left an email, you'll hear back when the chart ships (or sooner if we have questions).</p>\n        <a class=\"btn\" href=\"/\">← Back to charts</a>\n      </div>\n    </div>\n  </div>\n</section>\n</main>\n\n<div id=\"site-footer\"><footer class=\"footer-fallback\"><nav aria-label=\"Footer\"><a href=\"/\">Home</a> · <a href=\"/#library\">Charts</a> · <a href=\"/get-started\">Get Started</a> · <a href=\"/suggest\">Suggest a Chart</a> · <a href=\"/privacy\">Privacy</a> · <a href=\"/terms\">Terms of Service</a></nav><p>© vizstudio, premium D3 community visualizations for Data Studio.</p></footer></div>";
const STYLES = "";

export default function Page() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" key="l0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" key="l1" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" key="l2" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap" key="l3" />
      <link rel="stylesheet" href="/assets/style.css" key="l4" />
      <link rel="stylesheet" href="/assets/forms.css" key="l5" />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
      <ClientScripts srcs={["/assets/forms.js", "/assets/partials.js"]} />
    </>
  );
}
