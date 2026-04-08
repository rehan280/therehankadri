"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const blogHref = "/blog";
const statsHref = "/stats";
const serviceHref = "/#services";
const aboutHref = "/about";
const contactHref = "/contact";

const navLinks = [
  { href: statsHref, label: "Stats" },
  { href: serviceHref, label: "Service" },
  { href: aboutHref, label: "About Us" },
] as const;

export default function HomeNavbar() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const [scrolled, setScrolled] = useState(false);
  const shouldHideNavbar = pathname.startsWith(blogHref) || pathname.startsWith(statsHref);
  const menuOpen = menuState.path === pathname ? menuState.open : false;
  const useTransparentHeroNavbar = pathname === aboutHref;

  useEffect(() => {
    if (shouldHideNavbar) {
      return;
    }

    const handleScroll = () => {
      const nextScrolled = window.scrollY > 30;
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [shouldHideNavbar]);

  const closeMenu = () => setMenuState({ open: false, path: pathname });
  const toggleMenu = () => setMenuState({ open: !menuOpen, path: pathname });
  const isStatsActive = pathname.startsWith(statsHref);
  const isServiceActive = pathname === "/";
  const isAboutActive = pathname === aboutHref || pathname === contactHref;

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}${useTransparentHeroNavbar && !menuOpen ? " hero-blend" : ""}`}>
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
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === statsHref
                  ? isStatsActive
                  : href === serviceHref
                    ? isServiceActive
                    : isAboutActive;

              return (
                <Link
                  key={href}
                  href={href}
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
          <Link href="/#works" className="nav-secondary">
            View Results
          </Link>
          <Link href="/contact" className="btn btn-orange nav-btn">
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
            <p>Browse stats, services, and company pages.</p>
          </div>
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === statsHref
                ? isStatsActive
                : href === serviceHref
                  ? isServiceActive
                  : isAboutActive;

            return (
              <Link
                key={href}
                href={href}
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
