import type { NovelChapter } from "../core/types";

export function buildScreenplayPrompt(params: {
  title: string;
  format: "screenplay" | "stage" | "audio";
  chapters: NovelChapter[];
}): string {
  const chapterText = params.chapters
    .map((chapter) => `## ${chapter.id} ${chapter.title}\n${chapter.content}`)
    .join("\n\n");

  return [
    "你是一名专业编剧和文学改编顾问。请把小说章节改编成结构化剧本初稿。",
    "输出必须是 YAML，不要输出 Markdown 代码围栏，不要输出额外解释。",
    "必须保留 source chapter id，方便作者追溯每个场景来自哪些章节。",
    "每个场景必须包含 location、time、characters、dramatic_goal、conflict、action、dialogues、transition。",
    "dialogues 中每句台词必须包含 speaker、line、tone、subtext、action_hint。",
    `作品名：${params.title}`,
    `剧本格式：${params.format}`,
    "YAML 顶层字段必须是 metadata、source、characters、acts、scenes、adaptation_notes、validation。",
    "小说章节如下：",
    chapterText,
  ].join("\n\n");
}
