import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Plus, Trash2, Calendar, Target, CheckCircle2, ChevronRight, Check, ChevronLeft } from 'lucide-react';

export const HabitTracker = () => {
  const { habits, goals, addHabit, toggleHabit, deleteHabit, getHabitStreaks } = useApp();
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [goalId, setGoalId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCalendarHabitId, setExpandedCalendarHabitId] = useState(null);

  // Calendar states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Generate list of the past 7 days for the quick list
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

  // Calendar Grid Helper
  const getMonthDetails = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
    
    const dayCells = [];
    // Prefix empty blocks
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push({ isEmpty: true, id: `empty_${i}` });
    }
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const monthFormatted = String(month + 1).padStart(2, '0');
      const dayFormatted = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
      dayCells.push({ isEmpty: false, dayNum: day, dateStr, id: `day_${day}` });
    }
    return dayCells;
  };

  const calendarDays = getMonthDetails(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const toggleExpandCalendar = (habitId) => {
    if (expandedCalendarHabitId === habitId) {
      setExpandedCalendarHabitId(null);
    } else {
      setExpandedCalendarHabitId(habitId);
      // Reset calendar focus to current month
      setCurrentYear(new Date().getFullYear());
      setCurrentMonth(new Date().getMonth());
    }
  };

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
            <Flame size={20} className="inline-icon flame-icon" />
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
      <div className="section-header" style={{ marginTop: '20px' }}>
        <div>
          <h2>Daily Habits</h2>
          <p>Commit to small acts. Toggle accomplishments for the past week, or expand the calendar for monthly views.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Plus size={14} />
          <span>Add Habit</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="aura-card habit-form-card fade-in" style={{ marginBottom: '16px' }}>
          <h3>Create Compounding Habit</h3>
          <div className="grid-3" style={{ marginTop: '12px' }}>
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
          <div className="form-actions" style={{ marginTop: '12px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="btn-btn btn-secondary"
              style={{ padding: '6px 12px' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-btn btn-primary" style={{ padding: '6px 12px' }}>
              Build Habit
            </button>
          </div>
        </form>
      )}

      {habits.length === 0 ? (
        <div className="empty-state-card aura-card" style={{ marginTop: '16px' }}>
          <Calendar size={36} className="empty-icon" />
          <h3>No habits being tracked</h3>
          <p>Habits shape your actions. Establish your first habit to begin building consistency.</p>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="btn-btn btn-secondary" 
            style={{ marginTop: '12px', padding: '6px 12px' }}
          >
            Create Habit
          </button>
        </div>
      ) : (
        <div className="habits-list" style={{ marginTop: '12px' }}>
          {habitsWithStreaks.map(habit => {
            const mappedGoal = goals.find(g => g.id === habit.goalId);
            const isCalendarExpanded = expandedCalendarHabitId === habit.id;

            return (
              <div key={habit.id} className="aura-card habit-item-card fade-in">
                <div className="habit-item-main">
                  {/* Habit details */}
                  <div className="habit-info">
                    <div>
                      <h3 className="habit-title">{habit.title}</h3>
                      <div className="habit-meta">
                        <span className="habit-freq">{habit.frequency}</span>
                        {mappedGoal && (
                          <span className="badge badge-goal" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Target size={9} />
                            <span>{mappedGoal.title}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="habit-streaks-indicators">
                      <div className="streak-badge" title="Current Streak">
                        <Flame size={12} className="streak-icon active-flame" />
                        <span>{habit.streaks.current}d</span>
                      </div>
                      <button 
                        onClick={() => toggleExpandCalendar(habit.id)}
                        className={`btn-icon habit-compact-btn ${isCalendarExpanded ? 'calendar-expanded-active' : ''}`}
                        title="View Monthly Calendar"
                      >
                        <Calendar size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this habit permanently? Data history will be lost.')) {
                            deleteHabit(habit.id);
                          }
                        }} 
                        className="habit-delete-btn"
                        title="Delete Habit"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Calendar tracker row (7 day quick view) */}
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
                            {isCompleted ? <Check size={11} /> : <span className="day-num">{day.dayNum}</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Month View Calendar */}
                {isCalendarExpanded && (
                  <div className="habit-calendar-expanded fade-in">
                    <div className="calendar-control-row">
                      <h4>Monthly Completion Log</h4>
                      <div className="calendar-switcher">
                        <button onClick={handlePrevMonth} className="btn-icon month-nav-btn">
                          <ChevronLeft size={12} />
                        </button>
                        <span className="calendar-month-year">{monthName} {currentYear}</span>
                        <button onClick={handleNextMonth} className="btn-icon month-nav-btn">
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="calendar-grid-header">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="calendar-header-cell">{d[0]}</div>
                      ))}
                    </div>

                    <div className="calendar-grid-body">
                      {calendarDays.map(cell => {
                        if (cell.isEmpty) {
                          return <div key={cell.id} className="calendar-day-cell empty-cell" />;
                        }

                        const isCompleted = habit.history.includes(cell.dateStr);
                        const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                        return (
                          <button
                            key={cell.id}
                            onClick={() => toggleHabit(habit.id, cell.dateStr)}
                            className={`calendar-day-cell active-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today-cell' : ''}`}
                            title={cell.dateStr}
                          >
                            <span>{cell.dayNum}</span>
                            {isCompleted && <div className="completed-glow" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
          padding: 12px 16px;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .flame-icon {
          color: var(--accent-warning);
        }

        .stat-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .habit-form-card {
          border-color: var(--accent-primary);
        }

        .habit-form-card h3 {
          font-size: 1rem;
        }

        .habits-list {
          display: flex;
          flex-direction: column;
          gap: 12px; /* reduced from 18px */
        }

        .habit-item-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 12px 16px; /* condensed padding from 24px */
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }
        .habit-item-card:hover {
          border-color: var(--border-hover);
        }

        .habit-item-main {
          display: flex;
          flex-direction: column;
          gap: 12px; /* condensed from 20px */
        }
        @media (min-width: 768px) {
          .habit-item-main {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .habit-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .habit-title {
          font-size: 0.95rem; /* condensed from 1.1rem */
          font-weight: 600;
          color: var(--text-primary);
        }

        .habit-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .habit-freq {
          font-size: 0.7rem;
          color: var(--text-secondary);
          background-color: var(--bg-tertiary);
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .habit-streaks-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background-color: rgba(255, 209, 102, 0.08);
          border: 1px solid rgba(255, 209, 102, 0.15);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          color: var(--accent-warning);
          font-weight: 500;
        }

        .active-flame {
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        .habit-compact-btn {
          width: 26px;
          height: 26px;
        }

        .habit-delete-btn {
          color: var(--text-muted);
          padding: 4px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-smooth);
        }
        .habit-delete-btn:hover {
          color: var(--accent-danger);
          background-color: rgba(224, 122, 95, 0.08);
        }

        .calendar-expanded-active {
          color: var(--accent-primary) !important;
          border-color: var(--accent-primary) !important;
          background-color: rgba(142, 148, 242, 0.05);
        }

        /* 7 Day Matrix Row - Condensed */
        .habit-matrix {
          display: flex;
          gap: 6px;
          justify-content: space-between;
          background-color: var(--bg-tertiary);
          padding: 6px 12px; /* condensed from 10px 16px */
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .matrix-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 32px; /* condensed from 38px */
        }

        .matrix-day.today .day-label {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .day-label {
          font-size: 0.65rem;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .matrix-toggle {
          width: 26px; /* shrunk from 32px */
          height: 26px;
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
          color: #ffffff;
        }
        body.light-theme .matrix-toggle.completed {
          color: #ffffff;
        }

        .day-num {
          font-size: 0.7rem;
          font-weight: 500;
        }

        /* Expanded Calendar styles - Compact Fixed Small Boxes */
        .habit-calendar-expanded {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border-color);
          max-width: 260px;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .calendar-control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .calendar-control-row h4 {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .calendar-switcher {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .calendar-month-year {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 80px;
          text-align: center;
        }

        .month-nav-btn {
          width: 22px;
          height: 22px;
        }

        .calendar-grid-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 4px;
          text-align: center;
        }

        .calendar-header-cell {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .calendar-grid-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .calendar-day-cell {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 500;
          border-radius: var(--border-radius-sm);
          position: relative;
          transition: var(--transition-smooth);
        }

        .empty-cell {
          background-color: transparent;
          pointer-events: none;
        }

        .active-cell {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }
        .active-cell:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .active-cell.completed {
          background-color: rgba(82, 183, 136, 0.12);
          border-color: rgba(82, 183, 136, 0.3);
          color: var(--accent-success);
          font-weight: 600;
        }
        .active-cell.completed:hover {
          background-color: var(--accent-success);
          border-color: var(--accent-success);
          color: #ffffff;
        }

        .today-cell {
          border-color: var(--accent-primary) !important;
          color: var(--accent-primary) !important;
          font-weight: 700;
        }

        .completed-glow {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: var(--accent-success);
          bottom: 3px;
        }
        .active-cell.completed:hover .completed-glow {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
};
