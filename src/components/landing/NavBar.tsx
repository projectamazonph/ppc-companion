import styles from "./NavBar.module.css";
import buttonStyles from "./ButtonStyles.module.css";

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <a href="#" className={styles.navLogo}>
          Project<span>Amazon</span>PH
        </a>
        <a href="#pricing" className={`${buttonStyles.btnPrimary} ${styles.navCta}`}>
          Simulan Mo Na →
        </a>
      </div>
    </nav>
  );
}
