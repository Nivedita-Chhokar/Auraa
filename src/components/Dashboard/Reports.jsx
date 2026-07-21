import React from 'react';
import { useApp } from '../../context/AppContext';
import { Target, CheckCircle2, Flame, Award, HelpCircle, Calendar } from 'lucide-react';

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

  // GitHub Style Contribution Heatmap Generator (Past 16 Weeks)
  const getContributionData = () => {
    const today = new Date();
    const endDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    
    // 16 weeks (112 days) ending on Saturday of current week
    const days = [];
    const totalDays = 16 * 7; 
    
    const startDate = new Date();
    startDate.setDate(today.getDate() - (totalDays - 1 - (6 - endDayOfWeek)));

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Calculate total accomplishments (completed tasks + completed habits)
      const taskCount = tasks.filter(t => t.date === dateStr && t.isCompleted).length;
      let habitCount = 0;
      habits.forEach(h => {
        if (h.history && h.history.includes(dateStr)) habitCount++;
      });

      const totalCount = taskCount + habitCount;
      
      let level = 0;
      if (totalCount === 1) level = 1;
      else if (totalCount === 2) level = 2;
      else if (totalCount >= 3 && totalCount <= 4) level = 3;
      else if (totalCount >= 5) level = 4;

      days.push({
        dateStr,
        dayOfWeek: d.getDay(),
        totalCount,
        level,
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }

    // Group into 16 weeks (columns) x 7 days (rows)
    const weeks = [];
    for (let w = 0; w < 16; w++) {
      weeks.push(days.slice(w * 7, (w + 1) * 7));
    }

    const totalContributions = days.reduce((sum, d) => sum + d.totalCount, 0);

    return { weeks, totalContributions };
  };

  const contributionData = getContributionData();

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

  // Render Inline SVG Bar Chart
  const renderBarChart = () => {
    const chartHeight = 150;
    const chartWidth = 460;
    const paddingLeft = 30;
    const paddingBottom = 25;
    const usableWidth = chartWidth - paddingLeft;
    const usableHeight = chartHeight - paddingBottom;
    const barWidth = 30;
    const gap = (usableWidth - barWidth * 7) / 8;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
        <line x1={paddingLeft} y1={usableHeight * 0} x2={chartWidth} y2={usableHeight * 0} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight * 0.5} x2={chartWidth} y2={usableHeight * 0.5} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight} x2={chartWidth} y2={usableHeight} stroke="var(--border-color)" strokeWidth="1" />
        
        <text x="5" y="12" fill="var(--text-muted)" fontSize="10">100%</text>
        <text x="5" y={(usableHeight / 2) + 4} fill="var(--text-muted)" fontSize="10">50%</text>
        <text x="5" y={usableHeight + 4} fill="var(--text-muted)" fontSize="10">0%</text>

        {taskStats.map((item, idx) => {
          const x = paddingLeft + gap + idx * (barWidth + gap);
          const barHeight = (item.rate / 100) * usableHeight;
          const y = usableHeight - barHeight;

          return (
            <g key={item.date} className="chart-bar-group">
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={usableHeight}
                rx="4"
                fill="var(--bg-tertiary)"
                opacity="0.5"
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx="4"
                fill="var(--accent-primary)"
                className="anim-bar"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 6}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
              >
                {item.label}
              </text>
              <title>{`${item.completed}/${item.total} Completed (${item.rate}%)`}</title>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Inline SVG Area Line Chart
  const renderAreaChart = () => {
    const chartHeight = 150;
    const chartWidth = 460;
    const paddingLeft = 30;
    const paddingBottom = 25;
    const usableWidth = chartWidth - paddingLeft;
    const usableHeight = chartHeight - paddingBottom;
    const colWidth = usableWidth / 6;

    const points = habitStats.map((item, idx) => {
      const x = paddingLeft + idx * colWidth;
      const y = usableHeight - (item.rate / 100) * usableHeight;
      return { x, y, label: item.label, rate: item.rate };
    });

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

        <line x1={paddingLeft} y1={usableHeight * 0} x2={chartWidth} y2={usableHeight * 0} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight * 0.5} x2={chartWidth} y2={usableHeight * 0.5} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={paddingLeft} y1={usableHeight} x2={chartWidth} y2={usableHeight} stroke="var(--border-color)" strokeWidth="1" />

        <text x="5" y="12" fill="var(--text-muted)" fontSize="10">100%</text>
        <text x="5" y={(usableHeight / 2) + 4} fill="var(--text-muted)" fontSize="10">50%</text>
        <text x="5" y={usableHeight + 4} fill="var(--text-muted)" fontSize="10">0%</text>

        {points.length > 0 && <path d={areaPath} fill="url(#chartGradient)" />}
        {points.length > 0 && (
          <path d={linePath} fill="none" stroke="var(--accent-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

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

      {/* TOP SECTION: GitHub Style Contribution Heatmap */}
      <div className="aura-card heatmap-card" style={{ marginTop: '16px' }}>
        <div className="heatmap-header">
          <div>
            <h3>Global Consistency Heatmap</h3>
            <p>{contributionData.totalContributions} total accomplishments logged across the past 16 weeks</p>
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="heatmap-cell level-0" />
            <div className="heatmap-cell level-1" />
            <div className="heatmap-cell level-2" />
            <div className="heatmap-cell level-3" />
            <div className="heatmap-cell level-4" />
            <span>More</span>
          </div>
        </div>

        <div className="heatmap-scroll-container">
          <div className="heatmap-grid">
            <div className="heatmap-day-labels">
              <span></span>
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
            </div>

            <div className="heatmap-weeks-row">
              {contributionData.weeks.map((week, wIdx) => (
                <div key={wIdx} className="heatmap-week-column">
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      className={`heatmap-cell level-${day.level}`}
                      title={`${day.formattedDate}: ${day.totalCount} completed ${day.totalCount === 1 ? 'action' : 'actions'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 7-day charts */}
      <div className="grid-2" style={{ marginTop: '16px' }}>
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
      <div className="reports-bottom aura-card" style={{ marginTop: '16px' }}>
        <div className="chart-header">
          <h3>Goal Compilation Breakdowns</h3>
          <p>Compound percentage fulfillment score per grand vision</p>
        </div>

        {goals.length === 0 ? (
          <div className="chart-empty" style={{ padding: '30px 0' }}>
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

        /* GitHub Contribution Heatmap Styling */
        .heatmap-card {
          padding: 16px 20px;
        }

        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .heatmap-header h3 {
          font-size: 1.05rem;
        }

        .heatmap-header p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .heatmap-scroll-container {
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .heatmap-grid {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          min-width: max-content;
        }

        .heatmap-day-labels {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 0.65rem;
          color: var(--text-muted);
          text-align: right;
          padding-right: 4px;
        }
        .heatmap-day-labels span {
          height: 11px;
          line-height: 11px;
        }

        .heatmap-weeks-row {
          display: flex;
          gap: 3px;
        }

        .heatmap-week-column {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .heatmap-cell {
          width: 11px;
          height: 11px;
          border-radius: 2px;
          transition: transform 0.15s ease, background-color 0.2s ease;
          cursor: pointer;
        }
        .heatmap-cell:hover {
          transform: scale(1.3);
          z-index: 3;
        }

        .heatmap-cell.level-0 {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }

        .heatmap-cell.level-1 {
          background-color: rgba(82, 183, 136, 0.25);
          border: 1px solid rgba(82, 183, 136, 0.35);
        }

        .heatmap-cell.level-2 {
          background-color: rgba(82, 183, 136, 0.55);
        }

        .heatmap-cell.level-3 {
          background-color: rgba(82, 183, 136, 0.85);
        }

        .heatmap-cell.level-4 {
          background-color: var(--accent-success);
          box-shadow: 0 0 6px rgba(82, 183, 136, 0.4);
        }

        body.light-theme .heatmap-cell.level-1 {
          background-color: rgba(27, 138, 90, 0.2);
        }
        body.light-theme .heatmap-cell.level-2 {
          background-color: rgba(27, 138, 90, 0.45);
        }
        body.light-theme .heatmap-cell.level-3 {
          background-color: rgba(27, 138, 90, 0.75);
        }
        body.light-theme .heatmap-cell.level-4 {
          background-color: var(--accent-success);
        }

        /* General Charts Styling */
        .chart-container-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chart-header h3 {
          font-size: 0.95rem;
        }

        .chart-header p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        .chart-wrapper-div {
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .chart-empty {
          font-size: 0.8rem;
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
          gap: 12px;
          margin-top: 14px;
        }

        .goal-progress-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 0;
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
            gap: 20px;
          }
        }

        .row-detail {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .row-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .row-bar-section {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .row-bar-section {
            width: 280px;
          }
        }

        .row-bar-track {
          flex: 1;
        }

        .row-pct {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          width: 32px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};
