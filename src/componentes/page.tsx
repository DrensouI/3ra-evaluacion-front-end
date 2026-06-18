import Login from "./Login";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Login />
      </main>
    </div>
  );
}
