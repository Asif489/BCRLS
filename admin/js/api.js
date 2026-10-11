/*
  Thin fetch wrapper for the admin API.

  - the JWT lives in sessionStorage only (cleared when the tab closes)
  - the password is never stored anywhere
  - 401 on an authenticated call means the session is gone: the token is
    dropped and an `admin:session-expired` event lets the router show the
    sign-in screen with the "session expired" notice
  - errors are normalised into ApiError { message, status, details, rateLimited }
    where details is the server's [{ path, message }] validation array
*/

const TOKEN_KEY = "bcrls.admin.token";
const USER_KEY = "bcrls.admin.user";

/* Mirrors server/src/lib/storage.js + the multer limit in routes/uploads.js. */
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message || "Request failed");
    this.name = "ApiError";
    this.status = options.status || 0;
    this.details = Array.isArray(options.details) ? options.details : [];
    this.rateLimited = Boolean(options.rateLimited);
  }

  /* First validation message that belongs to `path` ("title", "detail.speakers"). */
  fieldMessage(path) {
    const wanted = ["data." + path, path];
    for (const candidate of wanted) {
      const hit = this.details.find((d) => d && d.path === candidate);
      if (hit) return hit.message;
    }
    return null;
  }
}

/* ------------------------------------------------------------ session */

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (err) {
    return null;
  }
}

export function getUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function setSession(token, user) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user || null));
  } catch (err) {
    /* private mode: the panel simply signs out on reload */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (err) {
    /* ignore */
  }
}

/* ------------------------------------------------------------- request */

async function request(path, options = {}) {
  const method = options.method || "GET";
  const headers = Object.assign({}, options.headers);
  let body;

  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const authenticated = options.auth !== false;
  const token = getToken();
  if (authenticated && token) headers.Authorization = "Bearer " + token;

  let response;
  try {
    response = await fetch(path, { method, headers, body });
  } catch (err) {
    throw new ApiError("Cannot reach the server. Check your connection and try again.");
  }

  let payload = null;
  const raw = await response.text();
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch (err) {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      (payload && payload.error && payload.error.message) ||
      "Request failed (" + response.status + ")";
    const details = (payload && payload.error && payload.error.details) || [];

    /* The login call answers 401 for a wrong password - only an
       authenticated call proves that the token is gone. */
    if (response.status === 401 && authenticated && token && path !== "/api/auth/login") {
      clearSession();
      window.dispatchEvent(new CustomEvent("admin:session-expired", { detail: { message } }));
    }

    throw new ApiError(message, {
      status: response.status,
      details: details,
      rateLimited: response.status === 429,
    });
  }

  return payload;
}

/* -------------------------------------------------------------- api */

export const api = {
  /* auth */
  login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
  },
  me() {
    return request("/api/auth/me");
  },
  changePassword(currentPassword, newPassword) {
    return request("/api/auth/password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  },

  /* content */
  listSections() {
    return request("/api/admin/content/");
  },
  getSection(key) {
    return request("/api/admin/content/" + encodeURIComponent(key));
  },
  createItem(key, data) {
    return request("/api/admin/content/" + encodeURIComponent(key) + "/items", {
      method: "POST",
      body: { data: data },
    });
  },
  updateItem(key, itemId, patch) {
    return request(
      "/api/admin/content/" + encodeURIComponent(key) + "/items/" + encodeURIComponent(itemId),
      { method: "PATCH", body: patch }
    );
  },
  deleteItem(key, itemId) {
    return request(
      "/api/admin/content/" + encodeURIComponent(key) + "/items/" + encodeURIComponent(itemId),
      { method: "DELETE" }
    );
  },
  reorder(key, order) {
    return request("/api/admin/content/" + encodeURIComponent(key) + "/reorder", {
      method: "POST",
      body: { order: order },
    });
  },

  /* journal issues */
  listIssues() {
    return request("/api/admin/issues");
  },
  getIssue(id) {
    return request("/api/admin/issues/" + encodeURIComponent(id));
  },
  createIssue(data) {
    return request("/api/admin/issues", { method: "POST", body: data });
  },
  updateIssue(id, data) {
    return request("/api/admin/issues/" + encodeURIComponent(id), {
      method: "PATCH",
      body: data,
    });
  },
  setCurrentIssue(id) {
    return request("/api/admin/issues/" + encodeURIComponent(id) + "/current", {
      method: "POST",
    });
  },
  deleteIssue(id) {
    return request("/api/admin/issues/" + encodeURIComponent(id), {
      method: "DELETE",
    });
  },

  /* submissions */
  listSubmissions(query) {
    const params = new URLSearchParams();
    Object.keys(query || {}).forEach(function (name) {
      const value = query[name];
      if (value !== undefined && value !== null && value !== "") params.set(name, value);
    });
    const suffix = params.toString() ? "?" + params.toString() : "";
    return request("/api/admin/submissions" + suffix);
  },
  setSubmissionStatus(id, status) {
    return request("/api/admin/submissions/" + encodeURIComponent(id), {
      method: "PATCH",
      body: { status: status },
    });
  },
  deleteSubmission(id) {
    return request("/api/admin/submissions/" + encodeURIComponent(id), {
      method: "DELETE",
    });
  },

  /* uploads */
  upload(file) {
    const form = new FormData();
    form.append("file", file, file.name);
    return request("/api/admin/uploads", { method: "POST", form: form });
  },
};

export default api;
