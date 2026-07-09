import styles from "./PricingSection.module.css";
import buttonStyles from "./ButtonStyles.module.css";

interface Feature {
  text: string;
  available: boolean;
}

interface Tier {
  tier: string;
  name: string;
  price: string;
  unit: string;
  featured: boolean;
  features: (string | Feature)[];
  cta: string;
  ctaClass: string;
}

const tiers: Tier[] = [
  {
    tier: "Tier 1",
    name: "PPC Foundations",
    price: "₱2,999",
    unit: "/ full program",
    featured: false,
    features: [
      "Amazon PPC Fundamentals (video)",
      "Keyword Research Basics",
      "Campaign Structure Guide",
      "Budget Setup Walkthrough",
      "5 Real Campaign Examples",
      { text: "Live Coaching Sessions", available: false },
      { text: "1-on-1 Account Review", available: false },
    ],
    cta: "Enroll — ₱2,999",
    ctaClass: buttonStyles.btnSecondary,
  },
  {
    tier: "Tier 2",
    name: "Accelerated Mastery",
    price: "₱5,999",
    unit: "/ full program",
    featured: true,
    features: [
      "Everything in Foundations",
      "Advanced Bidding Strategies",
      "Negative Keyword Mastery",
      "ACOS Optimization Framework",
      "Product Launch Blueprint",
      "Private Facebook Group Access",
      { text: "1-on-1 Account Review", available: false },
    ],
    cta: "Enroll — ₱5,999",
    ctaClass: buttonStyles.btnPrimary,
  },
  {
    tier: "Tier 3",
    name: "Ultimate Transformation",
    price: "₱9,999",
    unit: "/ full program",
    featured: false,
    features: [
      "Everything in Accelerated",
      "1-on-1 Account Review (2x)",
      "Full Campaign Audit Session",
      "Scaling from ₱10K to ₱100K/mo",
      "Advanced Auto Campaigns",
      "Priority DM Support (30 days)",
      "Lifetime Access — All Future Updates",
    ],
    cta: "Enroll — ₱9,999",
    ctaClass: buttonStyles.btnSecondary,
  },
];

function FeatureItem({ text, available }: Feature) {
  if (available) {
    return (
      <li>
        <i className="ph ph-check-circle"></i>
        {text}
      </li>
    );
  }
  return (
    <li>
      <i className="ph ph-check-circle unavail"></i>
      {text}
    </li>
  );
}

export default function PricingSection() {
  return (
    <section className={styles.pricingSection} id="pricing">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>Mga Program</div>
        <h2 className={styles.sectionTitle}>Piliin ang Iyong Path</h2>
        <p className={styles.sectionSubtitle}>
          Tatlong programa para sa bawat lebel ng karanasan at badyet
        </p>
      </div>
      <div className={styles.pricingGrid}>
        {tiers.map((tier) => (
          <div
            className={`${styles.pricingCard} ${tier.featured ? styles.pricingFeatured : ""}`}
            key={tier.name}
          >
            <div className={styles.tierName}>{tier.tier}</div>
            <div className={styles.tierTitle}>{tier.name}</div>
            <div className={styles.price}>
              {tier.price} <span>{tier.unit}</span>
            </div>
            <div className={styles.divider}></div>
            <ul className={styles.features}>
              {tier.features.map((feature, idx) => (
                <FeatureItem
                  key={idx}
                  text={typeof feature === "string" ? feature : feature.text}
                  available={
                    typeof feature === "string" ? true : feature.available
                  }
                />
              ))}
            </ul>
            <a href="#" className={`${tier.ctaClass} ${styles.cta}`}>
              {tier.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
