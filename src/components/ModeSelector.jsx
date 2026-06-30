import { useState, useMemo } from 'react'
import {
  ALL_QUARTERS, QUARTER_MONTH_NAMES,
  makeQuarterKey, makeMonthKey, getMonthsForQuarter,
  susScore, quarterStatus, growthScore
} from '../constants.js'
import styles from './ModeSelector.module.css'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i) // -2 to +2 from current

function MonthChip({ month, data, onClick }) {
  const d = data.monthly[month] || {}
  const done = susScore(d.answers) !== null
  const evCount = Array.isArray(d.events) ? d.events.length : 0
  const msCount = Array.isArray(d.milestones) ? d.milestones.length : 0
  const shortName = month.split(' ')[0].slice(0, 3)
  return (
    <button
      className={`${styles.monthChip} ${done ? styles.chipDone : ''}`}
      onClick={() => onClick(month)}
    >
      <span className={styles.chipMonth}>{shortName}</span>
      {done ? (
        <span className={styles.chipStatus}>
          <span className={styles.chipDot} />
          {evCount}E {msCount}M
        </span>
      ) : (
        <span className={styles.chipStatusPending}>—</span>
      )}
    </button>
  )
}

<<<<<<< HEAD
function QuarterSection({ q, year, data, onMonthly, onQuarterly, onQuarterReport }) {
=======
function QuarterSection({ q, year, data, onMonthly, onQuarterly }) {
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
  const quarterKey = makeQuarterKey(q, year)
  const monthKeys = getMonthsForQuarter(q, year)
  const status = quarterStatus(data.monthly, monthKeys)
  const qData = data.quarterly[quarterKey]
  const qDone = susScore(qData?.answers) !== null

  const statusColors = {
    no_monthly: 'var(--ink-faint)',
    partial: 'var(--gold)',
    complete: 'var(--teal)',
  }

  return (
    <div className={styles.quarterSection}>
      <div className={styles.qSectionHead}>
        <span className={styles.qLabel}>{q}</span>
        <span className={styles.qStatusDot} style={{ color: statusColors[status] }}>
          {status === 'complete' ? '● All filled' : status === 'partial' ? '◐ Partial' : '○ Empty'}
        </span>
      </div>
      <div className={styles.monthRow}>
        {monthKeys.map(m => (
          <MonthChip key={m} month={m} data={data} onClick={onMonthly} />
        ))}
      </div>
<<<<<<< HEAD

      {/* When no monthly entries: allow direct quarterly survey */}
=======
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
      {status === 'no_monthly' && (
        <button
          className={`${styles.altBtn} ${qDone ? styles.altDone : ''}`}
          onClick={() => onQuarterly(quarterKey)}
        >
          {qDone ? '✓ Quarterly survey done' : 'Fill quarterly survey directly →'}
        </button>
      )}
<<<<<<< HEAD

      {/* When all months are complete: show consolidated quarter badge + report button */}
      {status === 'complete' && (
        <div className={styles.consolidatedRow}>
          <span className={styles.consolidatedBadge}>
            ✓ Quarter consolidated from monthly data
          </span>
          <button
            className={styles.quarterReportBtn}
            onClick={() => onQuarterReport(quarterKey)}
          >
            View Quarter Report →
          </button>
        </div>
      )}

      {/* Partial: show hint */}
      {status === 'partial' && (
        <p className={styles.partialHint}>
          Fill all 3 months to auto-consolidate this quarter.
        </p>
      )}
=======
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
    </div>
  )
}

// Period selector for report generation
function ReportPicker({ data, onGenerate }) {
  const [yearA, setYearA] = useState(CURRENT_YEAR)
  const [modeA, setModeA] = useState('monthly') // 'monthly' | 'quarterly'
  const [qA, setQA] = useState('Q1')
  const [monthA, setMonthA] = useState('January')

  const [yearB, setYearB] = useState(CURRENT_YEAR)
  const [modeB, setModeB] = useState('monthly')
  const [qB, setQB] = useState('Q2')
  const [monthB, setMonthB] = useState('April')

  function getPeriodKey(mode, q, month, year) {
    return mode === 'quarterly' ? makeQuarterKey(q, year) : makeMonthKey(month, year)
  }

  const keyA = getPeriodKey(modeA, qA, monthA, yearA)
  const keyB = getPeriodKey(modeB, qB, monthB, yearB)

  function hasData(key, mode) {
<<<<<<< HEAD
    if (mode === 'quarterly') {
      // Direct quarterly survey entry counts
      if (susScore(data.quarterly[key]?.answers) !== null) return true
      // Consolidated from monthly entries also counts (complete or partial)
      const [q, year] = key.split(' ')
      const monthKeys = getMonthsForQuarter(q, year)
      const status = quarterStatus(data.monthly, monthKeys)
      return status === 'complete' || status === 'partial'
    }
    return susScore(data.monthly[key]?.answers) !== null
  }

  function dataSourceLabel(key, mode) {
    if (mode !== 'quarterly') return 'has data'
    if (susScore(data.quarterly[key]?.answers) !== null) return 'has data (direct survey)'
    const [q, year] = key.split(' ')
    const monthKeys = getMonthsForQuarter(q, year)
    const status = quarterStatus(data.monthly, monthKeys)
    if (status === 'complete') return 'consolidated from monthly (all 3 filled)'
    if (status === 'partial') return 'consolidated from monthly (partial)'
    return 'has data'
  }

  const bHasData = hasData(keyB, modeB)
  const aHasData = hasData(keyA, modeA)
  const canGenerate = bHasData // at minimum Period B must have data
=======
    if (mode === 'quarterly') return susScore(data.quarterly[key]?.answers) !== null
    return susScore(data.monthly[key]?.answers) !== null
  }

  const canGenerate = true // always allow; dashboard shows empty state if no data
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa

  return (
    <div className={styles.reportPicker}>
      <h3 className={styles.rpTitle}>Generate Report</h3>
      <p className={styles.rpDesc}>
<<<<<<< HEAD
        Compare any two periods. Period B must have data. Period A is optional (used as baseline).
=======
        Compare any two periods. Select a previous month/quarter and a current one to see your growth.
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
      </p>

      <div className={styles.rpGrid}>
        {/* Period A */}
        <div className={styles.rpPeriod}>
          <div className={styles.rpPeriodLabel}>Period A <span className={styles.rpLabelSub}>(earlier / baseline)</span></div>
          <div className={styles.rpControls}>
            <select value={yearA} onChange={e => setYearA(+e.target.value)} className={styles.rpSelect}>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <div className={styles.rpModeToggle}>
              <button className={`${styles.rpModeBtn} ${modeA === 'monthly' ? styles.rpModeActive : ''}`} onClick={() => setModeA('monthly')}>Monthly</button>
              <button className={`${styles.rpModeBtn} ${modeA === 'quarterly' ? styles.rpModeActive : ''}`} onClick={() => setModeA('quarterly')}>Quarterly</button>
            </div>
            {modeA === 'quarterly' ? (
              <select value={qA} onChange={e => setQA(e.target.value)} className={styles.rpSelect}>
                {ALL_QUARTERS.map(q => <option key={q}>{q}</option>)}
              </select>
            ) : (
              <>
                <select value={qA} onChange={e => { setQA(e.target.value); setMonthA(QUARTER_MONTH_NAMES[e.target.value][0]) }} className={styles.rpSelect}>
                  {ALL_QUARTERS.map(q => <option key={q}>{q}</option>)}
                </select>
                <select value={monthA} onChange={e => setMonthA(e.target.value)} className={styles.rpSelect}>
                  {QUARTER_MONTH_NAMES[qA].map(m => <option key={m}>{m}</option>)}
                </select>
              </>
            )}
          </div>
          <div className={styles.rpKey}>
            {keyA}
            {hasData(keyA, modeA)
<<<<<<< HEAD
              ? <span className={styles.rpHasData}> ✓ {dataSourceLabel(keyA, modeA)}</span>
=======
              ? <span className={styles.rpHasData}> ✓ has data</span>
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
              : <span className={styles.rpNoData}> · no data yet</span>
            }
          </div>
        </div>

        <div className={styles.rpArrow}>→</div>

        {/* Period B */}
        <div className={styles.rpPeriod}>
          <div className={styles.rpPeriodLabel}>Period B <span className={styles.rpLabelSub}>(current / comparison)</span></div>
          <div className={styles.rpControls}>
            <select value={yearB} onChange={e => setYearB(+e.target.value)} className={styles.rpSelect}>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <div className={styles.rpModeToggle}>
              <button className={`${styles.rpModeBtn} ${modeB === 'monthly' ? styles.rpModeActive : ''}`} onClick={() => setModeB('monthly')}>Monthly</button>
              <button className={`${styles.rpModeBtn} ${modeB === 'quarterly' ? styles.rpModeActive : ''}`} onClick={() => setModeB('quarterly')}>Quarterly</button>
            </div>
            {modeB === 'quarterly' ? (
              <select value={qB} onChange={e => setQB(e.target.value)} className={styles.rpSelect}>
                {ALL_QUARTERS.map(q => <option key={q}>{q}</option>)}
              </select>
            ) : (
              <>
                <select value={qB} onChange={e => { setQB(e.target.value); setMonthB(QUARTER_MONTH_NAMES[e.target.value][0]) }} className={styles.rpSelect}>
                  {ALL_QUARTERS.map(q => <option key={q}>{q}</option>)}
                </select>
                <select value={monthB} onChange={e => setMonthB(e.target.value)} className={styles.rpSelect}>
                  {QUARTER_MONTH_NAMES[qB].map(m => <option key={m}>{m}</option>)}
                </select>
              </>
            )}
          </div>
          <div className={styles.rpKey}>
            {keyB}
            {hasData(keyB, modeB)
<<<<<<< HEAD
              ? <span className={styles.rpHasData}> ✓ {dataSourceLabel(keyB, modeB)}</span>
=======
              ? <span className={styles.rpHasData}> ✓ has data</span>
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
              : <span className={styles.rpNoData}> · no data yet</span>
            }
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {!canGenerate && (
        <p className={styles.rpBlockedMsg}>
          ⚠ Period B ({keyB}) has no data yet. Fill in that period's survey first.
        </p>
      )}
      <button
        className={`${styles.generateBtn} ${!canGenerate ? styles.generateBtnDisabled : ''}`}
        disabled={!canGenerate}
        onClick={() => canGenerate && onGenerate(
=======
      <button
        className={styles.generateBtn}
        onClick={() => onGenerate(
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
          { key: keyA, isMonthly: modeA === 'monthly' },
          { key: keyB, isMonthly: modeB === 'monthly' }
        )}
      >
<<<<<<< HEAD
        {canGenerate
          ? `Generate Report: ${aHasData ? keyA + ' → ' : ''}${keyB}`
          : 'Complete Period B survey to generate report'
        }
=======
        Generate Report: {keyA} → {keyB}
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
      </button>
    </div>
  )
}

<<<<<<< HEAD
export default function ModeSelector({ data, onSelectMonthly, onSelectQuarterly, onDashboard, onQuarterReport }) {
=======
export default function ModeSelector({ data, onSelectMonthly, onSelectQuarterly, onDashboard }) {
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Personal Growth Dashboard</p>
        <h2 className={styles.heroTitle}>Track your growth,<br /><em>period by period.</em></h2>
        <p className={styles.heroDesc}>
          Pick a year, then log monthly or quarterly entries. Compare any two periods to generate a growth report.
        </p>
      </div>

      {/* Year selector */}
      <div className={styles.yearSelector}>
        <span className={styles.yearLabel}>Viewing year:</span>
        <div className={styles.yearBtns}>
          {YEARS.map(y => (
            <button
              key={y}
              className={`${styles.yearBtn} ${selectedYear === y ? styles.yearActive : ''}`}
              onClick={() => setSelectedYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Quarter grid for selected year */}
      <div className={styles.quarterGrid}>
        {ALL_QUARTERS.map(q => (
          <QuarterSection
            key={q}
            q={q}
            year={selectedYear}
            data={data}
            onMonthly={onSelectMonthly}
            onQuarterly={onSelectQuarterly}
<<<<<<< HEAD
            onQuarterReport={onQuarterReport}
=======
>>>>>>> 0f3be879a29130b815e33869fdf0519548523dfa
          />
        ))}
      </div>

      {/* Report generator */}
      <ReportPicker
        data={data}
        onGenerate={(pA, pB) => onDashboard(pA, pB)}
      />
    </div>
  )
}
