import { login, register } from "../script.js";

const loginForm = document.querySelector("[data-login-form]");
const registerForm = document.querySelector("[data-register-form]");

const loginError = document.querySelector("[data-login-error]");
const registerError = document.querySelector("[data-register-error]");

// ---------- login ----------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginError) loginError.textContent = "";

    const fd = new FormData(loginForm);

    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();

    if (!email || !password) {
      loginError.textContent = "Email and password are required.";
      return;
    }

    try {
      await login({ email: email, password: password });
      window.location.href = "../index.html";
    } catch (err) {
      loginError.textContent =
        err && err.message ? err.message : "Login failed";
    }
  });
}

// ---------- register ----------
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (registerError) registerError.textContent = "";

    const fd = new FormData(registerForm);

    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const avatarUrl = String(fd.get("avatar") || "").trim();

    if (!name || !email || !password) {
      registerError.textContent = "All fields except avatar are required.";
      return;
    }

    try {
      await register({
        name: name,
        email: email,
        password: password,
        avatar: avatarUrl ? { url: avatarUrl } : undefined,
      });

      // Auto-login after register (optional but nice)
      await login({ email: email, password: password });

      window.location.href = "../index.html";
    } catch (err) {
      registerError.textContent =
        err && err.message ? err.message : "Registration failed";
    }
  });
}
