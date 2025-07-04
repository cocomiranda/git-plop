import { useState, useEffect } from 'react'
import './App.css'
import { Analytics } from '@vercel/analytics/react'

const today = new Date();

const ACTIVITIES = [
  { key: 'water', label: 'Water', emoji: '💧', type: 'drink' },
  { key: 'walk', label: 'Walk', emoji: '🚶', type: 'do' },
  { key: 'vegetables', label: 'Vegetables', emoji: '🥦🥕🥒', type: 'eat' },
  { key: 'run', label: 'Run', emoji: '🏃', type: 'do' },
  { key: 'read', label: 'Read', emoji: '📚', type: 'do' },
  { key: 'yoga', label: 'Yoga', emoji: '🧘‍♂️', type: 'do' },
  { key: 'study', label: 'Study', emoji: '📖', type: 'do' },
  { key: 'workout', label: 'Workout', emoji: '🏋️', type: 'do' },
  { key: 'quit_smoking', label: 'Quit Smoking', emoji: '🚭', type: 'quit' },
  { key: 'quit_alcohol', label: 'Quit Alcohol', emoji: '🚫🍺', type: 'quit' },
  { key: 'poop', label: 'Poop', emoji: '💩', type: 'do' },
  { key: 'shower', label: 'Shower', emoji: '🚿', type: 'do' },
  { key: 'fruits', label: 'Fruits', emoji: '🍌🍎🍊', type: 'eat' },
];

function getSelectedActivity() {
  return JSON.parse(localStorage.getItem('selectedActivity')) || ACTIVITIES[0];
}

function setSelectedActivity(activity) {
  localStorage.setItem('selectedActivity', JSON.stringify(activity));
}

function getActivityData(activityKey) {
  return JSON.parse(localStorage.getItem(`${activityKey}Data`) || '{}');
}

function setActivityData(activityKey, data) {
  localStorage.setItem(`${activityKey}Data`, JSON.stringify(data));
}

function formatDate(date) {
  // Returns YYYY-MM-DD in local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStreak(data) {
  // Find the most recent date with an entry
  const dates = Object.keys(data).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date(dates[0]);

  // Count consecutive days backwards from the most recent entry
  for (let i = 1; i < 366; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    const prevDateStr = formatDate(prevDate);
    
    if (data[prevDateStr]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  return streak;
}

function getYearCalendarData() {
  const year = today.getFullYear();
  const months = [];
  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const days = [];
    // Fill empty days at start (Monday = 0, Sunday = 6)
    let emptyDays = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < emptyDays; i++) {
      days.push(null);
    }
    // Fill actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, m, d);
      days.push(date);
    }
    months.push(days);
  }
  return months;
}

// Returns 1, 2, or 3 flames based on the streak length
function getFlames(streak) {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 11) return '🔥🔥';
  if (streak >= 1) return '🔥';
  return '';
}

function App() {
  const [activity, setActivity] = useState(getSelectedActivity());
  const [activityData, setActivityDataState] = useState(getActivityData(getSelectedActivity().key));
  const [popup, setPopup] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak(activityData));
  }, [activityData]);

  useEffect(() => {
    setSelectedActivity(activity);
    setActivityDataState(getActivityData(activity.key));
  }, [activity]);

  const handleActivity = () => {
    const date = formatDate(today);
    if (activityData[date]) {
      setPopup('already');
      return;
    }
    const newData = { ...activityData, [date]: true };
    setActivityData(activity.key, newData);
    setActivityDataState(newData);
    setPopup('success');
  };

  const handleReset = () => {
    localStorage.removeItem(`${activity.key}Data`);
    setActivityDataState({});
    setPopup(null);
  };

  useEffect(() => {
    if (popup) {
      const t = setTimeout(() => setPopup(null), 1500);
      return () => clearTimeout(t);
    }
  }, [popup]);

  const months = getYearCalendarData();
  const activityCount = Object.keys(activityData).filter(date => date.startsWith(today.getFullYear())).length;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <>
      <Analytics />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5em', marginBottom: '1em' }}>
        <select
          value={activity.key}
          onChange={e => {
            const selected = ACTIVITIES.find(a => a.key === e.target.value);
            setActivity(selected);
          }}
          style={{ fontSize: '1.1em', padding: '0.3em 1em', borderRadius: 8 }}
        >
          {ACTIVITIES.map(a => (
            <option key={a.key} value={a.key}>
              {a.emoji} {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className="banana-app">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1em' }}>
          <h1 className="banana-title" style={{ marginBottom: 0 }}>streakio <span role="img" aria-label="flame">🔥</span></h1>
          <div style={{ fontWeight: 700, fontSize: '2em', marginTop: '0.2em', display: 'flex', alignItems: 'center', gap: '0.3em' }}>
            <span role="img" aria-label={activity.label.toLowerCase()}>{activity.emoji}</span>
          </div>
        </div>
        <div className="banana-side" style={{ marginTop: '0.5em', marginBottom: '2em' }}>
          <div className="banana-actions">
            <div className="banana-question">
              {activity.key === 'water' && 'Did you drink 3 liters of water today?'}
              {activity.key === 'walk' && 'Did you walk 30 minutes today?'}
              {activity.key === 'vegetables' && 'Did you eat 4 servings of vegetables today?'}
              {activity.key === 'read' && 'Did you read 15–30 minutes today?'}
              {activity.key === 'study' && 'Did you study 1 h today?'}
              {activity.key === 'fruits' && 'Did you eat 3 servings of fruits today?'}
              {activity.type === 'eat' && activity.key !== 'vegetables' && activity.key !== 'fruits' && `Did you eat your ${activity.label.toLowerCase()} today?`}
              {activity.type === 'drink' && activity.key !== 'water' && `Did you drink your ${activity.label.toLowerCase()} today?`}
              {activity.type === 'do' && activity.key !== 'walk' && activity.key !== 'read' && activity.key !== 'study' && `Did you ${activity.label.toLowerCase()} today?`}
              {activity.key === 'quit_smoking' && `Did you stay smoke-free today?`}
              {activity.key === 'quit_alcohol' && `Did you stay alcohol-free today?`}
              {activity.type === 'quit' && activity.key !== 'quit_smoking' && activity.key !== 'quit_alcohol' && `Did you avoid ${activity.label.toLowerCase()} today?`}
            </div>
            <button className="banana-btn small" onClick={handleActivity}>Yes</button>
          </div>
          {popup === 'success' && <div className="banana-popup success">Recorded successfully!</div>}
          {popup === 'already' && <div className="banana-popup already">Already recorded today!</div>}
        </div>
        <div className="banana-main">
          <div className="banana-chart-container">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              margin: '0 auto',
            }}>
              {months.map((monthDays, monthIndex) => (
                <div key={monthIndex} style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(7, 1fr)`,
                  gap: 2,
                  width: `calc(7 * 10px + 6 * 2px)`,
                  boxSizing: 'content-box',
                }}>
                  {monthDays.map((date, i) => {
                    const filled = date && activityData[formatDate(date)];
                    return (
                      <div
                        key={date ? date.toISOString() : `empty-${monthIndex}-${i}`}
                        title={date ? date.toDateString() + (filled ? ` ${activity.emoji}` : '') : ''}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: date ? (filled ? '#ffe066' : '#e6eefa') : 'transparent',
                          border: date ? '1px solid #ccc' : 'none',
                          margin: 0,
                          display: 'inline-block',
                          boxSizing: 'border-box',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="banana-chart-footer">
              <span>{activityCount} {activityCount === 1 ? 'log' : 'logs'} this year</span>
            </div>
          </div>
          {(streak > 0 || activityCount > 1) && (
            <div className="banana-streak">
              {activity.key === 'quit_smoking' && (
                <>
                  <span role="img" aria-label="streak">{getFlames(streak)}</span>
                  <span className="banana-streak-count">{streak}</span>
                  <span>days streak of being smoke-free</span>
                </>
              )}
              {activity.key === 'quit_alcohol' && (
                <>
                  <span role="img" aria-label="streak">{getFlames(streak)}</span>
                  <span className="banana-streak-count">{streak}</span>
                  <span>days streak of being alcohol-free</span>
                </>
              )}
              {activity.type === 'eat' && (
                <>
                  <span role="img" aria-label="streak">{getFlames(streak)}</span>
                  <span className="banana-streak-count">{streak}</span>
                  <span>days streak of eating {activity.label.toLowerCase()}</span>
                </>
              )}
              {activity.type === 'drink' && (
                <>
                  <span role="img" aria-label="streak">{getFlames(streak)}</span>
                  <span className="banana-streak-count">{streak}</span>
                  <span>days streak of drinking {activity.label.toLowerCase()}</span>
                </>
              )}
              {activity.type === 'do' && (
                <>
                  <span role="img" aria-label="streak">{getFlames(streak)}</span>
                  <span className="banana-streak-count">{streak}</span>
                  <span>days streak of {(() => {
                    const key = activity.key;
                    if (key === 'run') return 'running';
                    if (key === 'walk') return 'walking';
                    if (key === 'read') return 'reading';
                    if (key === 'yoga') return 'doing yoga';
                    if (key === 'study') return 'studying';
                    return activity.label.toLowerCase();
                  })()}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App
