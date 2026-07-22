import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppContext = createContext();

// Mapper functions to map database (snake_case) formats to Javascript (camelCase) formats
const mapGoalFromDb = (dbGoal) => ({
  id: dbGoal.id,
  title: dbGoal.title,
  description: dbGoal.description,
  category: dbGoal.category,
  createdAt: dbGoal.created_at,
});

const mapHabitFromDb = (dbHabit) => ({
  id: dbHabit.id,
  title: dbHabit.title,
  frequency: dbHabit.frequency,
  goalId: dbHabit.goal_id || '',
  history: dbHabit.history || [],
  createdAt: dbHabit.created_at,
});

const mapTaskFromDb = (dbTask) => ({
  id: dbTask.id,
  title: dbTask.title,
  priority: dbTask.priority,
  goalId: dbTask.goal_id || '',
  date: dbTask.date,
  isCompleted: dbTask.is_completed,
  createdAt: dbTask.created_at,
});

const mapReviewFromDb = (dbReview) => ({
  id: dbReview.id,
  monthStr: dbReview.month_str,
  updatedAt: dbReview.updated_at,
  ...(dbReview.review_data || {}),
});

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
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

  // Load user data on startup and auth state change
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        };
        setCurrentUser(userObj);
        loadUserData(userObj.id).then(() => setAuthLoading(false));
      } else {
        setCurrentUser(null);
        clearUserData();
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const userObj = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
        };
        setCurrentUser(userObj);
        loadUserData(userObj.id);
      } else {
        setCurrentUser(null);
        clearUserData();
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId) => {
    try {
      const [goalsRes, habitsRes, tasksRes, reviewsRes] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('monthly_reviews').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
      ]);

      if (!goalsRes.error) setGoals(goalsRes.data.map(mapGoalFromDb));
      if (!habitsRes.error) setHabits(habitsRes.data.map(mapHabitFromDb));
      if (!tasksRes.error) setTasks(tasksRes.data.map(mapTaskFromDb));
      if (!reviewsRes.error) setMonthlyReviews(reviewsRes.data.map(mapReviewFromDb));
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
    }
  };

  const clearUserData = () => {
    setGoals([]);
    setHabits([]);
    setTasks([]);
    setMonthlyReviews([]);
  };

  // Auth Operations
  const login = async (identifier, password) => {
    const trimmedId = identifier.trim();
    let emailToAuth = trimmedId;

    if (!trimmedId.includes('@')) {
      // Treat as username, look up in profiles
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', trimmedId)
          .maybeSingle();

        if (profileError || !profile) {
          return { success: false, message: 'Invalid credentials. User not found.' };
        }
        emailToAuth = profile.email;
      } catch (err) {
        return { success: false, message: 'Error checking user profiles.' };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  };

  const signup = async (email, username, password) => {
    const trimmedEmail = email.trim();
    const trimmedUser = username.trim();

    if (!trimmedEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (trimmedUser.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    // Check if username is taken in public profiles
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmedUser)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'Username is already taken.' };
      }
    } catch (err) {
      console.warn('Could not verify username uniqueness:', err);
    }

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password,
      options: {
        data: {
          username: trimmedUser
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Goal Operations
  const addGoal = async (title, description, category) => {
    if (!currentUser) return;
    const newDbGoal = {
      user_id: currentUser.id,
      title,
      description,
      category: category || 'General',
    };

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([newDbGoal])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setGoals(prev => [mapGoalFromDb(data), ...prev]);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));

      // Cascade updates to tasks and habits in the database
      await supabase
        .from('tasks')
        .update({ goal_id: null })
        .eq('goal_id', goalId);
      
      setTasks(prev => prev.map(t => t.goalId === goalId ? { ...t, goalId: '' } : t));

      await supabase
        .from('habits')
        .update({ goal_id: null })
        .eq('goal_id', goalId);

      setHabits(prev => prev.map(h => h.goalId === goalId ? { ...h, goalId: '' } : h));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // Habit Operations
  const addHabit = async (title, frequency, goalId) => {
    if (!currentUser) return;
    const newDbHabit = {
      user_id: currentUser.id,
      title,
      frequency: frequency || 'Daily',
      goal_id: goalId || null,
      history: []
    };

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([newDbHabit])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setHabits(prev => [mapHabitFromDb(data), ...prev]);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabit = async (habitId, dateStr) => {
    if (!currentUser) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    let newHistory = [...habit.history];
    const index = newHistory.indexOf(dateStr);
    if (index > -1) {
      newHistory.splice(index, 1);
    } else {
      newHistory.push(dateStr);
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .update({ history: newHistory })
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setHabits(prev => prev.map(h => h.id === habitId ? mapHabitFromDb(data) : h));
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const deleteHabit = async (habitId) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  // Task Operations
  const addTask = async (title, priority, goalId, dateStr) => {
    if (!currentUser) return;
    const newDbTask = {
      user_id: currentUser.id,
      title,
      priority: priority || 'medium',
      goal_id: goalId || null,
      date: dateStr || new Date().toISOString().split('T')[0],
      is_completed: false
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newDbTask])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks(prev => [mapTaskFromDb(data), ...prev]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_completed: !task.isCompleted })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks(prev => prev.map(t => t.id === taskId ? mapTaskFromDb(data) : t));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Monthly Review Operations
  const saveMonthlyReview = async (monthStr, reviewData) => {
    if (!currentUser) return;
    const existing = monthlyReviews.find(r => r.monthStr === monthStr);
    
    try {
      if (existing) {
        const { data, error } = await supabase
          .from('monthly_reviews')
          .update({
            review_data: reviewData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setMonthlyReviews(prev => prev.map(r => r.id === existing.id ? mapReviewFromDb(data) : r));
        }
      } else {
        const newDbReview = {
          user_id: currentUser.id,
          month_str: monthStr,
          review_data: reviewData
        };

        const { data, error } = await supabase
          .from('monthly_reviews')
          .insert([newDbReview])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setMonthlyReviews(prev => [...prev, mapReviewFromDb(data)]);
        }
      }
    } catch (error) {
      console.error('Error saving monthly review:', error);
    }
  };

  const deleteMonthlyReview = async (reviewId) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from('monthly_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      setMonthlyReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Error deleting monthly review:', error);
    }
  };

  // Streak Calculation Helpers (Client Side Only)
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
      authLoading,
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
