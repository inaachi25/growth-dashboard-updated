import { useState, useEffect } from 'react'
import {
  ALL_QUARTERS, QUARTER_MONTH_NAMES,
  makeQuarterKey, makeMonthKey, getMonthsForQuarter,
  EMPTY_PERIOD_DATA,
  susScore, quarterStatus, aggregateMonthlyAnswers, aggregateMonthlyActivities
} from './constants.js'
import Header from './components/Header.jsx'
import ModeSelector from './components/ModeSelector.jsx'
import InputView from './components/InputView.jsx'
import Dashboard from './components/Dashboard.jsx'
import styles from './App.module.css'

const STORAGE_KEY = 'pgd_data_v3'

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { monthly: {}, quarterly: {} }
}

function getPeriodFromStore(data, key, isMonthly) {
  const store = isMonthly ? data.monthly : data.quarterly
  return store[key] || EMPTY_PERIOD_DATA()
}

export default function App() {
  const [view, setView]               = useState('home')
  const [mode, setMode]               = useState(null)
  const [activePeriod, setActivePeriod] = useState(null)
  const [data, setData]               = useState(loadData)
  const [animKey, setAnimKey]         = useState(0)

  // Report selection: two periods to compare
  const [reportPeriodA, setReportPeriodA] = useState(null)
  const [reportPeriodB, setReportPeriodB] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }, [data])

  function updateAnswer(period, isMonthly, index, value) {
    const key = isMonthly ? 'monthly' : 'quarterly'
    setData(prev => {
      const existing = prev[key][period] || EMPTY_PERIOD_DATA()
      const answers = [...(existing.answers || Array(10).fill(0))]
      answers[index] = value
      return { ...prev, [key]: { ...prev[key], [period]: { ...existing, answers } } }
    })
  }

  function updateActivity(period, isMonthly, field, value) {
    const key = isMonthly ? 'monthly' : 'quarterly'
    setData(prev => {
      const existing = prev[key][period] || EMPTY_PERIOD_DATA()
      return { ...prev, [key]: { ...prev[key], [period]: { ...existing, [field]: value } } }
    })
  }

  function getReportData(periodKey, isMonthly) {
    if (!periodKey) return EMPTY_PERIOD_DATA()
    if (!isMonthly) {
      return data.quarterly[periodKey] || EMPTY_PERIOD_DATA()
    }
    return data.monthly[periodKey] || EMPTY_PERIOD_DATA()
  }

  // For a quarter key like "Q2 2024", aggregate from monthly if available
  function getQuarterReportData(quarterKey) {
    const [q, year] = quarterKey.split(' ')
    const monthKeys = getMonthsForQuarter(q, year)
    const status = quarterStatus(data.monthly, monthKeys)
    if (status === 'no_monthly') {
      return data.quarterly[quarterKey] || EMPTY_PERIOD_DATA()
    }
    const answers = aggregateMonthlyAnswers(data.monthly, monthKeys)
    const { events, milestones } = aggregateMonthlyActivities(data.monthly, monthKeys)
    return { answers, events, milestones, _aggregated: true }
  }

  function switchView(v, newMode, newPeriod) {
    setView(v)
    if (newMode !== undefined) setMode(newMode)
    if (newPeriod !== undefined) setActivePeriod(newPeriod)
    setAnimKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetAll() {
    if (window.confirm('Reset all data? This cannot be undone.')) {
      setData({ monthly: {}, quarterly: {} })
      switchView('home')
    }
  }

  const isMonthly = mode === 'monthly'

  return (
    <div className={styles.app}>
      <Header
        view={view}
        mode={mode}
        activePeriod={activePeriod}
        onHome={() => switchView('home')}
        onDashboard={() => switchView('dashboard')}
        onReset={resetAll}
      />

      <main className={styles.main}>
        {view === 'home' && (
          <ModeSelector
            key={`home-${animKey}`}
            data={data}
            onSelectMonthly={(month) => switchView('input', 'monthly', month)}
            onSelectQuarterly={(quarter) => switchView('input', 'quarterly', quarter)}
            onQuarterReport={(quarterKey) => {
              // View the consolidated quarter as Period B (no baseline)
              setReportPeriodA(null)
              setReportPeriodB({ key: quarterKey, isMonthly: false })
              switchView('dashboard')
            }}
            onDashboard={(pA, pB) => {
              setReportPeriodA(pA)
              setReportPeriodB(pB)
              switchView('dashboard')
            }}
          />
        )}

        {view === 'input' && activePeriod && (
          <InputView
            key={`input-${activePeriod}-${animKey}`}
            period={activePeriod}
            isMonthly={isMonthly}
            data={getPeriodFromStore(data, activePeriod, isMonthly)}
            allData={data}
            onAnswer={(i, v) => updateAnswer(activePeriod, isMonthly, i, v)}
            onActivity={(field, val) => updateActivity(activePeriod, isMonthly, field, val)}
            onBack={() => switchView('home')}
            onDashboard={() => {
              // Report for the current period: show it as Period B (no comparison yet)
              setReportPeriodA(null)
              setReportPeriodB({ key: activePeriod, isMonthly })
              switchView('dashboard')
            }}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard
            key={`dashboard-${animKey}`}
            periodA={reportPeriodA}
            periodB={reportPeriodB}
            data={data}
            getQuarterData={getQuarterReportData}
            onBack={() => switchView('home')}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <span>Personal Growth Dashboard · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
