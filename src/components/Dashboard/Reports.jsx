import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, CheckCircle2, Flame, Award, HelpCircle } from 'lucide-react';

export const Reports = () => {
  const { tasks, habits, goals } = useApp();

  // Helper to generate the last 7 days (ending today)
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const last7Days = getLast7Days();

  // Compute Task Completion Stats per Day
  const getTaskStats = () => {
    return last7Days.map(date => {
      const dayTasks = tasks.filter(t => t.date === date);
      const total = dayTasks.length;
      const completed = dayTasks.filter(t => t.isCompleted).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return { date, label: dayLabel, total, completed, rate };
    });
  };

  // Compute Habit Consistency Stats per Day
  const getHabitStats = () => {
    return last7Days.map(date => {
      const activeHabitsCount = habits.length;
      if (activeHabitsCount === 0) return { date, label: '', rate: 0 };
      
      const completedHabitsCount = habits.filter(h => h.history.includes(date)).length;
      const rate = Math.round((completedHabitsCount / activeHabitsCount) * 100);
      
      const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return { date, label: dayLabel, rate };
    });
  };

  const taskStats = getTaskStats();
  const habitStats = getHabitStats();

  // Goal Progress Ratings
  const getGoalBreakdown = () => {
    return goals.map(goal => {
      const goalHabits = habits.filter(h => h.goalId === goal.id);
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      
      const totalTasks = goalTasks.length;
      const completedTasks = goalTasks.filter(t => t.isCompleted).length;
      const taskRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : null;

      let habitRate = null;
      if (goalHabits.length > 0) {
        let totalCompletions = 0;
        goalHabits.forEach(h => {
          totalCompletions += h.history ? h.history.length : 0;
        });
        const targetCompletions = goalHabits.length * 5;
        habitRate = targetCompletions > 0 ? Math.min((totalCompletions / targetCompletions) * 100, 100) : 0;
      }

      let progress = 0;
      let count = 0;
      if (taskRate !== null) { progress += taskRate; count++; }
      if (habitRate !== null) { progress += habitRate; count++; }
      
      return {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        progress: count > 0 ? Math.round(progress / count) : 0
      };
    });
  };

  const goalBreakdown = getGoalBreakdown();

  // General Summary Metrics
  const totalTasksCompleted = tasks.filter(t => t.isCompleted).length;
  const overallTaskRatio = tasks.length > 0 ? Math.round((totalTasksCompleted / tasks.length) * 100) : 0;

  // Render Inline SVG Bar Chart
  const renderBarChart = () => {
    const chartHeight = 160;
    const chartWidth = 460;
    const paddingLeft = 30;
    const paddingBottom = 25;
    const usableWidth = chartWidth - paddingLeft;
    const usableHeight = chartHeight - paddingBottom;
    const barWidth = 30;
    const gap = (usableWidth - barWidth * 7) / 8;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
        {/* Y Axis Grid Lines */}
        <line x1={paddingLeft} y1={usableHeight * 0} x2={chartWidth} y2={usableHeight * 0} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight * 0.5} x2={chartWidth} y2={usableHeight * 0.5} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight} x2={chartWidth} y2={usableHeight} stroke="var(--border-color)" strokeWidth="1" />
        
        {/* Axis Labels */}
        <text x="5" y="12" fill="var(--text-muted)" fontSize="10">100%</text>
        <text x="5" y={(usableHeight / 2) + 4} fill="var(--text-muted)" fontSize="10">50%</text>
        <text x="5" y={usableHeight + 4} fill="var(--text-muted)" fontSize="10">0%</text>

        {/* Bars */}
        {taskStats.map((item, idx) => {
          const x = paddingLeft + gap + idx * (barWidth + gap);
          // Height mapping
          const barHeight = (item.rate / 100) * usableHeight;
          const y = usableHeight - barHeight;

          return (
            <g key={item.date} className="chart-bar-group">
              {/* Background Track */}
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={usableHeight}
                rx="4"
                fill="var(--bg-tertiary)"
                opacity="0.5"
              />
              {/* Active Fill Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)} // at least minor stroke visible
                rx="4"
                fill="var(--accent-primary)"
                className="anim-bar"
              />
              {/* X Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 6}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
              >
                {item.label}
              </text>
              {/* Tooltip Hover Helper */}
              <title>{`${item.completed}/${item.total} Completed (${item.rate}%)`}</title>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Inline SVG Area Line Chart
  const renderAreaChart = () => {
    const chartHeight = 160;
    const chartWidth = 460;
    const paddingLeft = 30;
    const paddingBottom = 25;
    const usableWidth = chartWidth - paddingLeft;
    const usableHeight = chartHeight - paddingBottom;
    const colWidth = usableWidth / 6;

    // Generate coordinate pairs
    const points = habitStats.map((item, idx) => {
      const x = paddingLeft + idx * colWidth;
      const y = usableHeight - (item.rate / 100) * usableHeight;
      return { x, y, label: item.label, rate: item.rate };
    });

    // Create Path Strings
    let linePath = '';
    let areaPath = '';

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} `;
      areaPath = `M ${points[0].x} ${usableHeight} L ${points[0].x} ${points[0].y} `;
      
      for (let i = 1; i < points.length; i++) {
        linePath += `L ${points[i].x} ${points[i].y} `;
        areaPath += `L ${points[i].x} ${points[i].y} `;
      }
      
      areaPath += `L ${points[points.length - 1].x} ${usableHeight} Z`;
    }

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-success)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-success)" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid Lines */}
        <line x1={paddingLeft} y1={usableHeight * 0} x2={chartWidth} y2={usableHeight * 0} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight * 0.5} x2={chartWidth} y2={usableHeight * 0.5} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight} x2={chartWidth} y2={usableHeight} stroke="var(--border-color)" strokeWidth="1" />

        {/* Axis Labels */}
        <text x="5" y="12" fill="var(--text-muted)" fontSize="10">100%</text>
        <text x="5" y={(usableHeight / 2) + 4} fill="var(--text-muted)" fontSize="10">50%</text>
        <text x="5" y={usableHeight + 4} fill="var(--text-muted)" fontSize="10">0%</text>

        {/* Area fill */}
        {points.length > 0 && (
          <path d={areaPath} fill="url(#chartGradient)" />
        )}

        {/* Trend Line */}
        {points.length > 0 && (
          <path d={linePath} fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Coordinate dot markers */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="var(--bg-primary)"
              stroke="var(--accent-success)"
              strokeWidth="2"
            />
            <text
              x={pt.x}
              y={chartHeight - 6}
              fill="var(--text-secondary)"
              fontSize="10"
              textAnchor="middle"
            >
              {pt.label}
            </text>
            <title>{`Habit Consistency: ${pt.rate}%`}</title>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="reports-section fade-in">
      <div className="section-header">
        <div>
          <h2>Productivity Reports</h2>
          <p>Analyze how consistently you adhere to scheduled workflows and high-level aspirations.</p>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid-2" style={{ marginTop: '24px' }}>
        <div className="aura-card chart-container-card">
          <div className="chart-header">
            <h3>Intention Completion Rates</h3>
            <p>Daily task accomplishment ratios (last 7 days)</p>
          </div>
          <div className="chart-wrapper-div">
            {tasks.length === 0 ? (
              <div className="chart-empty">No task data available</div>
            ) : (
              renderBarChart()
            )}
          </div>
        </div>

        <div className="aura-card chart-container-card">
          <div className="chart-header">
            <h3>Habit Consistency Curve</h3>
            <p>Percentage of total habits toggled (last 7 days)</p>
          </div>
          <div className="chart-wrapper-div">
            {habits.length === 0 ? (
              <div className="chart-empty">No habit tracking data available</div>
            ) : (
              renderAreaChart()
            )}
          </div>
        </div>
      </div>

      {/* Objectives Breakdown Grid */}
      <div className="reports-bottom aura-card" style={{ marginTop: '24px' }}>
        <div className="chart-header">
          <h3>Goal Compilation Breakdowns</h3>
          <p>Compound percentage fulfillment score per grand vision</p>
        </div>

        {goals.length === 0 ? (
          <div className="chart-empty" style={{ padding: '40px 0' }}>
            No goals available to map. Create them in the Goals portal.
          </div>
        ) : (
          <div className="goals-breakdown-list">
            {goalBreakdown.map(g => (
              <div key={g.id} className="goal-progress-row">
                <div className="row-detail">
                  <span className="badge badge-goal">{g.category}</span>
                  <span className="row-title">{g.title}</span>
                </div>

                {/* Progress bar and score */}
                <div className="row-bar-section">
                  <div className="progress-bar-track row-bar-track">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${g.progress}%`,
                        backgroundColor: g.progress > 75 ? 'var(--accent-success)' : 'var(--accent-primary)'
                      }} 
                    />
                  </div>
                  <span className="row-pct">{g.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .reports-section {
          width: 100%;
        }

        .chart-container-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-header h3 {
          font-size: 1.1rem;
        }

        .chart-header p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .chart-wrapper-div {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .chart-empty {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .svg-chart {
          overflow: visible;
        }

        .chart-bar-group {
          cursor: pointer;
        }

        .anim-bar {
          transform-origin: bottom;
          animation: scaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes scaleUp {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        .goals-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 20px;
        }

        .goal-progress-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .goal-progress-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        @media (min-width: 768px) {
          .goal-progress-row {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
          }
        }

        .row-detail {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .row-title {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .row-bar-section {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .row-bar-section {
            width: 320px;
          }
        }

        .row-bar-track {
          flex: 1;
        }

        .row-pct {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          width: 35px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};
