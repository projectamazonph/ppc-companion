import styles from "./LandingFooter.module.css";

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        Project<span>Amazon</span>PH
      </div>
      <div className={styles.links}>
        <a href="#">Facebook Page</a>
        <a href="#">YouTube Channel</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
      <div className={styles.copy}>© 2026 ProjectAmazonPH. Lahat ng karapatan ay nakareserba.</div>
    </footer>
  );
}
