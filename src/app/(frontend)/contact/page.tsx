"use client";

import { FormEvent, useState } from "react";
import styles from "./contact.module.css";

const renderSocialIcon = (type: "email" | "linkedin" | "instagram" | "youtube" | "x") => {
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
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm-.2 2A3.55 3.55 0 0 0 4 7.55v8.9A3.55 3.55 0 0 0 7.55 20h8.9A3.55 3.55 0 0 0 20 16.45v-8.9A3.55 3.55 0 0 0 16.45 4h-8.9Zm8.95 1.45a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Z" />
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
    href: "https://www.linkedin.com/in/therehankadri/",
    handle: "@therehankadri",
    note: "Growth strategy and pipeline insights.",
  },
  {
    type: "instagram" as const,
    name: "Instagram",
    href: "https://www.instagram.com/therehankadri/",
    handle: "@therehankadri",
    note: "Brand, content, and behind-the-scenes ideas.",
  },
  {
    type: "youtube" as const,
    name: "YouTube",
    href: "https://youtube.com/@rehanous?si=FDWGeBZ6MtP6oUcK",
    handle: "@rehanous",
    note: "Content systems and YouTube growth.",
  },
  {
    type: "x" as const,
    name: "X",
    href: "https://x.com/rehanous",
    handle: "@rehanous",
    note: "Short ideas on positioning and content.",
  },
];

export default function ContactPage() {
  const [formResult, setFormResult] = useState("");

  const onContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormResult("Sending message...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", "c43eac91-aa20-47a0-97b3-2286e58da10f");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (response.ok && (data?.success ?? true)) {
        setFormResult("Message sent successfully.");
        form.reset();
        setTimeout(() => setFormResult(""), 5000);
      } else {
        setFormResult(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setFormResult("Network error. Please try again later.");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroIntro}>
            <span className={styles.eyebrow}>Contact</span>
            <h1>You made it!</h1>
            <p>
              Looking to build your brand, fix your pipeline, or create a stronger growth system?
            </p>
          </div>

          <section className={styles.formSection} aria-labelledby="contact-form-title">
            <div className={styles.formHeader}>
              <span className={styles.formKicker}>Project inquiry</span>
              <h2 id="contact-form-title">Tell me what you need</h2>
              <p>Best for SEO, lead generation, content systems, and growth audits.</p>
            </div>

            <form className={styles.form} onSubmit={onContactSubmit}>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" name="first_name" type="text" placeholder="John" required />
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" name="last_name" type="text" placeholder="Doe" />
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="email">Work email</label>
                  <input id="email" name="email" type="email" placeholder="john@company.com" required />
                </div>

                <div className={styles.field}>
                  <label htmlFor="company">Company or brand</label>
                  <input id="company" name="company" type="text" placeholder="Your company" />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="message">I&apos;m interested in...</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell me about your offer, bottleneck, and the result you want next."
                  required
                />
              </div>

              <div className={styles.formFooter}>
                <button type="submit" className={styles.submitButton}>
                  Send Inquiry
                </button>
                <p className={styles.formNote}>
                  45-minute call if there&apos;s a fit. I&apos;ll show what to fix first.
                </p>
              </div>

              {formResult ? <div className={styles.formStatus}>{formResult}</div> : null}
            </form>
          </section>

          <section className={styles.connectSection} aria-labelledby="connect-title">
            <div className={styles.connectSurface}>
              <div className={styles.connectIntro}>
                <span className={styles.connectKicker}>Connect with me</span>
                <h2 id="connect-title">Prefer a direct channel?</h2>
                <p>Email is best for serious inquiries. Social is best if you want to stay in touch.</p>
              </div>

              <a href="mailto:youtech280@gmail.com" className={styles.connectEmail}>
                <div className={styles.connectEmailTop}>
                  <span className={styles.connectEmailBadge}>Best for direct contact</span>
                  <span className={styles.connectEmailArrow}>↗</span>
                </div>
                <strong>youtech280@gmail.com</strong>
                <span>Reply window: usually within 24 hours.</span>
              </a>

              <div className={styles.socialGrid}>
                {socialLinks.map(({ type, name, href, handle, note }) => (
                  <a key={name} href={href} target="_blank" rel="noreferrer" className={styles.socialCard}>
                    <span className={styles.socialIcon}>{renderSocialIcon(type)}</span>
                    <div className={styles.socialCopy}>
                      <strong>{name}</strong>
                      <span>{handle}</span>
                      <small>{note}</small>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
