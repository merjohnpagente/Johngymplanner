import React, { useEffect, useMemo, useState } from 'react';
import {
  Home, Dumbbell, TrendingUp, User, ChevronRight, Check, Plus,
  Clock, Flame, Target, CalendarDays, Settings, Bell, Info,
  LogOut, X, RotateCcw, Ruler, Trash2,
} from 'lucide-react';

/* ---------- Data (same plan, minimal presentation) ---------- */
const DAYS = [
  { key: 'MON', name: 'Push Day', short: 'Push', focus: 'Chest, Shoulders, Triceps', color: '#00FF66', groups: [
    ['Chest', [['Barbell Bench Press', 4, '6-8', 'Compound'], ['Incline Dumbbell Press', 3, '8-12', 'Compound'], ['Machine Chest Press', 3, '10-12', 'Machine'], ['Cable Chest Fly', 3, '12-15', 'Cable']]],
    ['Shoulders', [['Seated Dumbbell Shoulder Press', 3, '8-12', 'Compound'], ['Dumbbell Lateral Raise', 3, '12-20', 'Isolation'], ['Face Pull', 3, '12-20', 'Cable']]],
    ['Triceps', [['Cable Triceps Pushdown', 3, '10-15', 'Cable'], ['Overhead Cable Extension', 3, '10-15', 'Cable']]],
  ]},
  { key: 'TUE', name: 'Pull Day', short: 'Pull', focus: 'Back, Biceps', color: '#4DA6FF', groups: [
    ['Back', [['Pull-Ups / Assisted Pull-Ups', 3, '6-10', 'Compound'], ['Lat Pulldown', 3, '8-12', 'Machine'], ['Barbell Row', 3, '6-10', 'Compound'], ['Seated Cable Row', 3, '10-12', 'Cable']]],
    ['Biceps', [['EZ-Bar Curl', 3, '8-12', 'Free weight'], ['Incline Dumbbell Curl', 3, '10-12', 'Free weight'], ['Hammer Curl', 2, '10-15', 'Free weight']]],
  ]},
  { key: 'WED', name: 'Leg Day A', short: 'Legs', focus: 'Quads, Hamstrings, Calves', color: '#B266FF', groups: [
    ['Quads & Glutes', [['Barbell Back Squat', 4, '6-8', 'Compound'], ['Leg Press', 3, '10-12', 'Machine'], ['Bulgarian Split Squat', 3, '8-10 / leg', 'Free weight'], ['Leg Extension', 3, '12-15', 'Machine']]],
    ['Hamstrings', [['Romanian Deadlift', 3, '8-10', 'Compound'], ['Seated Leg Curl', 3, '10-15', 'Machine'], ['Hip Thrust', 3, '8-12', 'Compound']]],
    ['Calves', [['Standing Calf Raise', 4, '10-15', 'Machine']]],
  ]},
  { key: 'THU', name: 'Active Recovery', short: 'Rest', focus: 'Mobility, Walking', color: '#6B7280', groups: [
    ['Recovery', [['Easy Walk or Cycle', 1, '20-30 min', 'Cardio'], ['Hip Mobility', 1, '5-8 min', 'Mobility'], ['Gentle Stretching', 1, '5-10 min', 'Mobility']]],
  ]},
  { key: 'FRI', name: 'Upper Body', short: 'Upper', focus: 'Chest, Back, Arms', color: '#FFB020', groups: [
    ['Chest & Back', [['Incline Barbell Press', 3, '8-10', 'Compound'], ['One-Arm Dumbbell Row', 3, '8-12 / side', 'Compound'], ['Neutral-Grip Lat Pulldown', 3, '10-12', 'Machine']]],
    ['Arms', [['Dumbbell Lateral Raise', 3, '12-20', 'Isolation'], ['Preacher Curl', 3, '10-12', 'Machine'], ['Rope Triceps Pushdown', 3, '10-15', 'Cable']]],
  ]},
  { key: 'SAT', name: 'Leg Day B', short: 'Lower', focus: 'Glutes, Hamstrings', color: '#FF5D5D', groups: [
    ['Posterior Chain', [['Deadlift / Trap-Bar Deadlift', 3, '5-6', 'Compound'], ['Hip Thrust', 3, '8-12', 'Compound'], ['Lying Leg Curl', 3, '10-15', 'Machine']]],
    ['Quads & Core', [['Front / Hack Squat', 3, '8-10', 'Compound'], ['Walking Lunges', 2, '10 / leg', 'Free weight'], ['Plank', 3, '30-60 sec', 'Bodyweight']]],
  ]},
  { key: 'SUN', name: 'Rest Day', short: 'Rest', focus: 'Recover', color: '#6B7280', groups: [
    ['Optional', [['Leisurely Walk', 1, '15-30 min', 'Cardio'], ['Gentle Stretching', 1, '5-10 min', 'Mobility']]],
  ]},
];

const todayIdx = () => (new Date().getDay() + 6) % 7;
const dateStr = () => new Date().toLocaleDateString('en-CA');
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};
const load = (k, f) => {
  try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(f)); } catch { return f; }
};

function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <rect width="512" height="512" rx="120" fill="#0B1210" />
      <rect x="120" y="242" width="272" height="28" rx="14" fill="#00FF66" />
      <rect x="88" y="176" width="36" height="160" rx="18" fill="#00FF66" />
      <rect x="136" y="200" width="30" height="112" rx="15" fill="#39FF14" />
      <rect x="388" y="176" width="36" height="160" rx="18" fill="#00FF66" />
      <rect x="346" y="200" width="30" height="112" rx="15" fill="#39FF14" />
    </svg>
  );
}

function AppIcon({ size = 84, radius = 24 }) {
  const [fail, setFail] = useState(false);
  if (fail) return <Logo size={size} />;
  return <img src="icon-512.png" width={size} height={size} style={{ borderRadius: radius, objectFit: 'cover' }} onError={() => setFail(true)} alt="Johns Fit Planner icon" />;
}

function instructionsFor(name) {
  return [
    `Set up for ${name} with a manageable load.`,
    'Keep a stable stance and controlled breathing.',
    'Lower / stretch with control, no bouncing.',
    'Press / lift with good form. Stop if you feel sharp pain.',
  ];
}

export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(() => load('jfp-user', null));
  const [authTab, setAuthTab] = useState('login');
  const [nameInput, setNameInput] = useState('');
  const [page, setPage] = useState('Home');
  const [dayIdx, setDayIdx] = useState(todayIdx());
  const [openDay, setOpenDay] = useState(null);
  const [detail, setDetail] = useState(null); // {dayIdx, ex:[name,sets,reps,type]}
  const [done, setDone] = useState(() => load('jfp-done', {}));
  const [logs, setLogs] = useState(() => load('jfp-weights', []));
  const [measures, setMeasures] = useState(() => load('jfp-measure', { chest: '', waist: '', arms: '', thighs: '', fat: '', height: '175', age: '22' }));
  const [weight, setWeight] = useState('');
  const [progTab, setProgTab] = useState('Weight');
  const [notif, setNotif] = useState(() => load('jfp-notif', true));
  const [showSettings, setShowSettings] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', goal: 'Muscle Gain' });

  useEffect(() => { const t = setTimeout(() => setSplash(false), 2000); return () => clearTimeout(t); }, []);
  useEffect(() => localStorage.setItem('jfp-done', JSON.stringify(done)), [done]);
  useEffect(() => localStorage.setItem('jfp-weights', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('jfp-measure', JSON.stringify(measures)), [measures]);
  useEffect(() => localStorage.setItem('jfp-notif', JSON.stringify(notif)), [notif]);
  useEffect(() => { if (user) { localStorage.setItem('jfp-user', JSON.stringify(user)); setProfileForm(f => ({ ...f, name: user.name })); } }, [user]);

  const day = DAYS[dayIdx];
  const key = dateStr() + '-' + day.key;
  const checked = done[key] || [];
  const dayCount = day.groups.reduce((n, g) => n + g[1].length, 0);
  const totalDone = Object.values(done).reduce((n, a) => n + a.length, 0);
  const curWeight = logs[0]?.kg;

  const toggle = (exName) => setDone(o => ({
    ...o, [key]: (o[key] || []).includes(exName) ? o[key].filter(x => x !== exName) : [...(o[key] || []), exName],
  }));

  const addWeight = (e) => {
    e.preventDefault();
    const v = Number(weight);
    if (v >= 20 && v <= 400) { setLogs(o => [{ kg: v, date: dateStr() }, ...o].slice(0, 60)); setWeight(''); }
  };

  const chartPts = useMemo(() => {
    const last = [...logs].reverse().slice(-12);
    if (last.length < 2) return '';
    const vs = last.map(x => x.kg);
    const min = Math.min(...vs), max = Math.max(...vs), span = (max - min) || 1;
    return last.map((x, i) => `${(i / (last.length - 1)) * 280},${60 - ((x.kg - min) / span) * 44}`).join(' ');
  }, [logs]);

  const activeDates = useMemo(() => {
    const s = new Set();
    Object.keys(done).forEach(k => { if ((done[k] || []).length) s.add(k.slice(0, 10)); });
    return s;
  }, [done]);

  /* ---------- Splash ---------- */
  if (splash) {
    return (
      <div className="splash">
        <AppIcon size={96} radius={26} />
        <h1>Johns<br /><span>Fit Planner</span></h1>
        <p>Plan &middot; Train &middot; Build &middot; Repeat</p>
        <small className="dev">Developed by MJDev</small>
      </div>
    );
  }

  /* ---------- Auth ---------- */
  if (!user) {
    return (
      <div className="auth">
        <AppIcon size={72} radius={20} />
        <h1>Johns <span>Fit Planner</span></h1>
        <p className="muted">Your fitness journey starts here.</p>
        <div className="tabs">
          <button className={authTab === 'login' ? 'on' : ''} onClick={() => setAuthTab('login')}>Login</button>
          <button className={authTab === 'signup' ? 'on' : ''} onClick={() => setAuthTab('signup')}>Sign Up</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (nameInput.trim()) setUser({ name: nameInput.trim() }); }} className="card">
          <label>{authTab === 'login' ? 'Name or Username' : 'Full Name'}</label>
          <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="e.g. John" required />
          <button className="primary" type="submit">{authTab === 'login' ? 'Login' : 'Sign Up'}</button>
        </form>
        <button className="ghost" onClick={() => setUser({ name: 'Guest' })}>Continue as Guest</button>
        <small className="dev">Developed by MJDev</small>
      </div>
    );
  }

  const firstName = (user.name || 'John').split(' ')[0];
  const nav = [['Home', Home], ['Workout', Dumbbell], ['Progress', TrendingUp], ['Profile', User]];

  return (
    <div className="app">
      <header>
        <AppIcon size={36} radius={10} />
        <div className="brand"><b>Johns <span>Fit Planner</span></b></div>
        <button className="iconbtn" onClick={() => { setPage('Profile'); setShowSettings(false); }} aria-label="profile"><User size={18} /></button>
      </header>

      <main>
        {page === 'Home' && (
          <>
            <p className="hello">{greeting()},<br /><b>{firstName}!</b></p>
            <p className="muted">Discipline today, stronger tomorrow.</p>
            <section className="card today">
              <small>TODAY'S WORKOUT</small>
              <h2>{DAYS[todayIdx()].name}</h2>
              <p className="muted">{DAYS[todayIdx()].focus}</p>
              <button className="primary" onClick={() => { setDayIdx(todayIdx()); setPage('Workout'); }}>Start Workout <ChevronRight size={16} /></button>
            </section>
            <div className="rowhead"><b>Weekly Overview</b><button className="link" onClick={() => setPage('Workout')}>View All</button></div>
            <div className="weekdots">
              {DAYS.map((d, i) => (
                <button key={d.key} onClick={() => { setDayIdx(i); setPage('Workout'); }} className={i === todayIdx() ? 'now' : ''}>
                  <small>{d.key.slice(0, 3)}</small><span style={{ background: d.color }} />
                </button>
              ))}
            </div>
            <section className="card banner">
              <Flame size={20} />
              <div><b>BETTER THAN YESTERDAY</b><p>Small steps, big results. Keep going.</p></div>
            </section>
          </>
        )}

        {page === 'Workout' && (
          <>
            <p className="hello"><b>Weekly Plan</b></p>
            <div className="weektabs">{['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => <button key={w} className={i === 0 ? 'on' : ''}>{w}</button>)}</div>
            <div className="daylist">
              {DAYS.map((d, i) => (
                <div key={d.key}>
                  <button className="daycard" onClick={() => setOpenDay(openDay === i ? null : i)}>
                    <span className="dot" style={{ background: d.color }}>{d.key.slice(0, 2)}</span>
                    <span><b>{d.name}</b><small>{d.focus}</small></span>
                    <ChevronRight size={16} />
                  </button>
                  {openDay === i && (
                    <div className="exlist">
                      {d.groups.map(g => (
                        <div key={g[0]}>
                          <small className="muted">{g[0]}</small>
                          {g[1].map(ex => (
                            <button key={ex[0]} className="exrow" onClick={() => setDetail({ dayIdx: i, ex })}>
                              <span><b>{ex[0]}</b><small>{ex[1]} sets &middot; {ex[2]} reps</small></span>
                              {(done[dateStr() + '-' + d.key] || []).includes(ex[0]) ? <Check size={16} color="#00FF66" /> : <ChevronRight size={15} />}
                            </button>
                          ))}
                        </div>
                      ))}
                      <button className="primary" onClick={() => { setDayIdx(i); setOpenDay(null); }}>Open {d.short} session</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active session */}
            <section className="card">
              <small>DAY {dayIdx + 1} OF 7</small>
              <h2>{day.name}</h2>
              <p className="muted">{day.focus} &middot; {checked.length}/{dayCount} done</p>
              <div className="bar"><span style={{ width: `${dayCount ? (checked.length / dayCount) * 100 : 0}%` }} /></div>
              {day.groups.map(g => (
                <div key={g[0]}>
                  <small className="muted">{g[0]}</small>
                  {g[1].map(ex => (
                    <button key={ex[0]} className="exrow" onClick={() => toggle(ex[0])}>
                      <span className={'check ' + (checked.includes(ex[0]) ? 'yes' : '')}>{checked.includes(ex[0]) && <Check size={14} />}</span>
                      <span><b>{ex[0]}</b><small>{ex[1]} sets &middot; {ex[2]} reps</small></span>
                    </button>
                  ))}
                </div>
              ))}
              <button className="ghost" onClick={() => setDone(o => ({ ...o, [key]: [] }))}><RotateCcw size={13} /> Reset day</button>
            </section>
          </>
        )}

        {page === 'Progress' && (
          <>
            <p className="hello"><b>Progress</b></p>
            <div className="tabs">
              {['Weight', 'Body Stats', 'History'].map(t => <button key={t} className={progTab === t ? 'on' : ''} onClick={() => setProgTab(t)}>{t}</button>)}
            </div>
            {progTab === 'Weight' && (
              <>
                <section className="card">
                  <small>WEIGHT LOG</small>
                  {logs.length < 2 ? <p className="muted">Add 2+ weigh-ins to see your chart.</p> : (
                    <svg viewBox="0 0 300 70" className="chart"><polyline points={chartPts} fill="none" stroke="#00FF66" strokeWidth="3" strokeLinecap="round" /></svg>
                  )}
                  <p className="bignum">{curWeight ? curWeight.toFixed(1) + ' kg' : '--'}</p>
                </section>
                <form className="card" onSubmit={addWeight}>
                  <label>Add Weight (kg)</label>
                  <div className="hrow"><input type="number" min="20" max="400" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 72.5" required /><button className="primary"><Plus size={15} /> Add</button></div>
                </form>
                {logs.map((x, i) => <div className="wrow" key={x.date + i}><span><CalendarDays size={14} /> {x.date}</span><b>{x.kg.toFixed(1)} kg</b></div>)}
              </>
            )}
            {progTab === 'Body Stats' && (
              <section className="card">
                <small>BODY MEASUREMENTS (cm / %)</small>
                {[['Chest', 'chest'], ['Waist', 'waist'], ['Arms', 'arms'], ['Thighs', 'thighs'], ['Body Fat %', 'fat']].map(([lb, k]) => (
                  <div className="hrow" key={k}><label>{lb}</label><input value={measures[k]} onChange={e => setMeasures({ ...measures, [k]: e.target.value })} placeholder="--" inputMode="decimal" /></div>
                ))}
                <p className="muted"><Ruler size={13} /> Saved on this device automatically.</p>
              </section>
            )}
            {progTab === 'History' && (
              <section className="card">
                <small>WORKOUT HISTORY</small>
                <MonthGrid active={activeDates} />
                <div className="stats2"><div><small>TOTAL CHECKED</small><b>{totalDone}</b></div><div><small>WEIGH-INS</small><b>{logs.length}</b></div></div>
              </section>
            )}
          </>
        )}

        {page === 'Profile' && (
          <>
            <p className="hello"><b>Profile</b></p>
            <section className="card me">
              <span className="avatar"><User size={26} /></span>
              <div><b>{user.name}</b><small>{measures.height || '--'} cm &middot; {measures.age || '--'} yrs &middot; {profileForm.goal}</small></div>
            </section>
            {!showSettings ? (
              <>
                <button className="setting" onClick={() => { setPage('Progress'); setProgTab('History'); }}><Dumbbell size={17} /><span><b>Workout History</b><small>{totalDone} exercises checked</small></span><ChevronRight size={16} /></button>
                <button className="setting" onClick={() => { setPage('Progress'); setProgTab('Body Stats'); }}><Ruler size={17} /><span><b>Body Measurements</b><small>Chest, waist, arms, thighs, fat</small></span><ChevronRight size={16} /></button>
                <button className="setting" onClick={() => setShowSettings(true)}><Settings size={17} /><span><b>Settings</b><small>Profile, notifications, about MJDev</small></span><ChevronRight size={16} /></button>
                <section className="card banner"><Target size={18} /><div><b>Consistency beats perfection</b><p>Adapt weights to your recovery.</p></div></section>
              </>
            ) : (
              <>
                <button className="ghost" onClick={() => setShowSettings(false)}><X size={14} /> Back</button>
                <section className="card">
                  <small><User size={13} /> PROFILE INFORMATION</small>
                  <label>Display name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                  <label>Goal</label>
                  <div className="hrow">
                    <select value={profileForm.goal} onChange={e => setProfileForm({ ...profileForm, goal: e.target.value })}>
                      <option>Muscle Gain</option><option>Fat Loss</option><option>Strength</option><option>General Fitness</option>
                    </select>
                    <button className="primary" onClick={() => profileForm.name.trim() && setUser({ name: profileForm.name.trim() })}>Save</button>
                  </div>
                  <div className="hrow"><div><label>Height (cm)</label><input value={measures.height} onChange={e => setMeasures({ ...measures, height: e.target.value })} /></div><div><label>Age</label><input value={measures.age} onChange={e => setMeasures({ ...measures, age: e.target.value })} /></div></div>
                </section>
                <section className="card">
                  <small><Bell size={13} /> NOTIFICATIONS</small>
                  <div className="hrow"><span>Workout reminders</span><button className={'switch ' + (notif ? 'on' : '')} onClick={() => setNotif(!notif)}><span /></button></div>
                  <small><Info size={13} /> ABOUT</small>
                  <p className="muted">Johns Fit Planner v1.0.0<br />Developed by <b>MJDev</b><br />GitHub: merjohnpagente / Johngymplanner</p>
                </section>
                <button className="setting danger" onClick={() => { if (confirm('Clear all local data?')) { localStorage.clear(); location.reload(); } }}><Trash2 size={16} /><span><b>Clear app data</b></span></button>
                <button className="setting danger" onClick={() => { localStorage.removeItem('jfp-user'); setUser(null); }}><LogOut size={16} /><span><b>Log Out</b></span></button>
              </>
            )}
            <p className="devfoot">Developed by MJDev</p>
          </>
        )}
      </main>

      {/* Exercise detail modal */}
      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <button className="iconbtn" onClick={() => setDetail(null)}><X size={17} /></button>
            <small>{DAYS[detail.dayIdx].name.toUpperCase()}</small>
            <h2>{detail.ex[0]}</h2>
            <div className="stats3">
              <div><small>SETS</small><b>{detail.ex[1]}</b></div>
              <div><small>REPS</small><b>{detail.ex[2]}</b></div>
              <div><small>REST</small><b>90 sec</b></div>
            </div>
            <b>Instructions</b>
            <ol>{instructionsFor(detail.ex[0]).map((s, i) => <li key={i}>{s}</li>)}</ol>
            <p className="muted"><Clock size={13} /> Estimated 50-75 min for full session.</p>
            <button className="primary" onClick={() => {
              const d = DAYS[detail.dayIdx], k = dateStr() + '-' + d.key;
              setDone(o => ({ ...o, [k]: (o[k] || []).includes(detail.ex[0]) ? o[k] : [...(o[k] || []), detail.ex[0]] }));
              setDetail(null);
            }}><Check size={15} /> Mark as Completed</button>
          </div>
        </div>
      )}

      <nav className="bottom">
        {nav.map(([label, Icon]) => (
          <button key={label} className={page === label ? 'active' : ''} onClick={() => setPage(label)}>
            <Icon size={19} /><small>{label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

function MonthGrid({ active }) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const count = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const pad = (n) => `${y}-${String(m + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
  return (
    <div className="cal">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <small key={i}>{d}</small>)}
      {cells.map((d, i) => d === null ? <span key={'e' + i} /> : (
        <span key={i} className={active.has(pad(d)) ? 'hit' : ''}>{d}</span>
      ))}
    </div>
  );
}
