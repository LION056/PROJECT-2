const GENERATED_OTP = "123456";
const EXISTING_USERS = [
    "obutedaniel2@gmail.com",
    "topshotta56@gmail.com",
    "lion82@gmail.com"
  ];

  const state = {
    email: "",
    fullName: ""
  };
  
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  
  function renderEmailScreen() {
  
    document.getElementById("screen-container").innerHTML = `
      
  
     <div class="auth-logo">
    <div class="logo-icon">✦</div>
    <h1>BudgetBasket</h1>
  </div>

   <div class="auth-box">

    <h2>Welcome to BudgetBasket</h2>

    <p class="subtitle">
      Enter your email to sign in or create an account.
    </p>

    <label>Email</label>

    <input
      type="email"
      id="email"
      placeholder="you@company.com"
    >

    <button
      id="continueBtn"
      disabled
    >
      Continue ✉️
    </button>

    <p class="helper-text">
      No password needed. We'll email you a one-time code.
    </p>

  </div>
  </div>

  <p class="footer-text">
    By continuing, you agree to our Terms and Privacy Policy.
  </p>
    `;
  
    const emailInput = document.getElementById("email");
    const continueBtn = document.getElementById("continueBtn");
  
    emailInput.addEventListener("input", () => {
  
      const email = emailInput.value.trim();
  
      if (validateEmail(email)) {
  
        continueBtn.disabled = false;
        emailInput.style.border =
          "2px solid green";
  
      } else {
  
        continueBtn.disabled = true;
        emailInput.style.border =
          "2px solid red";
  
      }
  
    });
  
    continueBtn.addEventListener("click", () => {
  
      state.email =
        emailInput.value.trim();
  
      continueBtn.textContent =
        "Loading...";
  
      continueBtn.disabled = true;
  
      setTimeout(() => {
  
        renderOtpScreen();
  
      }, 1500);
  
    });
  
  }
  
  function renderOtpScreen() {
  
    document.getElementById("screen-container").innerHTML = `
      
  
      <h2>Verify Your Email</h2>
  
      <p>Enter the 6-digit code sent to your email</p>

      <div id="message"></div>

      <p id="timer" class="timer">
        Code expires in 30s
     </p>

      <div class="otp-container">
        <input maxlength="1" class="otp-input">
        <input maxlength="1" class="otp-input">
        <input maxlength="1" class="otp-input">
        <input maxlength="1" class="otp-input">
        <input maxlength="1" class="otp-input">
        <input maxlength="1" class="otp-input">
      </div>
  
      <button id="verifyBtn">
        Verify Code
      </button>
  
      <button id="resendBtn">
        Resend Code
      </button>
    `;
  

    const message =
     document.getElementById("message");

    const timer =
     document.getElementById("timer");

    let countdown = 30;

    const otpInputs =
      document.querySelectorAll(".otp-input");
  
    const verifyBtn =
      document.getElementById("verifyBtn");
      
      verifyBtn.disabled = true;

    const resendBtn =
      document.getElementById("resendBtn");

      resendBtn.disabled = true;
      
      resendBtn.textContent =
        `Resend in ${countdown}s`;
      
      const countdownInterval = setInterval(() => {
      
        countdown--;

        timer.textContent = 
         `Code expires in ${countdown}s`;
      
        resendBtn.textContent =
          `Resend in ${countdown}s`;
      
        if (countdown <= 0) {
      
          clearInterval(countdownInterval);

          message.textContent = 
           "x Verification code expired";

          message.className = "error"
      
          resendBtn.disabled = false;
      
          resendBtn.textContent =
            "Resend Code";
      
        }
      
      }, 1000);
      
    otpInputs[0].focus();
  
    otpInputs.forEach((input, index) => {
  
      input.addEventListener("input", () => {

        input.value =
          input.value.replace(/[^0-9]/g, "");
    
        if (
          input.value &&
          index < otpInputs.length - 1
        ) {
          otpInputs[index + 1].focus();
        }
    
        const otpValue = [...otpInputs]
          .map(input => input.value)
          .join("");
    
        verifyBtn.disabled =
          otpValue.length !== 6;

        if(otpValue.length === 6) {

          verifyBtn.click();
        }
    
      });
    
    });
      
  
    verifyBtn.addEventListener("click", () => {
  
      verifyBtn.textContent =
        "Verifying...";
      
      verifyBtn.disabled = true;
  
      setTimeout(() => {
  
        let enteredOtp = "";
  
        otpInputs.forEach((input) => {
          enteredOtp += input.value;
        });
  
        if (enteredOtp === GENERATED_OTP) {
  
          message.textContent =
            "✓ Code verified successfully";
  
          message.className =
            "success";
  
          const existingUser =
            EXISTING_USERS.includes(
              state.email
            );
  
          setTimeout(() => {
  
            if (existingUser) {
  
              renderDashboard();
  
            } else {
  
              renderOnboardingScreen();
  
            }
  
          }, 1000);
  
        } else {
  
          message.textContent =
            "✕ Incorrect verification code";
  
          message.className =
            "error";
  
          verifyBtn.textContent =
            "Verify Code";
  
          verifyBtn.disabled =
            false;
  
        }
  
      }, 1500);
  
    });
  
    resendBtn.addEventListener("click", () => {
  
      message.textContent =
        "✓ Verification code resent";
  
      message.className =
        "success";
  
    });
  
  }
  
  function renderOnboardingScreen() {
  
    document.getElementById("screen-container").innerHTML = `
   

  
      <h2>Complete Your Profile</h2>

      <div id="message"></div>
  
      <input
        type="text"
        id="fullName"
        placeholder="Full Name"
      >
  
      <button id="finishBtn">
        Continue
      </button>
    `;

    const fullNameInput =
      document.getElementById("fullName");

    const finishBtn =
      document.getElementById("finishBtn");

    const message =
      document.getElementById("message");
  
    finishBtn.addEventListener("click", () => {
  
      const fullName =
        fullNameInput.value.trim();
  
      if (fullName === "") {
  
        message.textContent =
          "Please enter your full name";

        message.className = "error";
  
        return;
  
      }
  
      state.fullName = fullName;
  
      renderDashboard();
  
    });
  
  }
  
  function renderDashboard() {
  
    document.querySelector(".container").innerHTML = `
      <div class="dashboard-layout">

  <div class="sidebar">

    <h2>BudgetBasket</h2>

     <ul>
  <li class="active">📊 Dashboard</li>

  <li id="transactionsTab"> 💳 Transactions</li>

  <li id="insightsTab">📈 Insights</li>

  <li id="rewardsTab"> 🎁 Rewards</li>

  <li id="setttingsTab">⚙️ Settings</li>

  <li id="logoutBtn"> 🚪 Logout</li>
</ul>

</div>

  <main class="dashboard-main">

    <h1>Dashboard</h1>

    <p class="welcome-text">
      Welcome, ${state.fullName || state.email}
    </p>

    <div class="welcome-banner">

  <h2>You stayed within budget this week 🎉</h2>

  <p>
    You earned +120 grocery points this month.
  </p>

</div>

    <div class="stats-grid">

      <div class="stat-card">
        <h4>Account Balance</h4>
        <h3>$8,420</h3>
      </div>

      <div class="stat-card">
        <h4>Monthly Budget</h4>
        <h3>$2,400</h3>
      </div>

      <div class="stat-card">
        <h4>Remaining Budget</h4>
        <h3>$307</h3>
      </div>

      <div class="stat-card">
        <h4>Reward Points</h4>
        <h3>1,240</h3>
      </div>
      </div>

      <div class="budget-health">

       <h3>Budget Health</h3>

      <div class="progress-bar">
       <div class="progress-fill"></div>
     </div>

    <p>$2,093 of $2,400 spent this month</p>

    </div>

    <div class="categories">

    <h3>Top Categories</h3>

    <div class="category-item">
     <span>🍔 Food</span>
     <span>$520</span>
    </div>

    <div class="category-item">
     <span>🚗 Transport</span>
     <span>$310</span>
   </div>

    <div class="category-item">
     <span>🎬 Entertainment</span>
     <span>$240</span>
    </div>
    </div>

     <div class="transactions">

    <h3>Recent Transactions</h3>

    <div class="transaction-item">
     <span>🍔 McDonald's</span>
     <span class="expense">-$25</span>
    </div>

    <div class="transaction-item">
     <span>⛽ Shell</span>
     <span class="expense">-$45</span>
    </div>

    <div class="transaction-item">
     <span>💰 Salary</span>
     <span class="income">+$1,200</span>
    </div>

    </div>
    </main>

    </div>
  `;

  console.log(document.getElementById("logoutBtn"));

  document
  .getElementById("logoutBtn")
  .addEventListener("click", () => {

  console.log("Logout clicked");

    state.email = "";
    state.fullName = "";

    document.querySelector(".container").innerHTML = `
    <div class="auth-card">
      <div id="screen-container"></div>
    </div>
  
    <div id="message"></div>
  `;
  
  renderEmailScreen();

//   });
//   document
//   .getElementById("transactionsTab")
//   .addEventListener("click", () => {

//     alert("Transactions page coming soon");

//   });

// document
//   .getElementById("insightsTab")
//   .addEventListener("click", () => {

//     alert("Insights page coming soon");

//   });

// document
//   .getElementById("rewardsTab")
//   .addEventListener("click", () => {

//     alert("Rewards page coming soon");


// document
//   .getElementById("settingsTab")
//   .addEventListener("click", () => {

//     alert("Settings page coming soon");

  });
} // 

renderEmailScreen();


