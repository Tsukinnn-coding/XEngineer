import type { NovelChapter } from "./types";

const headingPattern =
  /^\s*(?:#{1,3}\s*)?(?:(?:第[一二三四五六七八九十百千万0-9]+[章节回])|(?:Chapter\s+\d+)|(?:CHAPTER\s+\d+)|(?:\d+[.、]\s*章))[^\n]*$/;

function countWords(text: string): number {
  return text.replace(/\s+/g, "").length;
}

function toChapter(id: number, title: string, lines: string[]): NovelChapter {
  const content = lines.join("\n").trim();

  return {
    id: `chapter-${id}`,
    index: id,
    title: title.trim() || `未命名章节 ${id}`,
    content,
    wordCount: countWords(content),
  };
}

export function parseChapters(input: string): NovelChapter[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const chapters: NovelChapter[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (headingPattern.test(line)) {
      if (currentTitle || currentLines.length > 0) {
        chapters.push(toChapter(chapters.length + 1, currentTitle, currentLines));
      }
      currentTitle = line.replace(/^#{1,3}\s*/, "").trim();
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  if (currentTitle || currentLines.length > 0) {
    chapters.push(toChapter(chapters.length + 1, currentTitle || "未命名章节 1", currentLines));
  }

  return chapters.filter((chapter) => chapter.content.length > 0);
}
