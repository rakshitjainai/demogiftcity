import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('regmate_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('regmate_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync token to localStorage and fetch user data on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('regmate_user', JSON.stringify(data.user));
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.warn('Backend server disconnected or offline:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const saveAuthSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('regmate_token', newToken);
    localStorage.setItem('regmate_user', JSON.stringify(newUser));
    setAuthError(null);
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Login failed. Please check your credentials.';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }

      saveAuthSession(data.token, data.user);
      return data.user;
    } catch (err) {
      if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch')))) {
        // Fallback local authentication mode when backend server is offline
        const mockName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const mockUser = {
          id: 'local-user-1',
          name: mockName || 'CS Prashant Kumar',
          email: email,
          picture: null,
          role: 'member',
          created_at: new Date().toISOString()
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        saveAuthSession(mockToken, mockUser);
        return mockUser;
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Registration failed.';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }

      saveAuthSession(data.token, data.user);
      return data.user;
    } catch (err) {
      if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch')))) {
        const mockUser = {
          id: 'local-user-1',
          name: name || 'CS Prashant Kumar',
          email: email,
          picture: null,
          role: 'member',
          created_at: new Date().toISOString()
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        saveAuthSession(mockToken, mockUser);
        return mockUser;
      }
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('regmate_token');
    localStorage.removeItem('regmate_user');
  };

  // Save Quiz Result to backend
  const saveQuizResult = async (topicId, score, totalQuestions, passed) => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/user/quiz-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topicId, score, totalQuestions, passed })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('regmate_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch (err) {
      console.warn('Failed to sync quiz progress to backend:', err);
    }
  };

  // Save Learning Module Progress
  const saveLearningProgress = async (moduleId, completedLessons, progress) => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/user/learning-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ moduleId, completedLessons, progress })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('regmate_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch (err) {
      console.warn('Failed to sync learning progress to backend:', err);
    }
  };

  // Toggle Course Item Completion (Lesson or MCQ)
  const toggleCourseItem = async (courseSlug, itemUid) => {
    if (!token) {
      // Local fallback for guest / unauthenticated
      const guestProgress = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
      if (!guestProgress[courseSlug]) guestProgress[courseSlug] = { completedItems: [], quizAnswers: [] };
      const items = guestProgress[courseSlug].completedItems || [];
      const idx = items.indexOf(itemUid);
      if (idx >= 0) items.splice(idx, 1);
      else items.push(itemUid);
      guestProgress[courseSlug].completedItems = items;
      localStorage.setItem('regmate_guest_course_progress', JSON.stringify(guestProgress));
      return guestProgress;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/course-progress/toggle-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseSlug, itemUid })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('regmate_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch (err) {
      console.warn('Failed to sync course item progress to backend:', err);
    }
  };

  // Record Course MCQ Answer
  const answerCourseMcq = async (courseSlug, itemUid, selectedOption, isCorrect) => {
    if (!token) {
      const guestProgress = JSON.parse(localStorage.getItem('regmate_guest_course_progress') || '{}');
      if (!guestProgress[courseSlug]) guestProgress[courseSlug] = { completedItems: [], quizAnswers: [] };
      if (!guestProgress[courseSlug].completedItems.includes(itemUid)) {
        guestProgress[courseSlug].completedItems.push(itemUid);
      }
      guestProgress[courseSlug].quizAnswers.push({ uid: itemUid, selectedOption, isCorrect, timestamp: new Date() });
      localStorage.setItem('regmate_guest_course_progress', JSON.stringify(guestProgress));
      return guestProgress;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/course-progress/answer-mcq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseSlug, itemUid, selectedOption, isCorrect })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('regmate_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch (err) {
      console.warn('Failed to sync MCQ answer to backend:', err);
    }
  };

  // Save Reading Progress
  const saveReadingProgress = async (actSlug, chapter, sectionNum, sectionTitle) => {
    // Always store locally
    const readObj = { actSlug, chapter, sectionNum, sectionTitle, updatedAt: new Date().toISOString() };
    localStorage.setItem('regmate_last_read', JSON.stringify(readObj));

    if (!token) return readObj;

    try {
      const response = await fetch(`${API_BASE_URL}/user/reading-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ actSlug, chapter, sectionNum, sectionTitle })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('regmate_user', JSON.stringify(data.user));
        }
        return data;
      }
    } catch (err) {
      console.warn('Failed to sync reading progress to backend:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        saveQuizResult,
        saveLearningProgress,
        toggleCourseItem,
        answerCourseMcq,
        saveReadingProgress,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
