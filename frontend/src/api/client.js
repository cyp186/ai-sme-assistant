const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  const detail = data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }
  return "Something went wrong";
}

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  register: (data) => request("/auth/register", { method: "POST", body: data }),

  login: async (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  },

  getMe: () => request("/auth/me"),

  getBusiness: () => request("/business"),
  createBusiness: (data) => request("/business", { method: "POST", body: data }),
  updateBusiness: (data) => request("/business", { method: "PUT", body: data }),

  getCustomers: () => request("/customers"),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request("/customers", { method: "POST", body: data }),
  updateCustomer: (id, data) =>
    request(`/customers/${id}`, { method: "PUT", body: data }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),

  getEnquiries: () => request("/enquiries"),
  getEnquiry: (id) => request(`/enquiries/${id}`),
  createEnquiry: (data) => request("/enquiries", { method: "POST", body: data }),
  updateEnquiry: (id, data) =>
    request(`/enquiries/${id}`, { method: "PUT", body: data }),
  deleteEnquiry: (id) => request(`/enquiries/${id}`, { method: "DELETE" }),

  getKnowledge: () => request("/knowledge-base"),
  createKnowledge: (data) =>
    request("/knowledge-base", { method: "POST", body: data }),
  updateKnowledge: (id, data) =>
    request(`/knowledge-base/${id}`, { method: "PUT", body: data }),
  deleteKnowledge: (id) =>
    request(`/knowledge-base/${id}`, { method: "DELETE" }),
};
