import { useState } from 'react'
import styles from './ActivityTracker.module.css'

function newItem(title, date, type) {
  return { id: Date.now() + Math.random(), title, date, type }
}

function ItemRow({ item, onRemove }) {
  return (
    <div className={styles.itemRow}>
      <span className={`${styles.itemIcon} ${item.type === 'milestone' ? styles.iconMs : styles.iconEv}`}>
        {item.type === 'milestone' ? '★' : '◆'}
      </span>
      <div className={styles.itemBody}>
        <span className={styles.itemTitle}>{item.title}</span>
        {item.date && <span className={styles.itemDate}>{item.date}</span>}
      </div>
      <button className={styles.removeBtn} onClick={() => onRemove(item.id)} aria-label="Remove">×</button>
    </div>
  )
}

export default function ActivityTracker({ events, milestones, onChange }) {
  const [evTitle, setEvTitle] = useState('')
  const [evDate, setEvDate] = useState('')
  const [msTitle, setMsTitle] = useState('')
  const [msDate, setMsDate] = useState('')

  function addEvent() {
    if (!evTitle.trim()) return
    onChange('events', [...events, newItem(evTitle.trim(), evDate, 'event')])
    setEvTitle(''); setEvDate('')
  }

  function addMilestone() {
    if (!msTitle.trim()) return
    onChange('milestones', [...milestones, newItem(msTitle.trim(), msDate, 'milestone')])
    setMsTitle(''); setMsDate('')
  }

  function removeEvent(id) {
    onChange('events', events.filter(e => e.id !== id))
  }

  function removeMilestone(id) {
    onChange('milestones', milestones.filter(m => m.id !== id))
  }

  return (
    <div className={styles.wrap}>
      {/* Events */}
      <div className={styles.trackSection}>
        <div className={styles.trackHeader}>
          <span className={styles.trackIcon} style={{ color: 'var(--accent)' }}>◆</span>
          <div>
            <h4 className={styles.trackTitle}>Events</h4>
            <p className={styles.trackDesc}>Activities, workshops, meetings, habits — anything notable. Each counts as 1 pt.</p>
          </div>
          <span className={styles.trackCount}>{events.length}</span>
        </div>

        {events.length > 0 && (
          <div className={styles.itemList}>
            {events.map(e => <ItemRow key={e.id} item={e} onRemove={removeEvent} />)}
          </div>
        )}

        <div className={styles.addRow}>
          <input
            className={styles.titleInput}
            type="text"
            placeholder="Event name…"
            value={evTitle}
            onChange={e => setEvTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEvent()}
          />
          <input
            className={styles.dateInput}
            type="date"
            value={evDate}
            onChange={e => setEvDate(e.target.value)}
          />
          <button className={styles.addBtn} onClick={addEvent}>Add</button>
        </div>
      </div>

      {/* Milestones */}
      <div className={styles.trackSection}>
        <div className={styles.trackHeader}>
          <span className={styles.trackIcon} style={{ color: 'var(--teal)' }}>★</span>
          <div>
            <h4 className={styles.trackTitle}>Milestones</h4>
            <p className={styles.trackDesc}>Significant achievements, completions, breakthroughs. Each counts as 4 pts.</p>
          </div>
          <span className={styles.trackCount}>{milestones.length}</span>
        </div>

        {milestones.length > 0 && (
          <div className={styles.itemList}>
            {milestones.map(m => <ItemRow key={m.id} item={m} onRemove={removeMilestone} />)}
          </div>
        )}

        <div className={styles.addRow}>
          <input
            className={styles.titleInput}
            type="text"
            placeholder="Milestone name…"
            value={msTitle}
            onChange={e => setMsTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMilestone()}
          />
          <input
            className={styles.dateInput}
            type="date"
            value={msDate}
            onChange={e => setMsDate(e.target.value)}
          />
          <button className={`${styles.addBtn} ${styles.addBtnTeal}`} onClick={addMilestone}>Add</button>
        </div>
      </div>
    </div>
  )
}
