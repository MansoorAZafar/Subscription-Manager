export function createApiClient(baseUrl, getAccessToken) {
  async function request(path, options = {}) {
    const token = await getAccessToken();
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 204) return null;
    const raw = await response.text();
    const body = raw ? JSON.parse(raw) : null;
    if (!response.ok)
      throw new Error(
        body?.detail || body?.message || `Request failed (${response.status})`,
      );
    return body;
  }
  return {
    get: (path) => request(path),
    post: (path, body) =>
      request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    put: (path, body) =>
      request(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
}
