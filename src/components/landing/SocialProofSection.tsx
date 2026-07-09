import styles from "./SocialProofSection.module.css";

interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  city: string;
  income: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Before ProjectAmazonPH, ₱8K lang kinikita ko monthly as general VA. Ngayon, umabot na ng ₱45,000 — at patuloy na tumataas. Hindi ko talaga ini-expect na magiging possible ito.",
    initials: "MC",
    name: "Maria Christina S.",
    city: "Cebu City",
    income: "₱45K/mo",
  },
  {
    quote:
      "Hindi ako tech-savvy. Akala ko mahihirapan ako. But Ryan explained everything so clearly. After 6 weeks, nakapag-set up na ako ng sariling Amazon PPC campaigns. Game changer.",
    initials: "JR",
    name: "James Ryan D.",
    city: "Davao City",
    income: "₱62K/mo",
  },
  {
    quote:
      "Nag-work ako sa BPO for 3 years. Nagising ako one day na ayaw ko na. I took the leap and joined Accelerated Mastery. 3 months in, nagka-clients na ako sa Amazon sellers. Best decision ever.",
    initials: "AP",
    name: "Anna Paula M.",
    city: "Iloilo City",
    income: "₱38K/mo",
  },
];

export default function SocialProofSection() {
  return (
    <section className={styles.socialProof}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>Mga Kuwento</div>
        <h2 className={styles.sectionTitle}>Totoong Mga Resulta</h2>
        <p className={styles.sectionSubtitle}>
          Mga VAs mula sa iba&apos;t ibang panig ng Pilipinas
        </p>
      </div>
      <div className={styles.testimonialGrid}>
        {testimonials.map((t, idx) => (
          <div className={styles.testimonialCard} key={idx}>
            <p className={styles.quote}>{t.quote}</p>
            <div className={styles.author}>
              <div className={styles.avatar}>{t.initials}</div>
              <div>
                <div className={styles.authorName}>{t.name}</div>
                <div className={styles.meta}>
                  <span className={styles.cityBadge}>
                    <i className="ph ph-map-pin"></i> {t.city}
                  </span>
                  <span className={styles.incomeBadge}>
                    <i className="ph ph-trend-up"></i> {t.income}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
