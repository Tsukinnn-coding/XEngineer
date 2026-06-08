import { callChatCompletion } from "../ai/llmAdapter";
import { buildScreenplayPrompt } from "../ai/prompts";
import { parseChapters } from "./chapterParser";
import { createFallbackScreenplay } from "./fallbackConverter";
import { validateScreenplay } from "./schema";
import type { AiConfig, ConversionResult } from "./types";
import { parseScreenplayYaml, stringifyScreenplayYaml } from "./yaml";

export async function convertNovelToScreenplay(params: {
  title: string;
  format: "screenplay" | "stage" | "audio";
  novelText: string;
  aiConfig: AiConfig;
  fetcher?: typeof fetch;
}): Promise<ConversionResult> {
  const chapters = parseChapters(params.novelText);
  const wordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const batchCount = Math.max(1, Math.ceil(wordCount / 6000));

  if (chapters.length === 0) {
    throw new Error("请输入小说正文后再生成剧本。");
  }

  const configMissing = !params.aiConfig.baseUrl || !params.aiConfig.apiKey || !params.aiConfig.model;
  if (configMissing) {
    const fallback = createFallbackScreenplay({
      title: params.title,
      format: params.format,
      model: params.aiConfig.model,
      chapters,
      reason: "AI 配置不完整",
    });

    return {
      screenplay: fallback,
      yaml: stringifyScreenplayYaml(fallback),
      diagnostics: {
        chapterCount: chapters.length,
        wordCount,
        batchCount,
        aiMode: "fallback",
        messages: ["AI 配置不完整，已生成 fallback 结构。"],
      },
    };
  }

  try {
    const prompt = buildScreenplayPrompt({
      title: params.title,
      format: params.format,
      chapters,
    });
    const raw = await callChatCompletion({
      config: params.aiConfig,
      messages: [
        { role: "system", content: "你是专业编剧助手，只输出符合要求的 YAML。" },
        { role: "user", content: prompt },
      ],
      fetcher: params.fetcher,
    });
    const parsed = parseScreenplayYaml(raw);
    const validation = validateScreenplay(parsed);

    if (!validation.success) {
      throw new Error(validation.error.issues.map((issue) => issue.message).join("; "));
    }

    return {
      screenplay: validation.data,
      yaml: stringifyScreenplayYaml(validation.data),
      diagnostics: {
        chapterCount: chapters.length,
        wordCount,
        batchCount,
        aiMode: "llm",
        messages: ["AI 改编完成，输出已通过 Schema 校验。"],
        rawModelOutput: raw,
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const fallback = createFallbackScreenplay({
      title: params.title,
      format: params.format,
      model: params.aiConfig.model,
      chapters,
      reason,
    });

    return {
      screenplay: fallback,
      yaml: stringifyScreenplayYaml(fallback),
      diagnostics: {
        chapterCount: chapters.length,
        wordCount,
        batchCount,
        aiMode: "fallback",
        messages: [`AI 改编失败：${reason}`, "已生成 fallback 结构供排查。"],
      },
    };
  }
}
