/* =========================================================
   BCRLS FORM SUBMIT
   Wires every static form to the public API.

   - one capture-phase submit listener on document, so it runs
     before (and stops) the fake per-page handlers and the native
     GET submit that used to reload the page
   - validates with the browser's own constraint validation
   - POSTs the form as JSON to /api/forms/<key>
   - a hidden honeypot field is added by JS (never in the HTML)
   - disabled + loading state while the request is in flight
   - success and error text appears in the same message element
     and with the same styling the page already uses
   - if the API is unreachable the user's input is kept and a
     friendly error is shown
   ========================================================= */

(function () {
    "use strict";

    if (window.__bcrlsFormSubmit) return;
    window.__bcrlsFormSubmit = true;

    var API_BASE = "/api/forms/";

    var HONEYPOT_NAME = "website"; /* server ignores the row if it is filled */

    var NETWORK_ERROR =
        "Sorry, we could not reach the server. " +
        "Your answers are still here - please try again in a moment.";

    var FALLBACK_ERROR =
        "Sorry, your submission could not be sent. Please check the form and try again.";

    /* form element id -> API key + the message element the page already has */
    var FORMS = [
        { id: "contactForm", key: "contact", message: "#formMessage",
          success: "Thank you for contacting BCRLS. Your message has been received. We will get back to you as soon as possible." },
        { id: "connectionForm", key: "connection", message: null,
          success: "Thank you for reaching out to BCRLS. Your interest has been received and we will get back to you soon." },
        { id: "newsletterForm", key: "newsletter", message: null,
          success: "Thank you for subscribing to the BCRLS newsletter." },
        { id: "memberForm", key: "member", message: "#memberFormMessage",
          success: "Thank you for your interest in BCRLS. Your membership request has been received." },
        { id: "fellowForm", key: "fellow", message: "#fellowMessage",
          success: "Thank you. Your application has been submitted successfully." },
        { id: "internshipForm", key: "internship", message: "#internshipMessage",
          success: "Thank you. Your application has been submitted successfully." },
        { id: "partnerForm", key: "partner", message: "#partnerMessageBox",
          success: "Thank you. Your message has been submitted successfully." },
        { id: "volunteerForm", key: "volunteer", message: "#volunteerMessage",
          success: "Thank you. Your application has been submitted successfully." }
    ];

    /* field names the server should see, whatever the markup calls them */
    var RENAME = { newsletterEmail: "email" };

    var byId = {};
    FORMS.forEach(function (spec) { byId[spec.id] = spec; });

    /* ---------------------------------------------------- helpers */

    function whenReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    function fieldName(el) {
        var name = el.name || el.id || "";
        return RENAME[name] || name;
    }

    function push(data, key, value) {
        if (value === undefined || value === null || value === "") return;
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }

    /* Reads the form the way a browser would serialise it, plus the
       current page path so the admin can group submissions. */
    function collect(form) {
        var data = {};
        var controls = form.querySelectorAll("input, select, textarea");
        var i;
        var el;
        var type;

        for (i = 0; i < controls.length; i += 1) {
            el = controls[i];
            type = (el.type || el.tagName.toLowerCase()).toLowerCase();

            if (el.disabled) continue;
            if (type === "submit" || type === "button" || type === "reset") continue;
            if (type === "file") {
                if (el.files && el.files.length) push(data, fieldName(el), el.files[0].name);
                continue;
            }
            if ((type === "checkbox" || type === "radio") && !el.checked) continue;

            if (el.tagName === "SELECT" && el.multiple) {
                var picked = Array.prototype.filter
                    .call(el.options, function (opt) { return opt.selected; })
                    .map(function (opt) { return opt.value; });
                if (picked.length) push(data, fieldName(el), picked);
            } else {
                push(data, fieldName(el), el.value);
            }
        }

        data.page = window.location.pathname;
        return data;
    }

    /* ----------------------------------------- message element */

    function ensureMessage(form, spec) {
        if (spec.message) {
            var existing = document.querySelector(spec.message);
            if (existing) return existing;
        }

        /* Pages without a message element (connection + newsletter on
           index.html) get one placed after the form, styled like the
           message boxes the other pages already ship. */
        var created = document.createElement("div");
        created.className = "form-message bcrls-form-message";
        created.setAttribute("role", "status");
        created.setAttribute("aria-live", "polite");
        created.style.display = "none";
        created.style.marginTop = "12px";
        created.style.padding = "12px 14px";
        created.style.borderRadius = "10px";
        created.style.fontSize = "12px";
        created.style.lineHeight = "1.6";
        created.style.background = "#edf7f2";
        created.style.color = "#197052";

        form.parentNode.insertBefore(created, form.nextSibling);
        spec.messageElement = created;
        return created;
    }

    function showMessage(el, text, kind) {
        if (!el) return;

        el.textContent = text;
        el.classList.add("show");
        el.style.display = "block";

        if (kind === "error") {
            el.style.background = "#fdecea";
            el.style.color = "#a12b24";
        } else {
            el.style.background = "#edf7f2";
            el.style.color = "#197052";
        }

        try {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (err) {
            el.scrollIntoView();
        }
    }

    /* ------------------------------------------------- honeypot */

    function ensureHoneypot(form) {
        var input = form.querySelector('input[name="' + HONEYPOT_NAME + '"]');
        if (input) return input;

        input = document.createElement("input");
        input.type = "text";
        input.name = HONEYPOT_NAME;
        input.value = "";
        input.setAttribute("autocomplete", "off");
        input.setAttribute("tabindex", "-1");
        input.setAttribute("aria-hidden", "true");
        /* visually hidden but still posted */
        input.style.position = "absolute";
        input.style.left = "-9999px";
        input.style.top = "auto";
        input.style.width = "1px";
        input.style.height = "1px";
        input.style.opacity = "0";

        form.appendChild(input);
        return input;
    }

    /* ------------------------------------------- loading state */

    function setBusy(form, busy) {
        var button = form.querySelector('button[type="submit"], input[type="submit"]');

        form.setAttribute("aria-busy", busy ? "true" : "false");

        if (!button) return;

        if (busy) {
            button.dataset.bcrlsLabel = button.innerHTML;
            button.disabled = true;
            button.setAttribute("aria-disabled", "true");
            button.innerHTML = "Sending...";
        } else if (button.dataset.bcrlsLabel !== undefined) {
            button.innerHTML = button.dataset.bcrlsLabel;
            delete button.dataset.bcrlsLabel;
            button.disabled = false;
            button.removeAttribute("aria-disabled");
        }
    }

    /* ------------------------------------------------ submit */

    function errorText(body) {
        if (!body || !body.error) return FALLBACK_ERROR;

        if (Array.isArray(body.error.details) && body.error.details.length) {
            return body.error.details
                .map(function (issue) { return issue.message; })
                .filter(Boolean)
                .join(" ");
        }

        return body.error.message || FALLBACK_ERROR;
    }

    function handleSubmit(form, spec) {
        if (form.getAttribute("aria-busy") === "true") return;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var message = spec.messageElement || ensureMessage(form, spec);

        setBusy(form, true);

        fetch(API_BASE + spec.key, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collect(form))
        })
            .then(function (res) {
                return res
                    .json()
                    .catch(function () { return null; })
                    .then(function (body) { return { ok: res.ok, body: body }; });
            })
            .then(function (result) {
                if (result.ok) {
                    showMessage(message, spec.success, "success");
                    form.reset();
                } else {
                    /* the answers stay in the form so they can be retried */
                    showMessage(message, errorText(result.body), "error");
                }
            })
            .catch(function () {
                showMessage(message, NETWORK_ERROR, "error");
            })
            .then(function () {
                setBusy(form, false);
            });
    }

    /* ------------------------------------------------ wiring */

    function specFor(form) {
        if (!form || form.tagName !== "FORM") return null;
        return byId[form.id] || null;
    }

    /*
      Capture phase on document: this runs before the submit event reaches
      the form itself, so preventDefault + stopPropagation here silences
      every per-page fake handler and the native GET submit in one place.
    */
    document.addEventListener(
        "submit",
        function (event) {
            var spec = specFor(event.target);
            if (!spec) return;

            event.preventDefault();
            event.stopPropagation();
            handleSubmit(event.target, spec);
        },
        true
    );

    whenReady(function () {
        FORMS.forEach(function (spec) {
            var form = document.getElementById(spec.id);
            if (!form) return;
            ensureHoneypot(form);
            /* pre-create the message element so first paint is stable */
            ensureMessage(form, spec);
        });
    });
})();
