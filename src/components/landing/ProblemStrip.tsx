import styles from "./ProblemStrip.module.css";

export default function ProblemStrip() {
  return (
    <section className={styles.problemStrip}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLabel}>Ang Problema</div>
        <h2 className={styles.sectionTitle}>Bakit Ka Pa Rin Nandito?</h2>
        <p className={styles.sectionSubtitle}>
          Tatlong hadlang na humaharang sa iyong landi sa Amazon PPC
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
            <i className="ph ph-question"></i>
          </div>
          <h3 className={styles.problemTitle}>Walang Alam sa Amazon</h3>
          <p className={styles.problemDesc}>
            Nag-try ka na mag-self-study pero nawawala sa iba&apos;t ibang YouTube videos. Wala ring
            validation kung okay ang ginagawa mo.
          </p>
          <div className={`${styles.problemAmount} ${styles.problemAmountGold}`}>Direction</div>
        </div>
      </div>
    </section>
  );
}
