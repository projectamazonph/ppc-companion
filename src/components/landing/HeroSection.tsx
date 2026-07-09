"use client";

import styles from "./HeroSection.module.css";
import buttonStyles from "./ButtonStyles.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.eyebrow}>
        <i className="ph ph-fire"></i>
        14 Taon ng Karanasan sa Amazon Ads
      </div>
      <h1 className={styles.headline}>
        Natatarantado ka pa rin<br />
        sa <em>Amazon Ads?</em>
      </h1>
      <p className={styles.subheadline}>
        Habang ang mga kaibigan mo sa <strong>Cebu, Davao, at Iloilo</strong> ay kumikita na ng{" "}
        <strong>₱60,000–₱80,000 kada buwan</strong> gamit ang Amazon PPC, nandito ka pa rin — nahihiya,
        natatakot, o hindi alam kung saan magsisimula.
      </p>
      <div className={styles.actions}>
        <a href="#pricing" className={`${buttonStyles.btnPrimary} ${styles.btnPrimaryLarge}`}>
          <i className="ph ph-rocket-launch"></i>
          Simulan Mo Na
        </a>
        <a href="#faq" className={buttonStyles.btnSecondary}>
          <i className="ph ph-play-circle"></i>
          Tingnan ang Detalye
        </a>
      </div>
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>500+</div>
          <div className={styles.statLabel}>Mga Pinagtutulungal kong VAs</div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>₱50M+</div>
          <div className={styles.statLabel}>Total Ads Managed</div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>6+</div>
          <div className={styles.statLabel}>Taon na sa Amazon PPC</div>
        </div>
      </div>
      <div className={styles.badgeRow}>
        <div className={styles.badge}>
          <i className="ph ph-map-pin"></i> Cebu City
        </div>
        <div className={styles.badge}>
          <i className="ph ph-map-pin"></i> Davao City
        </div>
        <div className={styles.badge}>
          <i className="ph ph-map-pin"></i> Iloilo City
        </div>
        <div className={styles.badge}>
          <i className="ph ph-map-pin"></i> NCR
        </div>
        <div className={`${styles.badge} ${styles.badgeVerified}`}>
          <i className="ph ph-check-circle"></i> Verified Coach
        </div>
      </div>
    </section>
  );
}
