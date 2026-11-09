import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createApiClient } from "./apiClient.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createApiClient", () => {
  it("adds the bearer token and decodes successful JSON responses", async () => {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://api.example.test/api/subscriptions");
      assert.equal(options.headers.Authorization, "Bearer access-token");
      return new Response(JSON.stringify({ content: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const client = createApiClient(
      "https://api.example.test",
      async () => "access-token",
    );
    assert.deepEqual(await client.get("/api/subscriptions"), { content: [] });
  });

  it("sends JSON for create requests", async () => {
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.method, "POST");
      assert.equal(options.headers["Content-Type"], "application/json");
      assert.deepEqual(JSON.parse(options.body), { name: "Music" });
      return new Response(null, { status: 204 });
    };

    const client = createApiClient("", async () => "token");
    assert.equal(
      await client.post("/api/subscriptions", { name: "Music" }),
      null,
    );
  });

  it("uses the backend problem detail for failed requests", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ detail: "Access denied" }), {
        status: 403,
      });

    const client = createApiClient("", async () => "token");
    await assert.rejects(client.get("/api/subscriptions"), {
      message: "Access denied",
    });
  });
});
