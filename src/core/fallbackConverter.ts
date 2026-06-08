import type { NovelChapter, ScreenplayYaml } from "./types";

export function createFallbackScreenplay(params: {
  title: string;
  format: "screenplay" | "stage" | "audio";
  model: string;
  chapters: NovelChapter[];
  reason: string;
}): ScreenplayYaml {
  const firstChapter = params.chapters[0];

  return {
    metadata: {
      title: params.title,
      language: "zh-CN",
      screenplay_format: params.format,
      generated_at: new Date().toISOString(),
      model: params.model || "unconfigured",
      ai_mode: "fallback",
    },
    source: {
      chapter_count: params.chapters.length,
      chapters: params.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        summary: chapter.content.slice(0, 80) || "该章节暂无可用摘要。",
        word_count: chapter.wordCount,
      })),
      coverage: `fallback 覆盖 ${params.chapters.length}/${params.chapters.length} 章`,
    },
    characters: [
      {
        name: "待作者确认角色",
        role: "待确认角色",
        traits: ["需要 AI 或作者补充"],
        goal: "根据小说正文继续提炼",
        relationships: [],
        source_chapters: firstChapter ? [firstChapter.id] : [],
      },
    ],
    acts: [
      {
        id: "act-1",
        title: "第一幕",
        narrative_function: "根据输入章节建立故事开端",
        theme: "待作者确认",
        scenes: ["scene-1"],
      },
    ],
    scenes: [
      {
        id: "scene-1",
        title: firstChapter?.title ?? "未命名场景",
        source_chapters: firstChapter ? [firstChapter.id] : [],
        location: "待确认地点",
        time: "待确认时间",
        characters: ["待作者确认角色"],
        dramatic_goal: "保留原章节主要事件，等待 AI 重新生成",
        conflict: "模型调用失败，未能提炼冲突",
        action: [firstChapter?.content.slice(0, 120) || "暂无动作描述"],
        dialogues: [],
        transition: "待确认转场",
      },
    ],
    adaptation_notes: [`这是 fallback 结果，原因：${params.reason}`],
    validation: {
      status: "fallback",
      messages: ["模型路径失败，当前结果仅用于展示 YAML 结构。"],
    },
  };
}
