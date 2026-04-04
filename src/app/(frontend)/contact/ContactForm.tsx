"use client";

import { FormEvent, useState } from "react";
import styles from "./contact.module.css";

export default function ContactForm() {
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
  );
}
