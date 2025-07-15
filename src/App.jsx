import { useState, useEffect } from 'react'
import './App.css'
import { Analytics } from '@vercel/analytics/react'
import ViewToggle from './ViewToggle';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ifgyccxvapcjbrxcfjvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZ3ljY3h2YXBjamJyeGNmanZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjMwNjIsImV4cCI6MjA2ODEzOTA2Mn0.JyH702xYjyIJ70LCdH7ieO3nJnGojaTejQ2DEMGMKLA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const today = new Date();

function getStoredActivities() {
  const stored = localStorage.getItem('activities');
  if (stored) return JSON.parse(stored);
  // Default activities if none stored
  return [
    { key: 'water', label: 'Water', emoji: '💧', type: 'drink' },
    { key: 'walk', label: 'Walk', emoji: '🚶', type: 'do' },
    { key: 'vegetables', label: 'Vegetables', emoji: '🥦🥕🥒', type: 'eat' },
    { key: 'run', label: 'Run', emoji: '🏃', type: 'do' },
    { key: 'read', label: 'Read', emoji: '📚', type: 'do' },
    { key: 'yoga', label: 'Yoga', emoji: '🧘‍♂️', type: 'do' },
    { key: 'study', label: 'Study', emoji: '📖', type: 'do' },
    { key: 'workout', label: 'Workout', emoji: '🏋️', type: 'do' },
    { key: 'code', label: 'Code', emoji: '🧑‍💻', type: 'do', reference: 'vibe coders' },
    { key: 'quit_smoking', label: 'Quit Smoking', emoji: '🚭', type: 'quit' },
    { key: 'quit_alcohol', label: 'Quit Alcohol', emoji: '🚫🍺', type: 'quit' },
    { key: 'poop', label: 'Poop', emoji: '💩', type: 'do' },
    { key: 'shower', label: 'Shower', emoji: '🚿', type: 'do' },
    { key: 'fruits', label: 'Fruits', emoji: '🍌🍎🍊', type: 'eat' },
  ];
}

function saveActivities(activities) {
  localStorage.setItem('activities', JSON.stringify(activities));
}

function getSelectedActivity() {
  return JSON.parse(localStorage.getItem('selectedActivity')) || getStoredActivities()[0];
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
  const todayStr = formatDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  if (data[todayStr]) {
    // Count streak as before, starting from today
    const dates = Object.keys(data).sort().reverse();
    let streak = 1;
    let currentDate = new Date(todayStr);
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
  } else if (data[yesterdayStr]) {
    // Only yesterday is present, streak is 1
    return 1;
  } else {
    return 0;
  }
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

function getMonthCalendarData() {
  // Returns a 5x7 grid for the current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  let emptyDays = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < emptyDays; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  // Pad to 5x7 (35 days)
  while (days.length < 35) days.push(null);
  // Split into 5 weeks
  return Array.from({ length: 5 }, (_, i) => days.slice(i * 7, i * 7 + 7));
}

function getWeekCalendarData() {
  // Returns an array of 7 days for the current week (Mon-Sun)
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOfWeek + i);
    week.push(d);
  }
  return week;
}

// Returns 1, 2, or 3 flames based on the streak length
function getFlames(streak) {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 11) return '🔥🔥';
  if (streak >= 1) return '🔥';
  return '';
}

// Add a function to get a question for an activity
function getActivityQuestion(label) {
  const l = label.toLowerCase().trim().replace(/\s+/g, ' ');
  if (l.includes('no social media')) return 'Digital detox! Did you stay off social media today?';
  if (l.includes('soccer') || l.includes('football') || l.includes('futbol') || l.includes('footbal')) return 'Goal time! Did you kick the ball around today?';
  if (l.includes('basketball')) return 'Swish! Did you shoot some hoops today?';
  if (l.includes('jump rope') || l.includes('jump')) return 'Bounce to it! Did you jump rope today?';
  if (l.includes('pushup')) return 'Push it! Did you do your pushups today?';
  if (l.includes('situp')) return 'Core power! Did you do your situps today?';
  if (l.includes('stretch')) return 'Stay limber! Did you stretch today?';
  if (l.includes('language')) return 'Polyglot in progress! Did you practice a new language today?';
  if (l.includes('board game') || l.includes('board')) return 'Game night! Did you play a board game today?';
  if (l.includes('puzzle')) return 'Brain boost! Did you solve a puzzle today?';
  if (l.includes('game')) return 'Level up! Did you play a game today?';
  if (l.includes('tv')) return 'Chill time! Did you watch your favorite show today?';
  if (l.includes('movie')) return 'Movie magic! Did you watch a film today?';
  if (l.includes('garden')) return 'Green thumb! Did you tend to your garden today?';
  if (l.includes('fishing') || l.includes('fish')) return 'Gone fishing! Did you cast a line today?';
  if (l.includes('lake')) return 'Lake day! Did you visit a lake today?';
  if (l.includes('mountain')) return 'Peak performance! Did you enjoy the mountains today?';
  if (l.includes('beach')) return 'Beach vibes! Did you hit the beach today?';
  if (l.includes('picnic')) return 'Picnic party! Did you enjoy a meal outdoors today?';
  if (l.includes('camp')) return 'Campfire stories! Did you go camping today?';
  if (l.includes('hike')) return 'Trailblazer! Did you go hiking today?';
  if (l.includes('park')) return 'Fresh air! Did you visit a park today?';
  if (l.includes('bus') || l.includes('transit')) return 'On the move! Did you use public transit today?';
  if (l.includes('drive')) return 'Road trip! Did you drive today?';
  if (l.includes('travel')) return 'Adventure awaits! Did you travel today?';
  if (l.includes('plan')) return 'Organized and ready! Did you plan your day?';
  if (l.includes('email')) return 'Inbox zero? Did you check your email today?';
  if (l.includes('meeting')) return 'Teamwork! Did you have a meeting today?';
  if (l.includes('volunteer')) return 'Giving back! Did you volunteer today?';
  if (l.includes('donate')) return 'Spread the love! Did you donate today?';
  if (l.includes('invest')) return 'Future focused! Did you invest today?';
  if (l.includes('budget')) return 'Money matters! Did you review your budget today?';
  if (l.includes('save') || l.includes('money')) return 'Cha-ching! Did you save money today?';
  if (l.includes('call')) return 'Stay connected! Did you call someone today?';
  if (l.includes('text')) return 'Ping! Did you text a friend today?';
  if (l.includes('family')) return 'Family first! Did you connect with your family today?';
  if (l.includes('photo')) return 'Say cheese! Did you snap a photo today?';
  if (l.includes('video')) return 'Lights, camera, action! Did you record a video today?';
  if (l.includes('blog')) return 'Share your story! Did you write a blog post today?';
  if (l.includes('write')) return 'Pen to paper! Did you write today?';
  if (l.includes('paint')) return 'Color your world! Did you paint today?';
  if (l.includes('draw')) return 'Sketch it out! Did you draw today?';
  if (l.includes('sing')) return 'Sing your heart out! Did you sing today?';
  if (l.includes('dance')) return 'Bust a move! Did you dance today?';
  if (l.includes('music') || l.includes('instrument') || l.includes('guitar') || l.includes('piano') || l.includes('violin')) return 'Feel the rhythm! Did you play music or practice an instrument today?';
  if (l.includes('bird')) return 'Feathered friends! Did you care for your bird today?';
  if (l.includes('cat')) return 'Purr-fect! Did you care for your cat today?';
  if (l.includes('dog')) return 'Pawsitive vibes! Did you care for your dog today?';
  if (l.includes('pet')) return 'Pet love! Did you care for your pet today?';
  if (l.includes('plant')) return 'Leafy greens! Did you water your plants today?';
  if (l.includes('bake')) return 'Sweet treats! Did you bake today?';
  if (l.includes('cook')) return 'Master chef! Did you cook today?';
  if (l.includes('grocery') || l.includes('shopping')) return 'Stocked up! Did you go grocery shopping today?';
  if (l.includes('trash')) return 'Clean sweep! Did you take out the trash today?';
  if (l.includes('dish')) return 'Sparkling clean! Did you do the dishes today?';
  if (l.includes('laundry')) return 'Fresh threads! Did you do laundry today?';
  if (l.includes('clean')) return 'Tidy up! Did you clean today?';
  if (l.includes('nail')) return 'Nailed it! Did you care for your nails today?';
  if (l.includes('haircut')) return 'New look! Did you get a haircut today?';
  if (l.includes('skincare')) return 'Glow up! Did you do skincare today?';
  if (l.includes('vitamin')) return 'Boost mode! Did you take your vitamins today?';
  if (l.includes('medicine') || l.includes('pill')) return 'Health first! Did you take your medicine today?';
  if (l.includes('doctor')) return 'Checkup time! Did you visit the doctor today?';
  if (l.includes('dentist')) return 'Smile bright! Did you visit the dentist today?';
  if (l.includes('floss')) return 'Floss boss! Did you floss today?';
  if (l.includes('brush')) return 'Shiny smile! Did you brush your teeth today?';
  if (l.includes('snack')) return 'Snack attack! Did you have a snack today?';
  if (l.includes('dinner')) return 'Dinner time! Did you have dinner today?';
  if (l.includes('lunch')) return 'Lunch break! Did you have lunch today?';
  if (l.includes('breakfast')) return 'Rise and shine! Did you have breakfast today?';
  if (l.includes('gratitude')) return 'Grateful heart! Did you practice gratitude today?';
  if (l.includes('journal')) return 'Dear diary... Did you write in your journal today?';
  if (l.includes('sun')) return 'Sunny days! Did you get some sun today?';
  if (l.includes('swim')) return 'Splash zone! Did you swim today?';
  if (l.includes('bike') || l.includes('cycle')) return 'Pedal power! Did you bike today?';
  if (l.includes('tea')) return 'Tea time! Did you drink tea today?';
  if (l.includes('coffee')) return 'Caffeine fix! Did you drink coffee today?';
  if (l.includes('meditate')) return 'Zen mode! Did you meditate today?';
  if (l.includes('sleep')) return 'Sweet dreams! Did you sleep well today?';
  if (l.includes('shower') || l.includes('bath')) return 'Fresh and clean! Did you shower or bathe today?';
  if (l.includes('poop') || l.includes('toilet')) return 'Gut check! Did you poop today?';
  if (l.includes('alcohol') || l.includes('beer')) return 'Cheers to health! Did you avoid alcohol today?';
  if (l.includes('smok')) return 'Breathe easy! Did you avoid smoking today?';
  if (l.includes('code') || l.includes('program')) return 'Builder vibes! Did you code today?';
  if (l.includes('workout') || l.includes('exercise')) return 'Strength and sweat! Did you workout today?';
  if (l.includes('study')) return 'Level up! Did you study today?';
  if (l.includes('yoga')) return 'Find your zen! Did you do yoga today?';
  if (l.includes('read')) return 'Feed your mind! Did you read today?';
  if (l.includes('run')) return 'Feel the burn! Did you run today?';
  if (l.includes('fruit')) return 'Sweet and healthy! Did you eat fruit today?';
  if (l.includes('vegetable') || l.includes('veggie')) return 'Fuel your body! Did you eat vegetables today?';
  if (l.includes('walk')) return 'Great day for a stroll! Did you walk today?';
  if (l.includes('water') || l.includes('drink')) return 'Staying hydrated? Did you drink enough water today?';
  // fallback
  return 'Did you do this activity today?';
}

function App() {
  const [activities, setActivities] = useState(getStoredActivities());
  const [activity, setActivity] = useState(() => {
    const stored = localStorage.getItem('selectedActivity');
    if (stored) {
      const selected = JSON.parse(stored);
      // If the selected activity is not in the list, fallback to first
      return getStoredActivities().find(a => a.key === selected.key) || getStoredActivities()[0];
    }
    return getStoredActivities()[0];
  });
  const [activityData, setActivityDataState] = useState(getActivityData(getSelectedActivity().key));
  const [popup, setPopup] = useState(null);
  const [streak, setStreak] = useState(0);
  const [view, setView] = useState('Month');
  const [animating, setAnimating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState(''); // will be auto-set
  const [addError, setAddError] = useState('');
  const [showManage, setShowManage] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);

  // Update activities in localStorage whenever they change
  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    setStreak(getStreak(activityData));
  }, [activityData]);

  useEffect(() => {
    setSelectedActivity(activity);
    setActivityDataState(getActivityData(activity.key));
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 350);
    return () => clearTimeout(t);
  }, [activity]);

  // Check for user session on mount
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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

  // Add a new activity
  const handleAddActivity = (e) => {
    e.preventDefault();
    setAddError('');
    const label = newLabel.trim();
    const emoji = newEmoji.trim();
    if (!label) {
      setAddError('Please enter a label.');
      return;
    }
    // Generate a unique key
    const key = label.toLowerCase().replace(/\s+/g, '_');
    if (activities.some(a => a.key === key)) {
      setAddError('Activity with this label already exists.');
      return;
    }
    const newActivity = { key, label, emoji };
    setActivities([...activities, newActivity]);
    setNewLabel('');
    setNewEmoji('');
    setShowManage(false);
    setActivity(newActivity);
  };

  // Delete an activity and its data
  const handleDeleteActivity = (key) => {
    if (!window.confirm('Delete this activity and all its data?')) return;
    setActivities(activities.filter(a => a.key !== key));
    localStorage.removeItem(`${key}Data`);
    // If the deleted activity is selected, switch to first remaining
    if (activity.key === key) {
      const next = activities.find(a => a.key !== key) || activities[0];
      setActivity(next);
    }
  };

  // Emoji prediction function
  function predictEmoji(label) {
    const l = label.toLowerCase().trim().replace(/\s+/g, ' ');
    if (l.includes('no social media') || l.includes('no facebook') || l.includes('no instagram') || l.includes('no twitter')) return '🚫📱';
    if (l.includes('soccer') || l.includes('football') || l.includes('futbol') || l.includes('footbal')) return '⚽';
    if (l.includes('basketball')) return '🏀';
    if (l.includes('jump rope') || l.includes('jump')) return '🤾';
    if (l.includes('pushup')) return '🏋️';
    if (l.includes('situp')) return '🏋️‍♂️';
    if (l.includes('stretch')) return '🤸';
    if (l.includes('language')) return '🈳';
    if (l.includes('board game') || l.includes('board')) return '🎲';
    if (l.includes('puzzle')) return '🧩';
    if (l.includes('game')) return '🎮';
    if (l.includes('tv')) return '📺';
    if (l.includes('movie')) return '🎬';
    if (l.includes('garden')) return '🌱';
    if (l.includes('fishing') || l.includes('fish')) return '🎣';
    if (l.includes('lake')) return '🏞️';
    if (l.includes('mountain')) return '🏔️';
    if (l.includes('beach')) return '🏖️';
    if (l.includes('picnic')) return '🧺';
    if (l.includes('camp')) return '⛺';
    if (l.includes('hike')) return '🥾';
    if (l.includes('park')) return '🌳';
    if (l.includes('bus') || l.includes('transit')) return '🚌';
    if (l.includes('drive')) return '🚗';
    if (l.includes('travel')) return '✈️';
    if (l.includes('plan')) return '🗓️';
    if (l.includes('email')) return '📧';
    if (l.includes('meeting')) return '👔';
    if (l.includes('work')) return '💼';
    if (l.includes('volunteer')) return '🤝';
    if (l.includes('donate')) return '💸';
    if (l.includes('invest')) return '📈';
    if (l.includes('budget')) return '📊';
    if (l.includes('save') || l.includes('money')) return '💰';
    if (l.includes('call')) return '📞';
    if (l.includes('text')) return '💬';
    if (l.includes('family')) return '👨‍👩‍👧‍👦';
    if (l.includes('photo')) return '📷';
    if (l.includes('video')) return '🎥';
    if (l.includes('blog')) return '📝';
    if (l.includes('write')) return '✍️';
    if (l.includes('paint')) return '🖌️';
    if (l.includes('draw')) return '🎨';
    if (l.includes('sing')) return '🎤';
    if (l.includes('dance')) return '💃';
    if (l.includes('music') || l.includes('instrument') || l.includes('guitar') || l.includes('piano') || l.includes('violin')) return '🎸';
    if (l.includes('bird')) return '🐦';
    if (l.includes('cat')) return '🐈';
    if (l.includes('dog')) return '🐕';
    if (l.includes('pet')) return '🐶';
    if (l.includes('plant')) return '🪴';
    if (l.includes('bake')) return '🧁';
    if (l.includes('cook')) return '🍳';
    if (l.includes('grocery') || l.includes('shopping')) return '🛒';
    if (l.includes('trash')) return '🗑️';
    if (l.includes('dish')) return '🍽️';
    if (l.includes('laundry')) return '🧺';
    if (l.includes('clean')) return '🧹';
    if (l.includes('nail')) return '💅';
    if (l.includes('haircut')) return '💇';
    if (l.includes('skincare')) return '🧴';
    if (l.includes('vitamin')) return '🧴';
    if (l.includes('medicine') || l.includes('pill')) return '💊';
    if (l.includes('doctor')) return '🩺';
    if (l.includes('dentist')) return '🦷';
    if (l.includes('floss')) return '🦷';
    if (l.includes('brush')) return '🪥';
    if (l.includes('snack')) return '🍪';
    if (l.includes('dinner')) return '🍽️';
    if (l.includes('lunch')) return '🍱';
    if (l.includes('breakfast')) return '🥣';
    if (l.includes('gratitude')) return '🙏';
    if (l.includes('journal')) return '📓';
    if (l.includes('sun')) return '☀️';
    if (l.includes('swim')) return '🏊';
    if (l.includes('bike') || l.includes('cycle')) return '🚴';
    if (l.includes('tea')) return '🍵';
    if (l.includes('coffee')) return '☕';
    if (l.includes('meditate')) return '🧘';
    if (l.includes('sleep')) return '😴';
    if (l.includes('shower') || l.includes('bath')) return '🚿';
    if (l.includes('poop') || l.includes('toilet')) return '💩';
    if (l.includes('alcohol') || l.includes('beer')) return '🚫🍺';
    if (l.includes('smok')) return '🚭';
    if (l.includes('code') || l.includes('program')) return '🧑‍💻';
    if (l.includes('workout') || l.includes('exercise')) return '🏋️';
    if (l.includes('study')) return '📖';
    if (l.includes('yoga')) return '🧘‍♂️';
    if (l.includes('read')) return '📚';
    if (l.includes('run')) return '🏃';
    if (l.includes('fruit')) return '🍎';
    if (l.includes('vegetable') || l.includes('veggie')) return '🥦';
    if (l.includes('walk')) return '🚶';
    if (l.includes('water') || l.includes('drink')) return '💧';
    // fallback
    return '✨';
  }

  // Update newEmoji automatically when newLabel changes
  useEffect(() => {
    setNewEmoji(predictEmoji(newLabel));
  }, [newLabel]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const months = getYearCalendarData();
  const activityCount = Object.keys(activityData).filter(date => date.startsWith(today.getFullYear())).length;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <>
      <Analytics />
      <h1 className="banana-title" style={{ marginBottom: 0, marginTop: '0.5em' }}>streakio <span role="img" aria-label="flame">🔥</span></h1>
      {/* Manage Activities Button */}
      {/* Remove the current Manage Activities button from above the dropdown */}
      {/* Add a floating, subtle button at the bottom right */}
      {/* Place this just before the closing </> in the return */}
      {/* Change the floating gear button to toggle the menu: if showManage is true, clicking the button closes it; if false, opens it.
When the menu is open, hide the gear button. */}
      {!showManage && (
        <>
          <div style={{ position: 'fixed', top: 24, left: 24, zIndex: 1100 }}>
            <button
              title="User Profile"
              style={{
                background: 'none',
                border: 'none',
                width: 40,
                height: 40,
                color: '#888',
                fontSize: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                padding: 0,
                margin: 0,
                lineHeight: 1,
                boxShadow: 'none',
              }}
              onClick={() => setShowLogin(true)}
              onMouseOver={e => (e.currentTarget.style.opacity = 1)}
              onMouseOut={e => (e.currentTarget.style.opacity = 0.7)}
              aria-label="User Profile"
            >
              <span role="img" aria-label="user" style={{lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                👤
              </span>
            </button>
          </div>
          <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1100 }}>
            <button
              onClick={() => setShowManage(true)}
              title="Manage Activities"
              style={{
                background: 'none',
                border: 'none',
                width: 40,
                height: 40,
                color: '#888',
                fontSize: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                padding: 0,
                margin: 0,
                lineHeight: 1,
                boxShadow: 'none',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = 1)}
              onMouseOut={e => (e.currentTarget.style.opacity = 0.7)}
              aria-label="Manage Activities"
            >
              <span role="img" aria-label="settings" style={{lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                ⚙️
              </span>
            </button>
          </div>
        </>
      )}
      {/* Manage Activities Modal/Panel */}
      {showManage && (
        <div className="manage-activities-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 32px #0002', position: 'relative' }}>
            <button
              onClick={() => setShowManage(false)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: '#eee',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                cursor: 'pointer',
                width: 25,
                height: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                color: '#222',
                zIndex: 1,
                padding: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.2em' }}>Manage Activities</h2>
            {/* Add Activity Form */}
            <form className="add-activity-form" onSubmit={handleAddActivity} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, }}>
              <span style={{ fontSize: '1.5em', width: 32, textAlign: 'center' }}>{newEmoji}</span>
              <input
                type="text"
                placeholder="Label"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                maxLength={20}
                required
              />
              <button className="banana-btn small" type="submit">Add</button>
            </form>
            {addError && <div className="banana-popup already" style={{ marginTop: 4 }}>{addError}</div>}
            {/* List activities with delete buttons */}
            <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, justifyContent: 'center' }}>
              {activities.map(a => (
                <div key={a.key} className="activity-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between', // ensures delete button stays right
                  background: '#f6faff',
                  borderRadius: 6,
                  padding: '4px 10px',
                  minWidth: 0, // prevents overflow
                  gap: 8,
                }}>
                  <span style={{ fontSize: '1.1em', flexShrink: 0 }}>{a.emoji}</span>
                  <span style={{ margin: '0 4px', fontSize: '0.98em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>{a.label}</span>
                  <button
                    className="banana-btn small"
                    style={{
                      background: '#eee',
                      color: '#bbb',
                      padding: '1px 5px',
                      height: 25,
                      width: 30,
                      fontSize: 14,
                      marginLeft: 0,
                      lineHeight: 1,
                      borderRadius: 4,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    title="Delete activity"
                    onClick={() => handleDeleteActivity(a.key)}
                    disabled={activities.length === 1}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Login Popup */}
      {showLogin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 240, maxWidth: 300, boxShadow: '0 4px 32px #0002', position: 'relative', textAlign: 'center' }}>
            <button
              onClick={() => setShowLogin(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#eee',
                border: 'none',
                borderRadius: 6,
                fontSize: 18,
                cursor: 'pointer',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                color: '#222',
                zIndex: 1,
                padding: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.1em' }}>Login</h2>
            <button className="gsi-material-button" onClick={handleGoogleLogin} style={{ border: 'none', background: 'none', padding: 0, margin: '0 auto', cursor: 'pointer' }}>
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6em 1em', border: '1.5px solid #4285F4', borderRadius: 8, background: '#fff', fontWeight: 600, fontSize: '1em', color: '#4285F4' }}>
                <div className="gsi-material-button-icon" style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block', width: 22, height: 22 }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
                <span style={{ display: 'none' }}>Sign in with Google</span>
              </div>
            </button>
          </div>
        </div>
      )}
      {/* Optionally show user info if logged in */}
      {user && (
        <div style={{ position: 'fixed', top: 70, left: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: '0.7em 1.2em', zIndex: 1100, color: '#333', fontWeight: 500 }}>
          <span>Welcome, {user.email}</span>
        </div>
      )}
      {/* Activity select dropdown */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5em', marginBottom: '1em' }}>
        <select
          value={activity.key}
          onChange={e => {
            const selected = activities.find(a => a.key === e.target.value);
            setActivity(selected);
          }}
          style={{ fontSize: '1.1em', padding: '0.3em 1em', borderRadius: 8 }}
        >
          {activities.map(a => (
            <option key={a.key} value={a.key}>
              {a.emoji} {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className={`banana-app banana-dots-fade${animating ? ' animating' : ''}`} key={activity.key + '-app'}>
        <div className="banana-side" style={{ marginTop: '0.5em', marginBottom: '2em' }}>
          <div className={`banana-dots-fade${animating ? ' animating' : ''}`} key={activity.key + '-side'}>
            <div className="banana-actions">
              <div className="banana-question">
                {getActivityQuestion(activity.label)}
              </div>
              <button className="banana-btn small" onClick={handleActivity}>Yes</button>
            </div>
          </div>
          {popup === 'success' && <div className="banana-popup success">Recorded successfully!</div>}
          {popup === 'already' && <div className="banana-popup already">Already recorded today!</div>}
        </div>
        <div className="banana-main">
          <div className="banana-chart-container">
            <div className={`banana-dots-fade${animating ? ' animating' : ''}`} key={activity.key}>
              <ViewToggle onChange={setView} />
              {view === 'Year' && (
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
              )}
              {view === 'Month' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 6,
                  justifyContent: 'center',
                  margin: '0 auto',
                  width: 'fit-content',
                }}>
                  {getMonthCalendarData().flat().map((date, i) => {
                    const filled = date && activityData[formatDate(date)];
                    return (
                      <div
                        key={date ? date.toISOString() : `empty-month-${i}`}
                        title={date ? date.toDateString() + (filled ? ` ${activity.emoji}` : '') : ''}
                        style={{
                          width: 14,
                          height: 14,
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
              )}
              {view === 'Week' && (
                <div style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center',
                  margin: '0 auto',
                  width: 'fit-content',
                }}>
                  {getWeekCalendarData().map((date, i) => {
                    const filled = date && activityData[formatDate(date)];
                    return (
                      <div
                        key={date ? date.toISOString() : `empty-week-${i}`}
                        title={date ? date.toDateString() + (filled ? ` ${activity.emoji}` : '') : ''}
                        style={{
                          width: 16,
                          height: 16,
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
              )}
              <div className="banana-chart-footer">
                <span>
                  {view === 'Year' && (
                    <>{activityCount} {activityCount === 1 ? 'log' : 'logs'} this year</>
                  )}
                  {view === 'Month' && (
                    <>{activityCount} {activityCount === 1 ? 'log' : 'logs'} this month</>
                  )}
                  {view === 'Week' && (
                    <>{activityCount} {activityCount === 1 ? 'log' : 'logs'} this week</>
                  )}
                </span>
              </div>
            </div>
          </div>
          {streak > 0 && (
            <div className={`banana-dots-fade${animating ? ' animating' : ''}`} key={activity.key + '-streak'}>
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
                      if (key === 'code') return 'building cool stuff';
                      return activity.label.toLowerCase();
                    })()}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Stripe Buy Button Script */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div id="stripe-buy-button-container">
          <stripe-buy-button
            buy-button-id="buy_btn_1RiF9SI5sPmv6sLqh2qex3IV"
            publishable-key="pk_live_51RiF3fI5sPmv6sLqVmkuQ6nECaF1kKgbh3lnxvBdnlAQCpDS1zS8Xp3Ua7U34BGffpRUf4PIK6BuCL9noXHb29Ii00FbWAYdwq"
          ></stripe-buy-button>
        </div>
      </div>
      <script async src="https://js.stripe.com/v3/buy-button.js"></script>
    </>
  );
}

export default App
