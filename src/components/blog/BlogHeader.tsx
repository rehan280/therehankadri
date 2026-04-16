"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./BlogHeader.module.css";

const blogHref = "/blog";
const statsHref = "/stats";
const serviceHref = "/#services";
const aboutHref = "/about";
const contactHref = "/contact";

const navLinks = [
  { href: blogHref, label: "Blog" },
  { href: statsHref, label: "Stats" },
  { href: serviceHref, label: "Service" },
  { href: aboutHref, label: "About Us" },
] as const;

export default function BlogHeader() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const menuOpen = menuState.path === pathname ? menuState.open : false;
  const useWarmHeroBlend = pathname === "/stats";
  const useLightHeroBlend = pathname === "/stats/youtube";

  const closeMenu = () => setMenuState({ open: false, path: pathname });
  const toggleMenu = () => setMenuState({ open: !menuOpen, path: pathname });
  const blendIntoHero = !menuOpen;
  const isBlogActive = pathname.startsWith(blogHref);
  const isStatsActive = pathname.startsWith(statsHref);
  const isServiceActive = pathname === "/";
  const isAboutActive = pathname === aboutHref || pathname === contactHref;

  return (
    <>
      <nav
        className={`navbar blog-navbar${menuOpen ? " menu-open" : ""}${blendIntoHero ? " hero-blend" : ""}${useLightHeroBlend ? " hero-blend-light" : ""}${useWarmHeroBlend ? " hero-blend-warm" : ""}`}
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
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === blogHref
                  ? isBlogActive
                  : href === statsHref
                  ? isStatsActive
                  : href === serviceHref
                    ? isServiceActive
                    : isAboutActive;

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={href.startsWith("/")}
                  className={isActive ? "active" : ""}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="nav-right">
          <Link href="/#works" prefetch className="nav-secondary">
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
            <p>Blog posts, stats, and growth resources for qualified revenue growth.</p>
          </div>
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === blogHref
                ? isBlogActive
                : href === statsHref
                ? isStatsActive
                : href === serviceHref
                  ? isServiceActive
                  : isAboutActive;

            return (
              <Link
                key={href}
                href={href}
                prefetch={href === blogHref || href === statsHref}
                onClick={closeMenu}
                className={isActive ? "active" : ""}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
          <Link href={contactHref} prefetch className="btn btn-orange drawer-hire" onClick={closeMenu}>
            Book a strategy call ↗
          </Link>
        </div>
      </div>

      {menuOpen ? <div className="drawer-overlay" onClick={closeMenu} /> : null}
      <div className={styles.navSpacer} aria-hidden="true" />
    </>
  );
}
