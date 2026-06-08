import { describe, expect, it, vi } from "vitest";
import { convertNovelToScreenplay } from "./orchestrator";

const modelYaml = `
metadata:
  title: 雨夜戏院
  language: zh-CN
  screenplay_format: screenplay
  generated_at: "2026-06-08T00:00:00.000Z"
  model: demo-model
  ai_mode: llm
source:
  chapter_count: 1
  chapters:
    - id: chapter-1
      title: 第一章 雨夜
      summary: 林青回到旧戏院。
      word_count: 12
  coverage: 覆盖 1/1 章
characters:
  - name: 林青
    role: 主角
    traits: [执着]
    goal: 找到真相
    relationships: []
    source_chapters: [chapter-1]
acts:
  - id: act-1
    title: 第一幕
    narrative_function: 建立冲突
    theme: 记忆
    scenes: [scene-1]
scenes:
  - id: scene-1
    title: 旧戏院
    source_chapters: [chapter-1]
    location: 旧戏院
    time: 夜
    characters: [林青]
    dramatic_goal: 进入旧戏院
    conflict: 她害怕面对过去
    action: [林青推开门]
    dialogues:
      - speaker: 林青
        line: 我回来了。
        tone: 低声
        subtext: 她在试探黑暗
        action_hint: 停在门口
    transition: 切至舞台
adaptation_notes:
  - 保留悬疑氛围。
validation:
  status: valid
  messages: []
`;

describe("convertNovelToScreenplay", () => {
  it("uses the LLM path when configuration is complete", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: modelYaml } }] }),
    });

    const result = await convertNovelToScreenplay({
      title: "雨夜戏院",
      format: "screenplay",
      novelText: "第一章 雨夜\n林青回到旧戏院。",
      aiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "secret", model: "demo-model" },
      fetcher,
    });

    expect(result.diagnostics.aiMode).toBe("llm");
    expect(result.screenplay.scenes[0].title).toBe("旧戏院");
  });

  it("returns transparent fallback when model call fails", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await convertNovelToScreenplay({
      title: "雨夜戏院",
      format: "screenplay",
      novelText: "第一章 雨夜\n林青回到旧戏院。",
      aiConfig: { baseUrl: "https://api.example.com/v1", apiKey: "secret", model: "demo-model" },
      fetcher,
    });

    expect(result.diagnostics.aiMode).toBe("fallback");
    expect(result.screenplay.validation.status).toBe("fallback");
    expect(result.diagnostics.messages.join("\n")).toContain("network down");
  });
});
