const FAQS = [
  {
    q: "How do I install charts into Looker Studio?",
    a: "Paste your license key in Looker's community viz picker, then paste the chart's Cloud Storage path. Two clicks. Every chart works the same way, no custom install per chart.",
  },
  {
    q: "Does Viz Studio see my data?",
    a: "No. Charts render client-side inside your Looker Studio session, the same way Google's native charts do. Your data never touches our servers. We only see license validations (key + domain).",
  },
  {
    q: "Can I self-host the charts?",
    a: "Team plans get a signed zip of every chart's source. Host them in your own Cloud Storage bucket, keep the license key for updates. Pro users run off our CDN.",
  },
  {
    q: "What happens if I cancel?",
    a: "Charts keep working until the end of your current period. After that, any report using a Viz Studio chart falls back to a Looker default chart, no broken dashboards, just a graceful downgrade.",
  },
  {
    q: "Do you offer a non-profit or EDU discount?",
    a: "Yes, 50% off Pro for verified EDU and registered non-profits. Email hello@vizstudio.io with proof of status.",
  },
  {
    q: "What if I need a chart you don't have?",
    a: "Post it on the public roadmap. If 20+ people upvote it, we build it within 10 business days. Team customers get two custom charts per year included.",
  },
];

export function FAQ() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-page px-6 py-20">
        <h2 className="cat-h2 mb-8">
          <span>Questions we get a lot</span>
          <span className="line" />
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="card p-5 group"
            >
              <summary className="cursor-pointer list-none flex justify-between items-start gap-4 font-sans text-[15px] font-medium text-text">
                {f.q}
                <span className="text-text-dim group-open:rotate-45 transition text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-[13px] leading-relaxed text-text-dim font-sans">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
