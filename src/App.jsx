import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/Landing/LandingPage';
import { Navbar } from './components/Dashboard/Navbar';
import { HabitTracker } from './components/Dashboard/HabitTracker';
import { TaskTracker } from './components/Dashboard/TaskTracker';
import { GoalTracker } from './components/Dashboard/GoalTracker';
import { Reports } from './components/Dashboard/Reports';
import { MonthlyReview } from './components/Dashboard/MonthlyReview';
import './App.css';

function MainAppContent() {
  const { currentUser, authLoading } = useApp();
  const [activeTab, setActiveTab] = useState('habits'); // 'habits', 'tasks', 'goals', 'reports', 'review'

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="dashboard-layout">
        {activeTab === 'habits' && <HabitTracker />}
        {activeTab === 'tasks' && <TaskTracker />}
        {activeTab === 'goals' && <GoalTracker />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'review' && <MonthlyReview />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
