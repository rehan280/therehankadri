"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./contact.module.css";

const renderSocialIcon = (type: "email" | "linkedin" | "youtube" | "x") => {
  switch (type) {
    case "email":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 5.75A1.75 1.75 0 0 1 4.75 4h14.5A1.75 1.75 0 0 1 21 5.75v12.5A1.75 1.75 0 0 1 19.25 20H4.75A1.75 1.75 0 0 1 3 18.25V5.75Zm2 .24v.3l7 4.9 7-4.9v-.3a.25.25 0 0 0-.25-.25H5.25A.25.25 0 0 0 5 5.99Zm14 2.14-6.57 4.6a.75.75 0 0 1-.86 0L5 8.13v10.12c0 .14.11.25.25.25h13.5a.25.25 0 0 0 .25-.25V8.13Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.94 8.5H4.12V19h2.82V8.5ZM5.53 4C4.6 4 4 4.62 4 5.43c0 .8.59 1.42 1.5 1.42h.02c.94 0 1.52-.62 1.52-1.42C7.02 4.62 6.46 4 5.53 4ZM20 12.56c0-3.16-1.69-4.63-3.94-4.63-1.82 0-2.63 1-3.08 1.7V8.5h-2.82c.04.74 0 10.5 0 10.5h2.82v-5.87c0-.31.02-.62.11-.84.25-.61.82-1.24 1.78-1.24 1.25 0 1.75.94 1.75 2.33V19H20v-6.44Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.58 7.19a2.96 2.96 0 0 0-2.08-2.1C17.67 4.6 12 4.6 12 4.6s-5.67 0-7.5.49a2.96 2.96 0 0 0-2.08 2.1C1.93 9.03 1.93 12 1.93 12s0 2.97.49 4.81a2.96 2.96 0 0 0 2.08 2.1c1.83.49 7.5.49 7.5.49s5.67 0 7.5-.49a2.96 2.96 0 0 0 2.08-2.1c.49-1.84.49-4.81.49-4.81s0-2.97-.49-4.81ZM10.18 14.98V9.02L15.41 12l-5.23 2.98Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.9 3H21l-4.6 5.26L21.8 21h-4.94l-3.87-5.07L8.56 21H6.45l4.92-5.63L2.2 3h5.06l3.5 4.59L14.87 3Zm-.73 16.75h1.16L6.63 4.17H5.39l12.78 15.58Z" />
        </svg>
      );
  }
};

const socialLinks = [
  {
    type: "linkedin" as const,
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/rehan-kadri-27b5b8231",
    handle: "@rehan-kadri",
    note: "Professional updates, B2B growth insights, and founder-focused strategy.",
  },
  {
    type: "youtube" as const,
    name: "YouTube",
    href: "https://youtube.com/@rehanous?si=FDWGeBZ6MtP6oUcK",
    handle: "@rehanous",
    note: "Growth content, content systems, and audience-building breakdowns.",
  },
  {
    type: "x" as const,
    name: "X",
    href: "https://x.com/rehanous",
    handle: "@rehanous",
    note: "Short-form thoughts on brand, pipeline, content, and execution.",
  },
];

export default function ContactPage() {
  const [formResult, setFormResult] = useState("");

  const onContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormResult("Sending message...");
    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "c43eac91-aa20-47a0-97b3-2286e58da10f");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setFormResult("Form submitted successfully.");
        event.currentTarget.reset();
        setTimeout(() => setFormResult(""), 5000);
      } else {
        setFormResult(data.message || "Error submitting form. Please try again.");
      }
    } catch {
      setFormResult("Network error. Please try again later.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.topbar}>
            <Link href="/" className={styles.brand}>
              REHAN<span>.</span>
            </Link>
            <Link href="/" className={styles.backLink}>
              Back to home
            </Link>
          </div>

          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Contact Us</span>
            <h1>Let&apos;s Turn Attention Into Qualified Pipeline.</h1>
            <p>
              Tell me what you&apos;re building, where growth is getting stuck, and what outcome you
              need next. I&apos;ll respond with the clearest way forward.
            </p>
          </div>

          <div className={styles.layout}>
            <div className={styles.infoColumn}>
              <div className={styles.emailCard}>
                <span className={styles.kicker}>Best for direct outreach</span>
                <a href="mailto:youtech280@gmail.com" className={styles.emailLink}>
                  <span className={styles.iconWrap}>{renderSocialIcon("email")}</span>
                  <span>youtech280@gmail.com</span>
                </a>
                <p>Share your offer, bottleneck, and growth target. Replies usually happen within 24-48 hours.</p>
              </div>

              <div className={styles.socialGrid}>
                {socialLinks.map(({ type, name, href, handle, note }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialCard}
                  >
                    <span className={styles.socialIcon}>{renderSocialIcon(type)}</span>
                    <span className={styles.socialCopy}>
                      <strong>{name}</strong>
                      <span>{handle}</span>
                      <small>{note}</small>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.formWrap}>
              <div className={styles.formCard}>
                <div className={styles.formTop}>
                  <span className={styles.formKicker}>Project inquiry</span>
                  <h2>Tell me what you need</h2>
                  <p>Use the form below if you want a focused strategy conversation.</p>
                </div>

                <form className={styles.form} onSubmit={onContactSubmit}>
                  <div className={styles.field}>
                    <label htmlFor="name">Full Name</label>
                    <input id="name" name="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Work Email</label>
                    <input id="email" name="email" type="email" placeholder="john@company.com" required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell me about your offer, audience, and where growth is getting stuck..."
                      required
                    />
                  </div>
                  <button type="submit" className={styles.submitButton}>
                    Send Inquiry ↗
                  </button>
                  {formResult ? <div className={styles.formStatus}>{formResult}</div> : null}
                </form>
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <p>© 2026 The Rehan Kadri. All rights reserved.</p>
            <div className={styles.footerLinks}>
              <Link href="/">Home</Link>
              <a href="mailto:youtech280@gmail.com">Email</a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
