"use client";

import { useEffect } from "react";
import styles from "./FAQSection.module.css";

const faqData = [
  {
    question: "Para kanino ba itong programs?",
    answer:
      "Para sa sinumang gustong matuto ng Amazon PPC — from zero knowledge hanggang working campaigns. Walang experience required. Ang kailangan mo lang: laptop, internet connection, atsipon sa pag-aaral.",
  },
  {
    question: "May guarantee ba kayo?",
    answer:
      "Oo. If after 30 days ng program at wala ka pang na-set up na sariling campaign, tutor-ulungan ka namin hanggang sa magawa mo. Hindi kami basta-basta nagti-take ng pera mo at iiwan. Our goal is para makita ka naming kumita.",
  },
  {
    question: "Magkano ang magiging gastos ko sa Amazon Ads mismo?",
    answer:
      "Recommendations: start with ₱3,000–₱5,000/month na ads budget. Hindi mo kailangang maging billionaire para magsimula. Many of our students start with small budgets and scale up once they see positive ROAS.",
  },
  {
    question: "AI ba ito? Kasi nag-aalala ako na papalitan ako ng AI.",
    answer:
      "eto palagi naming naririnig. Ang sagot: ang mga VA na marunong gumamit ng AI ay mas may advantage. Sa program namin, tinuturo namin kung paano gamitin ang AI para i-automate ang repetitive tasks — para mas marami kang time para sa strategic decision-making. AI is your teammate, not your replacement.",
  },
  {
    question: "Paano kung wala akong karanasan sa ecommerce?",
    answer:
      "Perfect ka kung wala pang karanasan. Our PPC Foundations program starts from zero. Hindi ka namin iiwan kung saan ka —一步步 kami magtatrabaho together hanggang sa maging confident ka sa campaigns mo.",
  },
  {
    question: "Gaano katagal bago ko makita ang unang results?",
    answer:
      "May students kaming nakakita ng unang sale within 2-3 weeks. Para sa iba, 4-6 weeks. Depende sa product niche at bidding strategy. Pero guaranteed: within 30 days makakapag-set up ka na ng working campaigns — with or without your first sale.",
  },
];

export default function FAQSection() {
  useEffect(() => {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.parentElement;
        if (!item) return;
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  }, []);

  return (
    <section className={styles.faqSection} id="faq">
      <div className={styles.faqList}>
        {faqData.map((item, idx) => (
          <div className={styles.faqItem} key={idx}>
            <button className={styles.faqQuestion} type="button">
              {item.question}
              <i className="ph ph-plus"></i>
            </button>
            <div className={styles.faqAnswer}>
              <div className={styles.faqAnswerInner}>{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
