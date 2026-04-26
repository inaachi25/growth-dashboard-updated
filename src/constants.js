// ─── Dynamic Quarter & Month Helpers ─────────────────────────────────────────

export const ALL_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

export const QUARTER_MONTH_NAMES = {
  Q1: ['January', 'February', 'March'],
  Q2: ['April', 'May', 'June'],
  Q3: ['July', 'August', 'September'],
  Q4: ['October', 'November', 'December'],
}

export function makeQuarterKey(q, year) {
  return `${q} ${year}`
}

export function makeMonthKey(monthName, year) {
  return `${monthName} ${year}`
}

export function getMonthsForQuarter(q, year) {
  return QUARTER_MONTH_NAMES[q].map(m => makeMonthKey(m, year))
}

// ─── Questions ────────────────────────────────────────────────────────────────

export const QUESTIONS = [
  {
    text: 'I feel clear about my personal goals and direction.',
    theme: 'Goal Clarity',
    themeKey: 'goal',
  },
  {
    text: 'I am making consistent progress on what matters most to me.',
    theme: 'Progress',
    themeKey: 'progress',
  },
  {
    text: 'I manage my time and energy effectively.',
    theme: 'Self-Regulation',
    themeKey: 'selfregulation',
  },
  {
    text: 'I handle stress and setbacks with resilience.',
    theme: 'Resilience',
    themeKey: 'resilience',
  },
  {
    text: 'I am learning new skills or deepening existing ones.',
    theme: 'Learning',
    themeKey: 'learning',
  },
  {
    text: 'I feel a sense of purpose in my daily activities.',
    theme: 'Purpose',
    themeKey: 'purpose',
  },
  {
    text: 'My relationships and social connections are fulfilling.',
    theme: 'Relationships',
    themeKey: 'relationships',
  },
  {
    text: 'I take care of my physical and mental well-being.',
    theme: 'Well-being',
    themeKey: 'wellbeing',
  },
  {
    text: 'I reflect regularly on my actions and decisions.',
    theme: 'Reflection',
    themeKey: 'reflection',
  },
  {
    text: 'Overall, I feel I am growing as a person.',
    theme: 'Overall Growth',
    themeKey: 'overall',
  },
]

export const THEME_COLORS = {
  goal:           { color: '#7B5EA7', bg: '#F3EEFF' },
  progress:       { color: '#2D7A6B', bg: '#D0EDE8' },
  selfregulation: { color: '#B8860B', bg: '#FAF0D0' },
  resilience:     { color: '#C4622D', bg: '#F5DBCF' },
  learning:       { color: '#2060A0', bg: '#D8E8F5' },
  purpose:        { color: '#8B4A2A', bg: '#F5E8DF' },
  relationships:  { color: '#1B7A4A', bg: '#D5EDDF' },
  wellbeing:      { color: '#5B7A3A', bg: '#E4EDD8' },
  reflection:     { color: '#6A5A8A', bg: '#EDE8F5' },
  overall:        { color: '#3A5A7A', bg: '#D8E5EF' },
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export const MILESTONE_WEIGHT = 4
export const EVENT_WEIGHT = 1

export function susScore(answers) {
  if (!answers || answers.filter(a => a > 0).length < 10) return null
  let total = 0
  answers.forEach((a, i) => {
    if (i % 2 === 0) total += a - 1
    else total += 5 - a
  })
  return Math.round(total * 2.5)
}

export function growthScore(eventList, milestoneList) {
  const e = Array.isArray(eventList) ? eventList.length : (parseInt(eventList) || 0)
  const m = Array.isArray(milestoneList) ? milestoneList.length : (parseInt(milestoneList) || 0)
  return e * EVENT_WEIGHT + m * MILESTONE_WEIGHT
}

export function scoreLabel(score) {
  if (score === null) return { label: 'Incomplete', color: 'var(--ink-faint)' }
  if (score >= 85) return { label: 'Excellent', color: 'var(--teal)' }
  if (score >= 70) return { label: 'Good', color: 'var(--teal-light)' }
  if (score >= 50) return { label: 'Fair', color: 'var(--gold)' }
  return { label: 'Needs work', color: 'var(--accent)' }
}

// ─── Quality Growth Analysis ──────────────────────────────────────────────────

export function analyzeGrowthQuality(periodAData, periodBData) {
  const susA = susScore(periodAData?.answers)
  const susB = susScore(periodBData?.answers)
  const evA = Array.isArray(periodAData?.events) ? periodAData.events.length : 0
  const msA = Array.isArray(periodAData?.milestones) ? periodAData.milestones.length : 0
  const evB = Array.isArray(periodBData?.events) ? periodBData.events.length : 0
  const msB = Array.isArray(periodBData?.milestones) ? periodBData.milestones.length : 0

  const results = []

  if (susA !== null && susB !== null) {
    const susDiff = susB - susA
    const evDiff = evB - evA
    const msDiff = msB - msA

    // Overload pattern: more events, same/lower self-score
    if (evDiff > 2 && susDiff <= 0) {
      results.push({
        type: 'warning',
        icon: '⚠️',
        title: 'High activity, low return — signs of overload',
        body: `You logged significantly more events in Period B (+${evDiff}) but your self-score ${susDiff < 0 ? `dropped by ${Math.abs(susDiff)} pts` : 'stayed flat'}. More events without score gains signals busyness without growth.`,
        actions: [
          'Audit your events: are they aligned to your actual goals?',
          'Cut low-value commitments and protect time for deep work.',
          'Fewer, higher-impact activities beat a full calendar.',
        ],
      })
    }

    // Quality growth: fewer events, more milestones, higher score
    if (susDiff > 0 && (msDiff >= 0 || evDiff <= 0)) {
      results.push({
        type: 'success',
        icon: '✨',
        title: 'High-quality growth — depth over breadth',
        body: `Period B shows a higher self-score (+${susDiff} pts)${msDiff > 0 ? ` and more milestones (+${msDiff})` : ''}. This is intentional, meaningful progress.`,
        actions: [
          'Keep prioritizing milestones — they signal real achievement.',
          "Document what habits or routines drove this period's quality.",
          'Replicate this approach next period.',
        ],
      })
    }

    // Good score but zero milestones
    if (susB >= 60 && msB === 0) {
      results.push({
        type: 'tip',
        icon: '💡',
        title: 'Strong self-score, but no milestones recorded',
        body: "Your self-assessment is solid, but you haven't logged any milestones. Milestones are the tangible proof of growth.",
        actions: [
          'Reflect: what did you actually achieve this period?',
          'Log at least 1–2 milestones retroactively.',
          'Next period, set 2–3 milestone targets at the start.',
        ],
      })
    }

    // Low self-score but many milestones
    if (susB < 55 && msB >= 3) {
      results.push({
        type: 'tip',
        icon: '🔍',
        title: "Many milestones, but self-score doesn't reflect it",
        body: `You logged ${msB} milestones but rate yourself at only ${susB}/100. There may be a gap between external output and internal satisfaction.`,
        actions: [
          'Ask yourself: are these milestones truly meaningful, or externally driven?',
          'Review your Purpose and Well-being scores — they may reveal the disconnect.',
          "Growth that doesn't feel good internally is worth re-evaluating.",
        ],
      })
    }

    // Significant decline
    if (susDiff <= -10) {
      results.push({
        type: 'warning',
        icon: '📉',
        title: 'Significant score decline — time to reset',
        body: `Your self-score dropped by ${Math.abs(susDiff)} points. A drop of this size usually signals burnout, misalignment, or unaddressed stress.`,
        actions: [
          'Do a full-period debrief: what drained you most?',
          'Identify 1–2 root causes, not just symptoms.',
          'Consider reducing commitments before adding new ones.',
        ],
      })
    }

    // Strong improvement
    if (susDiff >= 10) {
      results.push({
        type: 'success',
        icon: '🚀',
        title: 'Strong improvement — momentum is building',
        body: `A +${susDiff} pt jump signals genuine positive momentum. This is the time to study what you did differently and build on it.`,
        actions: [
          'Write down the 2–3 biggest changes you made this period.',
          'Lock in those habits before adding new goals.',
          'Set a stretch milestone for next period while momentum is high.',
        ],
      })
    }
  }

  // Default if nothing triggered
  if (results.length === 0) {
    results.push({
      type: 'neutral',
      icon: '📊',
      title: 'Steady — keep building the data picture',
      body: 'With more periods logged, patterns will sharpen. Consistency in tracking is itself a growth habit.',
      actions: [
        'Keep logging monthly — patterns emerge over 3+ periods.',
        'Set 1 specific goal for next period and track it as a milestone.',
        'Review your lowest-scoring question and pick one action to improve it.',
      ],
    })
  }

  return results
}

// ─── Actionable Insights Engine ───────────────────────────────────────────────

export function generateInsights(answersA, answersB) {
  const qA = answersA || Array(10).fill(0)
  const qB = answersB || Array(10).fill(0)

  const scores = QUESTIONS.map((q, i) => ({
    i, theme: q.theme, themeKey: q.themeKey, text: q.text,
    a: qA[i] || 0, b: qB[i] || 0,
    diff: (qB[i] || 0) - (qA[i] || 0),
  }))

  const lowestB      = [...scores].filter(s => s.b > 0).sort((a, b) => a.b - b.b).slice(0, 3)
  const mostDeclined = [...scores].filter(s => s.diff < 0).sort((a, b) => a.diff - b.diff).slice(0, 2)
  const mostImproved = [...scores].filter(s => s.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 2)

  const all = []

  lowestB.forEach(s => {
    all.push({
      type: 'improve',
      theme: s.theme, themeKey: s.themeKey,
      title: `Strengthen your ${s.theme}`,
      body: QUESTIONS[s.i].themeKey,
      action: getAction(s.themeKey),
      score: s.b,
    })
  })

  mostDeclined.forEach(s => {
    all.push({
      type: 'declined',
      theme: s.theme, themeKey: s.themeKey,
      title: `${s.theme} declined this period`,
      body: `Your score dropped by ${Math.abs(s.diff)} pt${Math.abs(s.diff) > 1 ? 's' : ''}.`,
      action: getAction(s.themeKey),
      score: s.b,
    })
  })

  mostImproved.forEach(s => {
    all.push({
      type: 'strength',
      theme: s.theme, themeKey: s.themeKey,
      title: `${s.theme} is your rising strength`,
      body: `Up by ${s.diff} pt${s.diff > 1 ? 's' : ''}.`,
      action: "Keep doing what's working — document your habit or practice for this domain so you can replicate it elsewhere.",
      score: s.b,
    })
  })

  const seen = new Set()
  return all.filter(ins => {
    if (seen.has(ins.themeKey)) return false
    seen.add(ins.themeKey)
    return true
  }).slice(0, 5)
}

function getAction(themeKey) {
  const actions = {
    goal:           'Write down 1–3 specific goals with deadlines for next period. Review weekly.',
    progress:       'Break your biggest goal into weekly milestones. Celebrate small wins explicitly.',
    selfregulation: 'Audit your week: block focus time, protect sleep, reduce decision fatigue through routines.',
    resilience:     'Practice a daily 5-minute reflection on what challenged you and what you learned from it.',
    learning:       'Commit to one deliberate learning block per week — course, book, or a skill practice session.',
    purpose:        'Write a one-sentence purpose statement. Filter your weekly commitments through it.',
    relationships:  'Schedule one meaningful connection per week — not networking, genuine catch-up.',
    wellbeing:      'Pick one physical health habit (sleep, movement, or diet) and track it daily for 30 days.',
    reflection:     'Keep a weekly journal: What went well? What would I do differently? What did I learn?',
    overall:        'Do a monthly review across all 10 dimensions — track your trend, not just your state.',
  }
  return actions[themeKey] || 'Reflect on what is holding this area back and pick one small daily action.'
}

// ─── Empty data factories ─────────────────────────────────────────────────────

export const EMPTY_PERIOD_DATA = () => ({
  answers: Array(10).fill(0),
  events: [],
  milestones: [],
})

export const EMPTY_QUARTER_DATA = EMPTY_PERIOD_DATA

// ─── Monthly → Quarter aggregation ───────────────────────────────────────────

export function quarterStatus(monthlyData, monthKeys) {
  const filled = monthKeys.filter(m => {
    const d = monthlyData[m]
    return d && susScore(d.answers) !== null
  })
  if (filled.length === 0) return 'no_monthly'
  if (filled.length === 3) return 'complete'
  return 'partial'
}

export function aggregateMonthlyAnswers(monthlyData, monthKeys) {
  const filled = monthKeys.filter(m => monthlyData[m] && susScore(monthlyData[m].answers) !== null)
  if (filled.length === 0) return Array(10).fill(0)
  const sums = Array(10).fill(0)
  filled.forEach(m => {
    monthlyData[m].answers.forEach((a, i) => { sums[i] += a })
  })
  return sums.map(s => Math.round(s / filled.length))
}

export function aggregateMonthlyActivities(monthlyData, monthKeys) {
  const events = [], milestones = []
  monthKeys.forEach(m => {
    const d = monthlyData[m]
    if (d) {
      if (Array.isArray(d.events)) events.push(...d.events)
      if (Array.isArray(d.milestones)) milestones.push(...d.milestones)
    }
  })
  return { events, milestones }
}
