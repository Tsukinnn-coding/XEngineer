import { render, screen } from "@testing-library/react";
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
});
