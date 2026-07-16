import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Plus, Trash2, Tag, Calendar, CheckSquare, Sparkles } from 'lucide-react';

export const GoalTracker = () => {
  const { goals, habits, tasks, addGoal, deleteGoal } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal(title.trim(), description.trim(), category);
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setShowAddForm(false);
  };

  const getGoalStats = (goalId) => {
    // 1. Get associated habits
    const goalHabits = habits.filter(h => h.goalId === goalId);
    // 2. Get associated tasks
    const goalTasks = tasks.filter(t => t.goalId === goalId);

    // Calculate tasks progress
    const totalTasks = goalTasks.length;
    const completedTasks = goalTasks.filter(t => t.isCompleted).length;
    const taskRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : null;

    // Calculate habits completion (approx. rate out of last 7 days for active habits)
    let habitRate = null;
    if (goalHabits.length > 0) {
      let totalHabitTicks = 0;
      // We look at all completions for these habits
      goalHabits.forEach(h => {
        // limit history items to last 7 days or just count total completions relative to days active
        totalHabitTicks += h.history ? h.history.length : 0;
      });
      // Mock progress rate: say, 5 completions per habit is "healthy" (5/7 = 71%)
      const maxTargetCompletions = goalHabits.length * 5;
      habitRate = maxTargetCompletions > 0 ? Math.min((totalHabitTicks / maxTargetCompletions) * 100, 100) : 0;
    }

    // Combined score
    let overallProgress = 0;
    let factorsCount = 0;

    if (taskRate !== null) {
      overallProgress += taskRate;
      factorsCount++;
    }
    if (habitRate !== null) {
      overallProgress += habitRate;
      factorsCount++;
    }

    return {
      totalTasks,
      completedTasks,
      totalHabits: goalHabits.length,
      taskRate: taskRate !== null ? Math.round(taskRate) : null,
      habitRate: habitRate !== null ? Math.round(habitRate) : null,
      overallProgress: factorsCount > 0 ? Math.round(overallProgress / factorsCount) : 0
    };
  };

  const categories = ['Personal', 'Career', 'Health', 'Wealth', 'Education', 'Relationships'];

  return (
    <div className="goals-section fade-in">
      <div className="section-header">
        <div>
          <h2>Life Visions & Goals</h2>
          <p>Define long-term objectives and observe how your daily habits and tasks fuel them.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-btn btn-primary"
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="aura-card goal-form-card fade-in">
          <h3>Create Objective</h3>
          <div className="grid-2" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Goal Title</label>
              <input 
                type="text" 
                placeholder="e.g., Achieve Health & Vitality" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Description / Definition of Success</label>
            <textarea 
              placeholder="Describe what success looks like and why this goal matters..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
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
              Establish Goal
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="empty-state-card aura-card">
          <Target size={40} className="empty-icon" />
          <h3>No goals established yet</h3>
          <p>Create your first high-level life vision to start aligning your actions.</p>
          <button 
            onClick={() => setShowAddForm(true)} 
            className="btn-btn btn-secondary" 
            style={{ marginTop: '16px' }}
          >
            Create a Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const stats = getGoalStats(goal.id);
            return (
              <div key={goal.id} className="aura-card goal-card fade-in">
                <div className="goal-card-header">
                  <div>
                    <span className="badge badge-goal">{goal.category}</span>
                    <h3 className="goal-title">{goal.title}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this goal? Mapped habits and tasks will be unlinked.')) {
                        deleteGoal(goal.id);
                      }
                    }} 
                    className="goal-delete-btn"
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}

                <div className="goal-progress-section">
                  <div className="progress-header">
                    <span>Compounded Alignment</span>
                    <span className="progress-val">{stats.overallProgress}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${stats.overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="goal-metrics">
                  <div className="metric-item">
                    <Calendar size={14} className="metric-icon" />
                    <span>
                      {stats.totalHabits} {stats.totalHabits === 1 ? 'Habit' : 'Habits'} Mapped
                    </span>
                    {stats.habitRate !== null && (
                      <span className="metric-sub-val">{stats.habitRate}% consistent</span>
                    )}
                  </div>
                  <div className="metric-item">
                    <CheckSquare size={14} className="metric-icon" />
                    <span>
                      {stats.completedTasks}/{stats.totalTasks} Tasks Done
                    </span>
                    {stats.taskRate !== null && (
                      <span className="metric-sub-val">{stats.taskRate}% done</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .goals-section {
          width: 100%;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 1.6rem;
          margin-bottom: 4px;
        }

        .section-header p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .goal-form-card {
          margin-bottom: 24px;
          border-color: var(--accent-primary);
        }

        .goal-form-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .empty-state-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          background-color: var(--bg-secondary);
          border: 1px dashed var(--border-color);
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state-card h3 {
          margin-bottom: 8px;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .goals-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .goal-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
        }

        .goal-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .goal-title {
          font-size: 1.2rem;
          margin-top: 8px;
        }

        .goal-delete-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-smooth);
        }
        .goal-delete-btn:hover {
          color: var(--accent-danger);
          background-color: rgba(224, 122, 95, 0.08);
        }

        .goal-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .goal-progress-section {
          margin-top: 8px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .progress-val {
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-bar-track {
          height: 6px;
          background-color: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--accent-primary);
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .goal-metrics {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid var(--border-color);
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .metric-icon {
          color: var(--text-muted);
        }

        .metric-sub-val {
          margin-left: auto;
          font-size: 0.8rem;
          color: var(--accent-success);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
