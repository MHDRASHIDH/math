/**
 * auth.js – Client-side authentication and demo profile management
 * 
 * IMPORTANT: This uses localStorage for demo & showcase purposes.
 * Real production authentication would use secure server-side sessions
 * or OAuth tokens. Children's data is never sent to external servers.
 */

import { showToast } from './navigation.js';

const AUTH_STORAGE_KEY = 'mathmind_auth_v1';
const USERS_STORAGE_KEY = 'mathmind_registered_users_v1';

/** Default demo user profile matching reference screenshots */
export const DEMO_USER = {
  username: 'Rashid',
  name: 'Rashid',
  email: 'rashid@mathmindkids.demo',
  level: 5,
  streak: 7,
  xp: 750,
  xpMax: 1000,
  avatar: 'assets/images/avatar-rashid.svg',
  isDemo: true,
  createdAt: new Date().toISOString()
};

/**
 * Check if a user is currently logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  return !!data;
}

/**
 * Retrieve current logged-in user profile
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('[Auth] Failed to parse auth user', e);
    return null;
  }
}

/**
 * Log in with existing credentials
 * @param {string} username
 * @param {string} password
 * @returns {{success: boolean, error?: string, user?: object}}
 */
export function loginUser(username, password) {
  const cleanUser = (username || '').trim();
  if (!cleanUser) {
    return { success: false, error: 'Please enter your username.' };
  }
  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  // Check demo user
  if (cleanUser.toLowerCase() === 'rashid' || cleanUser.toLowerCase() === 'demo') {
    return loginAsDemo();
  }

  // Check registered users list in localStorage
  const users = getStoredUsers();
  const found = users.find(u => u.username.toLowerCase() === cleanUser.toLowerCase());

  if (!found) {
    // If not found in registered list, create a new friendly local session for testing
    const newUser = {
      username: cleanUser,
      name: cleanUser,
      email: `${cleanUser.toLowerCase()}@local.demo`,
      level: 1,
      streak: 1,
      xp: 150,
      xpMax: 500,
      avatar: 'assets/images/avatar-rashid.svg',
      isDemo: true,
      createdAt: new Date().toISOString()
    };
    saveCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  if (found.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const sessionUser = { ...found };
  delete sessionUser.password;
  saveCurrentUser(sessionUser);
  return { success: true, user: sessionUser };
}

/**
 * Register a new user
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {{success: boolean, error?: string, user?: object}}
 */
export function registerUser(username, email, password) {
  const cleanUser = (username || '').trim();
  const cleanEmail = (email || '').trim();

  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const users = getStoredUsers();
  if (users.some(u => u.username.toLowerCase() === cleanUser.toLowerCase())) {
    return { success: false, error: 'That username is already taken! Try another.' };
  }

  const newUser = {
    username: cleanUser,
    name: cleanUser,
    email: cleanEmail,
    password: password, // In real prod, this would be hashed on a backend server
    level: 1,
    streak: 1,
    xp: 100,
    xpMax: 500,
    avatar: 'assets/images/avatar-rashid.svg',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const sessionUser = { ...newUser };
  delete sessionUser.password;
  saveCurrentUser(sessionUser);

  return { success: true, user: sessionUser };
}

/**
 * Instant login with preconfigured demo profile (Rashid Level 5)
 */
export function loginAsDemo() {
  saveCurrentUser(DEMO_USER);
  return { success: true, user: DEMO_USER };
}

/**
 * Log out current user and clear session
 */
export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function saveCurrentUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Wire up auth forms in the UI
 * @param {Function} onLoginSuccess - Callback invoked after successful login
 */
export function initAuth(onLoginSuccess) {
  const form = document.getElementById('auth-form');
  const errorEl = document.getElementById('auth-error-msg');
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const emailRow = document.getElementById('auth-email-row');
  const submitBtn = document.getElementById('auth-submit-btn');
  const demoBtn = document.getElementById('auth-demo-btn');
  const pwdInput = document.getElementById('auth-password');
  const togglePwdBtn = document.getElementById('btn-toggle-password');

  let mode = 'login'; // 'login' | 'register'

  function setMode(newMode) {
    mode = newMode;
    if (errorEl) errorEl.style.display = 'none';

    if (mode === 'login') {
      tabLogin?.classList.add('active');
      tabRegister?.classList.remove('active');
      if (emailRow) emailRow.style.display = 'none';
      if (submitBtn) submitBtn.textContent = '🚀 Log In';
    } else {
      tabRegister?.classList.add('active');
      tabLogin?.classList.remove('active');
      if (emailRow) emailRow.style.display = 'block';
      if (submitBtn) submitBtn.textContent = '✨ Create Account';
    }
  }

  tabLogin?.addEventListener('click', () => setMode('login'));
  tabRegister?.addEventListener('click', () => setMode('register'));

  // Toggle show/hide password
  togglePwdBtn?.addEventListener('click', () => {
    if (!pwdInput) return;
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    togglePwdBtn.textContent = isPwd ? '🙈' : '👁️';
    togglePwdBtn.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
  });

  // Demo play button
  demoBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const res = loginAsDemo();
    showToast(`Welcome, ${res.user.name}! (Demo Mode 🎮)`, 'success');
    if (onLoginSuccess) onLoginSuccess(res.user);
  });

  // Form submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('auth-username')?.value || '';
    const email = document.getElementById('auth-email')?.value || '';
    const password = document.getElementById('auth-password')?.value || '';

    let res;
    if (mode === 'login') {
      res = loginUser(username, password);
    } else {
      res = registerUser(username, email, password);
    }

    if (!res.success) {
      if (errorEl) {
        errorEl.textContent = res.error;
        errorEl.style.display = 'block';
      }
      showToast(res.error, 'error');
    } else {
      if (errorEl) errorEl.style.display = 'none';
      showToast(`Welcome, ${res.user.name}! 🌟`, 'success');
      if (onLoginSuccess) onLoginSuccess(res.user);
    }
  });
}
