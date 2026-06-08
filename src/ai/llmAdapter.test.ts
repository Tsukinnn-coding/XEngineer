import { describe, expect, it, vi } from "vitest";
import { callChatCompletion } from "./llmAdapter";

describe("callChatCompletion", () => {
  it("calls an OpenAI-compatible chat completions endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "metadata:\n  title: 测试" } }] }),
    });

    const content = await callChatCompletion({
      config: { baseUrl: "https://api.example.com/v1", apiKey: "secret", model: "demo" },
      messages: [{ role: "user", content: "convert" }],
      fetcher: fetchMock,
    });

    expect(content).toContain("metadata:");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer secret" }),
      }),
    );
  });

  it("throws a readable error for failed responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });

    await expect(
      callChatCompletion({
        config: { baseUrl: "https://api.example.com/v1", apiKey: "bad", model: "demo" },
        messages: [{ role: "user", content: "convert" }],
        fetcher: fetchMock,
      }),
    ).rejects.toThrow("模型请求失败：401 unauthorized");
  });
});
