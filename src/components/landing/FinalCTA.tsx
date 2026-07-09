import styles from "./FinalCTA.module.css";
import buttonStyles from "./ButtonStyles.module.css";

export default function FinalCTA() {
  return (
    <section className={styles.finalCta}>
      <h2 className={styles.title}>
        Huli na ba?<br />
        <em>Hindi.</em>
      </h2>
      <p className={styles.sub}>
        Linggu-linggo na lang ang mga nagigising. Ikaw? Mag-start na tayo ngayon — bago pa
        dumating ang susunod na wave ng competition.
      </p>
      <a href="#pricing" className={`${buttonStyles.btnPrimary} ${styles.ctaLarge}`}>
        <i className="ph ph-rocket-launch"></i>
        Simulan Mo Na — ₱2,999 lang
      </a>
      <div className={styles.urgencyRow}>
        <div className={styles.urgencyItem}>
          <i className="ph ph-lock"></i> Secure checkout
        </div>
        <div className={styles.urgencyItem}>
          <i className="ph ph-shield-check"></i> 30-day guarantee
        </div>
        <div className={styles.urgencyItem}>
          <i className="ph ph-users-three"></i> 500+ na ang sumali
        </div>
      </div>
    </section>
  );
}
