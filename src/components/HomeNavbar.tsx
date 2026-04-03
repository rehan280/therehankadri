"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#services", label: "Expertise" },
  { href: "#works", label: "Results" },
  { href: "#process", label: "Systems" },
  { href: "#about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const observedSections = ["services", "works", "proofs", "process", "about"];

export default function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          setActiveSection((current) =>
            current === entry.target.id ? current : entry.target.id
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    observedSections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        sectionObserver.observe(section);
      }
    });

    const handleScroll = () => {
      const nextScrolled = window.scrollY > 30;
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      sectionObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
        <Link href="/" className="nav-brand" aria-label="The Rehan Kadri home">
          <span className="nav-brand-copy">
            <span className="nav-brand-kicker">Revenue-first growth systems</span>
            <span className="nav-brand-title">
              <span className="nav-brand-the">The</span>
              <span className="nav-brand-rehan">Rehan</span>
              <span className="nav-brand-kadri">Kadri</span>
            </span>
          </span>
        </Link>

        <div className="desktop-links-shell">
          <div className="desktop-links">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={href.startsWith("#") && activeSection === href.slice(1) ? "active" : ""}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <Link href="#proofs" className="nav-secondary">
            View Results
          </Link>
          <Link href="/contact" className="btn btn-orange nav-btn">
            Book a strategy call
          </Link>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer${menuOpen ? " open" : ""}`} id="mobile-nav-drawer">
        <div className="mobile-drawer-links">
          <div className="mobile-drawer-top">
            <p>SEO, content, and pipeline strategy for qualified revenue growth.</p>
          </div>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={closeMenu}>
              {label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-orange drawer-hire" onClick={closeMenu}>
            Book a strategy call ↗
          </Link>
        </div>
      </div>

      {menuOpen ? <div className="drawer-overlay" onClick={closeMenu} /> : null}
    </>
  );
}
