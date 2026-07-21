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

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper function to evaluate strict day status: 'completed', 'today-pending', 'missed', 'future', 'before-creation', 'not-due'
  const getDayStatus = (habit, dateStr) => {
    const isCompleted = habit.history && habit.history.includes(dateStr);
    if (isCompleted) return 'completed';

    if (dateStr > todayStr) return 'future';
    if (dateStr === todayStr) return 'today-pending';

    // Determine creation date
    let createdDateStr = todayStr;
    if (habit.createdAt) {
      createdDateStr = habit.createdAt.split('T')[0];
    } else if (habit.history && habit.history.length > 0) {
      const sorted = [...habit.history].sort();
      createdDateStr = sorted[0];
    }

    // Days before creation are neutral
    if (dateStr < createdDateStr) return 'before-creation';

    // Frequency check for past dates
    if (habit.frequency === 'Weekly') {
      const createdDayOfWeek = new Date(createdDateStr).getDay();
      const currentDayOfWeek = new Date(dateStr).getDay();
      if (currentDayOfWeek !== createdDayOfWeek) {
        return 'not-due';
      }
    }

    // Strictly past, on/after creation date, due, and not completed
    return 'missed';
  };

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
      setCurrentYear(new Date().getFullYear());
      setCurrentMonth(new Date().getMonth());
    }
  };

  return (
    <div className="habits-section fade-in">
      {/* Stat Cards Hierarchy - Asymmetric Hero Grid */}
      <div className="stats-hero-layout">
        <div className="aura-card stat-card-hero">
          <div className="stat-hero-label">Current streak</div>
          <div className="stat-hero-value">
            {activeStreaksCount} <span className="stat-unit">days</span>
          </div>
          <div className="stat-hero-desc">Combined across active habits</div>
        </div>

        <div className="stats-side-stack">
          <div className="aura-card stat-card-sub">
            <div className="stat-sub-label">Active habits</div>
            <div className="stat-sub-value">{totalHabits}</div>
          </div>
          <div className="aura-card stat-card-sub">
            <div className="stat-sub-label">Best single-habit streak</div>
            <div className="stat-sub-value">
              {bestStreak} <span className="stat-unit-sm">days</span>
            </div>
          </div>
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
        <>
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
                        <div className="streak-badge" title="Current Habit Streak">
                          <Flame size={12} className="streak-icon active-flame" />
                          <span>{habit.streaks.current}d</span>
                        </div>

                        {/* Action buttons with safety spacing buffer */}
                        <div className="habit-actions-group">
                          <button 
                            onClick={() => toggleExpandCalendar(habit.id)}
                            className={`btn-icon habit-compact-btn ${isCalendarExpanded ? 'calendar-expanded-active' : ''}`}
                            title="View Monthly Calendar Log"
                          >
                            <Calendar size={13} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Delete this habit permanently? Data history will be lost.')) {
                                deleteHabit(habit.id);
                              }
                            }} 
                            className="btn-icon habit-delete-btn"
                            title="Delete Habit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 7-Day Matrix with Refined Day-Status Logic */}
                    <div className="habit-matrix">
                      {pastDays.map(day => {
                        const status = getDayStatus(habit, day.dateStr);
                        const isToday = day.dateStr === todayStr;
                        const isInteractive = status === 'completed' || status === 'today-pending' || status === 'missed';

                        return (
                          <div 
                            key={day.dateStr} 
                            className={`matrix-day ${isToday ? 'today' : ''}`}
                          >
                            <span className="day-label">{day.dayName}</span>
                            <button
                              onClick={() => {
                                if (isInteractive) toggleHabit(habit.id, day.dateStr);
                              }}
                              className={`matrix-toggle ${status}`}
                              title={`${habit.title} (${day.dateStr}): ${status}`}
                              disabled={!isInteractive}
                            >
                              {status === 'completed' && <Check size={11} />}
                              {status === 'missed' && <div className="missed-inner-ring" />}
                              {status === 'today-pending' && <span className="day-num">{day.dayNum}</span>}
                              {(status === 'future' || status === 'before-creation' || status === 'not-due') && null}
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

                          const status = getDayStatus(habit, cell.dateStr);
                          const isToday = cell.dateStr === todayStr;
                          const isInteractive = status === 'completed' || status === 'today-pending' || status === 'missed';

                          return (
                            <button
                              key={cell.id}
                              onClick={() => {
                                if (isInteractive) toggleHabit(habit.id, cell.dateStr);
                              }}
                              className={`calendar-day-cell active-cell ${status} ${isToday ? 'today-cell' : ''}`}
                              title={`${cell.dateStr}: ${status}`}
                              disabled={!isInteractive}
                            >
                              <span>{cell.dayNum}</span>
                              {status === 'completed' && <div className="completed-glow" />}
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

          {/* Semantics Legend */}
          <div className="habits-legend">
            <span className="legend-item"><span className="dot dot-done" /> Done</span>
            <span className="legend-item"><span className="dot dot-missed" /> Missed</span>
            <span className="legend-item"><span className="dot dot-future" /> Not yet due / Untracked</span>
          </div>
        </>
      )}

      <style>{`
        .habits-section {
          width: 100%;
        }

        /* Stat Cards Hierarchy - Asymmetric Hero Grid */
        .stats-hero-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .stats-hero-layout {
            grid-template-columns: 1.6fr 1fr;
          }
        }

        .stat-card-hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px 24px;
          border-color: rgba(142, 148, 242, 0.25);
          background-color: var(--bg-secondary);
        }

        .stat-hero-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-hero-value {
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
          margin: 6px 0 4px;
        }

        .stat-unit {
          font-size: 1.4rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stat-hero-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .stats-side-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-card-sub {
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stat-sub-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stat-sub-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 2px;
        }

        .stat-unit-sm {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
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
          gap: 12px;
        }

        .habit-item-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 12px 16px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }
        .habit-item-card:hover {
          border-color: var(--border-hover);
        }

        .habit-item-main {
          display: flex;
          flex-direction: column;
          gap: 12px;
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
          font-size: 0.95rem;
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
          gap: 12px;
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

        .habit-actions-group {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 4px;
        }

        .habit-compact-btn {
          width: 28px;
          height: 28px;
        }

        .habit-delete-btn {
          width: 28px;
          height: 28px;
          color: var(--text-muted);
        }
        .habit-delete-btn:hover {
          color: var(--accent-danger);
          background-color: rgba(224, 122, 95, 0.1);
          border-color: rgba(224, 122, 95, 0.3);
        }

        .calendar-expanded-active {
          color: var(--accent-primary) !important;
          border-color: var(--accent-primary) !important;
          background-color: rgba(142, 148, 242, 0.05);
        }

        /* 7 Day Matrix Row - Status Semantics */
        .habit-matrix {
          display: flex;
          gap: 6px;
          justify-content: space-between;
          background-color: var(--bg-tertiary);
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          border: 1px solid var(--border-color);
        }

        .matrix-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 32px;
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
          width: 26px;
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

        /* Status 1: Completed (Dominant Green Fill) */
        .matrix-toggle.completed {
          background-color: var(--accent-success);
          border-color: var(--accent-success);
          color: #ffffff;
        }

        /* Status 2: Missed (Subtle translucent red ring, thin muted border) */
        .matrix-toggle.missed {
          background-color: rgba(224, 122, 95, 0.06);
          border: 1px solid rgba(224, 122, 95, 0.35);
          color: var(--accent-danger);
        }
        .missed-inner-ring {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid rgba(224, 122, 95, 0.6);
        }

        /* Status 3: Today Pending (Interactive outline) */
        .matrix-toggle.today-pending {
          background-color: var(--bg-secondary);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
        }
        .matrix-toggle.today-pending:hover {
          background-color: rgba(142, 148, 242, 0.08);
        }

        /* Status 4, 5, 6: Future / Before Creation / Not Due (Muted, recessed, non-interactive) */
        .matrix-toggle.future,
        .matrix-toggle.before-creation,
        .matrix-toggle.not-due {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          opacity: 0.25;
          cursor: default;
        }

        .day-num {
          font-size: 0.7rem;
          font-weight: 500;
        }

        /* Expanded Calendar styles */
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

        .active-cell.completed {
          background-color: var(--accent-success);
          border-color: var(--accent-success);
          color: #ffffff;
          font-weight: 600;
        }

        .active-cell.missed {
          background-color: rgba(224, 122, 95, 0.06);
          border: 1px solid rgba(224, 122, 95, 0.35);
          color: var(--accent-danger);
        }

        .active-cell.today-pending {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          font-weight: 700;
        }

        .active-cell.future,
        .active-cell.before-creation,
        .active-cell.not-due {
          opacity: 0.25;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          cursor: default;
        }

        .completed-glow {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #ffffff;
          bottom: 3px;
        }

        /* Semantics Legend Component */
        .habits-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 14px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-done {
          background-color: var(--accent-success);
        }

        .dot-missed {
          background-color: rgba(224, 122, 95, 0.06);
          border: 1px solid rgba(224, 122, 95, 0.5);
        }

        .dot-future {
          background-color: var(--border-color);
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
};
