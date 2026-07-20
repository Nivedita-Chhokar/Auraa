import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // User-specific states
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [monthlyReviews, setMonthlyReviews] = useState([]);

  // Load registered users on startup
  useEffect(() => {
    const storedUsers = localStorage.getItem('aura_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    const activeUser = localStorage.getItem('aura_current_user');
    if (activeUser) {
      const parsedUser = JSON.parse(activeUser);
      setCurrentUser(parsedUser);
      loadUserData(parsedUser.username);
    }
  }, []);

  // Sync user specific data when logged in
  const loadUserData = (username) => {
    const userGoals = localStorage.getItem(`aura_goals_${username}`);
    const userHabits = localStorage.getItem(`aura_habits_${username}`);
    const userTasks = localStorage.getItem(`aura_tasks_${username}`);
    const userReviews = localStorage.getItem(`aura_reviews_${username}`);

    setGoals(userGoals ? JSON.parse(userGoals) : []);
    setHabits(userHabits ? JSON.parse(userHabits) : []);
    setTasks(userTasks ? JSON.parse(userTasks) : []);
    setMonthlyReviews(userReviews ? JSON.parse(userReviews) : []);
  };

  // Auth Operations
  const login = (username, password) => {
    const trimmedUser = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === trimmedUser && u.password === password);
    if (!user) {
      return { success: false, message: 'Invalid credentials. Usernames are case-insensitive.' };
    }
    
    setCurrentUser(user);
    localStorage.setItem('aura_current_user', JSON.stringify(user));
    loadUserData(user.username);
    return { success: true };
  };

  const signup = (username, password) => {
    const trimmedUser = username.trim();
    if (trimmedUser.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const exists = users.some(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username is already taken.' };
    }

    const newUser = { username: trimmedUser, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('aura_users', JSON.stringify(updatedUsers));
    
    // Automatically log in
    setCurrentUser(newUser);
    localStorage.setItem('aura_current_user', JSON.stringify(newUser));
    setGoals([]);
    setHabits([]);
    setTasks([]);
    setMonthlyReviews([]);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aura_current_user');
    setGoals([]);
    setHabits([]);
    setTasks([]);
    setMonthlyReviews([]);
  };

  // Helper function to sync with LocalStorage
  const syncData = (key, data) => {
    if (currentUser) {
      localStorage.setItem(`aura_${key}_${currentUser.username}`, JSON.stringify(data));
    }
  };

  // Goal Operations
  const addGoal = (title, description, category) => {
    const newGoal = {
      id: 'g_' + Date.now(),
      title,
      description,
      category: category || 'General',
      createdAt: new Date().toISOString()
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    syncData('goals', updated);
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    syncData('goals', updatedGoals);

    // Unlink or delete associated tasks & habits
    const updatedTasks = tasks.map(t => t.goalId === goalId ? { ...t, goalId: '' } : t);
    setTasks(updatedTasks);
    syncData('tasks', updatedTasks);

    const updatedHabits = habits.map(h => h.goalId === goalId ? { ...h, goalId: '' } : h);
    setHabits(updatedHabits);
    syncData('habits', updatedHabits);
  };

  // Habit Operations
  const addHabit = (title, frequency, goalId) => {
    const newHabit = {
      id: 'h_' + Date.now(),
      title,
      frequency: frequency || 'Daily',
      goalId: goalId || '',
      createdAt: new Date().toISOString(),
      history: [] // array of YYYY-MM-DD
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    syncData('habits', updated);
  };

  const toggleHabit = (habitId, dateStr) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const index = h.history.indexOf(dateStr);
        let newHistory = [...h.history];
        if (index > -1) {
          newHistory.splice(index, 1);
        } else {
          newHistory.push(dateStr);
        }
        return { ...h, history: newHistory };
      }
      return h;
    });
    setHabits(updated);
    syncData('habits', updated);
  };

  const deleteHabit = (habitId) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    syncData('habits', updated);
  };

  // Task Operations
  const addTask = (title, priority, goalId, dateStr) => {
    const newTask = {
      id: 't_' + Date.now(),
      title,
      priority: priority || 'medium',
      goalId: goalId || '',
      date: dateStr || new Date().toISOString().split('T')[0],
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    syncData('tasks', updated);
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    setTasks(updated);
    syncData('tasks', updated);
  };

  const deleteTask = (taskId) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    syncData('tasks', updated);
  };

  // Monthly Review Operations
  const saveMonthlyReview = (monthStr, reviewData) => {
    const updated = [...monthlyReviews];
    const existingIndex = updated.findIndex(r => r.monthStr === monthStr);
    const newReview = {
      id: existingIndex > -1 ? updated[existingIndex].id : 'rev_' + Date.now(),
      monthStr,
      ...reviewData,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      updated[existingIndex] = newReview;
    } else {
      updated.push(newReview);
    }

    setMonthlyReviews(updated);
    syncData('reviews', updated);
  };

  const deleteMonthlyReview = (reviewId) => {
    const updated = monthlyReviews.filter(r => r.id !== reviewId);
    setMonthlyReviews(updated);
    syncData('reviews', updated);
  };

  // Streak Calculation Helpers
  const getHabitStreaks = (habit) => {
    if (!habit.history || habit.history.length === 0) {
      return { current: 0, longest: 0 };
    }

    const sortedDates = [...habit.history].sort((a, b) => new Date(b) - new Date(a));
    
    // Calculate Current Streak
    let currentStreak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const hasCompletedToday = habit.history.includes(todayStr);
    const hasCompletedYesterday = habit.history.includes(yesterdayStr);

    if (hasCompletedToday || hasCompletedYesterday) {
      let checkDate = hasCompletedToday ? today : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (habit.history.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate Longest Streak
    let longestStreak = 0;
    let tempStreak = 0;
    // Sort ascending for longest streak detection
    const ascDates = [...new Set(habit.history)].sort((a, b) => new Date(a) - new Date(b));
    
    if (ascDates.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < ascDates.length; i++) {
        const prev = new Date(ascDates[i - 1]);
        const curr = new Date(ascDates[i]);
        const diffTime = Math.abs(curr - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { current: currentStreak, longest: longestStreak };
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      goals,
      habits,
      tasks,
      monthlyReviews,
      theme,
      toggleTheme,
      login,
      signup,
      logout,
      addGoal,
      deleteGoal,
      addHabit,
      toggleHabit,
      deleteHabit,
      addTask,
      toggleTask,
      deleteTask,
      saveMonthlyReview,
      deleteMonthlyReview,
      getHabitStreaks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
