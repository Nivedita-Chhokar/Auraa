import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, CheckCircle2, Circle, Target, Calendar, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export const TaskTracker = () => {
  const { tasks, goals, addTask, toggleTask, deleteTask } = useApp();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [goalId, setGoalId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Date Shift Helpers
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title.trim(), priority, goalId, selectedDate);
    setTitle('');
    setGoalId('');
    setPriority('medium');
    setShowAddForm(false);
  };

  // Filter tasks for selected date
  const filteredTasks = tasks.filter(t => t.date === selectedDate);
  const completedCount = filteredTasks.filter(t => t.isCompleted).length;
  const totalCount = filteredTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Format Date for humans
  const getFriendlyDate = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (selectedDate === today) return 'Today';
    if (selectedDate === yesterday) return 'Yesterday';
    if (selectedDate === tomorrow) return 'Tomorrow';

    return new Date(selectedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="tasks-section fade-in">
      {/* Header Panel - Standardized Page Title & Subtitle */}
      <div className="section-header">
        <div>
          <h2>Daily Intentions & Tasks</h2>
          <p>Plan daily checklist items and observe how actions support your long-term goals.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Date Switcher Panel */}
      <div className="date-navigation aura-card" style={{ marginTop: '16px' }}>
        <button onClick={() => shiftDate(-1)} className="btn-icon nav-date-btn" style={{ width: '28px', height: '28px' }}>
          <ArrowLeft size={14} />
        </button>
        <div className="date-center">
          <span className="friendly-date">{getFriendlyDate()}</span>
          <span className="literal-date">{selectedDate}</span>
          {selectedDate !== new Date().toISOString().split('T')[0] && (
            <button onClick={handleSetToday} className="today-shortcut-btn">
              Back to Today
            </button>
          )}
        </div>
        <button onClick={() => shiftDate(1)} className="btn-icon nav-date-btn" style={{ width: '28px', height: '28px' }}>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Daily Progress Widget */}
      <div className="aura-card progress-widget-card" style={{ marginTop: '12px' }}>
        <div className="progress-details">
          <div>
            <h3>Completion Ratio</h3>
            <p>{totalCount > 0 ? `${completedCount} of ${totalCount} items accomplished` : 'Plan some items for this date'}</p>
          </div>
          <span className="progress-percentage">{progressPercent}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent-primary)' }} />
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="aura-card task-form-card fade-in" style={{ marginBottom: '16px' }}>
          <h3>Create Daily Action Item</h3>
          <div className="grid-3" style={{ marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">Task description</label>
              <input 
                type="text" 
                placeholder="e.g., Code dashboard layouts" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Link to Goal (Optional)</label>
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
              Log Action
            </button>
          </div>
        </form>
      )}

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state-card aura-card" style={{ marginTop: '16px' }}>
          <CheckCircle2 size={36} className="empty-icon" />
          <h3>All clear for {getFriendlyDate()}</h3>
          <p>No logged items. Rest up or schedule ahead.</p>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="btn-btn btn-secondary" 
            style={{ marginTop: '12px', padding: '6px 12px' }}
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="tasks-list" style={{ marginTop: '12px' }}>
          {filteredTasks.map(task => {
            const mappedGoal = goals.find(g => g.id === task.goalId);
            return (
              <div 
                key={task.id} 
                className={`interactive-list-item task-item fade-in ${task.isCompleted ? 'completed-item' : ''}`}
              >
                <div className="task-left">
                  <button 
                    onClick={() => toggleTask(task.id)} 
                    className="task-checkbox"
                    title={task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 size={18} className="checkbox-icon checked" />
                    ) : (
                      <Circle size={18} className="checkbox-icon" />
                    )}
                  </button>
                  
                  <div className="task-details">
                    <span className="task-title">{task.title}</span>
                    <div className="task-meta">
                      <span className={`badge badge-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      {mappedGoal && (
                        <span className="badge badge-goal" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Target size={9} />
                          <span>{mappedGoal.title}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteTask(task.id)} 
                  className="task-delete-btn"
                  title="Remove Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .tasks-section {
          width: 100%;
        }

        .date-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px; /* condensed from 16px 24px */
        }

        .date-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .friendly-date {
          font-size: 0.95rem; /* condensed from 1.15rem */
          font-weight: 600;
          color: var(--text-primary);
        }

        .literal-date {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .today-shortcut-btn {
          font-size: 0.7rem;
          color: var(--accent-primary);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1px;
          text-decoration: underline;
        }
        .today-shortcut-btn:hover {
          color: var(--accent-primary-hover);
        }

        .progress-widget-card {
          padding: 12px 16px; /* condensed from 20px */
        }

        .progress-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px; /* condensed from 12px */
        }

        .progress-details h3 {
          font-size: 0.9rem; /* condensed from 1rem */
          margin-bottom: 1px;
        }

        .progress-details p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .progress-percentage {
          font-size: 1.25rem; /* condensed from 1.5rem */
          font-weight: 700;
          color: var(--text-primary);
        }

        .task-form-card {
          border-color: var(--accent-primary);
        }

        .task-form-card h3 {
          font-size: 1rem;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px; /* condensed from 12px */
        }

        .task-item {
          transition: var(--transition-smooth);
        }

        .task-left {
          display: flex;
          align-items: center;
          gap: 12px; /* condensed from 16px */
          flex: 1;
        }

        .task-checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }
        .task-checkbox:hover {
          color: var(--accent-primary);
          transform: scale(1.08);
        }

        .checkbox-icon.checked {
          color: var(--accent-success);
        }

        .task-title {
          font-size: 0.9rem; /* condensed from 0.95rem */
          font-weight: 500;
          color: var(--text-primary);
          transition: var(--transition-smooth);
        }

        .completed-item {
          opacity: 0.6;
        }

        .completed-item .task-title {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .task-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .task-delete-btn {
          color: var(--text-muted);
          padding: 4px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-smooth);
        }
        .task-delete-btn:hover {
          color: var(--accent-danger);
          background-color: rgba(224, 122, 95, 0.08);
        }
      `}</style>
    </div>
  );
};
