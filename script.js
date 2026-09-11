
/* ================================================================
   QUIZMASTER – MODERN QUIZ PLATFORM (Vanilla JS + LocalStorage)
   ================================================================
   ⚠️ SECURITY WARNING ⚠️
   This is a FRONTEND-ONLY demo. Passwords and the admin secret
   are stored in plain text and visible in JavaScript / LocalStorage.
   This is NOT secure for any real application.
   In production, use a backend (Node.js, PHP, Python, etc.) with
   proper authentication, hashing, and session management.
   ================================================================ */

// ---------- STORAGE KEYS ----------
const STORAGE_KEYS = {
  USERS: 'qm_users',
  QUIZZES: 'qm_quizzes',
  ATTEMPTS: 'qm_attempts',
  CURRENT_USER: 'qm_currentUser',
  SESSION: 'qm_session'
};

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : (data.message || 'Request failed');
    throw new Error(message);
  }

  return data;
}

async function syncLocalStorageFromBackend() {
  try {
    const [users, quizzes, attempts] = await Promise.all([
      apiRequest('/api/users'),
      apiRequest('/api/quizzes'),
      apiRequest('/api/attempts')
    ]);

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    return { users, quizzes, attempts };
  } catch (error) {
    console.warn('Backend unavailable, falling back to local storage:', error.message);
    return {
      users: getUsers(),
      quizzes: getQuizzes(),
      attempts: getAttempts()
    };
  }
}

// ---------- DEMO DATA SETUP ----------
function initializeDemoData() {
  if (localStorage.getItem(STORAGE_KEYS.USERS)) return; // already initialized

  const demoUsers = [
    {
      id: 1,
      name: 'Demo Student',
      username: 'student',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
      createdAt: '2025-01-15'
    },
    {
      id: 2,
      name: 'Admin User',
      username: 'admin',
      email: 'admin@quizmaster.com',
      password: 'Admin@1234',
      role: 'admin',
      createdAt: '2025-01-01'
    }
  ];

  const demoQuizzes = [
    {
      id: 1,
      title: 'HTML & CSS Basics',
      description: 'Test your knowledge of HTML and CSS fundamentals.',
      category: 'Web Development',
      difficulty: 'Easy',
      timeLimit: 10,
      passingPercentage: 60,
      createdAt: '2025-02-10',
      questions: [
        { id: 1, question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Markup Language'], answer: 0, explanation: 'HTML stands for Hyper Text Markup Language.' },
        { id: 2, question: 'Which CSS property controls the text size?', options: ['font-style', 'text-size', 'font-size', 'text-style'], answer: 2, explanation: 'font-size controls the size of the text.' },
        { id: 3, question: 'What is the correct HTML element for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], answer: 2, explanation: '<h1> defines the largest heading.' },
        { id: 4, question: 'Which CSS property is used to change the background color?', options: ['color', 'bgcolor', 'background-color', 'background'], answer: 2, explanation: 'background-color sets the background color.' },
        { id: 5, question: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], answer: 1, explanation: 'CSS stands for Cascading Style Sheets.' }
      ]
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics.',
      category: 'Programming',
      difficulty: 'Medium',
      timeLimit: 15,
      passingPercentage: 60,
      createdAt: '2025-02-15',
      questions: [
        { id: 1, question: 'Which keyword is used to declare a constant in JavaScript?', options: ['var', 'let', 'const', 'static'], answer: 2, explanation: 'const is used to declare a constant variable.' },
        { id: 2, question: 'What is the correct way to write a JavaScript array?', options: ['var colors = "red", "green", "blue"', 'var colors = ["red", "green", "blue"]', 'var colors = (1:"red", 2:"green", 3:"blue")', 'var colors = 1 = ("red"), 2 = ("green")'], answer: 1, explanation: 'Arrays are written with square brackets.' },
        { id: 3, question: 'How do you write "Hello World" in an alert box?', options: ['msg("Hello World")', 'alert("Hello World")', 'alertBox("Hello World")', 'msgBox("Hello World")'], answer: 1, explanation: 'alert() displays an alert box.' },
        { id: 4, question: 'What is the result of 2 + "2" in JavaScript?', options: ['4', '22', 'NaN', 'undefined'], answer: 1, explanation: 'JavaScript concatenates when one operand is a string.' },
        { id: 5, question: 'Which operator is used to assign a value to a variable?', options: ['*', '-', '=', 'x'], answer: 2, explanation: 'The = operator assigns values.' }
      ]
    },
    {
      id: 3,
      title: 'Computer Fundamentals',
      description: 'Basic computer knowledge and terminology.',
      category: 'General',
      difficulty: 'Easy',
      timeLimit: 10,
      passingPercentage: 60,
      createdAt: '2025-03-01',
      questions: [
        { id: 1, question: 'What does CPU stand for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Central Processor Unit'], answer: 1, explanation: 'CPU stands for Central Processing Unit.' },
        { id: 2, question: 'Which of the following is an input device?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], answer: 2, explanation: 'Keyboard is an input device.' },
        { id: 3, question: 'What is the brain of the computer?', options: ['RAM', 'CPU', 'Hard Drive', 'GPU'], answer: 1, explanation: 'CPU is often called the brain of the computer.' },
        { id: 4, question: 'What does RAM stand for?', options: ['Read Access Memory', 'Random Access Memory', 'Run All Memory', 'Read And Memory'], answer: 1, explanation: 'RAM stands for Random Access Memory.' },
        { id: 5, question: 'Which one is an operating system?', options: ['Microsoft Word', 'Windows', 'Google Chrome', 'Photoshop'], answer: 1, explanation: 'Windows is an operating system.' }
      ]
    }
  ];

  const demoAttempts = [
    { studentId: 1, quizId: 1, score: 4, total: 5, percentage: 80, date: '2026-09-10', timeTaken: '04:32', answers: [] },
    { studentId: 1, quizId: 2, score: 3, total: 5, percentage: 60, date: '2026-09-12', timeTaken: '08:15', answers: [] }
  ];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(demoQuizzes));
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(demoAttempts));
}

// ---------- GLOBAL STATE ----------
let currentUser = null;
let currentSession = null;
let activeQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizTimerInterval = null;
let quizSecondsRemaining = 0;
let quizTotalSeconds = 0;
let quizStartTime = null;

// ---------- UTILITY FUNCTIONS ----------
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
function normalizeQuestion(question, fallbackId = 1) {
  if (!question || typeof question !== 'object') return { id: fallbackId, question: 'Untitled Question', options: [], answer: 0, explanation: '' };

  const safeOptions = Array.isArray(question.options) ? question.options.map(opt => String(opt ?? '').trim()).filter(Boolean) : [];
  const safeAnswer = Number.isInteger(question.answer) ? question.answer : 0;

  return {
    ...question,
    id: Number.isFinite(question.id) ? Number(question.id) : fallbackId,
    question: String(question.question || 'Untitled Question').trim(),
    options: safeOptions,
    answer: safeAnswer >= 0 && safeAnswer < safeOptions.length ? safeAnswer : 0,
    explanation: String(question.explanation || '')
  };
}
function normalizeQuiz(quiz) {
  if (!quiz || typeof quiz !== 'object') return null;

  const normalizedQuestions = Array.isArray(quiz.questions)
    ? quiz.questions.map((question, index) => normalizeQuestion(question, index + 1))
    : [];

  return {
    ...quiz,
    questions: normalizedQuestions,
    timeLimit: Number(quiz.timeLimit) || 10,
    passingPercentage: Number(quiz.passingPercentage) || 60,
    difficulty: quiz.difficulty || 'Easy',
    category: quiz.category || 'General',
    title: quiz.title || 'Untitled Quiz',
    description: quiz.description || ''
  };
}
function getQuizzes() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES)) || [];
  if (!Array.isArray(stored)) return [];
  return stored.map(normalizeQuiz).filter(Boolean);
}
function saveQuizzes(quizzes) {
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes.map(normalizeQuiz).filter(Boolean)));
}
function getAttempts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) || [];
}
function saveAttempts(attempts) {
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
}
function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// ---------- TOAST ----------
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close">×</button>
  `;
  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ---------- MODAL ----------
function showModal(title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
    <div class="modal-actions">
      <button class="btn btn-outline" id="modalCancel">${cancelText}</button>
      <button class="btn" id="modalConfirm">${confirmText}</button>
    </div>
  `;
  overlay.classList.add('open');

  document.getElementById('modalCancel').onclick = () => {
    overlay.classList.remove('open');
  };
  document.getElementById('modalConfirm').onclick = () => {
    overlay.classList.remove('open');
    if (onConfirm) onConfirm();
  };
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  };
}

// ---------- PAGE NAVIGATION ----------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', async () => {
  initializeDemoData();
  await syncLocalStorageFromBackend();

  // Restore session if exists
  const savedUser = getCurrentUser();
  if (savedUser) {
    currentUser = savedUser;
    if (savedUser.role === 'admin') {
      showAdminDashboard();
    } else {
      showStudentDashboard();
    }
  } else {
    showPage('pageAuth');
  }

  // Role selection
  document.getElementById('roleStudentCard').addEventListener('click', () => {
    if (currentUser) { showStudentDashboard(); return; }
    showPage('pageStudentLogin');
  });
  document.getElementById('roleAdminCard').addEventListener('click', () => {
    if (currentUser && currentUser.role === 'admin') { showAdminDashboard(); return; }
    showPage('pageAdminLogin');
  });

  // Back buttons
  document.getElementById('backToRoleFromLogin').addEventListener('click', (e) => { e.preventDefault(); showPage('pageAuth'); });
  document.getElementById('backToRoleFromSignup').addEventListener('click', (e) => { e.preventDefault(); showPage('pageAuth'); });
  document.getElementById('backToRoleFromAdmin').addEventListener('click', (e) => { e.preventDefault(); showPage('pageAuth'); });

  // Student login <-> signup
  document.getElementById('goToSignup').addEventListener('click', (e) => { e.preventDefault(); showPage('pageStudentSignup'); });
  document.getElementById('goToLogin').addEventListener('click', (e) => { e.preventDefault(); showPage('pageStudentLogin'); });

  // Forgot password (demo)
  document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset is not available in this demo.', 'warning');
  });

  // Password visibility toggles
  setupPasswordToggle('toggleLoginPassword', 'loginPassword');
  setupPasswordToggle('toggleSignupPassword', 'signupPassword');
  setupPasswordToggle('toggleAdminPassword', 'adminPassword');
  setupPasswordToggle('toggleAdminSecret', 'adminSecret');

  // Student Login Form
  document.getElementById('studentLoginForm').addEventListener('submit', handleStudentLogin);

  // Student Signup Form
  document.getElementById('studentSignupForm').addEventListener('submit', handleStudentSignup);

  // Admin Login Form
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);

  // Student Dashboard Navigation
  document.getElementById('navToHistory').addEventListener('click', showHistoryPage);
  document.getElementById('navToAccount').addEventListener('click', showAccountPage);
  document.getElementById('studentLogoutBtn').addEventListener('click', () => confirmLogout('student'));

  // History page back
  document.getElementById('backToDashboardFromHistory').addEventListener('click', () => showStudentDashboard());
  // Account page back
  document.getElementById('backToDashboardFromAccount').addEventListener('click', () => showStudentDashboard());
  // Account save
  document.getElementById('saveAccountBtn').addEventListener('click', saveAccountChanges);

  // View all history from dashboard
  document.getElementById('viewAllHistoryBtn').addEventListener('click', showHistoryPage);

  // Quiz page
  document.getElementById('prevQuestionBtn').addEventListener('click', () => navigateQuestion(-1));
  document.getElementById('nextQuestionBtn').addEventListener('click', () => navigateQuestion(1));
  document.getElementById('quitQuizBtn').addEventListener('click', quitQuiz);

  // Result page buttons
  document.getElementById('reviewAnswersBtn').addEventListener('click', showReviewPage);
  document.getElementById('tryAnotherQuizBtn').addEventListener('click', () => { stopQuizTimer(); showStudentDashboard(); });
  document.getElementById('goToDashboardBtn').addEventListener('click', () => { stopQuizTimer(); showStudentDashboard(); });
  document.getElementById('backToResultBtn').addEventListener('click', () => showPage('pageResult'));

  // Admin dashboard buttons
  document.getElementById('adminNavCreate').addEventListener('click', () => {
    document.getElementById('adminCreateSection').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('adminNavManage').addEventListener('click', () => {
    document.getElementById('adminManageSection').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('adminNavStudents').addEventListener('click', () => {
    document.getElementById('adminStudentsSection').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('adminLogoutBtn').addEventListener('click', () => confirmLogout('admin'));
  document.getElementById('adminSaveProfileBtn').addEventListener('click', saveAdminProfile);

  document.getElementById('quizQuestionCountInput').addEventListener('input', renderQuizQuestionBuilder);
  renderQuizQuestionBuilder();

  // Create Quiz Form
  document.getElementById('createQuizForm').addEventListener('submit', handleCreateQuiz);
});

// ---------- PASSWORD TOGGLE ----------
function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? '🙈' : '👁️';
  });
}

// ---------- FORM VALIDATION HELPERS ----------
function showError(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', show);
}
function clearErrors(formId) {
  const form = document.getElementById(formId);
  if (form) form.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
}

// ---------- STUDENT LOGIN ----------
async function handleStudentLogin(e) {
  e.preventDefault();
  clearErrors('studentLoginForm');

  const emailOrUsername = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  let valid = true;

  if (!emailOrUsername) { showError('loginEmailError', true); valid = false; }
  if (!password) { showError('loginPasswordError', true); valid = false; }
  if (!valid) return;

  try {
    const response = await apiRequest('/api/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password })
    });

    const user = response.user;
    currentUser = { ...user };
    setCurrentUser(currentUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...(JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')), ...[]]));
    showToast(`Welcome back, ${user.name}! 🎉`, 'success');
    showStudentDashboard();
  } catch (error) {
    showToast(error.message || 'Invalid email/username or password.', 'error');
  }
}

// ---------- STUDENT SIGNUP ----------
async function handleStudentSignup(e) {
  e.preventDefault();
  clearErrors('studentSignupForm');

  const name = document.getElementById('signupName').value.trim();
  const username = document.getElementById('signupUsername').value.trim();
  const branch = document.getElementById('signupBranch').value.trim();
  const rollNumber = document.getElementById('signupRollNumber').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const confirm = document.getElementById('signupConfirm').value.trim();
  let valid = true;

  if (!name) { showError('signupNameError', true); valid = false; }
  if (!username || username.length < 3) { showError('signupUsernameError', true); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('signupEmailError', true); valid = false; }
  if (!password || password.length < 6) { showError('signupPasswordError', true); valid = false; }
  if (password !== confirm) { showError('signupConfirmError', true); valid = false; }
  if (!valid) return;

  try {
    const response = await apiRequest('/api/auth/student/signup', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password, branch, rollNumber })
    });

    const newUser = response.user;
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === newUser.id);
    if (existingIndex >= 0) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
    saveUsers(users);

    currentUser = { ...newUser };
    setCurrentUser(currentUser);
    showToast('Account created successfully! 🎉', 'success');
    showStudentDashboard();
  } catch (error) {
    showToast(error.message || 'Unable to create account.', 'error');
  }
}

// ---------- ADMIN LOGIN ----------
async function handleAdminLogin(e) {
  e.preventDefault();
  clearErrors('adminLoginForm');

  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const secret = document.getElementById('adminSecret').value.trim();
  let valid = true;

  if (!username) { showError('adminUsernameError', true); valid = false; }
  if (!password) { showError('adminPasswordError', true); valid = false; }
  if (!secret) { showError('adminSecretError', true); valid = false; }
  if (!valid) return;

  try {
    const response = await apiRequest('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, secret })
    });

    const admin = response.user;
    currentUser = { ...admin };
    setCurrentUser(currentUser);
    await syncLocalStorageFromBackend();
    showToast('Admin access granted. Welcome! 🛡️', 'success');
    showAdminDashboard();
  } catch (error) {
    showToast(error.message || 'Invalid admin credentials.', 'error');
  }
}

// ---------- LOGOUT ----------
function confirmLogout(role) {
  showModal(
    'Confirm Logout',
    'Are you sure you want to logout?',
    'Yes, Logout',
    'Cancel',
    () => {
      currentUser = null;
      setCurrentUser(null);
      stopQuizTimer();
      showToast('Logged out successfully.', 'success');
      showPage('pageAuth');
    }
  );
}

// ---------- STUDENT DASHBOARD ----------
function showStudentDashboard() {
  if (!currentUser || currentUser.role !== 'student') { showPage('pageAuth'); return; }

  const displayName = currentUser.name.split(' ')[0];
  document.getElementById('studentNameDisplay').textContent = displayName;

  // Stats
  const attempts = getAttempts().filter(a => a.studentId === currentUser.id);
  const totalQuizzes = attempts.length;
  const avgScore = totalQuizzes > 0 ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalQuizzes) : 0;
  const bestScore = totalQuizzes > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
  const questionsAnswered = attempts.reduce((s, a) => s + a.total, 0);

  document.getElementById('statTotalQuizzes').textContent = totalQuizzes;
  document.getElementById('statAvgScore').textContent = avgScore + '%';
  document.getElementById('statBestScore').textContent = bestScore + '%';
  document.getElementById('statQuestionsAnswered').textContent = questionsAnswered;

  // Available quizzes
  const quizzes = getQuizzes();
  const grid = document.getElementById('studentQuizGrid');
  grid.innerHTML = quizzes.map(q => `
    <div class="quiz-card">
      <div class="quiz-meta">
        <span class="badge ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
        <span class="badge">${q.category}</span>
      </div>
      <h3>${q.title}</h3>
      <p class="quiz-desc">${q.description}</p>
      <div class="quiz-info">
        <span>📝 ${q.questions.length} questions</span>
        <span>⏱ ${q.timeLimit} min</span>
        <span>🎯 ${q.passingPercentage}% pass</span>
      </div>
      <button class="btn btn-block" onclick="startQuiz(${q.id})">Start Quiz</button>
    </div>
  `).join('');

  // Recent history
  const recent = attempts.slice(-3).reverse();
  const recentList = document.getElementById('recentHistoryList');
  if (recent.length === 0) {
    recentList.innerHTML = '<p style="color:var(--text-muted); padding:12px 0;">No attempts yet. Take your first quiz!</p>';
  } else {
    recentList.innerHTML = recent.map(a => {
      const quiz = quizzes.find(q => q.id === a.quizId);
      return `
        <div class="history-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:white; border-radius:12px; border:1px solid var(--border); margin-bottom:8px;">
          <div>
            <strong>${quiz ? quiz.title : 'Unknown Quiz'}</strong>
            <div style="font-size:0.8rem; color:var(--text-muted);">${a.date}</div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-weight:700; color:${a.percentage >= 60 ? '#166534' : '#991b1b'};">${a.percentage}%</span>
            <button class="btn btn-outline btn-sm" onclick="viewAttemptResult(${a.id})">View</button>
          </div>
        </div>
      `;
    }).join('');
  }

  showPage('pageStudentDashboard');
}

// ---------- QUIZ START ----------
window.startQuiz = function(quizId) {
  const quizzes = getQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) { showToast('Quiz not found.', 'error'); return; }

  activeQuiz = JSON.parse(JSON.stringify(quiz)); // deep clone
  currentQuestionIndex = 0;
  userAnswers = new Array(quiz.questions.length).fill(null);
  quizTotalSeconds = quiz.timeLimit * 60;
  quizSecondsRemaining = quizTotalSeconds;
  quizStartTime = Date.now();

  // Reset UI
  document.getElementById('quizTitleDisplay').textContent = quiz.title;
  document.getElementById('quizTimer').textContent = formatTime(quizSecondsRemaining);
  document.getElementById('quizTimer').classList.remove('urgent');

  renderQuestion();
  updateProgress();
  startQuizTimer();
  showPage('pageQuiz');
};

// ---------- RENDER QUESTION ----------
function renderQuestion() {
  if (!activeQuiz) return;
  const q = activeQuiz.questions[currentQuestionIndex];
  if (!q) return;

  const safeOptions = Array.isArray(q.options) ? q.options : [];
  document.getElementById('questionText').textContent = q.question || 'Question';
  const optionsList = document.getElementById('optionsList');
  const selectedIdx = userAnswers[currentQuestionIndex];

  if (!safeOptions.length) {
    optionsList.innerHTML = '<div class="empty-state">No options were saved for this question.</div>';
    document.getElementById('quizAnswerFeedback').textContent = 'This question has no valid answer options.';
    return;
  }

  optionsList.innerHTML = safeOptions.map((opt, idx) => {
    const isSelected = selectedIdx === idx;
    const stateClass = isSelected ? 'selected' : '';
    const marker = isSelected ? '✓' : String.fromCharCode(65 + idx);
    return `
      <div class="option-item ${stateClass}" data-index="${idx}" role="radio" aria-checked="${isSelected}">
        <span class="option-marker">${marker}</span>
        <span>${opt}</span>
      </div>
    `;
  }).join('');

  const feedbackBox = document.getElementById('quizAnswerFeedback');
  if (selectedIdx === null) {
    feedbackBox.className = 'answer-feedback';
    feedbackBox.textContent = '';
  } else {
    feedbackBox.className = 'answer-feedback';
    feedbackBox.textContent = 'Answer saved. You will see the correct answer after submission.';
  }

  optionsList.querySelectorAll('.option-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index);
      userAnswers[currentQuestionIndex] = idx;
      renderQuestion();
    });
  });

  document.getElementById('prevQuestionBtn').disabled = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === activeQuiz.questions.length - 1;
  document.getElementById('nextQuestionBtn').textContent = isLast ? 'Submit Quiz ✓' : 'Next →';
}

// ---------- NAVIGATE QUESTION ----------
function navigateQuestion(direction) {
  if (!activeQuiz) return;
  const total = activeQuiz.questions.length;
  const newIndex = currentQuestionIndex + direction;

  if (newIndex < 0) return;

  if (newIndex >= total) {
    // Submit quiz
    confirmSubmitQuiz();
    return;
  }

  currentQuestionIndex = newIndex;
  renderQuestion();
  updateProgress();
}

// ---------- UPDATE PROGRESS ----------
function updateProgress() {
  if (!activeQuiz) return;
  const total = activeQuiz.questions.length;
  const current = currentQuestionIndex + 1;
  document.getElementById('questionCounter').textContent = `Question ${current} / ${total}`;
  const percent = ((current - 1) / total) * 100;
  document.getElementById('quizProgressFill').style.width = percent + '%';
}

// ---------- QUIZ TIMER ----------
function startQuizTimer() {
  stopQuizTimer();
  quizTimerInterval = setInterval(() => {
    quizSecondsRemaining--;
    const timerEl = document.getElementById('quizTimer');
    timerEl.textContent = '⏱ ' + formatTime(quizSecondsRemaining);

    if (quizSecondsRemaining <= 60) {
      timerEl.classList.add('urgent');
    } else {
      timerEl.classList.remove('urgent');
    }

    if (quizSecondsRemaining <= 0) {
      stopQuizTimer();
      showToast('⏰ Time is up! Submitting quiz...', 'warning');
      submitQuiz(true);
    }
  }, 1000);
}

function stopQuizTimer() {
  if (quizTimerInterval) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
  }
}

function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------- CONFIRM SUBMIT ----------
function confirmSubmitQuiz() {
  const unanswered = userAnswers.filter(a => a === null).length;
  let msg = 'Are you sure you want to submit your quiz?';
  if (unanswered > 0) {
    msg = `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`;
  }
  showModal('Submit Quiz', msg, 'Yes, Submit', 'Review', () => {
    submitQuiz(false);
  });
}

// ---------- SUBMIT QUIZ ----------
async function submitQuiz(autoSubmitted = false) {
  stopQuizTimer();
  if (!activeQuiz) return;

  const total = activeQuiz.questions.length;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const reviewData = [];

  activeQuiz.questions.forEach((q, idx) => {
    const selected = userAnswers[idx];
    const isCorrect = selected === q.answer;
    if (selected === null) {
      unanswered++;
    } else if (isCorrect) {
      correct++;
    } else {
      wrong++;
    }
    reviewData.push({
      question: q.question,
      options: q.options,
      selected: selected,
      correctAnswer: q.answer,
      explanation: q.explanation || '',
      isCorrect: isCorrect,
      answered: selected !== null
    });
  });

  const percentage = Math.round((correct / total) * 100);
  const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
  const timeTakenStr = formatTime(timeTaken);

  const attempt = {
    id: Date.now(),
    studentId: currentUser.id,
    quizId: activeQuiz.id,
    quizTitle: activeQuiz.title,
    score: correct,
    total: total,
    percentage: percentage,
    date: new Date().toISOString().split('T')[0],
    timeTaken: timeTakenStr,
    answers: reviewData
  };

  try {
    await apiRequest('/api/attempts', {
      method: 'POST',
      body: JSON.stringify(attempt)
    });
  } catch (error) {
    console.warn('Attempt backend save failed:', error.message);
  }

  const attempts = getAttempts();
  attempts.push(attempt);
  saveAttempts(attempts);

  showResult(attempt, autoSubmitted);
}

// ---------- SHOW RESULT ----------
function showResult(attempt, autoSubmitted) {
  const percentage = attempt.percentage;
  document.getElementById('resultScore').textContent = `${attempt.score}/${attempt.total}`;
  document.getElementById('resultPercentLabel').textContent = percentage + '%';
  document.getElementById('resultPercentText').textContent = percentage + '%';
  document.getElementById('resultCorrect').textContent = attempt.score;
  document.getElementById('resultWrong').textContent = attempt.total - attempt.score - (attempt.answers.filter(a => !a.answered).length);
  document.getElementById('resultUnanswered').textContent = attempt.answers.filter(a => !a.answered).length;
  document.getElementById('resultTimeTaken').textContent = attempt.timeTaken;

  // Message
  let msg = '';
  if (percentage >= 80) msg = 'Excellent work! 🎉';
  else if (percentage >= 60) msg = 'Good job! Keep improving.';
  else msg = 'Keep practicing. You can do better!';
  document.getElementById('resultMessage').textContent = msg;

  // Circular progress
  const circle = document.getElementById('resultCircle');
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (percentage / 100) * circumference;
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Confetti for high scores
  if (percentage >= 80) {
    launchConfetti();
  }

  // Store current attempt for review
  currentAttempt = attempt;
  showPage('pageResult');
}

// ---------- CONFETTI ----------
function launchConfetti() {
  const colors = ['#4A7878', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = Math.random() * 8 + 6 + 'px';
    piece.style.height = Math.random() * 8 + 6 + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

// ---------- REVIEW ----------
let currentAttempt = null;

function showReviewPage() {
  if (!currentAttempt) return;
  const list = document.getElementById('reviewList');
  list.innerHTML = currentAttempt.answers.map((a, idx) => {
    const statusClass = a.isCorrect ? 'correct' : (a.answered ? 'wrong' : '');
    const statusText = a.isCorrect ? '✅ Correct' : (a.answered ? '❌ Wrong' : '⬜ Unanswered');
    const selectedText = a.selected !== null ? a.options[a.selected] : 'Not answered';
    return `
      <div class="review-item ${statusClass}">
        <div class="review-q">Q${idx + 1}. ${a.question}</div>
        <div class="review-answer">
          <span>Your answer: <strong>${selectedText}</strong></span>
          <span>Correct: <strong>${a.options[a.correctAnswer]}</strong></span>
        </div>
        <div class="review-status">${statusText}</div>
        ${a.explanation ? `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">💡 ${a.explanation}</div>` : ''}
      </div>
    `;
  }).join('');
  showPage('pageReview');
}

// ---------- VIEW ATTEMPT RESULT (from history) ----------
window.viewAttemptResult = function(attemptId) {
  const attempts = getAttempts();
  const attempt = attempts.find(a => a.id === attemptId);
  if (!attempt) { showToast('Attempt not found.', 'error'); return; }
  currentAttempt = attempt;
  showResult(attempt, false);
};

// ---------- HISTORY PAGE ----------
function showHistoryPage() {
  if (!currentUser || currentUser.role !== 'student') return;
  const attempts = getAttempts().filter(a => a.studentId === currentUser.id).reverse();
  const quizzes = getQuizzes();

  const wrapper = document.getElementById('historyTableWrapper');
  if (attempts.length === 0) {
    wrapper.innerHTML = '<div class="card" style="text-align:center; padding:40px;"><p style="color:var(--text-muted);">No quiz attempts yet. Start your first quiz!</p></div>';
  } else {
    wrapper.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${attempts.map(a => {
              const quiz = quizzes.find(q => q.id === a.quizId);
              const passed = a.percentage >= 60;
              return `
                <tr>
                  <td data-label="Quiz">${quiz ? quiz.title : a.quizTitle || 'Unknown'}</td>
                  <td data-label="Date">${a.date}</td>
                  <td data-label="Score">${a.score}/${a.total}</td>
                  <td data-label="Percentage">${a.percentage}%</td>
                  <td data-label="Status" class="${passed ? 'status-pass' : 'status-fail'}">${passed ? 'Passed' : 'Failed'}</td>
                  <td data-label="Action"><button class="btn btn-outline btn-sm" onclick="viewAttemptResult(${a.id})">View Result</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  showPage('pageHistory');
}

// ---------- ACCOUNT PAGE ----------
function showAccountPage() {
  if (!currentUser || currentUser.role !== 'student') return;
  document.getElementById('accountFullName').textContent = currentUser.name;
  document.getElementById('accountUsername').textContent = '@' + currentUser.username;
  document.getElementById('accountNameInput').value = currentUser.name;
  document.getElementById('accountUsernameInput').value = currentUser.username;
  document.getElementById('accountBranchInput').value = currentUser.branch || '';
  document.getElementById('accountRollNumberInput').value = currentUser.rollNumber || '';
  document.getElementById('accountEmailInput').value = currentUser.email;
  document.getElementById('accountCreatedAt').value = currentUser.createdAt;
  showPage('pageAccount');
}

async function saveAccountChanges() {
  const newName = document.getElementById('accountNameInput').value.trim();
  const newUsername = document.getElementById('accountUsernameInput').value.trim();
  const newBranch = document.getElementById('accountBranchInput').value.trim();
  const newRollNumber = document.getElementById('accountRollNumberInput').value.trim();
  if (!newName || !newUsername) { showToast('Name and username are required.', 'warning'); return; }

  const users = getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx === -1) return;

  if (users.some((u, i) => i !== idx && u.username === newUsername)) {
    showToast('Username already taken.', 'error');
    return;
  }

  try {
    const response = await apiRequest(`/api/users/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName, username: newUsername, branch: newBranch, rollNumber: newRollNumber })
    });
    currentUser = { ...currentUser, ...response.user };
  } catch (error) {
    console.warn('Profile update backend failed:', error.message);
  }

  users[idx].name = newName;
  users[idx].username = newUsername;
  users[idx].branch = newBranch;
  users[idx].rollNumber = newRollNumber;
  saveUsers(users);

  currentUser.name = newName;
  currentUser.username = newUsername;
  currentUser.branch = newBranch;
  currentUser.rollNumber = newRollNumber;
  setCurrentUser(currentUser);

  showToast('Account updated successfully! ✅', 'success');
  showStudentDashboard();
}

// ---------- ADMIN DASHBOARD ----------
function showAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') { showPage('pageAuth'); return; }

  const quizzes = getQuizzes();
  const users = getUsers();
  const attempts = getAttempts();

  document.getElementById('adminStatQuizzes').textContent = quizzes.length;
  document.getElementById('adminStatQuestions').textContent = quizzes.reduce((s, q) => s + q.questions.length, 0);
  document.getElementById('adminStatStudents').textContent = users.filter(u => u.role === 'student').length;
  document.getElementById('adminStatAttempts').textContent = attempts.length;

  document.getElementById('adminNameInput').value = currentUser.name || '';
  document.getElementById('adminUsernameInput').value = currentUser.username || '';
  document.getElementById('adminEmailInput').value = currentUser.email || '';
  document.getElementById('adminCreatedAt').textContent = currentUser.createdAt || 'N/A';
  document.getElementById('adminProfileHeader').textContent = `${currentUser.name} · @${currentUser.username}`;

  const quizList = document.getElementById('adminQuizList');
  if (quizzes.length === 0) {
    quizList.innerHTML = '<p style="color:var(--text-muted);">No quizzes created yet.</p>';
  } else {
    quizList.innerHTML = quizzes.map(q => `
      <div class="quiz-card">
        <div class="quiz-meta">
          <span class="badge ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
          <span class="badge">${q.category}</span>
        </div>
        <h3>${q.title}</h3>
        <p class="quiz-desc">${q.description}</p>
        <div class="quiz-info">
          <span>📝 ${q.questions.length} questions</span>
          <span>⏱ ${q.timeLimit} min</span>
          <span>📅 ${q.createdAt || 'N/A'}</span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="viewQuizQuestions(${q.id})">View Questions</button>
          <button class="btn btn-danger btn-sm" onclick="deleteQuiz(${q.id})">Delete</button>
        </div>
      </div>
    `).join('');
  }

  const studentList = document.getElementById('adminStudentList');
  const students = users.filter(u => u.role === 'student');
  if (students.length === 0) {
    studentList.innerHTML = '<p style="color:var(--text-muted); padding:16px;">No students registered.</p>';
  } else {
    studentList.innerHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Username</th><th>Email</th><th>Attempts</th><th>Avg Score</th><th>Registered</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${students.map(s => {
            const sAttempts = attempts.filter(a => a.studentId === s.id);
            const avg = sAttempts.length > 0 ? Math.round(sAttempts.reduce((sum, a) => sum + a.percentage, 0) / sAttempts.length) : 0;
            return `
              <tr>
                <td data-label="Name">${s.name}</td>
                <td data-label="Username">${s.username}</td>
                <td data-label="Email">${s.email}</td>
                <td data-label="Attempts">${sAttempts.length}</td>
                <td data-label="Avg Score">${avg}%</td>
                <td data-label="Registered">${s.createdAt}</td>
                <td data-label="Action"><button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Delete</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  showPage('pageAdminDashboard');
}

async function saveAdminProfile() {
  const newName = document.getElementById('adminNameInput').value.trim();
  const newUsername = document.getElementById('adminUsernameInput').value.trim();

  if (!newName || !newUsername) {
    showToast('Admin name and username are required.', 'warning');
    return;
  }

  const users = getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx === -1) {
    showToast('Admin user not found.', 'error');
    return;
  }

  if (users.some((u, i) => i !== idx && u.username.toLowerCase() === newUsername.toLowerCase())) {
    showToast('That username is already in use.', 'error');
    return;
  }

  try {
    const response = await apiRequest(`/api/users/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName, username: newUsername })
    });
    currentUser = { ...currentUser, ...response.user };
    users[idx] = { ...users[idx], name: newName, username: newUsername };
    saveUsers(users);
    setCurrentUser(currentUser);
    showToast('Admin profile updated successfully.', 'success');
    showAdminDashboard();
  } catch (error) {
    console.warn('Admin profile backend failed:', error.message);
    users[idx] = { ...users[idx], name: newName, username: newUsername };
    saveUsers(users);
    currentUser = { ...currentUser, name: newName, username: newUsername };
    setCurrentUser(currentUser);
    showToast('Admin profile updated locally.', 'success');
    showAdminDashboard();
  }
}

window.viewQuizQuestions = function(quizId) {
  const quiz = getQuizzes().find(q => q.id === quizId);
  if (!quiz) {
    showToast('Quiz not found.', 'error');
    return;
  }

  const content = `
    <h3>${escapeHtml(quiz.title)}</h3>
    <p style="color:var(--text-muted); margin:8px 0 16px;">${escapeHtml(quiz.description)}</p>
    <div style="display:flex; flex-direction:column; gap:14px; max-height:520px; overflow:auto; padding-right:8px;">
      ${quiz.questions.length ? quiz.questions.map((question, index) => `
        <div data-question-editor style="padding:14px; border:1px solid var(--border); border-radius:12px; background:#f8fafc;">
          <div class="form-group" style="margin-bottom:10px;">
            <label>Question ${index + 1}</label>
            <input type="text" value="${escapeHtml(question.question || '')}" data-question-index="${index}" data-field="question" />
          </div>
          <div style="display:grid; gap:8px; margin-bottom:10px;">
            ${question.options.map((option, optIndex) => `
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="radio" name="correct-${index}" value="${optIndex}" ${optIndex === Number(question.answer || 0) ? 'checked' : ''} data-question-index="${index}" data-field="answer" />
                <input type="text" value="${escapeHtml(option || '')}" data-question-index="${index}" data-option-index="${optIndex}" data-field="option" style="flex:1;" />
              </div>
            `).join('')}
          </div>
          <div class="form-group" style="margin:0;">
            <label>Explanation</label>
            <textarea rows="2" data-question-index="${index}" data-field="explanation">${escapeHtml(question.explanation || '')}</textarea>
          </div>
        </div>
      `).join('') : '<p style="color:var(--text-muted);">No questions yet in this quiz.</p>'}
    </div>
    <div class="modal-actions" style="margin-top:16px; display:flex; justify-content:flex-end; gap:10px;">
      <button class="btn btn-outline" id="closeQuestionsModal">Close</button>
      <button class="btn" id="saveQuestionsBtn">Save Questions</button>
    </div>
  `;

  const overlay = document.getElementById('modalOverlay');
  const contentBox = document.getElementById('modalContent');
  contentBox.innerHTML = content;
  overlay.classList.add('open');

  document.getElementById('closeQuestionsModal').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('open'); };

  document.getElementById('saveQuestionsBtn').addEventListener('click', async () => {
    const questionEditors = [...document.querySelectorAll('[data-question-editor]')];
    const updatedQuestions = questionEditors.map((editor, idx) => {
      const questionInput = editor.querySelector('[data-field="question"]');
      const explanationInput = editor.querySelector('[data-field="explanation"]');
      const answerValue = editor.querySelector('input[type="radio"][checked]');
      const optionInputs = [...editor.querySelectorAll('[data-field="option"]')];

      const question = {
        id: idx + 1,
        question: questionInput ? questionInput.value.trim() : `Question ${idx + 1}`,
        options: optionInputs.map(input => input.value.trim()),
        answer: answerValue ? Number(answerValue.value) : 0,
        explanation: explanationInput ? explanationInput.value.trim() : ''
      };

      if (!question.question || question.options.some(option => !option)) {
        throw new Error('Every question must have text and valid options.');
      }
      return question;
    });

    try {
      const response = await apiRequest(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty,
          timeLimit: quiz.timeLimit,
          passingPercentage: quiz.passingPercentage,
          questions: updatedQuestions
        })
      });

      const quizzes = getQuizzes();
      const index = quizzes.findIndex(q => q.id === quizId);
      if (index >= 0) {
        quizzes[index] = { ...quizzes[index], ...response.quiz, questions: updatedQuestions };
        saveQuizzes(quizzes);
      }
      showToast('Questions saved successfully.', 'success');
      overlay.classList.remove('open');
      showAdminDashboard();
    } catch (error) {
      showToast(error.message || 'Could not save questions.', 'error');
    }
  });
};

window.deleteStudent = function(studentId) {
  const student = getUsers().find(u => u.id === studentId);
  if (!student) {
    showToast('Student not found.', 'error');
    return;
  }

  showModal('Delete Student', `Delete ${student.name} (${student.username})? This will remove their account and attempts.`, 'Delete', 'Cancel', async () => {
    try {
      await apiRequest(`/api/users/${studentId}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Delete student backend failed:', error.message);
    }

    const users = getUsers().filter(u => u.id !== studentId);
    const attempts = getAttempts().filter(a => a.studentId !== studentId);
    saveUsers(users);
    saveAttempts(attempts);
    showToast('Student deleted successfully.', 'success');
    showAdminDashboard();
  });
};

window.viewQuizQuestions = window.viewQuizQuestions;
window.deleteStudent = window.deleteStudent;

// ---------- DELETE QUIZ ----------
window.deleteQuiz = function(quizId) {
  showModal('Delete Quiz', 'Are you sure you want to delete this quiz? This action cannot be undone.', 'Delete', 'Cancel', async () => {
    try {
      await apiRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Delete quiz backend failed:', error.message);
    }

    let quizzes = getQuizzes();
    quizzes = quizzes.filter(q => q.id !== quizId);
    saveQuizzes(quizzes);
    showToast('Quiz deleted successfully.', 'success');
    showAdminDashboard();
  });
};

function renderQuizQuestionBuilder() {
  const builder = document.getElementById('quizQuestionBuilder');
  if (!builder) return;

  const count = Math.max(1, parseInt(document.getElementById('quizQuestionCountInput').value || '1', 10) || 1);
  const cards = Array.from({ length: count }, (_, index) => {
    const questionNumber = index + 1;
    return `
      <div class="question-builder-card" style="border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:16px; background:#f8fafc;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px;">
          <h3 style="margin:0; font-size:1rem;">Question ${questionNumber}</h3>
        </div>
        <div class="form-group">
          <label>Question text</label>
          <input type="text" class="question-text-input" placeholder="Type your question here" required>
        </div>
        <div style="display:grid; gap:10px; margin-top:12px;">
          ${Array.from({ length: 4 }, (_, optionIndex) => `
            <div class="form-group" style="margin:0;">
              <label>Option ${optionIndex + 1}</label>
              <input type="text" class="option-input" placeholder="Enter option ${optionIndex + 1}" required>
            </div>
          `).join('')}
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Correct answer</label>
          <select class="correct-answer-select">
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        </div>
      </div>
    `;
  }).join('');

  builder.innerHTML = `
    <h3 style="font-size:1.1rem; margin-bottom:12px;">Question Builder</h3>
    ${cards}
  `;
}

// ---------- CREATE QUIZ ----------
async function handleCreateQuiz(e) {
  e.preventDefault();
  const title = document.getElementById('quizTitleInput').value.trim();
  const description = document.getElementById('quizDescriptionInput').value.trim();
  const category = document.getElementById('quizCategoryInput').value.trim();
  const difficulty = document.getElementById('quizDifficultyInput').value;
  const timeLimit = parseInt(document.getElementById('quizTimeLimitInput').value);
  const passing = parseInt(document.getElementById('quizPassingInput').value);
  const questionCount = parseInt(document.getElementById('quizQuestionCountInput').value);

  if (!title || !description || !category) {
    showToast('Please fill in all required fields.', 'warning');
    return;
  }

  const cards = document.querySelectorAll('.question-builder-card');
  if (!cards.length) {
    showToast('Please add at least one question.', 'warning');
    return;
  }

  const questions = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const questionText = card.querySelector('.question-text-input').value.trim();
    const optionInputs = [...card.querySelectorAll('.option-input')];
    const options = optionInputs.map(input => input.value.trim());
    const correctAnswer = Number(card.querySelector('.correct-answer-select').value);

    if (!questionText || options.some(option => !option)) {
      showToast(`Please complete question ${i + 1} before creating the quiz.`, 'warning');
      return;
    }

    questions.push({
      id: i + 1,
      question: questionText,
      options,
      answer: correctAnswer,
      explanation: `The correct answer is ${options[correctAnswer]}.`
    });
  }

  const newQuiz = {
    id: Date.now(),
    title,
    description,
    category,
    difficulty,
    timeLimit,
    passingPercentage: passing,
    questionCount,
    createdAt: new Date().toISOString().split('T')[0],
    questions
  };

  try {
    await apiRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        category,
        difficulty,
        timeLimit,
        passingPercentage: passing,
        questions
      })
    });
  } catch (error) {
    console.warn('Create quiz backend failed:', error.message);
  }

  const quizzes = getQuizzes();
  quizzes.push(newQuiz);
  saveQuizzes(quizzes);

  showToast('Quiz created successfully! Students will only see results after submission.', 'success');
  document.getElementById('createQuizForm').reset();
  renderQuizQuestionBuilder();
  showAdminDashboard();
}

// ---------- EXPOSE FUNCTIONS TO GLOBAL SCOPE ----------
window.startQuiz = startQuiz;
window.viewAttemptResult = viewAttemptResult;
window.deleteQuiz = deleteQuiz;

// ---------- QUIZ QUIT ----------
function quitQuiz() {
  showModal('Quit Quiz', 'Are you sure you want to quit? Your progress will be lost.', 'Quit', 'Continue', () => {
    stopQuizTimer();
    showStudentDashboard();
  });
}

// ---------- KEYBOARD NAVIGATION ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('modalOverlay');
    if (overlay.classList.contains('open')) overlay.classList.remove('open');
  }
});
