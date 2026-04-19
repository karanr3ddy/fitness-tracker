import { useState, useEffect } from "react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Glutes", "Core", "Cardio", "Full Body"];

const EXERCISE_LIBRARY = {
  Chest: ["Bench Press", "Incline Dumbbell Press", "Cable Flyes", "Push-Ups", "Chest Dips", "Pec Deck"],
  Back: ["Deadlift", "Pull-Ups", "Barbell Row", "Lat Pulldown", "Seated Cable Row", "Face Pulls"],
  Shoulders: ["Overhead Press", "Lateral Raises", "Front Raises", "Arnold Press", "Rear Delt Flyes", "Shrugs"],
  Biceps: ["Barbell Curl", "Hammer Curl", "Incline Curl", "Preacher Curl", "Cable Curl", "Concentration Curl"],
  Triceps: ["Skull Crushers", "Tricep Pushdown", "Overhead Extension", "Close Grip Bench", "Dips", "Kickbacks"],
  Legs: ["Squat", "Leg Press", "Romanian Deadlift", "Lunges", "Leg Curl", "Leg Extension", "Calf Raises"],
  Glutes: ["Hip Thrust", "Sumo Deadlift", "Glute Bridge", "Cable Kickback", "Step-Ups", "Bulgarian Split Squat"],
  Core: ["Plank", "Crunches", "Leg Raises", "Russian Twists", "Ab Wheel", "Hanging Knee Raises"],
  Cardio: ["Treadmill Run", "Cycling", "Jump Rope", "Rowing Machine", "Stair Climber", "HIIT Sprints"],
  "Full Body": ["Burpees", "Clean and Press", "Kettlebell Swings", "Thrusters", "Box Jumps", "Farmer's Walk"],
};

const INTENSITY_COLORS = { Easy: "#4ade80", Moderate: "#facc15", Hard: "#f97316", Beast: "#ef4444" };
const INTENSITY_LEVELS = ["Easy", "Moderate", "Hard", "Beast"];

const DEFAULT_SCHEDULE = {
  MON: { label: "Push", exercises: [
    { id: 1, name: "Bench Press", sets: 4, reps: "8-10", weight: "80kg", group: "Chest", intensity: "Hard", done: false },
    { id: 2, name: "Overhead Press", sets: 3, reps: "10-12", weight: "50kg", group: "Shoulders", intensity: "Moderate", done: false },
    { id: 3, name: "Tricep Pushdown", sets: 3, reps: "12-15", weight: "25kg", group: "Triceps", intensity: "Easy", done: false },
  ]},
  TUE: { label: "Pull", exercises: [
    { id: 4, name: "Deadlift", sets: 4, reps: "5", weight: "120kg", group: "Back", intensity: "Beast", done: false },
    { id: 5, name: "Pull-Ups", sets: 3, reps: "8-10", weight: "BW", group: "Back", intensity: "Hard", done: false },
    { id: 6, name: "Barbell Curl", sets: 3, reps: "10-12", weight: "30kg", group: "Biceps", intensity: "Moderate", done: false },
  ]},
  WED: { label: "Legs", exercises: [
    { id: 7, name: "Squat", sets: 5, reps: "5", weight: "100kg", group: "Legs", intensity: "Beast", done: false },
    { id: 8, name: "Leg Press", sets: 3, reps: "12-15", weight: "150kg", group: "Legs", intensity: "Hard", done: false },
    { id: 9, name: "Hip Thrust", sets: 3, reps: "12", weight: "80kg", group: "Glutes", intensity: "Moderate", done: false },
  ]},
  THU: { label: "Rest", exercises: [] },
  FRI: { label: "Push", exercises: [
    { id: 10, name: "Incline Dumbbell Press", sets: 4, reps: "10-12", weight: "30kg", group: "Chest", intensity: "Moderate", done: false },
    { id: 11, name: "Lateral Raises", sets: 4, reps: "15", weight: "10kg", group: "Shoulders", intensity: "Easy", done: false },
  ]},
  SAT: { label: "Full Body", exercises: [
    { id: 12, name: "Clean and Press", sets: 4, reps: "6", weight: "60kg", group: "Full Body", intensity: "Beast", done: false },
    { id: 13, name: "HIIT Sprints", sets: 1, reps: "20min", weight: "", group: "Cardio", intensity: "Hard", done: false },
  ]},
  SUN: { label: "Rest", exercises: [] },
};

let nextId = 100;

const muscleIcon = (g) => {
  const icons = { Chest: "🫁", Back: "🔙", Shoulders: "🦾", Biceps: "💪", Triceps: "🦿", Legs: "🦵", Glutes: "🍑", Core: "⚡", Cardio: "❤️", "Full Body": "🔥" };
  return icons[g] || "💪";
};

export default function GymApp() {
  const [schedule, setSchedule] = useState(() => {
    try {
      const s = localStorage.getItem("ironweek_schedule");
      return s ? JSON.parse(s) : DEFAULT_SCHEDULE;
    } catch {
      return DEFAULT_SCHEDULE;
    }
  });

  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().getDay(); // 0=Sun
    return DAYS[today === 0 ? 6 : today - 1];
  });

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterGroup, setFilterGroup] = useState("All");
  const [tab, setTab] = useState("week");
  const [editLabel, setEditLabel] = useState(false);
  const [labelVal, setLabelVal] = useState("");
  const [confetti, setConfetti] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem("ironweek_schedule", JSON.stringify(schedule)); } catch {}
  }, [schedule]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const dayData = schedule[activeDay];

  const openAdd = () => {
    setForm({ name: "", sets: 3, reps: "10", weight: "", group: "Chest", intensity: "Moderate" });
    setModal({ type: "add", day: activeDay });
  };

  const openEdit = (ex) => {
    setForm({ ...ex });
    setModal({ type: "edit", day: activeDay, exercise: ex });
  };

  const saveExercise = () => {
    if (!form.name.trim()) return;
    setSchedule(prev => {
      const day = { ...prev[modal.day], exercises: [...prev[modal.day].exercises] };
      if (modal.type === "add") {
        day.exercises = [...day.exercises, { ...form, id: nextId++, done: false }];
      } else {
        day.exercises = day.exercises.map(e => e.id === form.id ? { ...form } : e);
      }
      return { ...prev, [modal.day]: day };
    });
    showToast(modal.type === "add" ? "Exercise added 💪" : "Exercise updated ✅");
    setModal(null);
  };

  const deleteExercise = (id) => {
    setSchedule(prev => {
      const day = { ...prev[activeDay], exercises: prev[activeDay].exercises.filter(e => e.id !== id) };
      return { ...prev, [activeDay]: day };
    });
    showToast("Exercise removed 🗑");
  };

  const toggleDone = (id) => {
    setSchedule(prev => {
      const exs = prev[activeDay].exercises.map(e => e.id === id ? { ...e, done: !e.done } : e);
      const allDone = exs.length > 0 && exs.every(e => e.done);
      if (allDone) spawnConfetti();
      return { ...prev, [activeDay]: { ...prev[activeDay], exercises: exs } };
    });
  };

  const spawnConfetti = () => {
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: ["#facc15", "#ef4444", "#4ade80", "#60a5fa", "#f97316", "#c084fc"][i % 6],
    }));
    setConfetti(pieces);
    showToast("Workout complete! Beast mode 🔥");
    setTimeout(() => setConfetti([]), 3000);
  };

  const saveLabel = () => {
    setSchedule(prev => ({ ...prev, [activeDay]: { ...prev[activeDay], label: labelVal } }));
    setEditLabel(false);
  };

  const clearDay = () => {
    if (window.confirm(`Clear all exercises for ${activeDay}?`)) {
      setSchedule(prev => ({ ...prev, [activeDay]: { ...prev[activeDay], exercises: [] } }));
      showToast("Day cleared");
    }
  };

  const copyDay = (fromDay) => {
    setSchedule(prev => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        exercises: prev[fromDay].exercises.map(e => ({ ...e, id: nextId++, done: false })),
      },
    }));
    showToast(`Copied from ${fromDay} ✅`);
  };

  const resetAll = () => {
    if (window.confirm("Reset entire week to default? This cannot be undone.")) {
      setSchedule(DEFAULT_SCHEDULE);
      showToast("Week reset to default");
    }
  };

  // Stats
  const allExercises = Object.values(schedule).flatMap(d => d.exercises);
  const totalExercises = allExercises.length;
  const totalSets = allExercises.reduce((a, e) => a + (e.sets || 0), 0);
  const completedEx = allExercises.filter(e => e.done).length;
  const groupCounts = MUSCLE_GROUPS.reduce((a, g) => ({ ...a, [g]: allExercises.filter(e => e.group === g).length }), {});
  const restDays = Object.values(schedule).filter(d => d.exercises.length === 0).length;
  const maxGroupCount = Math.max(...Object.values(groupCounts), 1);

  const filtered = filterGroup === "All"
    ? dayData.exercises
    : dayData.exercises.filter(e => e.group === filterGroup);

  const dayProgress = dayData.exercises.length > 0
    ? Math.round((dayData.exercises.filter(e => e.done).length / dayData.exercises.length) * 100)
    : 0;

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#f0ede8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        input, select, textarea, button { font-family: 'Barlow Condensed', sans-serif; }
        input:focus, select:focus { outline: 1px solid #facc15 !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideIn {
          from { transform: translateX(-8px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastIn {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .ex-card      { animation: slideIn 0.2s ease; }
        .btn-icon:hover { background: #222 !important; }
        .day-tab      { transition: all 0.15s ease; }
        .day-tab:hover { border-color: #f0ede8 !important; color: #f0ede8 !important; }
        .exercise-row { transition: background 0.15s; }
        .exercise-row:hover { background: #181818 !important; }
        .suggestion-item:hover { background: #2a2a2a !important; cursor: pointer; }
        .stat-card    { transition: all 0.2s ease; cursor: default; }
        .stat-card:hover { border-color: #facc15 !important; transform: translateY(-2px); }
        .nav-btn      { transition: all 0.15s; }
        .nav-btn:hover { opacity: 0.8; }
      `}</style>

      {/* Confetti */}
      {confetti.map(p => (
        <div
          key={p.id}
          style={{
            position: "fixed", left: `${p.x}%`, top: 0,
            width: 8, height: 8, borderRadius: 2,
            background: p.color,
            animation: `fall 2.5s ${p.delay}s ease-in forwards`,
            zIndex: 9999, pointerEvents: "none",
          }}
        />
      ))}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#facc15", color: "#000", padding: "10px 20px",
          fontWeight: 800, fontSize: 14, letterSpacing: "1px",
          animation: "toastIn 0.3s ease", zIndex: 9998, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e1e1e", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#0a0a0a", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", color: "#facc15" }}>IRON</span>
          <span style={{ fontSize: 26, fontWeight: 300, letterSpacing: "4px", color: "#f0ede8" }}>WEEK</span>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "2px", marginLeft: 4 }}>GYM PLANNER</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["week", "📅 WEEK"], ["stats", "📊 STATS"]].map(([t, label]) => (
            <button key={t} className="nav-btn" onClick={() => setTab(t)} style={{
              background: tab === t ? "#facc15" : "transparent",
              color: tab === t ? "#000" : "#888",
              border: "1px solid", borderColor: tab === t ? "#facc15" : "#333",
              padding: "6px 14px", cursor: "pointer",
              fontWeight: 700, letterSpacing: "1.5px", fontSize: 12, textTransform: "uppercase",
            }}>
              {label}
            </button>
          ))}
          <button onClick={resetAll} className="nav-btn" style={{
            background: "transparent", border: "1px solid #2a2a2a",
            color: "#555", padding: "6px 10px", cursor: "pointer", fontSize: 12,
          }} title="Reset week">↺</button>
        </div>
      </header>

      {/* ── WEEK TAB ── */}
      {tab === "week" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 80px" }}>

          {/* Day selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, padding: "20px 0 16px" }}>
            {DAYS.map((d) => {
              const dd = schedule[d];
              const prog = dd.exercises.length > 0
                ? dd.exercises.filter(e => e.done).length / dd.exercises.length
                : 0;
              const isActive = d === activeDay;
              return (
                <button key={d} className="day-tab" onClick={() => { setActiveDay(d); setFilterGroup("All"); }} style={{
                  background: isActive ? "#facc15" : "#111",
                  border: `1px solid ${isActive ? "#facc15" : "#222"}`,
                  color: isActive ? "#000" : "#888",
                  padding: "10px 4px 8px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px" }}>{d}</span>
                  <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", padding: "0 2px" }}>
                    {dd.label || "—"}
                  </span>
                  <div style={{ width: "80%", height: 3, background: isActive ? "#0003" : "#222", borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
                    <div style={{ height: "100%", width: `${prog * 100}%`, background: isActive ? "#000" : "#facc15", borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 9, color: isActive ? "#0007" : "#555" }}>{dd.exercises.length} ex</span>
                </button>
              );
            })}
          </div>

          {/* Day header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #1e1e1e", paddingBottom: 12, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#facc15", letterSpacing: "-1px" }}>
                {FULL_DAYS[DAYS.indexOf(activeDay)]}
              </span>
              {editLabel ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={labelVal}
                    onChange={e => setLabelVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveLabel()}
                    autoFocus
                    maxLength={20}
                    style={{ background: "#111", border: "1px solid #333", color: "#f0ede8", padding: "5px 10px", fontSize: 14, width: 130 }}
                  />
                  <button onClick={saveLabel} style={{ background: "#facc15", border: "none", color: "#000", padding: "5px 10px", cursor: "pointer", fontWeight: 700 }}>✓</button>
                  <button onClick={() => setEditLabel(false)} style={{ background: "#222", border: "none", color: "#888", padding: "5px 10px", cursor: "pointer" }}>✕</button>
                </div>
              ) : (
                <span
                  onClick={() => { setLabelVal(dayData.label || ""); setEditLabel(true); }}
                  title="Click to edit label"
                  style={{ background: "#181818", border: "1px solid #2a2a2a", padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#aaa", letterSpacing: "1px", textTransform: "uppercase" }}
                >
                  {dayData.label || "Set label"} ✏️
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: dayProgress === 100 ? "#4ade80" : "#f0ede8", lineHeight: 1 }}>{dayProgress}%</div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: "1px" }}>COMPLETE</div>
              </div>
              <button onClick={openAdd} style={{ background: "#facc15", border: "none", color: "#000", padding: "10px 20px", cursor: "pointer", fontWeight: 800, fontSize: 15, letterSpacing: "1px", textTransform: "uppercase" }}>
                + ADD
              </button>
            </div>
          </div>

          {/* Filter chips */}
          {dayData.exercises.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {["All", ...MUSCLE_GROUPS.filter(g => dayData.exercises.some(e => e.group === g))].map(g => (
                <button key={g} onClick={() => setFilterGroup(g)} style={{
                  background: filterGroup === g ? "#1e1e1e" : "transparent",
                  border: `1px solid ${filterGroup === g ? "#facc15" : "#2a2a2a"}`,
                  color: filterGroup === g ? "#facc15" : "#666",
                  padding: "4px 12px", cursor: "pointer",
                  fontSize: 11, letterSpacing: "1px", textTransform: "uppercase",
                }}>
                  {g === "All" ? "All" : `${muscleIcon(g)} ${g}`}
                </button>
              ))}
            </div>
          )}

          {/* Exercise list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 20px", color: "#333" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#3a3a3a" }}>
                {dayData.exercises.length === 0 ? "Rest day. No exercises yet." : "No exercises in this filter."}
              </div>
              <div style={{ fontSize: 14, color: "#333", marginTop: 8 }}>
                {dayData.exercises.length === 0 ? "Hit + ADD to build your workout" : "Try selecting a different group"}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(ex => (
                <div key={ex.id} className="exercise-row ex-card" style={{
                  background: "#111",
                  border: `1px solid ${ex.done ? "#1a2e1a" : "#1e1e1e"}`,
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: ex.done ? 0.55 : 1,
                }}>
                  {/* Check */}
                  <button onClick={() => toggleDone(ex.id)} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    border: `2px solid ${ex.done ? "#4ade80" : "#333"}`,
                    background: ex.done ? "#4ade80" : "transparent",
                    cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: "#000", transition: "all 0.2s",
                  }}>
                    {ex.done ? "✓" : ""}
                  </button>

                  {/* Icon */}
                  <div style={{ width: 38, height: 38, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: "1px solid #2a2a2a" }}>
                    {muscleIcon(ex.group)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 17, fontWeight: 800, textDecoration: ex.done ? "line-through" : "none", color: ex.done ? "#555" : "#f0ede8" }}>
                        {ex.name}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "1px",
                        color: INTENSITY_COLORS[ex.intensity],
                        border: `1px solid ${INTENSITY_COLORS[ex.intensity]}33`,
                        background: `${INTENSITY_COLORS[ex.intensity]}11`,
                        padding: "2px 7px", textTransform: "uppercase",
                      }}>
                        {ex.intensity}
                      </span>
                      <span style={{ fontSize: 10, color: "#555", background: "#1a1a1a", padding: "2px 7px", letterSpacing: "1px" }}>
                        {ex.group}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, color: "#888" }}><span style={{ color: "#facc15", fontWeight: 700 }}>{ex.sets}</span> sets</span>
                      <span style={{ fontSize: 13, color: "#888" }}><span style={{ color: "#facc15", fontWeight: 700 }}>{ex.reps}</span> reps</span>
                      {ex.weight && <span style={{ fontSize: 13, color: "#888" }}><span style={{ color: "#facc15", fontWeight: 700 }}>{ex.weight}</span></span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn-icon" onClick={() => openEdit(ex)} title="Edit" style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#888", width: 32, height: 32, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                    <button className="btn-icon" onClick={() => deleteExercise(ex.id)} title="Delete" style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#666", width: 32, height: 32, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom utility bar */}
          {dayData.exercises.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={clearDay} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#555", padding: "8px 14px", cursor: "pointer", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase" }}>
                🗑 Clear Day
              </button>
              <select
                onChange={e => { if (e.target.value) { copyDay(e.target.value); e.target.value = ""; } }}
                defaultValue=""
                style={{ background: "#111", border: "1px solid #2a2a2a", color: "#555", padding: "8px 12px", cursor: "pointer", fontSize: 12, letterSpacing: "1px" }}
              >
                <option value="" disabled>📋 Copy from another day...</option>
                {DAYS.filter(d => d !== activeDay && schedule[d].exercises.length > 0).map(d => (
                  <option key={d} value={d}>{d} — {schedule[d].label || "Untitled"}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === "stats" && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 80px", animation: "fadeUp 0.3s ease" }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "2px", marginBottom: 24, textTransform: "uppercase" }}>Weekly Overview</div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 32 }}>
            {[
              { label: "Total Exercises", val: totalExercises, icon: "💪" },
              { label: "Total Sets", val: totalSets, icon: "🔢" },
              { label: "Completed", val: completedEx, icon: "✅" },
              { label: "Remaining", val: totalExercises - completedEx, icon: "⏳" },
              { label: "Rest Days", val: restDays, icon: "😴" },
              { label: "Training Days", val: 7 - restDays, icon: "🔥" },
              { label: "Completion", val: `${totalExercises > 0 ? Math.round((completedEx / totalExercises) * 100) : 0}%`, icon: "📈" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ background: "#111", border: "1px solid #1e1e1e", padding: "16px 14px" }}>
                <div style={{ fontSize: 26 }}>{s.icon}</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: "#facc15", lineHeight: 1.1, marginTop: 6 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Muscle group bar chart */}
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "2px", marginBottom: 14, textTransform: "uppercase", color: "#666" }}>
            Muscle Group Distribution
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {MUSCLE_GROUPS.filter(g => groupCounts[g] > 0).sort((a, b) => groupCounts[b] - groupCounts[a]).map(g => (
              <div key={g} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 26, textAlign: "center", fontSize: 16 }}>{muscleIcon(g)}</span>
                <span style={{ width: 90, fontSize: 12, fontWeight: 700, letterSpacing: "1px", color: "#888", textTransform: "uppercase", flexShrink: 0 }}>{g}</span>
                <div style={{ flex: 1, height: 22, background: "#1a1a1a", position: "relative" }}>
                  <div style={{
                    height: "100%",
                    width: `${(groupCounts[g] / maxGroupCount) * 100}%`,
                    background: "#facc15", transition: "width 0.6s ease",
                  }} />
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 700, color: "#000", mixBlendMode: "difference" }}>
                    {groupCounts[g]}
                  </span>
                </div>
              </div>
            ))}
            {MUSCLE_GROUPS.every(g => groupCounts[g] === 0) && (
              <div style={{ color: "#333", fontSize: 14, padding: "20px 0" }}>No exercises added yet.</div>
            )}
          </div>

          {/* Daily breakdown */}
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "2px", marginBottom: 14, textTransform: "uppercase", color: "#666" }}>
            Daily Breakdown
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
            {DAYS.map((d) => {
              const dd = schedule[d];
              const prog = dd.exercises.length > 0 ? dd.exercises.filter(e => e.done).length / dd.exercises.length : 0;
              return (
                <div key={d} onClick={() => { setTab("week"); setActiveDay(d); }} style={{
                  background: "#111", border: "1px solid #1e1e1e", padding: "12px 6px",
                  textAlign: "center", cursor: "pointer", transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#facc15"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#facc15", letterSpacing: "1px" }}>{d}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6, color: dd.exercises.length === 0 ? "#2a2a2a" : "#f0ede8" }}>
                    {dd.exercises.length}
                  </div>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: "1px", marginBottom: 6 }}>EX</div>
                  <div style={{ width: "100%", height: 3, background: "#1a1a1a" }}>
                    <div style={{ height: "100%", width: `${prog * 100}%`, background: "#4ade80", transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>{dd.label || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }}
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div style={{ background: "#111", border: "1px solid #2a2a2a", width: "100%", maxWidth: 480, padding: 24, animation: "fadeUp 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "2px", marginBottom: 20, textTransform: "uppercase" }}>
              {modal.type === "add" ? "➕ Add Exercise" : "✏️ Edit Exercise"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Name + suggestions */}
              <div>
                <label style={{ fontSize: 11, letterSpacing: "2px", color: "#555", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Exercise Name *</label>
                <input
                  value={form.name || ""}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Bench Press"
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#f0ede8", padding: "10px 12px", fontSize: 15 }}
                  autoFocus
                />
                {/* Auto-suggest from library when name is short */}
                {form.group && (form.name || "").length < 2 && EXERCISE_LIBRARY[form.group] && (
                  <div style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderTop: "none", maxHeight: 150, overflowY: "auto" }}>
                    {EXERCISE_LIBRARY[form.group].map(s => (
                      <div key={s} className="suggestion-item" onClick={() => setForm(f => ({ ...f, name: s }))} style={{ padding: "8px 12px", fontSize: 13, color: "#888", borderBottom: "1px solid #1a1a1a" }}>
                        {muscleIcon(form.group)} {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "2px", color: "#555", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Muscle Group</label>
                  <select value={form.group || "Chest"} onChange={e => setForm(f => ({ ...f, group: e.target.value }))} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#f0ede8", padding: "10px 12px", fontSize: 14 }}>
                    {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{muscleIcon(g)} {g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "2px", color: "#555", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Intensity</label>
                  <select value={form.intensity || "Moderate"} onChange={e => setForm(f => ({ ...f, intensity: e.target.value }))} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: INTENSITY_COLORS[form.intensity] || "#f0ede8", padding: "10px 12px", fontSize: 14 }}>
                    {INTENSITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Sets", key: "sets", placeholder: "3", type: "number" },
                  { label: "Reps", key: "reps", placeholder: "10", type: "text" },
                  { label: "Weight", key: "weight", placeholder: "e.g. 80kg / BW", type: "text" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, letterSpacing: "2px", color: "#555", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
                    <input
                      type={type}
                      value={form[key] || ""}
                      min={key === "sets" ? 1 : undefined}
                      onChange={e => setForm(f => ({ ...f, [key]: key === "sets" ? (parseInt(e.target.value) || 1) : e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#f0ede8", padding: "10px 12px", fontSize: 14 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                onClick={saveExercise}
                disabled={!(form.name || "").trim()}
                style={{
                  flex: 1, border: "none",
                  background: (form.name || "").trim() ? "#facc15" : "#2a2a2a",
                  color: (form.name || "").trim() ? "#000" : "#555",
                  padding: "12px", cursor: (form.name || "").trim() ? "pointer" : "not-allowed",
                  fontWeight: 800, fontSize: 14, letterSpacing: "2px", textTransform: "uppercase",
                }}
              >
                {modal.type === "add" ? "ADD EXERCISE" : "SAVE CHANGES"}
              </button>
              <button onClick={() => setModal(null)} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#666", padding: "12px 20px", cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
