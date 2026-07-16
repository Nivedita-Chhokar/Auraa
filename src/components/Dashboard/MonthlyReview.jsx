import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Sparkles, BookOpen, Star, Trash2, CheckCircle, Save, Calendar } from 'lucide-react';

export const MonthlyReview = () => {
  const { tasks, habits, monthlyReviews, saveMonthlyReview, deleteMonthlyReview } = useApp();
  
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [rating, setRating] = useState(3);
  const [achievements, setAchievements] = useState('');
  const [improvements, setImprovements] = useState('');
  const [learnings, setLearnings] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load existing review if available
  useEffect(() => {
    const existing = monthlyReviews.find(r => r.monthStr === selectedMonth);
    if (existing) {
      setRating(existing.rating || 3);
      setAchievements(existing.achievements || '');
      setImprovements(existing.improvements || '');
      setLearnings(existing.learnings || '');
    } else {
      setRating(3);
      setAchievements('');
      setImprovements('');
      setLearnings('');
    }
    setIsSaved(false);
  }, [selectedMonth, monthlyReviews]);

  // Calculations for selected month
  const getMonthStats = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // 1. Tasks stats
    const monthTasks = tasks.filter(t => t.date.startsWith(selectedMonth));
    const totalTasks = monthTasks.length;
    const completedTasks = monthTasks.filter(t => t.isCompleted).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Habits stats
    let totalCompletions = 0;
    habits.forEach(h => {
      totalCompletions += h.history.filter(d => d.startsWith(selectedMonth)).length;
    });
    const totalPossibleTicks = habits.length * daysInMonth;
    const habitConsistencyRate = totalPossibleTicks > 0 ? Math.round((totalCompletions / totalPossibleTicks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalCompletions,
      habitConsistencyRate,
      activeHabits: habits.length
    };
  };

  const stats = getMonthStats();

  const handleSave = (e) => {
    e.preventDefault();
    
    saveMonthlyReview(selectedMonth, {
      rating,
      achievements,
      improvements,
      learnings,
      metrics: {
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        taskCompletionRate: stats.taskCompletionRate,
        habitConsistencyRate: stats.habitConsistencyRate
      }
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getMonthReadableName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="review-section fade-in">
      <div className="section-header">
        <div>
          <h2>Monthly Reflections</h2>
          <p>Pause at the end of each month to review automated metrics and document qualitative insights.</p>
        </div>
      </div>

      <div className="grid-dashboard" style={{ marginTop: '24px' }}>
        {/* Left Side: Reflection Form */}
        <form onSubmit={handleSave} className="aura-card reflection-form">
          <div className="form-row-between">
            <h3>Reflect & Log</h3>
            <div className="month-picker-wrapper">
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-input-selector"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">How would you rate this month?</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`rating-star-btn ${rating >= star ? 'active' : ''}`}
                >
                  <Star size={20} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="rating-text">
                {rating === 1 && 'Challenging'}
                {rating === 2 && 'Mediocre'}
                {rating === 3 && 'Progressive'}
                {rating === 4 && 'Highly Focused'}
                {rating === 5 && 'Outstanding'}
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Key Achievements & Wins</label>
            <textarea
              placeholder="What went well? Major goals hit, boundaries set, or habit streaks maintained..."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Friction & Blockers</label>
            <textarea
              placeholder="What held you back? Habits broken, tasks carried over, or source of distraction..."
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Key Takeaways & Next Month Adjustments</label>
            <textarea
              placeholder="Notes, life adjustments, focus shifts for next month..."
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-btn btn-primary">
              <Save size={16} />
              <span>{isSaved ? 'Reflections Saved!' : 'Save Reflections'}</span>
            </button>
          </div>
        </form>

        {/* Right Side: Compiled Monthly Metrics */}
        <div className="reflection-sidebar">
          <div className="aura-card metrics-card">
            <h3>{getMonthReadableName(selectedMonth)} Stats</h3>
            <p className="card-desc">Automatically compiled metrics from your habits and checklist actions.</p>
            
            <div className="review-stat-list" style={{ marginTop: '20px' }}>
              <div className="review-stat-item">
                <div className="stat-info">
                  <span className="stat-title">Task Completion</span>
                  <span className="stat-pct">{stats.taskCompletionRate}%</span>
                </div>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${stats.taskCompletionRate}%`, backgroundColor: 'var(--accent-primary)' }} 
                  />
                </div>
                <span className="stat-detail-txt">{stats.completedTasks} of {stats.totalTasks} tasks checked off</span>
              </div>

              <div className="review-stat-item" style={{ marginTop: '20px' }}>
                <div className="stat-info">
                  <span className="stat-title">Habit Consistency</span>
                  <span className="stat-pct">{stats.habitConsistencyRate}%</span>
                </div>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${stats.habitConsistencyRate}%`, backgroundColor: 'var(--accent-success)' }} 
                  />
                </div>
                <span className="stat-detail-txt">{stats.totalCompletions} habit checkmarks logged across {stats.activeHabits} active habits</span>
              </div>
            </div>
          </div>

          <div className="aura-card tip-card" style={{ marginTop: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <Sparkles size={20} className="tip-icon" />
            <div>
              <h4>Reflective Alignment</h4>
              <p style={{ fontSize: '0.8rem', lineHeight: '1.4', marginTop: '4px' }}>
                Consistency requires monitoring patterns. Use this space to document adjustments. If habits are breaking, reduce their scope. If goals feel distant, align smaller tasks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Reviews Archive List */}
      <div className="reviews-archive-section" style={{ marginTop: '48px' }}>
        <h3 className="archive-title">Reflection History Log</h3>
        
        {monthlyReviews.length === 0 ? (
          <div className="empty-state-card aura-card" style={{ marginTop: '16px' }}>
            <BookOpen size={32} className="empty-icon" />
            <p>No historical monthly reviews recorded yet.</p>
          </div>
        ) : (
          <div className="archive-grid" style={{ marginTop: '16px' }}>
            {monthlyReviews.map((rev) => (
              <div key={rev.id} className="aura-card archive-card fade-in">
                <div className="archive-header">
                  <div>
                    <h4 className="archive-month">{getMonthReadableName(rev.monthStr)}</h4>
                    <div className="archive-stars">
                      {Array.from({ length: rev.rating || 3 }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" className="star-filled" />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setSelectedMonth(rev.monthStr)}
                      className="btn-btn btn-secondary archive-view-btn"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Load View
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this reflection entry permanently?')) {
                          deleteMonthlyReview(rev.id);
                        }
                      }}
                      className="goal-delete-btn"
                      title="Delete Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="archive-body" style={{ marginTop: '14px' }}>
                  <div className="archive-section-block">
                    <h5>Wins</h5>
                    <p>{rev.achievements}</p>
                  </div>
                  {rev.improvements && (
                    <div className="archive-section-block" style={{ marginTop: '8px' }}>
                      <h5>Improvements</h5>
                      <p>{rev.improvements}</p>
                    </div>
                  )}
                </div>

                <div className="archive-footer-metrics" style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Tasks: <strong>{rev.metrics?.taskCompletionRate || 0}%</strong></span>
                  <span>Habits: <strong>{rev.metrics?.habitConsistencyRate || 0}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .review-section {
          width: 100%;
        }

        .form-row-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .month-input-selector {
          background-color: var(--bg-tertiary);
          border-color: var(--border-color);
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.85rem;
          padding: 8px 12px;
          border-radius: var(--border-radius-sm);
        }

        .rating-selector {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rating-star-btn {
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }
        .rating-star-btn:hover, .rating-star-btn.active {
          color: var(--accent-warning);
        }

        .rating-text {
          margin-left: 12px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .reflection-sidebar {
          display: flex;
          flex-direction: column;
        }

        .metrics-card h3 {
          font-size: 1.05rem;
        }

        .card-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .review-stat-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .stat-title {
          color: var(--text-primary);
        }

        .stat-pct {
          color: var(--text-primary);
          font-weight: 600;
        }

        .stat-detail-txt {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .tip-card {
          border-color: rgba(142, 148, 242, 0.15);
          background-color: rgba(142, 148, 242, 0.02);
        }

        .tip-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .tip-card h4 {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .archive-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .archive-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .archive-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .archive-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
        }

        .archive-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .archive-month {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .archive-stars {
          display: flex;
          gap: 2px;
          margin-top: 4px;
        }

        .star-filled {
          color: var(--accent-warning);
        }

        .archive-body h5 {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .archive-body p {
          font-size: 0.8rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .archive-view-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
};
