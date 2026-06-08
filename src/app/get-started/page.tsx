import Script from "next/script";
import type { Metadata } from "next";
export const metadata: Metadata = {
  "title": "Create your account — vizstudio",
  "description": "Create your vizstudio account — 75+ premium D3 charts for Data Studio. No credit card required. We'll email you a link to set your password."
};

const BODY = "<div class=\"blobs\"><span class=\"blob blob-1\"></span><span class=\"blob blob-2\"></span><span class=\"blob blob-3\"></span></div>\n\n<div id=\"site-nav\"></div>\n\n<main>\n<section class=\"form-page\">\n  <div class=\"wrap\">\n    <div class=\"form-card\">\n      <div class=\"form-eyebrow\">Get Started</div>\n      <h1>Create your account.</h1>\n      <p class=\"sub\">No credit card required. We'll email you a link to verify your address and set your password — then you're in.</p>\n\n      <form id=\"signup-form\" novalidate>\n        <div class=\"form-field\">\n          <label for=\"su-name\">Full name</label>\n          <input id=\"su-name\" name=\"name\" type=\"text\" required autocomplete=\"name\" placeholder=\"Jane Doe\">\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"form-field\">\n          <label for=\"su-email\">Email</label>\n          <input id=\"su-email\" name=\"email\" type=\"email\" required autocomplete=\"email\" placeholder=\"jane@company.com\">\n          <span class=\"hint\">We'll send a link here to set your password.</span>\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"form-field\">\n          <label for=\"su-company\">Company</label>\n          <input id=\"su-company\" name=\"company\" type=\"text\" required autocomplete=\"organization\" placeholder=\"Where you work\">\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"form-field\">\n          <label for=\"su-role\">Role <span style=\"color:var(--muted);font-weight:400;\">(optional)</span></label>\n          <select id=\"su-role\" name=\"role\">\n            <option value=\"\">Select…</option>\n            <option>Analyst / BI</option>\n            <option>Marketer</option>\n            <option>Engineer</option>\n            <option>Product Manager</option>\n            <option>Executive</option>\n            <option>Other</option>\n          </select>\n          <span class=\"err\"></span>\n        </div>\n        <div class=\"form-submit\">\n          <button type=\"submit\" class=\"btn btn-primary\">Create account →</button>\n          <div class=\"micro\">By continuing you agree to our <a href=\"/terms\" style=\"color: var(--acc-4);\">Terms</a> and <a href=\"/privacy\" style=\"color: var(--acc-4);\">Privacy Policy</a>.</div>\n        </div>\n      </form>\n\n      <div class=\"form-success\">\n        <div class=\"check\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></div>\n        <h2>Check your inbox.</h2>\n        <p>Your account is ready. We emailed you a link to verify your address and set your password.</p>\n        <a class=\"btn btn-primary\" href=\"/dashboard\">Continue to your portal →</a>\n        <a class=\"btn\" href=\"/\" style=\"margin-top:8px;\">← Back to charts</a>\n      </div>\n\n      <p class=\"micro\" style=\"text-align:center;margin-top:18px;\">Already have an account? <a href=\"/login\" style=\"color: var(--acc-4);\">Log in</a></p>\n    </div>\n  </div>\n</section>\n</main>\n\n<div id=\"site-footer\"><footer class=\"footer-fallback\"><nav aria-label=\"Footer\"><a href=\"/\">Home</a> · <a href=\"/#library\">Charts</a> · <a href=\"/get-started\">Get Started</a> · <a href=\"/suggest\">Suggest a Chart</a> · <a href=\"/privacy\">Privacy</a> · <a href=\"/terms\">Terms of Service</a></nav><p>© vizstudio — premium D3 community visualizations for Data Studio.</p></footer></div>";
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
      <Script src="/assets/forms.js" strategy="afterInteractive" key="s1" />
      <Script src="/assets/partials.js" strategy="afterInteractive" key="s2" />
      <Script src="/assets/gen/get-started-3.js" strategy="afterInteractive" key="s3" />
    </>
  );
}
