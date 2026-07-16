import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Plus, Trash2, Calendar, Target, CheckCircle2, ChevronRight, Check } from 'lucide-react';

export const HabitTracker = () => {
  const { habits, goals, addHabit, toggleHabit, deleteHabit, getHabitStreaks } = useApp();
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [goalId, setGoalId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Generate list of the past 7 days
  const getPastSevenDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      days.push({ dateStr, dayName, dayNum });
    }
    return days;
  };

  const pastDays = getPastSevenDays();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit(title.trim(), frequency, goalId);
    setTitle('');
    setGoalId('');
    setShowAddForm(false);
  };

  // Stats calculation
  const totalHabits = habits.length;
  const habitsWithStreaks = habits.map(h => ({
    ...h,
    streaks: getHabitStreaks(h)
  }));
  
  const activeStreaksCount = habitsWithStreaks.reduce((sum, h) => sum + h.streaks.current, 0);
  const bestStreak = habitsWithStreaks.reduce((max, h) => Math.max(max, h.streaks.longest), 0);

  return (
    <div className="habits-section fade-in">
      {/* Stats Summary Widgets */}
      <div className="stats-row grid-3">
        <div className="aura-card stat-card">
          <div className="stat-label">Active Habits</div>
          <div className="stat-value">{totalHabits}</div>
          <div className="stat-desc">Daily actions building identity</div>
        </div>
        <div className="aura-card stat-card">
          <div className="stat-label">Total Current Streaks</div>
          <div className="stat-value text-accent">
            <Flame size={28} className="inline-icon flame-icon" />
            <span>{activeStreaksCount} Days</span>
          </div>
          <div className="stat-desc">Consecutive days active</div>
        </div>
        <div className="aura-card stat-card">
          <div className="stat-label">Personal Best Streak</div>
          <div className="stat-value text-success">{bestStreak} Days</div>
          <div className="stat-desc">Longest streak recorded</div>
        </div>
      </div>

      {/* Header and Add Form toggle */}
      <div className="section-header" style={{ marginTop: '32px' }}>
        <div>
          <h2>Daily Habits</h2>
          <p>Commit to small acts. Toggle accomplishments for the past week to maintain consistency.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-btn btn-primary"
        >
          <Plus size={16} />
          <span>Add Habit</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="aura-card habit-form-card fade-in">
          <h3>Create Compounding Habit</h3>
          <div className="grid-3" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Habit Name</label>
              <input 
                type="text" 
                placeholder="e.g., Read 15 pages" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Map to Objective (Optional)</label>
              <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                <option value="">No goal linkage</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="btn-btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-btn btn-primary">
              Build Habit
            </button>
          </div>
        </form>
      )}

      {habits.length === 0 ? (
        <div className="empty-state-card aura-card" style={{ marginTop: '20px' }}>
          <Calendar size={40} className="empty-icon" />
          <h3>No habits being tracked</h3>
          <p>Habits shape your actions. Establish your first habit to begin building consistency.</p>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="btn-btn btn-secondary" 
            style={{ marginTop: '16px' }}
          >
            Create Habit
          </button>
        </div>
      ) : (
        <div className="habits-list" style={{ marginTop: '20px' }}>
          {habitsWithStreaks.map(habit => {
            const mappedGoal = goals.find(g => g.id === habit.goalId);
            return (
              <div key={habit.id} className="aura-card habit-item fade-in">
                {/* Habit details */}
                <div className="habit-info">
                  <div>
                    <h3 className="habit-title">{habit.title}</h3>
                    <div className="habit-meta">
                      <span className="habit-freq">{habit.frequency}</span>
                      {mappedGoal && (
                        <span className="badge badge-goal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Target size={10} />
                          <span>{mappedGoal.title}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="habit-streaks-indicators">
                    <div className="streak-badge" title="Current Streak">
                      <Flame size={14} className="streak-icon active-flame" />
                      <span>{habit.streaks.current}d streak</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Delete this habit permanently? Data history will be lost.')) {
                          deleteHabit(habit.id);
                        }
                      }} 
                      className="habit-delete-btn"
                      title="Delete Habit"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Calendar tracker row */}
                <div className="habit-matrix">
                  {pastDays.map(day => {
                    const isCompleted = habit.history.includes(day.dateStr);
                    const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                    return (
                      <div 
                        key={day.dateStr} 
                        className={`matrix-day ${isToday ? 'today' : ''}`}
                      >
                        <span className="day-label">{day.dayName}</span>
                        <button
                          onClick={() => toggleHabit(habit.id, day.dateStr)}
                          className={`matrix-toggle ${isCompleted ? 'completed' : ''}`}
                          title={`Toggle ${habit.title} for ${day.dateStr}`}
                        >
                          {isCompleted ? <Check size={14} /> : <span className="day-num">{day.dayNum}</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .habits-section {
          width: 100%;
        }

        .stat-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .flame-icon {
          color: var(--accent-warning);
        }

        .stat-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .habit-form-card {
          border-color: var(--accent-primary);
        }

        .habit-form-card h3 {
          font-size: 1.1rem;
        }

        .habits-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .habit-item {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .habit-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .habit-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .habit-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .habit-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }

        .habit-freq {
          font-size: 0.75rem;
          color: var(--text-secondary);
          background-color: var(--bg-tertiary);
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .habit-streaks-indicators {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: rgba(255, 209, 102, 0.08);
          border: 1px solid rgba(255, 209, 102, 0.15);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          color: var(--accent-warning);
          font-weight: 500;
        }

        .active-flame {
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .habit-delete-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-smooth);
        }
        .habit-delete-btn:hover {
          color: var(--accent-danger);
          background-color: rgba(224, 122, 95, 0.08);
        }

        /* 7 Day Matrix Row */
        .habit-matrix {
          display: flex;
          gap: 8px;
          justify-content: space-between;
          background-color: var(--bg-tertiary);
          padding: 10px 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .matrix-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 38px;
        }

        .matrix-day.today .day-label {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .day-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .matrix-toggle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .matrix-toggle:hover {
          border-color: var(--accent-primary);
          background-color: var(--bg-tertiary);
        }

        .matrix-toggle.completed {
          background-color: var(--accent-success);
          border-color: var(--accent-success);
          color: #0c0d0e;
        }

        .day-num {
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
