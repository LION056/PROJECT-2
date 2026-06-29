const DEMO_MODE = true; // true = stop after onboarding | false = show full dashboard

// Global Application Configurations & Seed Data
const GENERATED_OTP = "123456";
const EXISTING_USERS = [
  "obutedaniel2@gmail.com",
  "topshotta56@gmail.com",
  "lion82@gmail.com"
];

// Global Application State
const state = {
  email: "",
  fullName: "",
  monthlyBudget: 2400 // Tracks state across screens
};
 
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
// ==========================================================================
// 1. EMAIL SCREEN
// ==========================================================================
function renderEmailScreen() {
  document.querySelector(".container").innerHTML = `
    <div class="auth-page">
      <div class="auth-logo">
        <div class="logo-icon">✦</div>
        <span>BudgetBasket</span>
      </div>
      <div class="auth-card">
        <h2>Welcome to BudgetBasket</h2>
        <p class="auth-subtitle">Enter your email to sign in or create an account.</p>
        <label for="email">Email</label>
        <div class="input-wrapper" id="emailWrapper">
          <input type="email" id="email" placeholder="johndoe@gmail.com" autocomplete="off" />
          <span class="input-check" id="emailCheck">✓</span>
        </div>
        <button id="continueBtn" class="primary-btn" disabled>
         Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <rect x="2" y="4" width="20" height="16" rx="2"/>
           <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
         </svg>
       </button>
        <p class="helper-text">No password needed. We'll email you a one-time code.</p>
      </div>
      <p class="footer-text">By continuing, you agree to our Terms and Privacy Policy.</p>
    </div>
  `;
 
  const emailInput = document.getElementById("email");
  const continueBtn = document.getElementById("continueBtn");
  const emailCheck = document.getElementById("emailCheck");
  const emailWrapper = document.getElementById("emailWrapper");
 

    emailInput.addEventListener("input", () => {
      const email = emailInput.value.trim();
      if (validateEmail(email)) {
        continueBtn.disabled = false;
        emailWrapper.classList.add("valid");
        emailWrapper.classList.remove("invalid");
        emailCheck.style.display = "block";
      } else {
        continueBtn.disabled = true;
        emailWrapper.classList.remove("valid");
        if (email.length > 0) {
          emailWrapper.classList.add("invalid");
        } else {
          emailWrapper.classList.remove("invalid");
        }
        emailCheck.style.display = "none";
      }
    });
 
  continueBtn.addEventListener("click", () => {
    state.email = emailInput.value.trim();
    continueBtn.textContent = "Loading...";
    continueBtn.disabled = true;
    setTimeout(() => renderOtpScreen(), 1500);
  });
}
 
// ==========================================================================
// 2. OTP SCREEN
// ==========================================================================
function renderOtpScreen() {
  document.querySelector(".container").innerHTML = `
    <div class="auth-page">
      <div class="auth-logo">
        <div class="logo-icon">✦</div>
        <span>BudgetBasket</span>
      </div>
      <div class="auth-card">
        <button class="back-btn" id="backBtn">← Back</button>
        <h2>Check your email</h2>
        <p class="auth-subtitle">We sent a 6-digit code to ${state.email}.</p>
        <div class="otp-container">
          <input maxlength="1" class="otp-input" type="text" inputmode="numeric" />
          <input maxlength="1" class="otp-input" type="text" inputmode="numeric" />
          <input maxlength="1" class="otp-input" type="text" inputmode="numeric" />
          <input maxlength="1" class="otp-input" type="text" inputmode="numeric" />
          <input maxlength="1" class="otp-input" type="text" inputmode="numeric" />
          <input maxlength="1" class="otp-input" type="text" inputmode="numeric" />
        </div>
        <div id="otpMessage"></div>
        <button id="verifyBtn" class="primary-btn" disabled>Verify code</button>
        <p class="resend-text" id="resendText">Didn't get a code? Resend in <span id="countdown">30</span>s</p>
      </div>
      <p class="footer-text">By continuing, you agree to our Terms and Privacy Policy.</p>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => renderEmailScreen());

  const otpInputs = document.querySelectorAll(".otp-input");
  const verifyBtn = document.getElementById("verifyBtn");
  const otpMessage = document.getElementById("otpMessage");
  const countdownEl = document.getElementById("countdown");
  const resendText = document.getElementById("resendText");

  let seconds = 30;
  const timer = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(timer);
      resendText.innerHTML = `Didn't get a code? <span id="resendLink" style="color:#111827;font-weight:700;cursor:pointer;text-decoration:underline;">Resend</span>`;
      document.getElementById("resendLink").addEventListener("click", () => renderOtpScreen());
    }
  }, 1000);

  otpInputs[0].focus();

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
      const val = [...otpInputs].map(i => i.value).join("");
      verifyBtn.disabled = val.length !== 6;
      if (val.length === 6) verifyBtn.click();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) otpInputs[index - 1].focus();
    });
  });

  verifyBtn.addEventListener("click", () => {
    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;
    const entered = [...otpInputs].map(i => i.value).join("");
    setTimeout(() => {
      if (entered === GENERATED_OTP) {
        clearInterval(timer);
        otpMessage.innerHTML = `<p class="otp-success">✓ Code verified successfully</p>`;
        const existing = localStorage.getItem(state.email);
        setTimeout(() => {
          if (existing) {
            state.fullName = existing;
            renderDashboard();
          } else {
            renderOnboardingScreen();
          }
        }, 800);
      } else {
        otpMessage.innerHTML = `<p class="otp-error">✕ Incorrect verification code</p>`;
        verifyBtn.textContent = "Verify code";
        verifyBtn.disabled = false;
        otpInputs.forEach(i => { i.value = ""; });
        otpInputs[0].focus();
      }
    }, 1000);
  });
}

 
// ==========================================================================
// 3. ONBOARDING SCREEN
// ==========================================================================
function renderOnboardingScreen() {
  document.querySelector(".container").innerHTML = `
    <div class="auth-page">
      <div class="auth-logo">
        <div class="logo-icon">✦</div>
        <span>BudgetBasket</span>
      </div>
      <div class="auth-card">
        <h2>Complete Your Profile</h2>
        <p class="auth-subtitle">Just one more step to get started.</p>
        <label for="fullName">Full Name</label>
        <input type="text" id="fullName" placeholder="John Doe" />
        <div id="nameMessage"></div>
        <button id="finishBtn" class="primary-btn">Continue</button>
      </div>
    </div>
  `;
 
  const finishBtn = document.getElementById("finishBtn");
  const fullNameInput = document.getElementById("fullName");
  const nameMessage = document.getElementById("nameMessage");
 
  finishBtn.addEventListener("click", () => {
    const name = fullNameInput.value.trim();
    if (!name) {
      nameMessage.innerHTML = `<p class="otp-error">Please enter your full name</p>`;
      return;
    }
    state.fullName = name;
    localStorage.setItem(state.email, name);

    renderDashboard();
  });
}

// ==========================================================================
// 4. DASHBOARD SHELL
// ==========================================================================
function renderDashboard() {
  document.querySelector(".container").innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">✦</div>
          <span>BudgetBasket</span>
        </div>
        <nav class="sidebar-nav">
          <ul>
            <li id="tab-dashboard" class="nav-item active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </li>
            <li id="tab-transactions" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Transactions
            </li>
            <li id="tab-insights" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Insights
            </li>
            <li id="tab-rewards" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              Rewards
            </li>
            <li id="tab-settings" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </li>
          </ul>
        </nav>
        <div class="sidebar-footer">
          <button id="logoutBtn" class="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </aside>
      <main class="main-content" id="main-view-slot"></main>
    </div>
  `;

  document.getElementById("tab-dashboard").addEventListener("click", () => {
    setTab("tab-dashboard");
    renderDashboardView();
  });

  document.getElementById("tab-transactions").addEventListener("click", () => {
    setTab("tab-transactions");
    DEMO_MODE ? renderComingSoon("Transactions") : renderTransactionsView();
  });

  document.getElementById("tab-insights").addEventListener("click", () => {
    setTab("tab-insights");
    DEMO_MODE ? renderComingSoon("Insights") : renderInsightsView();
  });

  document.getElementById("tab-rewards").addEventListener("click", () => {
    setTab("tab-rewards");
    DEMO_MODE ? renderComingSoon("Rewards") : renderRewardsView();
  });

  document.getElementById("tab-settings").addEventListener("click", () => {
    setTab("tab-settings");
    DEMO_MODE ? renderComingSoon("Settings") : renderSettingsView();
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.email = "";
    state.fullName = "";
    renderEmailScreen();
  });

  renderDashboardView();
}

function renderComingSoon(pageName) {
  document.getElementById("main-view-slot").innerHTML = `
    ${renderPageHeader(pageName)}
    <div class="panel" style="text-align:center; padding:80px 24px;">
      <div style="font-size:48px; margin-bottom:16px;">🚀</div>
      <h2 style="font-size:22px; font-weight:700; color:#111827; margin-bottom:8px;">Launching soon</h2>
      <p style="font-size:14px; color:#6b7280;">Stay tuned!</p>
    </div>
  `;
  attachNotifToggle();
}

 
function setTab(activeId) {
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  const el = document.getElementById(activeId);
  if (el) el.classList.add("active");
}
 
function renderPageHeader(title) {
  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1>${title}</h1>
        <p>Welcome back, ${state.fullName || state.email} — let's keep your budget on track.</p>
      </div>
      <div class="page-header-right">
        <button class="notif-btn" id="notifBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        <div class="avatar">${(state.fullName || state.email || "A").charAt(0).toUpperCase()}</div>
      </div>
    </div>
    <div class="notif-popup" id="notifPopup">
      <p class="notif-title">No new notifications</p>
      <p class="notif-sub">You're all caught up.</p>
    </div>
  `;
}
 
function attachNotifToggle() {
  const btn = document.getElementById("notifBtn");
  const popup = document.getElementById("notifPopup");
  if (btn && popup) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.toggle("show");
    });
    document.addEventListener("click", () => popup.classList.remove("show"));
  }
}
 
// ==========================================================================
// 5. DASHBOARD VIEW
// ==========================================================================
function renderDashboardView() {
  const budget = state.monthlyBudget;
  const spent = 2093;
  const pct = Math.round((spent / budget) * 100);
 
  document.getElementById("main-view-slot").innerHTML = `
    ${renderPageHeader("Dashboard")}
 
    <div class="hero-banner">
      <div class="hero-left">
        <span class="hero-tag">🏆 YOU'RE CRUSHING IT</span>
        <h2>You stayed within budget this week 🎉</h2>
        <p>You earned <strong>+120 grocery points</strong> this month.</p>
      </div>
      <button class="hero-btn" id="redeemBannerBtn">Redeem rewards</button>
    </div>
 
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon blue-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <span class="stat-badge green-badge">↗ +2.4%</span>
        </div>
        <p class="stat-label">Account Balance</p>
        <h3 class="stat-value">$8,420.55</h3>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon purple-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <span class="stat-badge gray-badge">May</span>
        </div>
        <p class="stat-label">Monthly Budget</p>
        <h3 class="stat-value">$${budget.toLocaleString()}</h3>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon green-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <span class="stat-badge green-badge">↗ 13% left</span>
        </div>
        <p class="stat-label">Remaining</p>
        <h3 class="stat-value">$307</h3>
      </div>
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon orange-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <span class="stat-badge green-badge">↗ +120 this month</span>
        </div>
        <p class="stat-label">Reward Points</p>
        <h3 class="stat-value">1,240</h3>
      </div>
    </div>
 
    <div class="dashboard-bottom">
      <div class="panel budget-health-panel">
        <div class="panel-head">
          <h3>Budget health</h3>
          <span class="close-limit-tag">● Close To Limit</span>
        </div>
        <p class="panel-sub">$${spent.toLocaleString()} of $${budget.toLocaleString()} spent this month</p>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="progress-labels">
          <span>$0</span>
          <span>$${budget.toLocaleString()}</span>
        </div>
      </div>
 
      <div class="panel budget-number-panel">
        <div class="panel-head">
          <h3>Monthly budget</h3>
          <button class="edit-link" onclick="setTab('tab-settings'); renderSettingsView();">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        </div>
        <h2 class="budget-big">$${budget.toLocaleString()}</h2>
        <p class="panel-sub">Resets on the 1st of each month</p>
      </div>
    </div>
 
    <div class="panel categories-panel">
      <div class="panel-head"><h3>Spending categories</h3></div>
      <p class="panel-sub" style="margin-bottom:20px;">Track each category at a glance</p>
      <div class="cat-grid">
        <div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-icon" style="background:#ecfdf5;color:#10b981;">🛒</div>
            <div><p class="cat-name">Groceries</p><p class="cat-spent">$412 / $600</p></div>
            <span class="cat-left green">$188 left</span>
          </div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:69%;background:#10b981;"></div></div>
        </div>
        <div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-icon" style="background:#eff6ff;color:#3b82f6;">🚗</div>
            <div><p class="cat-name">Transportation</p><p class="cat-spent">$198 / $250</p></div>
            <span class="cat-left blue">$52 left</span>
          </div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:79%;background:#3b82f6;"></div></div>
        </div>
        <div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-icon" style="background:#f5f3ff;color:#8b5cf6;">🎬</div>
            <div><p class="cat-name">Entertainment</p><p class="cat-spent">$142 / $150</p></div>
            <span class="cat-left purple">$8 left</span>
          </div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:95%;background:#8b5cf6;"></div></div>
        </div>
        <div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-icon" style="background:#fff7ed;color:#f59e0b;">💡</div>
            <div><p class="cat-name">Bills</p><p class="cat-spent">$880 / $900</p></div>
            <span class="cat-left orange">$20 left</span>
          </div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:98%;background:#f59e0b;"></div></div>
        </div>
        <div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-icon" style="background:#fdf2f8;color:#ec4899;">🛍️</div>
            <div><p class="cat-name">Shopping</p><p class="cat-spent">$340 / $300</p></div>
            <span class="cat-left red">-$40</span>
          </div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:100%;background:#ec4899;"></div></div>
        </div>
        <div class="cat-card">
          <div class="cat-card-top">
            <div class="cat-icon" style="background:#fef3c7;color:#d97706;">🍽️</div>
            <div><p class="cat-name">Dining</p><p class="cat-spent">$121 / $200</p></div>
            <span class="cat-left yellow">$79 left</span>
          </div>
          <div class="cat-bar-track"><div class="cat-bar-fill" style="width:60%;background:#d97706;"></div></div>
        </div>
      </div>
    </div>
  `;
 
  attachNotifToggle();
  document.getElementById("redeemBannerBtn").addEventListener("click", () => { setTab("tab-rewards"); DEMO_MODE ? renderComingSoon("Rewards") : renderRewardsView(); });
}
 
// ==========================================================================
// 6. TRANSACTIONS VIEW
// ==========================================================================
function renderTransactionsView() {
  const transactions = [
    { icon: "🛒", name: "Whole Foods Market", category: "Groceries", date: "May 27", amount: 84.32, status: "within" },
    { icon: "🚗", name: "Uber", category: "Transportation", date: "May 27", amount: 18.50, status: "within" },
    { icon: "🎬", name: "Netflix", category: "Entertainment", date: "May 26", amount: 15.99, status: "within" },
    { icon: "💡", name: "ConEdison", category: "Bills", date: "May 26", amount: 142.00, status: "within" },
    { icon: "🛍️", name: "Zara", category: "Shopping", date: "May 25", amount: 96.40, status: "over" },
    { icon: "🥗", name: "Sweetgreen", category: "Dining", date: "May 25", amount: 22.10, status: "within" },
    { icon: "🛒", name: "Trader Joe's", category: "Groceries", date: "May 24", amount: 62.18, status: "within" },
    { icon: "🚗", name: "Lyft", category: "Transportation", date: "May 23", amount: 11.20, status: "within" },
    { icon: "🎵", name: "Spotify", category: "Entertainment", date: "May 22", amount: 9.99, status: "within" },
    { icon: "📦", name: "Amazon", category: "Shopping", date: "May 21", amount: 54.00, status: "over" },
    { icon: "🌯", name: "Chipotle", category: "Dining", date: "May 20", amount: 14.75, status: "within" },
    { icon: "🛒", name: "Costco", category: "Groceries", date: "May 19", amount: 142.66, status: "within" }
  ];
  const categories = ["All", "Groceries", "Transportation", "Entertainment", "Bills", "Shopping", "Dining"];
  let selectedCat = "All";
  let search = "";
  let dropOpen = false;
 
  function filtered() {
    return transactions.filter(t =>
      (selectedCat === "All" || t.category === selectedCat) &&
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }
 
  function renderList() {
    const list = filtered();
    document.getElementById("txn-count").textContent = `${list.length} of ${transactions.length} shown`;
    document.getElementById("txn-list").innerHTML = list.length === 0
      ? `<p style="text-align:center;color:#9ca3af;padding:40px 0;">No transactions found.</p>`
      : list.map(t => `
        <div class="txn-row">
          <div class="txn-row-left">
            <div class="txn-ico">${t.icon}</div>
            <div>
              <p class="txn-name">${t.name}</p>
              <p class="txn-meta">${t.category} · ${t.date}</p>
            </div>
          </div>
          <div class="txn-row-right">
            <p class="txn-amt">–$${t.amount.toFixed(2)}</p>
            <p class="txn-status ${t.status}">${t.status === "over" ? "Over category" : "Within budget"}</p>
          </div>
        </div>
      `).join("");
  }
 
  function renderDrop() {
    document.getElementById("cat-dropdown").innerHTML = categories.map(c => `
      <div class="drop-item ${c === selectedCat ? "drop-selected" : ""}" data-cat="${c}">
        ${c === selectedCat ? "✓ " : ""}${c}
      </div>
    `).join("");
    document.querySelectorAll(".drop-item").forEach(el => {
      el.addEventListener("click", () => {
        selectedCat = el.dataset.cat;
        document.getElementById("cat-label").textContent = selectedCat;
        dropOpen = false;
        document.getElementById("cat-dropdown").classList.remove("open");
        renderList(); renderDrop();
      });
    });
  }
 
  document.getElementById("main-view-slot").innerHTML = `
    ${renderPageHeader("Transactions")}
    <div class="panel txn-panel">
      <div class="txn-panel-head">
        <div>
          <h3 class="panel-title">Recent transactions</h3>
          <p id="txn-count" class="txn-count"></p>
        </div>
        <div class="txn-controls">
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="txn-search" placeholder="Search merchant" />
          </div>
          <div class="filter-box">
            <button class="filter-toggle" id="filter-toggle">
              <span id="cat-label">All</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="drop-menu" id="cat-dropdown"></div>
          </div>
        </div>
      </div>
      <div id="txn-list"></div>
    </div>
  `;
 
  renderList();
  renderDrop();
  attachNotifToggle();
 
  document.getElementById("txn-search").addEventListener("input", e => { search = e.target.value; renderList(); });
  document.getElementById("filter-toggle").addEventListener("click", e => {
    e.stopPropagation();
    dropOpen = !dropOpen;
    document.getElementById("cat-dropdown").classList.toggle("open", dropOpen);
  });
  document.addEventListener("click", () => {
    dropOpen = false;
    const d = document.getElementById("cat-dropdown");
    if (d) d.classList.remove("open");
  });
}
 
// ==========================================================================
// 7. INSIGHTS VIEW
// ==========================================================================
function renderInsightsView() {
  document.getElementById("main-view-slot").innerHTML = `
    ${renderPageHeader("Insights")}
 
    <div class="insights-top-row" style="display:grid; grid-template-columns:1fr 300px; gap:16px; margin-bottom:16px;">
 
      <div class="panel">
        <div class="insights-head">
          <div>
            <h3 class="panel-title">Spending trend</h3>
            <p class="panel-sub">Budget vs actual this month</p>
          </div>
          <span class="trend-tag">&#x2197; 12% vs last month</span>
        </div>
        <canvas id="lineChart"></canvas>
      </div>
 
      <div class="panel">
        <div class="insights-head">
          <div>
            <h3 class="panel-title">By category</h3>
            <p class="panel-sub">Where your money went</p>
          </div>
        </div>
        <canvas id="donutChart"></canvas>
        <div class="donut-legend">
          <span><i style="background:#10b981"></i>Groceries</span>
          <span><i style="background:#3b82f6"></i>Transportation</span>
          <span><i style="background:#a855f7"></i>Entertainment</span>
          <span><i style="background:#f59e0b"></i>Bills</span>
          <span><i style="background:#ef4444"></i>Shopping</span>
          <span><i style="background:#f97316"></i>Dining</span>
        </div>
      </div>
 
    </div>
 
    <div class="panel" style="margin-bottom:16px;">
      <div class="insights-head">
        <div>
          <h3 class="panel-title">Budget vs actual by category</h3>
          <p class="panel-sub">Spot overspending instantly</p>
        </div>
      </div>
      <canvas id="barChart"></canvas>
    </div>
  `;
 
  attachNotifToggle();
 
  // Destroy any existing Chart instances
  ["lineChart","barChart","donutChart"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const existing = Chart.getChart(el);
      if (existing) existing.destroy();
    }
  });
 
  // LINE CHART
  new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: ["Wk1", "Wk2", "Wk3", "Wk4", "Now"],
      datasets: [
        {
          label: "Budget",
          data: [600, 1200, 1800, 2100, 2400],
          borderColor: "#c4b5fd",
          backgroundColor: "rgba(196,181,253,0.15)",
          fill: true, tension: 0.4,
          pointRadius: 0, pointHoverRadius: 5,
          pointHoverBackgroundColor: "#c4b5fd",
          pointHoverBorderColor: "white",
          pointHoverBorderWidth: 2, borderWidth: 2
        },
        {
          label: "Actual",
          data: [400, 850, 1300, 1800, 2093],
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.08)",
          fill: true, tension: 0.4,
          pointRadius: 0, pointHoverRadius: 5,
          pointHoverBackgroundColor: "#10b981",
          pointHoverBorderColor: "white",
          pointHoverBorderWidth: 2, borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: "white",
          titleColor: "#111827",
          bodyColor: "#6b7280",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          padding: 12, boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => "  " + item.dataset.label + ": $" + item.parsed.y.toLocaleString()
          }
        }
      },
      hover: { mode: "index", intersect: false },
      scales: {
        y: { beginAtZero: true, grid: { color: "#f3f4f6" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } }
      }
    },
    plugins: [{
      id: "crosshair",
      afterDraw(chart) {
        if (chart.tooltip._active && chart.tooltip._active.length) {
          const ctx = chart.ctx;
          const x = chart.tooltip._active[0].element.x;
          const topY = chart.scales.y.top;
          const bottomY = chart.scales.y.bottom;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#d1d5db";
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      }
    }]
  });
 
  // DONUT CHART
  new Chart(document.getElementById("donutChart"), {
    type: "doughnut",
    data: {
      labels: ["Groceries", "Transportation", "Entertainment", "Bills", "Shopping", "Dining"],
      datasets: [{
        data: [289, 30, 26, 142, 150, 37],
        backgroundColor: ["#10b981","#3b82f6","#a855f7","#f59e0b","#ef4444","#f97316"],
        borderWidth: 3,
        borderColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      cutout: "65%",
      plugins: { legend: { display: false } }
    }
  });
 
  // BAR CHART — tight spacing to match template
  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Groceries", "Transportation", "Entertainment", "Bills", "Shopping", "Dining"],
      datasets: [
        {
          label: "Budget",
          data: [500, 200, 150, 200, 100, 100],
          backgroundColor: "#c4b5fd",
          borderRadius: 4,
          categoryPercentage: 0.5,
          barPercentage: 0.9
        },
        {
          label: "Spent",
          data: [289, 30, 26, 142, 150, 37],
          backgroundColor: "#10b981",
          borderRadius: 4,
          categoryPercentage: 0.5,
          barPercentage: 0.9
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true, position: "bottom",
          labels: {
            usePointStyle: true, pointStyle: "circle",
            color: "#6b7280", font: { size: 12 }, padding: 20
          }
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "#f3f4f6" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: "#6b7280", font: { size: 12 } } }
      }
    }
  });
}
 
// ==========================================================================
// 8. REWARDS VIEW
// ==========================================================================
function renderRewardsView() {
  document.getElementById("main-view-slot").innerHTML = `
    ${renderPageHeader("Rewards")}
    <div class="rewards-layout">
      <div class="panel points-panel">
        <div class="points-card">
          <p class="points-label">YOUR POINTS</p>
          <h2 class="points-number">1,240</h2>
          <div class="points-bar-track"><div class="points-bar-fill"></div></div>
          <p class="points-sub">760 pts to next reward tier</p>
        </div>
        <p class="points-desc">Earn points by staying within your monthly budget. Redeem them for grocery cashback, free deliveries, and more.</p>
      </div>
      <div class="panel redeem-panel">
        <div class="redeem-head">
          <h3>Redeem grocery rewards</h3>
          <p>Use your points before they expire</p>
        </div>
        <div class="rewards-grid">
          <div class="reward-item">
            <div class="reward-info">
              <div class="reward-title-row">
                <p class="reward-name">$10 Grocery Cashback</p>
                <span class="badge-popular">Popular</span>
              </div>
              <p class="reward-desc">Apply at checkout on your next grocery run.</p>
              <p class="reward-pts">800 pts</p>
            </div>
            <div class="reward-action">
              <span class="reward-ico">🎁</span>
              <button class="redeem-action-btn">Redeem</button>
            </div>
          </div>
          <div class="reward-item">
            <div class="reward-info">
              <div class="reward-title-row">
                <p class="reward-name">Free Delivery x3</p>
                <span class="badge-new">New</span>
              </div>
              <p class="reward-desc">Three free deliveries from partner stores.</p>
              <p class="reward-pts">500 pts</p>
            </div>
            <div class="reward-action">
              <span class="reward-ico">🎁</span>
              <button class="redeem-action-btn">Redeem</button>
            </div>
          </div>
          <div class="reward-item">
            <div class="reward-info">
              <div class="reward-title-row">
                <p class="reward-name">$25 Whole Foods Voucher</p>
              </div>
              <p class="reward-desc">Redeemable in-store or online instantly.</p>
              <p class="reward-pts">1800 pts</p>
            </div>
            <div class="reward-action">
              <span class="reward-ico" style="opacity:0.3;">🎁</span>
              <button class="locked-btn" disabled>Locked</button>
            </div>
          </div>
          <div class="reward-item">
            <div class="reward-info">
              <div class="reward-title-row">
                <p class="reward-name">5% Off Weekly Shop</p>
              </div>
              <p class="reward-desc">Stack with existing store discounts.</p>
              <p class="reward-pts">1200 pts</p>
            </div>
            <div class="reward-action">
              <span class="reward-ico">🎁</span>
              <button class="redeem-action-btn">Redeem</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  attachNotifToggle();
}
 
// ==========================================================================
// 9. SETTINGS VIEW
// ==========================================================================
function renderSettingsView() {
  const name = state.fullName || "Alex Morgan";
  const email = state.email || "alex@budgetbasket.app";
  const budget = state.monthlyBudget;
 
  document.getElementById("main-view-slot").innerHTML = `
    ${renderPageHeader("Settings")}
    <div class="settings-stack">
 
      <div class="panel settings-panel">
        <h3 class="settings-section-title">Profile</h3>
        <p class="settings-section-sub">Your account details</p>
        <div class="settings-profile-row">
          <div class="avatar avatar-lg">${name.charAt(0).toUpperCase()}</div>
          <div>
            <p class="profile-name">${name}</p>
            <p class="profile-email">${email}</p>
          </div>
        </div>
      </div>
 
      <div class="panel settings-panel">
        <div class="settings-budget-head">
          <div>
            <h3 class="settings-section-title">Monthly budget</h3>
            <p class="settings-section-sub">Resets on the 1st of each month</p>
          </div>
          <button class="edit-link" id="editBudgetBtn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        </div>
        <div id="budget-display">
          <h2 class="budget-display-val">$${budget.toLocaleString()}</h2>
        </div>
      </div>
 
      <div class="panel settings-panel">
        <h3 class="settings-section-title">Preferences</h3>
        <p class="settings-section-sub">Manage notifications and account actions</p>
        <div class="prefs-grid">
          <div class="pref-card">
            <p class="pref-title">Notifications</p>
            <p class="pref-sub">Budget alerts and weekly summaries</p>
          </div>
          <div class="pref-card pref-signout" id="signOutBtn">
            <p class="pref-title">Sign out</p>
            <p class="pref-sub">End your session on this device</p>
          </div>
        </div>
      </div>
    </div>
 
    <div class="toast" id="toast">
      <span class="toast-check">✓</span>
      Monthly budget updated
    </div>
  `;
 
  attachNotifToggle();
 
  document.getElementById("editBudgetBtn").addEventListener("click", () => {
    document.getElementById("budget-display").innerHTML = `
      <div class="budget-edit-row">
        <div class="budget-input-wrap">
          <span class="budget-dollar">$</span>
          <input type="number" id="budgetInput" value="${state.monthlyBudget}" />
        </div>
        <button class="save-budget-btn" id="saveBudgetBtn">✓ Save</button>
      </div>
    `;
    document.getElementById("budgetInput").focus();
    document.getElementById("saveBudgetBtn").addEventListener("click", () => {
      const val = parseFloat(document.getElementById("budgetInput").value);
      if (!isNaN(val) && val >= 0) state.monthlyBudget = val;
      renderSettingsView();
      setTimeout(() => {
        const toast = document.getElementById("toast");
        if (toast) {
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 3000);
        }
      }, 100);
    });
  });
 
  document.getElementById("signOutBtn").addEventListener("click", () => {
    state.email = "";
    state.fullName = "";
    renderEmailScreen();
  });
}
 
// Boot
renderEmailScreen();