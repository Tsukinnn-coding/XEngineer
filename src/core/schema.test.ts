import { describe, expect, it } from "vitest";
import { validateScreenplay } from "./schema";
import type { ScreenplayYaml } from "./types";

const validScreenplay: ScreenplayYaml = {
  metadata: {
    title: "雨夜戏院",
    language: "zh-CN",
    screenplay_format: "screenplay",
    generated_at: "2026-06-08T00:00:00.000Z",
    model: "demo-model",
    ai_mode: "llm",
  },
  source: {
    chapter_count: 1,
    chapters: [{ id: "chapter-1", title: "第一章 雨夜", summary: "她回到旧戏院。", word_count: 20 }],
    coverage: "覆盖 1/1 章",
  },
  characters: [
    {
      name: "林青",
      role: "主角",
      traits: ["执着"],
      goal: "找出真相",
      relationships: [],
      source_chapters: ["chapter-1"],
    },
  ],
  acts: [
    {
      id: "act-1",
      title: "第一幕",
      narrative_function: "建立冲突",
      theme: "记忆",
      scenes: ["scene-1"],
    },
  ],
  scenes: [
    {
      id: "scene-1",
      title: "旧戏院重逢",
      source_chapters: ["chapter-1"],
      location: "旧戏院",
      time: "夜",
      characters: ["林青"],
      dramatic_goal: "进入戏院",
      conflict: "她害怕面对过去",
      action: ["林青推门。"],
      dialogues: [
        {
          speaker: "林青",
          line: "我回来了。",
          tone: "低声",
          subtext: "她不确定是否有人等待",
          action_hint: "停在门口",
        },
      ],
      transition: "切至舞台",
    },
  ],
  adaptation_notes: ["保留原章节的悬疑氛围。"],
  validation: { status: "valid", messages: [] },
};

describe("validateScreenplay", () => {
  it("accepts a complete screenplay object", () => {
    expect(validateScreenplay(validScreenplay).success).toBe(true);
  });

  it("rejects missing scenes", () => {
    const result = validateScreenplay({ ...validScreenplay, scenes: [] });

    expect(result.success).toBe(false);
  });
});
