// Screen elements
const loadingScreen = document.getElementById("loading");
const registerScreen = document.getElementById("register");
const successScreen = document.getElementById("success");

// Form elements
const form = document.getElementById("form");
const codeInput = document.getElementById("code");
const errorText = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoading = submitBtn.querySelector(".btn-loading");

function showScreen(screen) {
  loadingScreen.classList.remove("active");
  registerScreen.classList.remove("active");
  successScreen.classList.remove("active");

  screen.classList.add("active");
}

function setButtonLoading(loading) {
  submitBtn.disabled = loading;
  btnText.style.display = loading ? "none" : "inline";
  btnLoading.style.display = loading ? "inline-flex" : "none";
}

showScreen(loadingScreen);
setButtonLoading(false);
errorText.textContent = "";

// Receive messages from backend
window.api.onBackendMsg((msg) => {
    if (msg.type === "error") {
    setButtonLoading(false);
    showScreen(registerScreen);

    errorText.textContent = msg.message || "Failed to connect to server.";

    return;
  }
  
  if (msg.type === "code_exists") {
    if (msg.exists) {
      showScreen(successScreen);
    } else {
      showScreen(registerScreen);
    }
  }

  if (msg.type === "validation_result") {
    setButtonLoading(false);

    if (msg.success) {
      errorText.textContent = "";
      showScreen(successScreen);

      setTimeout(() => {
        window.close();
      }, 3000);
    } else {
      errorText.textContent = "Invalid enrollment code.";
    }
  }
});

window.api.sendReady();

// Handle form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const code = codeInput.value.trim();

  if (!code) {
    errorText.textContent = "Enrollment code is required.";
    return;
  }

  errorText.textContent = "";
  setButtonLoading(true);

  window.api.sendCode(code);
});
