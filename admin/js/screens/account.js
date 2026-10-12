/*
  Account screen: who you are signed in as, and the change-password form
  (POST /api/auth/password, minimum 10 characters).
*/

import api from "../api.js";
import * as ui from "../ui.js";

export async function renderAccount(container) {
  container.replaceChildren(ui.loadingNode());

  let admin = null;
  try {
    const result = await api.me();
    admin = (result && result.admin) || null;
  } catch (err) {
    container.replaceChildren(ui.errorNode(err.message || "Could not load your account."));
    return;
  }

  document.title = "Account · BCRLS Admin";
  container.replaceChildren();

  const head = ui.make("header", "page-head");
  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const dash = ui.make("a", "", "Dashboard");
  dash.href = "#/";
  crumbs.appendChild(dash);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(ui.make("span", "", "Account"));
  head.appendChild(crumbs);
  head.appendChild(ui.make("h1", "", "Account"));
  container.appendChild(head);

  /* ------------------------------------------------------------ who */

  const card = ui.make("section", "detail-card");
  card.appendChild(ui.make("h2", "", "Signed in as"));
  const details = ui.make("dl", "detail-list");
  [
    ["Name", admin.name || "—"],
    ["E-mail", admin.email || "—"],
    ["Role", admin.role || "—"],
  ].forEach(function (pair) {
    details.appendChild(ui.make("dt", "", pair[0]));
    details.appendChild(ui.make("dd", "", pair[1]));
  });
  card.appendChild(details);
  container.appendChild(card);

  /* -------------------------------------------------- change password */

  const form = ui.make("form", "item-form account-form");
  form.noValidate = true;
  form.appendChild(ui.make("h2", "", "Change password"));

  const summary = ui.make("p", "form-error-summary");
  summary.setAttribute("role", "alert");
  summary.hidden = true;
  form.appendChild(summary);

  const current = passwordField("currentPassword", "Current password", "current-password");
  const next = passwordField("newPassword", "New password", "new-password");
  const confirm = passwordField("confirmPassword", "Repeat new password", "new-password");

  form.appendChild(current.wrap);
  form.appendChild(next.wrap);
  form.appendChild(confirm.wrap);

  /* strength meter */
  const meter = ui.make("div", "strength");
  const meterBar = ui.make("span", "strength-bar");
  const meterLabel = ui.make("span", "strength-label", "Too short");
  meter.appendChild(meterBar);
  meter.appendChild(meterLabel);
  next.wrap.insertBefore(meter, next.hint);

  const hints = ui.make("ul", "strength-hints");
  const hintRules = [
    { label: "At least 10 characters", test: (v) => v.length >= 10 },
    { label: "Upper and lower case", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
    { label: "At least one number", test: (v) => /\d/.test(v) },
    { label: "At least one symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];
  const hintItems = hintRules.map(function (rule) {
    const li = ui.make("li", "", rule.label);
    hints.appendChild(li);
    return { node: li, rule: rule };
  });
  next.wrap.insertBefore(hints, meter);

  const actions = ui.make("div", "form-actions");
  const save = ui.make("button", "btn btn-primary", "Update password");
  save.type = "submit";
  actions.appendChild(save);
  form.appendChild(actions);
  container.appendChild(form);

  function evaluate() {
    const value = next.input.value;
    let passed = 0;
    hintItems.forEach(function (entry) {
      const ok = entry.rule.test(value);
      entry.node.classList.toggle("is-ok", ok);
      if (ok) passed += 1;
    });

    const ratio = value ? passed / hintRules.length : 0;
    meterBar.style.width = Math.round(ratio * 100) + "%";
    meter.className = "strength strength-" + (value ? Math.min(4, passed) : 0);
    meterLabel.textContent = ["Too short", "Weak", "Fair", "Good", "Strong"][
      value ? Math.min(4, passed) : 0
    ];
  }

  next.input.addEventListener("input", evaluate);
  evaluate();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    summary.hidden = true;
    summary.textContent = "";
    current.clearError();
    next.clearError();
    confirm.clearError();

    const secret = next.input.value;

    if (!current.input.value) {
      current.showError("Enter your current password.");
      current.input.focus();
      return;
    }
    if (secret.length < 10) {
      next.showError("The new password must be at least 10 characters.");
      next.input.focus();
      return;
    }
    if (secret !== confirm.input.value) {
      confirm.showError("The two passwords do not match.");
      confirm.input.focus();
      return;
    }

    save.disabled = true;
    const label = save.textContent;
    save.textContent = "Updating…";

    try {
      await api.changePassword(current.input.value, secret);
      form.reset();
      evaluate();
      ui.toast("Password updated", "success");
    } catch (err) {
      const message = (err.details || []).length
        ? err.details.map((d) => d.message).join("; ")
        : err.message;

      if (/current password/i.test(err.message || "")) {
        current.showError(err.message);
        current.input.focus();
      } else if (err.fieldMessage && err.fieldMessage("newPassword")) {
        next.showError(err.fieldMessage("newPassword"));
        next.input.focus();
      } else {
        summary.textContent = message || "Could not change the password.";
        summary.hidden = false;
      }
      ui.toast(err.message || "Could not change the password", "error");
    } finally {
      save.disabled = false;
      save.textContent = label;
    }
  });
}

function passwordField(name, label, autocomplete) {
  const wrap = ui.make("div", "field");
  const labelEl = ui.make("label", "field-label", label);
  const id = "f-" + name;
  labelEl.htmlFor = id;

  const input = document.createElement("input");
  input.type = "password";
  input.id = id;
  input.name = name;
  input.className = "input";
  input.setAttribute("autocomplete", autocomplete);
  input.required = true;

  const hint = ui.make("p", "field-hint");
  hint.id = id + "-hint";
  if (name === "newPassword") {
    hint.textContent = "At least 10 characters. It is stored only as a salted hash.";
    input.setAttribute("aria-describedby", hint.id);
  }

  const error = ui.make("p", "field-error");
  error.id = id + "-error";
  error.hidden = true;

  wrap.appendChild(labelEl);
  wrap.appendChild(input);
  if (name === "newPassword") wrap.appendChild(hint);
  wrap.appendChild(error);

  return {
    wrap: wrap,
    input: input,
    hint: hint,
    showError: function (message) {
      error.textContent = message;
      error.hidden = false;
      wrap.classList.add("has-error");
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", error.id);
    },
    clearError: function () {
      error.textContent = "";
      error.hidden = true;
      wrap.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
      if (name === "newPassword") input.setAttribute("aria-describedby", hint.id);
      else input.removeAttribute("aria-describedby");
    },
  };
}
