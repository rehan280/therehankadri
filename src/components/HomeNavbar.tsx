"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const blogHref = "/blog";
const serviceHref = "/#services";
const proofsHref = "/#proofs";
const aboutHref = "/about";
const contactHref = "/contact";

export default function HomeNavbar() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const [scrolled, setScrolled] = useState(false);
  const shouldHideNavbar = pathname.startsWith(blogHref);
  const menuOpen = menuState.path === pathname ? menuState.open : false;

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
  const isBlogActive = pathname.startsWith(blogHref);
  const isAboutActive = pathname === aboutHref || pathname === contactHref;
  const isContactActive = pathname === contactHref;

  if (shouldHideNavbar) {
    return null;
  }

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
            <Link
              href={blogHref}
              className={isBlogActive ? "active" : ""}
              aria-current={isBlogActive ? "page" : undefined}
            >
              Blog
            </Link>
            <Link href={serviceHref}>Service</Link>
            {/* <Link href={proofsHref}>Proofs</Link> */}

            <div className={`desktop-links-group${isAboutActive ? " active" : ""}`}>
              <Link
                href={aboutHref}
                className={isAboutActive ? "active" : ""}
                aria-current={pathname === aboutHref ? "page" : undefined}
              >
                About Us
              </Link>
              <div className="desktop-submenu" aria-label="About Us submenu">
                <Link
                  href={contactHref}
                  className={isContactActive ? "active" : ""}
                  aria-current={isContactActive ? "page" : undefined}
                >
                  Contact Us
                </Link>
              </div>
            </div>
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
            <p>Browse the blog, explore services, or learn more about Rehan.</p>
          </div>
          <Link
            href={blogHref}
            onClick={closeMenu}
            className={isBlogActive ? "active" : ""}
            aria-current={isBlogActive ? "page" : undefined}
          >
            Blog
          </Link>
          <Link href={serviceHref} onClick={closeMenu}>Service</Link>
          {/* <Link href={proofsHref} onClick={closeMenu}>Proofs</Link> */}
          <div className="mobile-nav-group">
            <Link
              href={aboutHref}
              onClick={closeMenu}
              className={isAboutActive ? "active" : ""}
              aria-current={pathname === aboutHref ? "page" : undefined}
            >
              About Us
            </Link>
            <Link
              href={contactHref}
              onClick={closeMenu}
              className={`mobile-sub-link${isContactActive ? " active" : ""}`}
              aria-current={isContactActive ? "page" : undefined}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {menuOpen ? <div className="drawer-overlay" onClick={closeMenu} /> : null}
    </>
  );
}
