import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Chart } from 'react-chartjs-2'
import {
  susScore, growthScore, scoreLabel, QUESTIONS,
  THEME_COLORS, generateInsights, analyzeGrowthQuality,
  aggregateMonthlyAnswers, aggregateMonthlyActivities,
  getMonthsForQuarter, quarterStatus
} from '../constants.js'
import styles from './Dashboard.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function InsightCard({ title, value, sub, direction, delay }) {
  const cls = direction === 'up' ? styles.up : direction === 'down' ? styles.down : ''
  return (
    <div className={styles.insightCard} style={{ animationDelay: `${delay}ms` }}>
      <span className={styles.insightTitle}>{title}</span>
      <span className={`${styles.insightVal} ${cls}`}>{value}</span>
      <span className={styles.insightSub}>{sub}</span>
    </div>
  )
}

function ActivityListSection({ label, events, milestones }) {
  const [open, setOpen] = useState(false)
  const total = events.length + milestones.length
  if (total === 0) return null
  return (
    <div className={styles.activityList}>
      <button className={styles.actListToggle} onClick={() => setOpen(o => !o)}>
        <span>{label} — {total} activit{total !== 1 ? 'ies' : 'y'} logged</span>
        <span className={styles.toggleIcon}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className={styles.actListItems}>
          {milestones.map((m, i) => (
            <div key={m.id || i} className={styles.actItem}>
              <span className={styles.actItemIcon} style={{ color: 'var(--teal)' }}>★</span>
              <span className={styles.actItemTitle}>{m.title}</span>
              {m.date && <span className={styles.actItemDate}>{m.date}</span>}
              <span className={styles.actItemPts}>+4 pts</span>
            </div>
          ))}
          {events.map((e, i) => (
            <div key={e.id || i} className={styles.actItem}>
              <span className={styles.actItemIcon} style={{ color: 'var(--accent)' }}>◆</span>
              <span className={styles.actItemTitle}>{e.title}</span>
              {e.date && <span className={styles.actItemDate}>{e.date}</span>}
              <span className={styles.actItemPts}>+1 pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActionableInsights({ insights }) {
  if (!insights.length) return null
  const typeConfig = {
    improve:  { icon: '↑', label: 'Focus area', border: 'var(--accent)' },
    declined: { icon: '↓', label: 'Declined',   border: '#D85A30' },
    strength: { icon: '★', label: 'Strength',   border: 'var(--teal)' },
  }
  return (
    <div className={styles.insightsBlock}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Actionable Insights</h3>
          <p className={styles.chartDesc}>Where to direct your energy next period</p>
        </div>
      </div>
      <div className={styles.insightsList}>
        {insights.map((ins, i) => {
          const { icon, label, border } = typeConfig[ins.type] || typeConfig.improve
          const tc = THEME_COLORS[ins.themeKey] || { color: 'var(--ink)', bg: 'var(--cream-dark)' }
          return (
            <div key={i} className={styles.insightItem} style={{ borderLeftColor: border }}>
              <div className={styles.insightItemHeader}>
                <span className={styles.insightBadge} style={{ background: tc.bg, color: tc.color }}>
                  {icon} {ins.theme}
                </span>
                <span className={styles.insightType} style={{ color: border }}>{label}</span>
              </div>
              <h4 className={styles.insightItemTitle}>{ins.title}</h4>
              <div className={styles.insightAction}>
                <span className={styles.insightActionIcon}>→</span>
                <span>{ins.action}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Smart Growth Summary (replaces References) ───────────────────────────────
function GrowthSummary({ periodAData, periodBData, labelA, labelB }) {
  const analyses = analyzeGrowthQuality(periodAData, periodBData)
  const susA = susScore(periodAData?.answers)
  const susB = susScore(periodBData?.answers)
  const gsA  = growthScore(periodAData?.events, periodAData?.milestones)
  const gsB  = growthScore(periodBData?.events, periodBData?.milestones)

  const typeStyles = {
    success: { border: 'var(--teal)', icon: '✨', bg: 'color-mix(in srgb, var(--teal) 6%, transparent)' },
    warning: { border: '#D85A30',     icon: '⚠️', bg: 'color-mix(in srgb, #D85A30 6%, transparent)' },
    tip:     { border: 'var(--gold)', icon: '💡', bg: 'color-mix(in srgb, var(--gold) 6%, transparent)' },
    neutral: { border: 'var(--ink-faint)', icon: '📊', bg: 'transparent' },
  }

  if (susA === null && susB === null) {
    return (
      <div className={styles.summaryBlock}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Growth Summary</h3>
            <p className={styles.chartDesc}>Fill in at least one period to see your personalized growth analysis.</p>
          </div>
        </div>
        <p className={styles.emptyNote}>No data yet — complete your self-assessment to unlock your summary.</p>
      </div>
    )
  }

  return (
    <div className={styles.summaryBlock}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>Growth Summary</h3>
          <p className={styles.chartDesc}>
            What the data says about your growth quality — and what to do next
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className={styles.summaryStats}>
        <div className={styles.summaryStatItem}>
          <span className={styles.ssLabel}>{labelA} self-score</span>
          <span className={styles.ssVal}>{susA !== null ? `${susA}/100` : '—'}</span>
        </div>
        <div className={styles.summaryArrow}>→</div>
        <div className={styles.summaryStatItem}>
          <span className={styles.ssLabel}>{labelB} self-score</span>
          <span className={styles.ssVal} style={{ color: susA !== null && susB !== null ? (susB >= susA ? 'var(--teal)' : 'var(--accent)') : 'var(--ink)' }}>
            {susB !== null ? `${susB}/100` : '—'}
          </span>
        </div>
        <div className={styles.summaryStatItem}>
          <span className={styles.ssLabel}>Growth score change</span>
          <span className={styles.ssVal} style={{ color: gsB >= gsA ? 'var(--teal)' : 'var(--accent)' }}>
            {gsB - gsA >= 0 ? '+' : ''}{gsB - gsA} pts
          </span>
        </div>
      </div>

      {/* Analysis cards */}
      <div className={styles.analysisCards}>
        {analyses.map((a, i) => {
          const ts = typeStyles[a.type] || typeStyles.neutral
          return (
            <div key={i} className={styles.analysisCard} style={{ borderLeftColor: ts.border, background: ts.bg }}>
              <div className={styles.analysisCardTitle}>
                <span>{a.icon}</span>
                <strong>{a.title}</strong>
              </div>
              <p className={styles.analysisCardBody}>{a.body}</p>
              <ul className={styles.analysisActions}>
                {a.actions.map((act, j) => (
                  <li key={j}><span className={styles.actBullet}>→</span> {act}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Quality growth explainer */}
      <div className={styles.qualityNote}>
        <strong>What is quality growth?</strong>
        <p>
          More events + same/lower self-score = <em>overload</em>, not growth.<br/>
          Fewer events + more milestones + higher self-score = <em>quality growth</em>.<br/>
          The goal is intentional progress, not a full calendar.
        </p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard({ periodA, periodB, data, getQuarterData, onBack }) {
  // Resolve period data
  function resolvePeriod(period) {
    if (!period) return { data: null, label: 'Period A' }
    const { key, isMonthly } = period
    if (!isMonthly) {
      // It's a quarter key like "Q2 2024"
      return { data: getQuarterData(key), label: key }
    }
    return { data: data.monthly[key] || null, label: key }
  }

  const pA = resolvePeriod(periodA)
  const pB = resolvePeriod(periodB)

  const dA = pA.data || { answers: Array(10).fill(0), events: [], milestones: [] }
  const dB = pB.data || { answers: Array(10).fill(0), events: [], milestones: [] }

  const susA = susScore(dA.answers)
  const susB = susScore(dB.answers)
  const gsA = growthScore(dA.events, dA.milestones)
  const gsB = growthScore(dB.events, dB.milestones)
  const susDiff = susA !== null && susB !== null ? susB - susA : null
  const gsDiff = gsB - gsA

  const evA = Array.isArray(dA.events) ? dA.events.length : 0
  const msA = Array.isArray(dA.milestones) ? dA.milestones.length : 0
  const evB = Array.isArray(dB.events) ? dB.events.length : 0
  const msB = Array.isArray(dB.milestones) ? dB.milestones.length : 0

  const improved = susDiff === null ? null : susDiff > 0 ? true : susDiff < 0 ? false : null
  const betterState = improved === true && gsDiff >= 0

  const insights = generateInsights(dA.answers, dB.answers)
  const labelA = pA.label || 'Period A'
  const labelB = pB.label || 'Period B'

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9E8E7E', font: { family: "'DM Mono'", size: 12 } },
        border: { color: 'rgba(26,22,18,0.12)' }
      },
      y: {
        grid: { color: 'rgba(26,22,18,0.06)' },
        ticks: { color: '#9E8E7E', font: { family: "'DM Mono'", size: 11 } },
        border: { dash: [4,4], color: 'transparent' }
      }
    }
  }

  const shortA = labelA.length > 12 ? labelA.replace(/(\w+) (\d+)/, (_, q, y) => `${q} '${String(y).slice(2)}`) : labelA
  const shortB = labelB.length > 12 ? labelB.replace(/(\w+) (\d+)/, (_, q, y) => `${q} '${String(y).slice(2)}`) : labelB

  const susChartData = {
    labels: [shortA, shortB],
    datasets: [{ data: [susA ?? 0, susB ?? 0], backgroundColor: ['rgba(196,98,45,0.5)','rgba(45,122,107,0.6)'], borderColor: ['#C4622D','#2D7A6B'], borderWidth: 2, borderRadius: 8, borderSkipped: false }]
  }
  const susOpts = { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min:0, max:100 } }, plugins: { ...chartDefaults.plugins, tooltip: { callbacks: { label: ctx => ` Score: ${ctx.raw}/100` } } } }

  const actChartData = {
    labels: [shortA, shortB],
    datasets: [
      { label:'Events', data:[evA,evB], backgroundColor:'rgba(196,98,45,0.4)', borderColor:'#C4622D', borderWidth:1.5, borderRadius:{topLeft:0,topRight:0,bottomLeft:6,bottomRight:6}, borderSkipped:'bottom' },
      { label:'Milestones', data:[msA,msB], backgroundColor:'rgba(45,122,107,0.5)', borderColor:'#2D7A6B', borderWidth:1.5, borderRadius:{topLeft:6,topRight:6,bottomLeft:0,bottomRight:0}, borderSkipped:'bottom' }
    ]
  }
  const actOpts = { ...chartDefaults, scales: { x: { ...chartDefaults.scales.x, stacked: true }, y: { ...chartDefaults.scales.y, stacked: true, ticks: { ...chartDefaults.scales.y.ticks, stepSize:1 } } } }

  const comboData = {
    labels: [shortA, shortB],
    datasets: [
      { type:'bar', label:'Growth score', data:[gsA,gsB], backgroundColor:'rgba(184,134,11,0.35)', borderColor:'#B8860B', borderWidth:2, borderRadius:8, yAxisID:'y' },
      { type:'line', label:'Self-score', data:[susA??0,susB??0], borderColor:'#C4622D', backgroundColor:'rgba(196,98,45,0.08)', borderWidth:2.5, pointBackgroundColor:'#C4622D', pointRadius:6, tension:0.3, fill:true, yAxisID:'y2' }
    ]
  }
  const comboOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false} },
    scales:{
      x:{ ...chartDefaults.scales.x },
      y:{ type:'linear', position:'left', grid:{color:'rgba(26,22,18,0.06)'}, ticks:{color:'#B8860B', font:{family:"'DM Mono'",size:11}}, title:{display:true,text:'Growth score',color:'#B8860B',font:{size:11,family:"'DM Mono'"}} },
      y2:{ type:'linear', position:'right', min:0, max:100, grid:{display:false}, ticks:{color:'#C4622D', font:{family:"'DM Mono'",size:11}}, title:{display:true,text:'Self-score',color:'#C4622D',font:{size:11,family:"'DM Mono'"}} }
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.periodLabel}>{labelA} → {labelB}</p>
          <h2 className={styles.pageTitle}>Growth<em> Report</em></h2>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.backBtn} onClick={onBack}>← Home</button>
          <button className={styles.printBtn} onClick={() => window.print()}>Print</button>
        </div>
      </div>

      {/* Insight cards */}
      <div className={styles.insightGrid}>
        <InsightCard title="Did I improve?" value={improved===null?'Pending':improved?'Yes ↑':'Not yet ↓'} sub="Based on self-score" direction={improved===null?'':improved?'up':'down'} delay={0} />
        <InsightCard title="Self-score change" value={susDiff===null?'—':(susDiff>0?'+':'')+susDiff+' pts'} sub={`${labelA} → ${labelB}`} direction={susDiff===null?'':susDiff>0?'up':'down'} delay={60} />
        <InsightCard title="Growth score Δ" value={(gsDiff>0?'+':'')+gsDiff+' pts'} sub="Activity delta" direction={gsDiff>0?'up':gsDiff<0?'down':''} delay={120} />
        <InsightCard title="Better overall?" value={improved===null?'Pending':betterState?'Yes ✓':'Mixed'} sub="Score + activity" direction={improved===null?'':betterState?'up':'down'} delay={180} />
      </div>

      {/* Score summary */}
      <div className={styles.scoreRow}>
        {[{ q: labelA, sus: susA, gs: gsA, isAgg: dA._aggregated }, { q: labelB, sus: susB, gs: gsB, isAgg: dB._aggregated }].map(({ q, sus, gs, isAgg }) => {
          const { label, color } = scoreLabel(sus)
          return (
            <div key={q} className={styles.scoreCard}>
              <div className={styles.scoreCardTop}>
                <span className={styles.scoreQ}>{q}</span>
                {isAgg && <span className={styles.aggBadge}>Aggregated from monthly</span>}
              </div>
              <div className={styles.scoreBig} style={{ color }}>{sus!==null ? sus : '—'}<span className={styles.scoreUnit}>/100</span></div>
              <div className={styles.scoreTag} style={{ background: color+'22', color }}>{label}</div>
              <div className={styles.scoreSub}>Growth score: {gs} pts</div>
            </div>
          )
        })}
      </div>

      {/* Activity logs */}
      <div className={styles.chartBlock}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Activity log</h3>
            <p className={styles.chartDesc}>All events and milestones with dates</p>
          </div>
        </div>
        <ActivityListSection label={labelA} events={Array.isArray(dA.events)?dA.events:[]} milestones={Array.isArray(dA.milestones)?dA.milestones:[]} />
        <ActivityListSection label={labelB} events={Array.isArray(dB.events)?dB.events:[]} milestones={Array.isArray(dB.milestones)?dB.milestones:[]} />
        {evA+msA+evB+msB===0 && <p className={styles.emptyNote}>No activities logged yet.</p>}
      </div>

      {/* Charts */}
      <div className={styles.chartBlock} style={{animationDelay:'100ms'}}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Self-score comparison</h3>
            <p className={styles.chartDesc}>SUS-adapted score (0–100) per period</p>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#C4622D'}}/>{shortA}</span>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#2D7A6B'}}/>{shortB}</span>
          </div>
        </div>
        <div className={styles.chartWrap} style={{height:'200px'}}><Bar data={susChartData} options={susOpts} /></div>
      </div>

      <div className={styles.chartBlock} style={{animationDelay:'150ms'}}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Activity breakdown</h3>
            <p className={styles.chartDesc}>Events and milestones per period (stacked)</p>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#C4622D'}}/>Events</span>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#2D7A6B'}}/>Milestones</span>
          </div>
        </div>
        <div className={styles.chartWrap} style={{height:'200px'}}><Bar data={actChartData} options={actOpts} /></div>
      </div>

      <div className={styles.chartBlock} style={{animationDelay:'200ms'}}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Combined growth insight</h3>
            <p className={styles.chartDesc}>Growth score (bars) vs self-score (line)</p>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#B8860B'}}/>Growth</span>
            <span className={styles.legendItem}><span className={styles.legendLine} style={{background:'#C4622D'}}/>Self-score</span>
          </div>
        </div>
        <div className={styles.chartWrap} style={{ height: '220px' }}>
          <Chart
            type="bar"
            data={comboData}
            options={comboOpts}
          />
        </div>
      </div>

      {/* Question breakdown */}
      <div className={styles.breakdownBlock} style={{animationDelay:'250ms'}}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Question-level breakdown</h3>
            <p className={styles.chartDesc}>Per-question delta (B − A) · grouped by theme</p>
          </div>
        </div>
        <div className={styles.breakdownList}>
          {QUESTIONS.map((q, i) => {
            const aA = (dA.answers||[])[i] || 0
            const aB = (dB.answers||[])[i] || 0
            const diff = aB - aA
            const tc = THEME_COLORS[q.themeKey] || { color: 'var(--ink-faint)', bg: 'var(--cream-dark)' }
            const deltaColor = diff > 0 ? 'var(--teal)' : diff < 0 ? 'var(--accent)' : 'var(--ink-faint)'
            return (
              <div key={i} className={styles.breakdownRow}>
                <span className={styles.bqNum}>{String(i+1).padStart(2,'0')}</span>
                <span className={styles.bqTheme} style={{background:tc.bg, color:tc.color}}>{q.theme}</span>
                <div className={styles.bqMid}>
                  <p className={styles.bqText}>{q.text}</p>
                  <div className={styles.bqBarWrap}>
                    <div className={styles.bqBar}><div className={styles.bqFill4} style={{width:`${(aA/5)*100}%`}}/></div>
                    <span className={styles.bqQuarter}>A</span>
                    <div className={styles.bqBar}><div className={styles.bqFill1} style={{width:`${(aB/5)*100}%`, background: diff>0?'var(--teal-light)':diff<0?'var(--accent)':'var(--ink-faint)', opacity:0.7}}/></div>
                    <span className={styles.bqQuarter}>B</span>
                  </div>
                </div>
                <span className={styles.bqVal} style={{color:deltaColor}}>
                  {diff > 0 ? '+' : ''}{diff !== 0 ? diff : aB>0 ? '=' : '—'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actionable Insights */}
      <ActionableInsights insights={insights} />

      {/* Growth Summary — replaces References */}
      <GrowthSummary
        periodAData={dA}
        periodBData={dB}
        labelA={labelA}
        labelB={labelB}
      />

      <div className={styles.actions}>
        <button className={styles.backLarge} onClick={onBack}>← Back to Home</button>
        <button className={styles.printLarge} onClick={() => window.print()}>Print report</button>
      </div>
    </div>
  )
}
