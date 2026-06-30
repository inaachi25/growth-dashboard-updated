import { QUESTIONS, susScore, growthScore, scoreLabel } from '../constants.js'
import ActivityTracker from './ActivityTracker.jsx'
import styles from './InputView.module.css'

export default function InputView({ period, isMonthly, data, allData, onAnswer, onActivity, onBack, onDashboard }) {
  const answered = (data.answers || []).filter(a => a > 0).length
  const pct = Math.round((answered / 10) * 100)
  const sus = susScore(data.answers)
  const gs = growthScore(data.events, data.milestones)
  const { label: scoreTag, color: scoreColor } = scoreLabel(sus)

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.modeLabel}>{isMonthly ? 'Monthly Report' : 'Quarterly Survey'}</p>
          <h2 className={styles.pageTitle}>{period}</h2>
          <p className={styles.pageDesc}>
            Rate each statement honestly on a 1–5 scale. Your self-score uses a SUS-adapted formula.
          </p>
        </div>
        <div className={styles.progressRing}>
          <svg width="76" height="76" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="30" fill="none" stroke="var(--cream-dark)" strokeWidth="5.5" />
            <circle
              cx="38" cy="38" r="30" fill="none"
              stroke={pct === 100 ? 'var(--teal)' : 'var(--accent)'}
              strokeWidth="5.5"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className={styles.ringCenter}>
            <span className={styles.ringPct}>{pct}%</span>
            <span className={styles.ringLbl}>done</span>
          </div>
        </div>
      </div>

      {/* Survey */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>
          <span>Self-Assessment Survey</span>
          <span className={styles.scaleHint}>1 = strongly disagree · 5 = strongly agree</span>
        </div>

        <div className={styles.progressBarWrap}>
          <div className={styles.progressBarFill} style={{ width: `${pct}%` }} />
        </div>

        <div className={styles.questionList}>
          {QUESTIONS.map((q, i) => {
            const ans = (data.answers || [])[i] || 0
            return (
              <div key={i} className={`${styles.qRow} ${ans > 0 ? styles.qDone : ''}`}>
                <span className={styles.qNum}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.qMain}>
                  <p className={styles.qText}>{q.text}</p>
                  <span className={styles.qTheme} style={{
                    background: getThemeBg(q.themeKey),
                    color: getThemeColor(q.themeKey),
                  }}>{q.theme}</span>
                </div>
                <div className={styles.scaleBtns}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      className={`${styles.scaleBtn} ${ans === v ? styles.scaleSel : ''}`}
                      onClick={() => onAnswer(i, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Activity Tracker */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>Activity Log</div>
        <ActivityTracker
          events={Array.isArray(data.events) ? data.events : []}
          milestones={Array.isArray(data.milestones) ? data.milestones : []}
          onChange={onActivity}
        />
      </section>

      {/* Score Preview */}
      <div className={styles.scorePreview}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Self-score</span>
          <span className={styles.metricVal} style={{ color: scoreColor }}>{sus !== null ? sus : '—'}</span>
          <span className={styles.metricSub}>{scoreTag}</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Growth score</span>
          <span className={styles.metricVal}>{gs}</span>
          <span className={styles.metricSub}>weighted pts</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Questions</span>
          <span className={styles.metricVal}>{answered}/10</span>
          <span className={styles.metricSub}>answered</span>
        </div>
      </div>

      <div className={styles.ctaRow}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <button className={styles.ctaBtn} onClick={onDashboard}>Generate Dashboard →</button>
      </div>
    </div>
  )
}

function getThemeColor(key) {
  const map = {
    goal: '#7B5EA7', progress: '#2D7A6B', selfregulation: '#B8860B',
    resilience: '#C4622D', learning: '#2060A0', purpose: '#8B4A2A',
    relationships: '#1B7A4A', wellbeing: '#5B7A3A', reflection: '#6A5A8A',
    overall: '#3A5A7A',
  }
  return map[key] || '#666'
}

function getThemeBg(key) {
  const map = {
    goal: '#F3EEFF', progress: '#D0EDE8', selfregulation: '#FAF0D0',
    resilience: '#F5DBCF', learning: '#D8E8F5', purpose: '#F5E8DF',
    relationships: '#D5EDDF', wellbeing: '#E4EDD8', reflection: '#EDE8F5',
    overall: '#D8E5EF',
  }
  return map[key] || '#EEE'
}
