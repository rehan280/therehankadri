"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./BlogHeader.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#works", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/#about", label: "About" },
];

export default function BlogHeader() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const menuOpen = menuState.path === pathname ? menuState.open : false;

  const closeMenu = () => setMenuState({ open: false, path: pathname });
  const toggleMenu = () => setMenuState({ open: !menuOpen, path: pathname });
  const blendIntoHero = !menuOpen;

  return (
    <>
      <nav
        className={`navbar blog-navbar${menuOpen ? " menu-open" : ""}${blendIntoHero ? " hero-blend" : ""}`}
      >
        <Link href="/" prefetch className="nav-brand" aria-label="The Rehan Kadri home">
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
                prefetch={href.startsWith("/")}
                className={href === "/blog" && pathname.startsWith("/blog") ? "active" : ""}
                aria-current={href === "/blog" && pathname.startsWith("/blog") ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <Link href="/#proofs" prefetch className="nav-secondary">
            View Results
          </Link>
          <Link href="/contact" prefetch className="btn btn-orange nav-btn">
            Book a strategy call
          </Link>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="blog-mobile-nav-drawer"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-drawer${menuOpen ? " open" : ""}`} id="blog-mobile-nav-drawer">
        <div className="mobile-drawer-links">
          <div className="mobile-drawer-top">
            <p>SEO, content, and pipeline strategy for qualified revenue growth.</p>
          </div>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} prefetch={href === "/blog" || href === "/"} onClick={closeMenu}>
              {label}
            </Link>
          ))}
          <Link href="/contact" prefetch className="btn btn-orange drawer-hire" onClick={closeMenu}>
            Book a strategy call ↗
          </Link>
        </div>
      </div>

      {menuOpen ? <div className="drawer-overlay" onClick={closeMenu} /> : null}
      <div className={styles.navSpacer} aria-hidden="true" />
    </>
  );
}
