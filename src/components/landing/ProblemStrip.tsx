import styles from "./ProblemStrip.module.css";

export default function ProblemStrip() {
  return (
    <section className={styles.problemStrip}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>Ang mga Hadlang</div>
        <h2 className={styles.sectionTitle}>Gusto Mong Matuto ng Amazon PPC — Pero...</h2>
        <p className={styles.sectionSubtitle}>
          alam naming tatlong bagay ang humaharang: ituturo namin sa&apos;yo ang lahat
        </p>
      </div>
      <div className={styles.problemGrid}>
        <div className={styles.problemCard}>
          <div className={styles.problemIcon}>
            <i className="ph ph-arrow-down"></i>
          </div>
          <h3 className={styles.problemTitle}>Ang ₱15K Ceiling</h3>
          <p className={styles.problemDesc}>
            Umuusbong ang sahod mo, Pero may takip. Hindi ka makagalaw nang higit sa
            ₱12,000–₱18,000 kada buwan kahit gaano ka kahusay.
          </p>
          <div className={styles.problemAmount}>₱15K</div>
        </div>
        <div className={styles.problemCard}>
          <div className={styles.problemIcon}>
            <i className="ph ph-robot"></i>
          </div>
          <h3 className={styles.problemTitle}>Takot sa AI</h3>
          <p className={styles.problemDesc}>
            Sinabi ng kaibigan mo na papalitan na daw ng AI ang mga VA. Pero ang totoo: may AI,
            maswerte ka pa rin — kung alam mo kung paano gamitin.
          </p>
          <div className={`${styles.problemAmount} ${styles.problemAmountOrange}`}>AI = Advantage</div>
        </div>
        <div className={styles.problemCard}>
          <div className={styles.problemIcon}>
            <i className="ph ph-map-trifold"></i>
          </div>
          <h3 className={styles.problemTitle}>Walang Direksyon</h3>
          <p className={styles.problemDesc}>
            Nag-try ka na mag-self-study pero nawawala sa iba&apos;t ibang YouTube videos. Wala ring
            validation kung okay ang ginagawa mo. <strong>Dito, guided ka from day one.</strong>
          </p>
          <div className={`${styles.problemAmount} ${styles.problemAmountGold}`}>Structured Path</div>
        </div>
      </div>
    </section>
  );
}
