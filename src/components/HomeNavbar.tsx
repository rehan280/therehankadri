"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const blogHref = "/blog";
const statsHref = "/stats";
const toolsHref = "/tools";
const serviceHref = "/#services";
const aboutHref = "/about";
const contactHref = "/contact";

const navLinks = [
  { href: blogHref, label: "Blog" },
  { href: statsHref, label: "Stats" },
  { href: toolsHref, label: "Tools" },
  { href: serviceHref, label: "Service" },
  { href: aboutHref, label: "About Us" },
] as const;

export default function HomeNavbar() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const shouldHideNavbar = pathname.startsWith(blogHref) || pathname.startsWith(statsHref);
  const menuOpen = menuState.path === pathname ? menuState.open : false;
  const useTransparentHeroNavbar = pathname === aboutHref;

  const closeMenu = () => setMenuState({ open: false, path: pathname });
  const toggleMenu = () => setMenuState({ open: !menuOpen, path: pathname });
  const isBlogActive = pathname.startsWith(blogHref);
  const isStatsActive = pathname.startsWith(statsHref);
  const isToolsActive = pathname.startsWith(toolsHref) || pathname === "/youtube-tags-generator" || pathname === "/youtube-title-extractor" || pathname === "/youtube-description-extractor";
  const isServiceActive = pathname === "/";
  const isAboutActive = pathname === aboutHref || pathname === contactHref;

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
      <nav className={`navbar${menuOpen ? " menu-open" : ""}${useTransparentHeroNavbar && !menuOpen ? " hero-blend" : ""}`}>
        <Link href="/" prefetch={false} className="nav-brand" aria-label="The Rehan Kadri home">
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
                  : href === toolsHref
                  ? isToolsActive
                  : href === serviceHref
                    ? isServiceActive
                    : isAboutActive;

              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
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
          <Link href="/#works" prefetch={false} className="nav-secondary">
            View Results
          </Link>
          <Link href="/contact" prefetch={false} className="btn btn-orange nav-btn">
            Book A Strategy Call
          </Link>
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={toggleMenu}
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
            <p>Browse blog posts, stats, tools, services, and company pages.</p>
          </div>
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === blogHref
                ? isBlogActive
                : href === statsHref
                ? isStatsActive
                : href === toolsHref
                ? isToolsActive
                : href === serviceHref
                  ? isServiceActive
                  : isAboutActive;

            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                onClick={closeMenu}
                className={isActive ? "active" : ""}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={contactHref}
            prefetch={false}
            onClick={closeMenu}
            className={`mobile-sub-link${pathname === contactHref ? " active" : ""}`}
            aria-current={pathname === contactHref ? "page" : undefined}
          >
            Contact Us
          </Link>
        </div>
      </div>

      {menuOpen ? <div className="drawer-overlay" onClick={closeMenu} /> : null}
    </>
  );
}
