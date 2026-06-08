"use client";

import { useState } from "react";

/**
 * Server-rendered marketing nav, ported from public/assets/partials.js.
 * Rendered as real markup (good for SEO); only the mobile burger needs state.
 * Links use absolute paths so they work from the dynamic /charts/[slug] route.
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav" id="nav">
      <div className="wrap row">
        <a href="/" className="logo">
          <span className="logo-mark inline" aria-hidden="true">
            <img src="/logo.webp" alt="" width={24} height={24} decoding="async" />
          </span>{" "}
          vizstudio
        </a>
        <nav>
          <a href="/#features">Features</a>
          <a href="/#library">Charts</a>
          <a href="/#how">How it works</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="right">
          <a className="btn" href="/login">
            Log in
          </a>
          <a className="btn primary" href="/get-started.html">
            Get Started
          </a>
          <button
            className="nav-burger"
            id="navBurger"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobileMenu"
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      <div
        className="mobile-menu"
        id="mobileMenu"
        style={open ? { display: "flex" } : undefined}
      >
        <a href="/#features">Features</a>
        <a href="/#library">Charts</a>
        <a href="/#how">How it works</a>
        <a href="/#pricing">Pricing</a>
        <a href="/#faq">FAQ</a>
        <a href="/login">Log in</a>
        <a className="btn primary" href="/get-started.html">
          Get Started →
        </a>
      </div>
    </header>
  );
}
