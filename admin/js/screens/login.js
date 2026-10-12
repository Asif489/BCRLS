/*
  Login screen: e-mail + password against POST /api/auth/login.

  The token is written to sessionStorage by setSession() and the password
  itself is never stored, logged or prefilled anywhere.
*/

import api, { setSession } from "../api.js";
import * as ui from "../ui.js";

export function mountLogin({ root, onSignedIn }) {
  const form = root.querySelector("#loginForm");
  const email = root.querySelector("#loginEmail");
  const password = root.querySelector("#loginPassword");
  const errorBox = root.querySelector("#loginError");
  const submit = root.querySelector("#loginSubmit");
  const title = root.querySelector("#loginTitle");
  const switchLine = root.querySelector("#loginSwitch");
  const confirmField = root.querySelector("#signupConfirmField");
  const confirmPassword = root.querySelector("#signupConfirmPassword");
  let mode = "login";

  function setMode(nextMode) {
    mode = nextMode;
    const signup = mode === "signup";
    title.textContent = signup ? "Create admin account" : "Sign in";
    submit.textContent = signup ? "Create account" : "Sign in";
    password.autocomplete = signup ? "new-password" : "current-password";
    confirmField.hidden = !signup;
    confirmPassword.required = signup;
    switchLine.innerHTML = signup
      ? 'Already have an account? <button class="link-button" id="showLogin" type="button">Sign in</button>'
      : 'Need an admin account? <button class="link-button" id="showSignup" type="button">Sign up</button>';
    const toggle = switchLine.querySelector("button");
    toggle.addEventListener("click", function () {
      setMode(signup ? "login" : "signup");
      showError("");
      form.reset();
      email.focus();
    });
    showError("");
  }

  function showError(message) {
    errorBox.textContent = message || "";
    errorBox.hidden = !message;
    if (message) {
      email.setAttribute("aria-invalid", "true");
      password.setAttribute("aria-invalid", "true");
    } else {
      email.removeAttribute("aria-invalid");
      password.removeAttribute("aria-invalid");
    }
  }

  function focusFirstField() {
    window.setTimeout(function () {
      email.focus();
    }, 0);
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");

    const address = email.value.trim();
    const secret = password.value;

    if (!address || !secret) {
      showError("Enter your e-mail and password.");
      (!address ? email : password).focus();
      return;
    }

    if (mode === "signup") {
      if (secret.length < 10) {
        showError("Use a password with at least 10 characters.");
        password.focus();
        return;
      }
      if (secret !== confirmPassword.value) {
        showError("The passwords do not match.");
        confirmPassword.focus();
        return;
      }
    }

    submit.disabled = true;
    const originalLabel = submit.textContent;
    submit.textContent = mode === "signup" ? "Creating account…" : "Signing in…";

    try {
      const session = mode === "signup"
        ? await api.signup(address, secret)
        : await api.login(address, secret);
      password.value = ""; /* the password leaves memory as soon as it is used */
      form.reset();

      const admin = session && session.admin ? session.admin : null;
      /* the token goes to sessionStorage only - the password is never kept */
      setSession(session && session.token ? session.token : "", admin);

      onSignedIn(admin);
    } catch (err) {
      showError(err.message || "Sign-in failed.");
      if (err.rateLimited) {
        ui.toast("Too many sign-in attempts. Try again in a few minutes.", "warn");
      }
      password.value = "";
      password.focus();
    } finally {
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  });

  /* Typing clears a stale error. */
  [email, password].forEach(function (input) {
    input.addEventListener("input", function () {
      if (!errorBox.hidden) showError("");
    });
  });

  setMode("login");

  return { focusFirstField: focusFirstField };
}
