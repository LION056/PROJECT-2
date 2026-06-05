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
  
  function renderProgress(currentStep) {
    return `
      <div class="progress">
        <div class="${currentStep >= 1 ? "active" : ""}">
          Email
        </div>
  
        <div class="${currentStep >= 2 ? "active" : ""}">
          Verify
        </div>
  
        <div class="${currentStep >= 3 ? "active" : ""}">
          Dashboard
        </div>
      </div>
    `;
  }
  
  function renderEmailScreen() {
  
    document.getElementById("screen-container").innerHTML = `
      ${renderProgress(1)}
  
      <h2>Welcome</h2>
  
      <input
        type="email"
        id="email"
        placeholder="Email Address"
      >
  
      <button
        id="continueBtn"
        disabled
      >
        Continue
      </button>
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
      ${renderProgress(2)}
  
      <h2>Verify Your Email</h2>
  
      <p>Enter the 6-digit code sent to your email</p>
  
      <div id="message"></div>
  
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
  
    const otpInputs =
      document.querySelectorAll(".otp-input");
  
    const verifyBtn =
      document.getElementById("verifyBtn");
      
      verifyBtn.disabled = true;

    const resendBtn =
      document.getElementById("resendBtn");
  
    const message =
      document.getElementById("message");
      let countdown = 30;

      resendBtn.disabled = true;
      
      resendBtn.textContent =
        `Resend in ${countdown}s`;
      
      const timer = setInterval(() => {
      
        countdown--;
      
        resendBtn.textContent =
          `Resend in ${countdown}s`;
      
        if (countdown <= 0) {
      
          clearInterval(timer);
      
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
     ${renderProgress(2)}

  
      <h2>Complete Your Profile</h2>
  
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
  
    document.getElementById("screen-container").innerHTML = `
      ${renderProgress(3)}
  
      <h2>Dashboard</h2>

      <div id="message" class="success">
      ✓ Authentication Successful
    </div>
  
      <p>
        Welcome,
        ${state.fullName || state.email}
      </p>

      <div class="dashboard-info">
  
      <p>
        <strong>Status:</strong> Active
      </p>

      <p>
        <strong>Last Login:</strong> Just now
      </p>

      </div>
    `;
  
  }
  
  renderEmailScreen();