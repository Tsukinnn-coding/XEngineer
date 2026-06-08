import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the AI configuration and novel input workflow", () => {
    render(<App />);

    expect(screen.getByLabelText("API Base URL")).toBeInTheDocument();
    expect(screen.getByLabelText("API Key")).toBeInTheDocument();
    expect(screen.getByLabelText("Model")).toBeInTheDocument();
    expect(screen.getByLabelText("小说正文")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "生成剧本 YAML" })).toBeInTheDocument();
  });

  it("generates fallback YAML and enables preview diagnostics without an API key", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "生成剧本 YAML" }));

    await waitFor(() => {
      expect(screen.getByText(/ai_mode: fallback/)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "复制" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "下载 YAML" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "剧本预览" }));
    expect(screen.getByText(/待确认地点/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "改编诊断" }));
    expect(screen.getByText("AI 模式：Fallback")).toBeInTheDocument();
  });
});
