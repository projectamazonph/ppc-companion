import styles from "./ResultsBanner.module.css";

export default function ResultsBanner() {
  return (
    <section className={styles.resultsBanner}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.resultsTitle}>hindi ka magiging isa sa kanila</h2>
        <p className={styles.resultsSub}>
          Ang mga graduate ng ProjectAmazonPH ay kumikita na ng malaki — at gumagawa ng matinong
          career sa Amazon
        </p>
      </div>
      <div className={styles.stats}>
        <div>
          <div className={styles.statNumber}>₱80K+</div>
          <div className={styles.statLabel}>Pinakamataas na Monthly Earnings</div>
        </div>
        <div>
          <div className={styles.statNumber}>94%</div>
          <div className={styles.statLabel}>Nagagamit ang Natutunan</div>
        </div>
        <div>
          <div className={styles.statNumber}>30</div>
          <div className={styles.statLabel}>Araw para makita ang Unang Sale</div>
        </div>
      </div>
    </section>
  );
}
