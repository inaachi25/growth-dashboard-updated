import styles from './Header.module.css'

export default function Header({ view, mode, activePeriod, onHome, onDashboard, onReset }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={onHome}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--accent)" strokeWidth="1.5" />
            <path d="M8 18 Q14 8 20 18" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <circle cx="14" cy="10" r="2" fill="var(--accent)" />
          </svg>
          <div>
            <h1 className={styles.title}>Growth<em>Index</em></h1>
            <p className={styles.subtitle}>Personal performance dashboard</p>
          </div>
        </button>

        <nav className={styles.nav}>
          {view !== 'home' && (
            <button className={styles.navBtn} onClick={onHome}>← Home</button>
          )}
          {view !== 'dashboard' && (
            <button className={styles.navBtn} onClick={onDashboard}>Dashboard</button>
          )}
          <button className={styles.resetBtn} onClick={onReset} title="Reset all data">↺</button>
        </nav>
      </div>

      {activePeriod && view === 'input' && (
        <div className={styles.breadcrumb}>
          <span className={styles.breadMode}>{mode === 'monthly' ? 'Monthly' : 'Quarterly'}</span>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadPeriod}>{activePeriod}</span>
        </div>
      )}
    </header>
  )
}
