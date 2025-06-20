import { useState, useEffect } from 'react'
import './App.css'

const today = new Date();

function getPoopData() {
  return JSON.parse(localStorage.getItem('poopData') || '{}');
}

function setPoopData(data) {
  localStorage.setItem('poopData', JSON.stringify(data));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getStreak(data) {
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    if (data[formatDate(date)]) {
      streak++;
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

function App() {
  const [poopData, setPoopDataState] = useState(getPoopData());
  const [popup, setPopup] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getStreak(poopData));
  }, [poopData]);

  const handlePoop = () => {
    const date = formatDate(today);
    if (poopData[date]) {
      setPopup('already');
      return;
    }
    const newData = { ...poopData, [date]: true };
    setPoopData(newData);
    setPoopDataState(newData);
    setPopup('success');
  };

  const handleReset = () => {
    localStorage.removeItem('poopData');
    setPoopDataState({});
    setPopup(null);
  };

  useEffect(() => {
    if (popup) {
      const t = setTimeout(() => setPopup(null), 1500);
      return () => clearTimeout(t);
    }
  }, [popup]);

  const months = getYearCalendarData();
  const poopCount = Object.keys(poopData).filter(date => date.startsWith(today.getFullYear())).length;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="poop-app">
      <h1 className="poop-title">git plop <span role="img" aria-label="poop">💩</span></h1>
      <div className="poop-main">
        <div className="poop-chart-container">
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
                  const filled = date && poopData[formatDate(date)];
                  return (
                    <div
                      key={date ? date.toISOString() : `empty-${monthIndex}-${i}`}
                      title={date ? date.toDateString() + (filled ? ' 💩' : '') : ''}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: date ? (filled ? '#4fc3f7' : '#e6eefa') : 'transparent',
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
          <div className="poop-chart-footer">
            <span>{poopCount} <span role="img" aria-label="poop">💩</span> in {today.getFullYear()}</span>
          </div>
        </div>
        {(streak > 0 || poopCount > 1) && (
          <div className="poop-streak">
            <span role="img" aria-label="poop" className="poop-emoji">💩</span>
            <span className="poop-streak-count">{streak}</span>
            <span>day streak</span>
          </div>
        )}
      </div>
      <div className="poop-side">
        <div className="poop-actions">
          <div className="poop-question">Did you poop today?</div>
          <button className="poop-btn small" onClick={handlePoop}>Yes</button>
        </div>
        {popup === 'success' && <div className="poop-popup success">Recorded successfully!</div>}
        {popup === 'already' && <div className="poop-popup already">Already recorded today!</div>}
      </div>
    </div>
  );
}

export default App
