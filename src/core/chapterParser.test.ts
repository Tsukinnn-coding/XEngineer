import { describe, expect, it } from "vitest";
import { parseChapters } from "./chapterParser";

describe("parseChapters", () => {
  it("treats untitled text as a single chapter", () => {
    const chapters = parseChapters("雨停了。她推开门，看见旧戏院的灯还亮着。");

    expect(chapters).toHaveLength(1);
    expect(chapters[0]).toMatchObject({
      id: "chapter-1",
      title: "未命名章节 1",
      index: 1,
    });
  });

  it("parses Chinese chapter headings", () => {
    const chapters = parseChapters("第一章 雨夜\n她来了。\n第二章 灯下\n他说话。");

    expect(chapters.map((chapter) => chapter.title)).toEqual(["第一章 雨夜", "第二章 灯下"]);
    expect(chapters[1].content).toBe("他说话。");
  });

  it("handles more than three chapters", () => {
    const input = ["第一章 开端", "A", "第二章 追问", "B", "第三章 误会", "C", "第四章 和解", "D"].join(
      "\n",
    );

    expect(parseChapters(input)).toHaveLength(4);
  });
});
