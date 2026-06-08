# AI Novel To Screenplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-first Web tool that converts one or more novel chapters into editable screenplay YAML, with a real OpenAI-compatible model path, schema validation, preview, export, and docs.

**Architecture:** Use a Vite + React + TypeScript app with a UI layer that calls a framework-independent conversion core. The core owns chapter parsing, prompt creation, LLM calls, model-output parsing, schema validation, fallback generation, YAML serialization, and diagnostics.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, `yaml`, `zod`, browser `fetch`, CSS modules via plain CSS.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`: Web workbench.
- Create `src/core/types.ts`: shared domain types for chapters, characters, scenes, screenplay, diagnostics, AI config, and conversion results.
- Create `src/core/chapterParser.ts`: parse one or many chapters from pasted text.
- Create `src/core/schema.ts`: zod schema and validation helpers for screenplay objects.
- Create `src/core/yaml.ts`: extract model YAML, parse YAML, serialize screenplay YAML.
- Create `src/core/fallbackConverter.ts`: transparent fallback output for API failures.
- Create `src/ai/prompts.ts`: prompt templates that instruct the model to produce schema-conformant YAML.
- Create `src/ai/llmAdapter.ts`: OpenAI-compatible Chat Completions adapter.
- Create `src/core/orchestrator.ts`: AI-first conversion pipeline.
- Create `src/sampleNovel.ts`: demo text with more than 3 chapters.
- Create tests under `src/**/*.test.ts`: parser, schema, YAML, adapter, orchestrator.
- Create `docs/yaml-schema.md`: user-facing YAML Schema documentation and design rationale.
- Modify `README.md`: install, run, configure model, demo, architecture, and scoring highlights.
- Create `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`: TypeScript, Vite, and test config.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Modify: `.gitignore`

- [ ] **Step 1: Add package metadata and scripts**

Create `package.json`:

```json
{
  "name": "xengineer-dramatize",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.5.0",
    "vite": "^6.3.5",
    "typescript": "^5.8.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "yaml": "^2.7.1",
    "zod": "^3.25.56"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.2"
  }
}
```

- [ ] **Step 2: Add TypeScript and Vite config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"],
  "references": []
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 3: Add the minimal app entry**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XEngineer Dramatize</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">XEngineer Dramatize</p>
        <h1>AI 小说转剧本工具</h1>
        <p>把小说章节交给 AI，生成可编辑、可校验、可下载的剧本 YAML 初稿。</p>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #18202f;
  background: #f5f7fb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

.app-shell {
  min-height: 100vh;
}

.hero {
  padding: 48px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #536176;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 40px;
}
```

- [ ] **Step 4: Ensure ignored generated folders stay out of git**

Ensure `.gitignore` includes:

```gitignore
.superpowers/
node_modules/
dist/
.env
.env.local
coverage/
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 6: Verify scaffold builds**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts vitest.config.ts src/main.tsx src/App.tsx src/styles.css .gitignore
git commit -m "chore: scaffold AI screenplay web app"
```

## Task 2: Core Types And Chapter Parser

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/chapterParser.ts`
- Create: `src/core/chapterParser.test.ts`

- [ ] **Step 1: Write parser tests**

Create `src/core/chapterParser.test.ts`:

```ts
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
    const input = ["第一章 开端", "A", "第二章 追问", "B", "第三章 误会", "C", "第四章 和解", "D"].join("\n");

    expect(parseChapters(input)).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run parser tests to verify failure**

Run:

```bash
npm test -- src/core/chapterParser.test.ts
```

Expected: FAIL because `src/core/chapterParser.ts` does not exist.

- [ ] **Step 3: Add shared types**

Create `src/core/types.ts`:

```ts
export interface NovelChapter {
  id: string;
  index: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface CharacterProfile {
  name: string;
  role: string;
  traits: string[];
  goal: string;
  relationships: string[];
  source_chapters: string[];
}

export interface DialogueLine {
  speaker: string;
  line: string;
  tone: string;
  subtext: string;
  action_hint: string;
}

export interface ScreenplayScene {
  id: string;
  title: string;
  source_chapters: string[];
  location: string;
  time: string;
  characters: string[];
  dramatic_goal: string;
  conflict: string;
  action: string[];
  dialogues: DialogueLine[];
  transition: string;
}

export interface ScreenplayAct {
  id: string;
  title: string;
  narrative_function: string;
  theme: string;
  scenes: string[];
}

export interface ScreenplayYaml {
  metadata: {
    title: string;
    language: string;
    screenplay_format: "screenplay" | "stage" | "audio";
    generated_at: string;
    model: string;
    ai_mode: "llm" | "fallback";
  };
  source: {
    chapter_count: number;
    chapters: Array<{
      id: string;
      title: string;
      summary: string;
      word_count: number;
    }>;
    coverage: string;
  };
  characters: CharacterProfile[];
  acts: ScreenplayAct[];
  scenes: ScreenplayScene[];
  adaptation_notes: string[];
  validation: {
    status: "valid" | "invalid" | "fallback";
    messages: string[];
  };
}

export interface ConversionDiagnostics {
  chapterCount: number;
  wordCount: number;
  batchCount: number;
  aiMode: "llm" | "fallback";
  messages: string[];
  rawModelOutput?: string;
}

export interface ConversionResult {
  screenplay: ScreenplayYaml;
  yaml: string;
  diagnostics: ConversionDiagnostics;
}
```

- [ ] **Step 4: Implement chapter parsing**

Create `src/core/chapterParser.ts`:

```ts
import type { NovelChapter } from "./types";

const headingPattern =
  /^\s*(?:#{1,3}\s*)?(?:(?:第[一二三四五六七八九十百千万0-9]+[章节回])|(?:Chapter\s+\d+)|(?:CHAPTER\s+\d+)|(?:\d+[.、]\s*章))[^\\n]*$/;

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
```

- [ ] **Step 5: Verify parser tests pass**

Run:

```bash
npm test -- src/core/chapterParser.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit parser**

```bash
git add src/core/types.ts src/core/chapterParser.ts src/core/chapterParser.test.ts
git commit -m "feat: parse novel chapters"
```

## Task 3: Schema Validation And YAML Utilities

**Files:**
- Create: `src/core/schema.ts`
- Create: `src/core/yaml.ts`
- Create: `src/core/schema.test.ts`
- Create: `src/core/yaml.test.ts`

- [ ] **Step 1: Write schema and YAML tests**

Create `src/core/schema.test.ts`:

```ts
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
  characters: [{ name: "林青", role: "主角", traits: ["执着"], goal: "找出真相", relationships: [], source_chapters: ["chapter-1"] }],
  acts: [{ id: "act-1", title: "第一幕", narrative_function: "建立冲突", theme: "记忆", scenes: ["scene-1"] }],
  scenes: [{
    id: "scene-1",
    title: "旧戏院重逢",
    source_chapters: ["chapter-1"],
    location: "旧戏院",
    time: "夜",
    characters: ["林青"],
    dramatic_goal: "进入戏院",
    conflict: "她害怕面对过去",
    action: ["林青推门。"],
    dialogues: [{ speaker: "林青", line: "我回来了。", tone: "低声", subtext: "她不确定是否有人等待", action_hint: "停在门口" }],
    transition: "切至舞台",
  }],
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
```

Create `src/core/yaml.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { extractYamlBlock, parseScreenplayYaml, stringifyScreenplayYaml } from "./yaml";

describe("yaml utilities", () => {
  it("extracts fenced YAML from model output", () => {
    expect(extractYamlBlock("```yaml\nmetadata:\n  title: 测试\n```")).toBe("metadata:\n  title: 测试");
  });

  it("parses YAML into plain objects", () => {
    expect(parseScreenplayYaml("metadata:\n  title: 测试")).toMatchObject({
      metadata: { title: "测试" },
    });
  });

  it("serializes objects without code fences", () => {
    expect(stringifyScreenplayYaml({ metadata: { title: "测试" } })).toContain("metadata:");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/core/schema.test.ts src/core/yaml.test.ts
```

Expected: FAIL because implementation files do not exist.

- [ ] **Step 3: Implement schema validation**

Create `src/core/schema.ts`:

```ts
import { z } from "zod";

const nonEmptyString = z.string().min(1);

export const dialogueLineSchema = z.object({
  speaker: nonEmptyString,
  line: nonEmptyString,
  tone: z.string(),
  subtext: z.string(),
  action_hint: z.string(),
});

export const screenplaySceneSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  source_chapters: z.array(nonEmptyString).min(1),
  location: nonEmptyString,
  time: nonEmptyString,
  characters: z.array(nonEmptyString),
  dramatic_goal: nonEmptyString,
  conflict: z.string(),
  action: z.array(nonEmptyString),
  dialogues: z.array(dialogueLineSchema),
  transition: z.string(),
});

export const screenplaySchema = z.object({
  metadata: z.object({
    title: nonEmptyString,
    language: nonEmptyString,
    screenplay_format: z.enum(["screenplay", "stage", "audio"]),
    generated_at: nonEmptyString,
    model: nonEmptyString,
    ai_mode: z.enum(["llm", "fallback"]),
  }),
  source: z.object({
    chapter_count: z.number().int().min(1),
    chapters: z.array(z.object({
      id: nonEmptyString,
      title: nonEmptyString,
      summary: nonEmptyString,
      word_count: z.number().int().min(0),
    })).min(1),
    coverage: nonEmptyString,
  }),
  characters: z.array(z.object({
    name: nonEmptyString,
    role: nonEmptyString,
    traits: z.array(nonEmptyString),
    goal: z.string(),
    relationships: z.array(z.string()),
    source_chapters: z.array(nonEmptyString),
  })),
  acts: z.array(z.object({
    id: nonEmptyString,
    title: nonEmptyString,
    narrative_function: nonEmptyString,
    theme: z.string(),
    scenes: z.array(nonEmptyString).min(1),
  })).min(1),
  scenes: z.array(screenplaySceneSchema).min(1),
  adaptation_notes: z.array(nonEmptyString),
  validation: z.object({
    status: z.enum(["valid", "invalid", "fallback"]),
    messages: z.array(z.string()),
  }),
});

export type ScreenplayValidation = ReturnType<typeof screenplaySchema.safeParse>;

export function validateScreenplay(value: unknown): ScreenplayValidation {
  return screenplaySchema.safeParse(value);
}
```

- [ ] **Step 4: Implement YAML utilities**

Create `src/core/yaml.ts`:

```ts
import { parse, stringify } from "yaml";

export function extractYamlBlock(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:yaml|yml)?\s*([\s\S]*?)\s*```$/i);

  if (fenced) {
    return fenced[1].trim();
  }

  return trimmed;
}

export function parseScreenplayYaml(raw: string): unknown {
  return parse(extractYamlBlock(raw));
}

export function stringifyScreenplayYaml(value: unknown): string {
  return stringify(value, {
    lineWidth: 100,
    singleQuote: false,
  });
}
```

- [ ] **Step 5: Verify schema and YAML tests pass**

Run:

```bash
npm test -- src/core/schema.test.ts src/core/yaml.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit schema and YAML utilities**

```bash
git add src/core/schema.ts src/core/yaml.ts src/core/schema.test.ts src/core/yaml.test.ts
git commit -m "feat: validate and serialize screenplay yaml"
```

## Task 4: LLM Adapter And Prompt Templates

**Files:**
- Create: `src/ai/llmAdapter.ts`
- Create: `src/ai/prompts.ts`
- Create: `src/ai/llmAdapter.test.ts`

- [ ] **Step 1: Write LLM adapter tests**

Create `src/ai/llmAdapter.test.ts`:

```ts
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

    await expect(callChatCompletion({
      config: { baseUrl: "https://api.example.com/v1", apiKey: "bad", model: "demo" },
      messages: [{ role: "user", content: "convert" }],
      fetcher: fetchMock,
    })).rejects.toThrow("模型请求失败：401 unauthorized");
  });
});
```

- [ ] **Step 2: Run adapter tests to verify failure**

Run:

```bash
npm test -- src/ai/llmAdapter.test.ts
```

Expected: FAIL because adapter implementation does not exist.

- [ ] **Step 3: Implement prompt templates**

Create `src/ai/prompts.ts`:

```ts
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
```

- [ ] **Step 4: Implement OpenAI-compatible adapter**

Create `src/ai/llmAdapter.ts`:

```ts
import type { AiConfig } from "../core/types";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Fetcher = typeof fetch;

export async function callChatCompletion(params: {
  config: AiConfig;
  messages: ChatMessage[];
  fetcher?: Fetcher;
}): Promise<string> {
  const fetcher = params.fetcher ?? fetch;
  const baseUrl = params.config.baseUrl.replace(/\/+$/, "");

  const response = await fetcher(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.config.apiKey}`,
    },
    body: JSON.stringify({
      model: params.config.model,
      messages: params.messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`模型请求失败：${response.status} ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("模型返回为空，无法生成剧本。");
  }

  return content;
}
```

- [ ] **Step 5: Verify adapter tests pass**

Run:

```bash
npm test -- src/ai/llmAdapter.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit adapter**

```bash
git add src/ai/prompts.ts src/ai/llmAdapter.ts src/ai/llmAdapter.test.ts
git commit -m "feat: add openai compatible llm adapter"
```

## Task 5: AI Orchestrator And Fallback

**Files:**
- Create: `src/core/fallbackConverter.ts`
- Create: `src/core/orchestrator.ts`
- Create: `src/core/orchestrator.test.ts`

- [ ] **Step 1: Write orchestrator tests**

Create `src/core/orchestrator.test.ts`:

```ts
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
```

- [ ] **Step 2: Run orchestrator tests to verify failure**

Run:

```bash
npm test -- src/core/orchestrator.test.ts
```

Expected: FAIL because orchestrator implementation does not exist.

- [ ] **Step 3: Implement fallback converter**

Create `src/core/fallbackConverter.ts`:

```ts
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
    characters: [{
      name: "待作者确认角色",
      role: "待确认角色",
      traits: ["需要 AI 或作者补充"],
      goal: "根据小说正文继续提炼",
      relationships: [],
      source_chapters: firstChapter ? [firstChapter.id] : [],
    }],
    acts: [{
      id: "act-1",
      title: "第一幕",
      narrative_function: "根据输入章节建立故事开端",
      theme: "待作者确认",
      scenes: ["scene-1"],
    }],
    scenes: [{
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
    }],
    adaptation_notes: [`这是 fallback 结果，原因：${params.reason}`],
    validation: {
      status: "fallback",
      messages: ["模型路径失败，当前结果仅用于展示 YAML 结构。"],
    },
  };
}
```

- [ ] **Step 4: Implement orchestrator**

Create `src/core/orchestrator.ts`:

```ts
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
```

- [ ] **Step 5: Verify orchestrator tests pass**

Run:

```bash
npm test -- src/core/orchestrator.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit orchestrator**

```bash
git add src/core/fallbackConverter.ts src/core/orchestrator.ts src/core/orchestrator.test.ts
git commit -m "feat: orchestrate AI screenplay conversion"
```

## Task 6: Web Workbench UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/sampleNovel.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write UI smoke test**

Create `src/App.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Add Testing Library setup import**

Modify `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
});
```

- [ ] **Step 3: Run UI test to verify failure**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: FAIL because the UI does not yet contain the requested form.

- [ ] **Step 4: Add sample novel**

Create `src/sampleNovel.ts`:

```ts
export const sampleNovel = `第一章 雨夜归来
林青在雨夜回到废弃的海边戏院。十年前，她的父亲在这里失踪，只留下一卷没有署名的剧本。

第二章 空座位
戏院第三排的七号座位上放着一束新鲜白花。林青听见舞台后方传来父亲年轻时常哼的旋律。

第三章 旧剧本
她在化妆间找到父亲的笔记。笔记写着：真正的结局不在台上，而在观众席。

第四章 灯亮之前
停电前的一瞬间，林青看见镜子里站着另一个自己。那个人拿着完整剧本，对她说：不要演最后一幕。`;
```

- [ ] **Step 5: Replace App with workbench**

Modify `src/App.tsx` to render:

```tsx
import { useMemo, useState } from "react";
import { convertNovelToScreenplay } from "./core/orchestrator";
import { parseChapters } from "./core/chapterParser";
import type { ConversionResult } from "./core/types";
import { sampleNovel } from "./sampleNovel";

const defaultBaseUrl = "https://api.openai.com/v1";

export default function App() {
  const [title, setTitle] = useState("雨夜戏院");
  const [format, setFormat] = useState<"screenplay" | "stage" | "audio">("screenplay");
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [novelText, setNovelText] = useState(sampleNovel);
  const [activeTab, setActiveTab] = useState<"yaml" | "preview" | "diagnostics">("yaml");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const chapters = useMemo(() => parseChapters(novelText), [novelText]);
  const wordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const batchCount = Math.max(1, Math.ceil(wordCount / 6000));

  async function handleGenerate() {
    setIsGenerating(true);
    setError("");
    try {
      const nextResult = await convertNovelToScreenplay({
        title,
        format,
        novelText,
        aiConfig: { baseUrl, apiKey, model },
      });
      setResult(nextResult);
      setActiveTab("yaml");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (result) {
      await navigator.clipboard.writeText(result.yaml);
    }
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.yaml], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title || "screenplay"}.yaml`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">XEngineer Dramatize</p>
          <h1>AI 小说转剧本工具</h1>
          <p>真实模型驱动的小说改编管线，输出可编辑 YAML 剧本初稿。</p>
        </div>
        <div className="topbar-actions">
          <button type="button" onClick={() => setNovelText(sampleNovel)}>载入示例</button>
          <button type="button" className="primary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "生成中..." : "生成剧本 YAML"}
          </button>
        </div>
      </header>

      <section className="workspace">
        <section className="panel input-panel">
          <div className="grid two">
            <label>
              作品名
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              剧本格式
              <select value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>
                <option value="screenplay">影视剧本</option>
                <option value="stage">舞台剧本</option>
                <option value="audio">广播剧</option>
              </select>
            </label>
          </div>

          <div className="grid three">
            <label>
              API Base URL
              <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
            </label>
            <label>
              API Key
              <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" />
            </label>
            <label>
              Model
              <input value={model} onChange={(event) => setModel(event.target.value)} />
            </label>
          </div>

          <label>
            小说正文
            <textarea value={novelText} onChange={(event) => setNovelText(event.target.value)} />
          </label>

          <div className="metrics">
            <span>{chapters.length} 章</span>
            <span>{wordCount} 字</span>
            <span>预计 {batchCount} 批</span>
            <span>{chapters.length >= 3 ? "已满足 3 章以上能力演示" : "可输入 1 章试用"}</span>
          </div>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel output-panel">
          <div className="tabs">
            <button type="button" className={activeTab === "yaml" ? "active" : ""} onClick={() => setActiveTab("yaml")}>YAML</button>
            <button type="button" className={activeTab === "preview" ? "active" : ""} onClick={() => setActiveTab("preview")}>剧本预览</button>
            <button type="button" className={activeTab === "diagnostics" ? "active" : ""} onClick={() => setActiveTab("diagnostics")}>改编诊断</button>
          </div>

          <div className="output-actions">
            <button type="button" onClick={handleCopy} disabled={!result}>复制</button>
            <button type="button" onClick={handleDownload} disabled={!result}>下载 YAML</button>
          </div>

          {!result && <div className="empty">生成后将在这里展示 YAML、剧本场景和改编诊断。</div>}
          {result && activeTab === "yaml" && <pre>{result.yaml}</pre>}
          {result && activeTab === "preview" && (
            <div className="preview-list">
              {result.screenplay.scenes.map((scene) => (
                <article key={scene.id} className="scene-card">
                  <h3>{scene.title}</h3>
                  <p>{scene.location} · {scene.time}</p>
                  <p><strong>冲突：</strong>{scene.conflict}</p>
                  {scene.dialogues.map((dialogue, index) => (
                    <blockquote key={`${dialogue.speaker}-${index}`}>
                      <strong>{dialogue.speaker}</strong>：{dialogue.line}
                    </blockquote>
                  ))}
                </article>
              ))}
            </div>
          )}
          {result && activeTab === "diagnostics" && (
            <div className="diagnostics">
              <p>AI 模式：{result.diagnostics.aiMode === "llm" ? "真实模型" : "Fallback"}</p>
              <p>章节数：{result.diagnostics.chapterCount}</p>
              <p>字数：{result.diagnostics.wordCount}</p>
              <p>批次数：{result.diagnostics.batchCount}</p>
              <ul>{result.diagnostics.messages.map((message) => <li key={message}>{message}</li>)}</ul>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Replace CSS with workbench layout**

Modify `src/styles.css`:

```css
:root {
  color: #18202f;
  background: #f4f6fa;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  border: 1px solid #c9d2e1;
  border-radius: 8px;
  background: #ffffff;
  color: #1d2a3d;
  cursor: pointer;
  font-weight: 700;
  min-height: 40px;
  padding: 0 14px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.topbar {
  align-items: flex-start;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin: 0 auto 20px;
  max-width: 1440px;
}

.topbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.eyebrow {
  color: #59677b;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  font-size: 34px;
  line-height: 1.12;
  margin: 0 0 8px;
}

.topbar p:last-child {
  color: #516074;
  margin: 0;
}

.workspace {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(360px, 0.95fr) minmax(420px, 1.05fr);
  margin: 0 auto;
  max-width: 1440px;
}

.panel {
  background: #ffffff;
  border: 1px solid #dbe2ee;
  border-radius: 8px;
  box-shadow: 0 16px 42px rgba(33, 45, 68, 0.08);
  min-width: 0;
  padding: 18px;
}

.input-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid {
  display: grid;
  gap: 12px;
}

.grid.two {
  grid-template-columns: 1fr 170px;
}

.grid.three {
  grid-template-columns: 1.2fr 1fr 0.9fr;
}

label {
  color: #536176;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: 800;
  gap: 7px;
}

input,
select,
textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #18202f;
  min-width: 0;
  outline: none;
  padding: 11px 12px;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

textarea {
  min-height: 460px;
  resize: vertical;
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metrics span {
  background: #eef4ff;
  border: 1px solid #cfe0ff;
  border-radius: 999px;
  color: #234a86;
  font-size: 13px;
  font-weight: 800;
  padding: 7px 10px;
}

.error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 8px;
  color: #9f1239;
  margin: 0;
  padding: 10px 12px;
}

.output-panel {
  display: grid;
  gap: 12px;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 680px;
}

.tabs,
.output-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tabs button.active {
  background: #132238;
  border-color: #132238;
  color: #ffffff;
}

.empty,
pre,
.preview-list,
.diagnostics {
  background: #0f172a;
  border-radius: 8px;
  color: #e8eef8;
  min-height: 520px;
  overflow: auto;
  padding: 18px;
}

pre {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.55;
  margin: 0;
  white-space: pre-wrap;
}

.preview-list {
  display: grid;
  gap: 12px;
}

.scene-card {
  background: #ffffff;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  color: #18202f;
  padding: 14px;
}

.scene-card h3 {
  margin: 0 0 8px;
}

.scene-card p {
  color: #516074;
  margin: 8px 0;
}

blockquote {
  border-left: 3px solid #f59e0b;
  margin: 10px 0 0;
  padding: 4px 0 4px 10px;
}

.diagnostics p {
  margin: 0 0 10px;
}

.diagnostics li {
  margin: 8px 0;
}

@media (max-width: 980px) {
  .app-shell {
    padding: 16px;
  }

  .topbar,
  .workspace {
    grid-template-columns: 1fr;
  }

  .topbar {
    display: grid;
  }

  .topbar-actions {
    justify-content: flex-start;
  }

  .grid.two,
  .grid.three {
    grid-template-columns: 1fr;
  }

  textarea {
    min-height: 320px;
  }
}
```

- [ ] **Step 7: Verify UI test passes**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Verify app builds**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit workbench**

```bash
git add src/App.tsx src/styles.css src/sampleNovel.ts src/App.test.tsx vitest.config.ts
git commit -m "feat: build AI screenplay workbench"
```

## Task 7: YAML Schema Documentation And README

**Files:**
- Create: `docs/yaml-schema.md`
- Modify: `README.md`

- [ ] **Step 1: Write YAML Schema documentation**

Create `docs/yaml-schema.md`:

````md
# 剧本 YAML Schema

## 设计目标

该 Schema 把 AI 生成结果约束成作者可继续编辑的剧本资产。它不只保存对白，还保存章节来源、角色动机、场景冲突和改编说明，方便作者追溯 AI 的改编决策。

## 顶层结构

```yaml
metadata:
  title: 雨夜戏院
  language: zh-CN
  screenplay_format: screenplay
  generated_at: "2026-06-08T00:00:00.000Z"
  model: gpt-4o-mini
  ai_mode: llm
source:
  chapter_count: 1
  chapters:
    - id: chapter-1
      title: 第一章 雨夜归来
      summary: 林青回到废弃戏院，发现父亲失踪案的新线索。
      word_count: 128
  coverage: 覆盖 1/1 章
characters: []
acts: []
scenes: []
adaptation_notes: []
validation: {}
```

## 字段说明

### metadata

`metadata` 描述生成结果本身。`title` 是作品名，`language` 是输出语言，`screenplay_format` 标识影视剧本、舞台剧或广播剧，`generated_at` 记录生成时间，`model` 记录使用的模型，`ai_mode` 标识结果来自真实模型还是 fallback。

### source

`source` 描述原小说来源。`chapter_count` 是输入章节数，`chapters` 保存章节编号、标题、摘要和字数，`coverage` 用自然语言说明剧本覆盖了多少输入内容。这个部分让作者能追溯每个剧本场景来自哪些章节。

### characters

`characters` 保存角色表。每个角色包含 `name`、`role`、`traits`、`goal`、`relationships` 和 `source_chapters`。这些字段帮助作者检查 AI 是否理解人物功能、动机和关系。

### acts

`acts` 保存幕结构。每一幕包含 `id`、`title`、`narrative_function`、`theme` 和 `scenes`。幕结构让长篇小说改编结果不只是场景列表，而是有叙事功能的剧本骨架。

### scenes

`scenes` 是剧本主体。每个场景包含 `id`、`title`、`source_chapters`、`location`、`time`、`characters`、`dramatic_goal`、`conflict`、`action`、`dialogues` 和 `transition`。这些字段覆盖剧本创作中最常编辑的单位。

### dialogues

`dialogues` 隶属于场景。每句台词包含 `speaker`、`line`、`tone`、`subtext` 和 `action_hint`。这样设计是为了让 AI 不只改写台词字面内容，也提供语气、潜台词和表演提示。

### adaptation_notes

`adaptation_notes` 记录 AI 的改编取舍，例如合并了哪些叙述、强化了哪些冲突、哪些部分建议作者人工润色。该字段让 AI 输出更可解释。

### validation

`validation` 记录校验状态和消息。`status` 可以是 `valid`、`invalid` 或 `fallback`，`messages` 保存可读诊断信息。

## 设计原因

- 保留章节来源：作者需要知道 AI 的每个改编决定来自原文哪里。
- 强调场景冲突：剧本不是小说摘要，场景必须有目标和冲突才便于继续打磨。
- 保存台词潜台词：小说改编成剧本时，很多心理描写需要转化为台词、动作或潜台词。
- 加入校验信息：AI 输出可能缺字段或格式不稳定，校验结果能帮助作者判断这份 YAML 是否可直接编辑。
- 支持 fallback 标识：模型调用失败时，系统仍能展示结构，但必须诚实标注结果不是 AI 改编。

## 示例

```yaml
metadata:
  title: 雨夜戏院
  language: zh-CN
  screenplay_format: screenplay
  generated_at: "2026-06-08T00:00:00.000Z"
  model: gpt-4o-mini
  ai_mode: llm
source:
  chapter_count: 1
  chapters:
    - id: chapter-1
      title: 第一章 雨夜归来
      summary: 林青在雨夜回到旧戏院。
      word_count: 128
  coverage: 覆盖 1/1 章
characters:
  - name: 林青
    role: 主角
    traits:
      - 执着
      - 克制
    goal: 找到父亲失踪的真相
    relationships: []
    source_chapters:
      - chapter-1
acts:
  - id: act-1
    title: 第一幕：归来
    narrative_function: 建立人物目标和悬疑氛围
    theme: 记忆与真相
    scenes:
      - scene-1
scenes:
  - id: scene-1
    title: 雨夜旧戏院
    source_chapters:
      - chapter-1
    location: 海边旧戏院
    time: 夜
    characters:
      - 林青
    dramatic_goal: 林青进入戏院寻找父亲线索
    conflict: 她想靠近真相，却害怕重新面对父亲失踪的夜晚
    action:
      - 林青推开锈住的侧门。
      - 舞台灯忽然闪了一下。
    dialogues:
      - speaker: 林青
        line: 我回来了。
        tone: 低声
        subtext: 她不确定这句话是说给父亲，还是说给自己
        action_hint: 手停在门把上，没有立刻松开
    transition: 切至观众席第三排
adaptation_notes:
  - 将小说中的环境描写转化为舞台动作和灯光变化。
validation:
  status: valid
  messages: []
```

````

- [ ] **Step 2: Rewrite README**

Modify `README.md` to include:

```md
# XEngineer Dramatize

AI 小说转剧本工具，面向七牛云 XEngineer 72 小时作品挑战。用户粘贴一个或多个小说章节，配置 OpenAI-compatible 模型服务后，工具生成结构化 YAML 剧本初稿，并提供剧本预览、改编诊断、复制和下载。

## 功能亮点

- 真实 AI 改编：通过 OpenAI-compatible Chat Completions API 调用模型。
- 支持 3 章以上：章节解析器可处理多章节输入，也允许单章节试用。
- 可编辑 YAML：输出遵循项目定义的剧本 Schema。
- 改编诊断：展示章节数量、字数、调用批次、AI/Fallback 模式和校验信息。
- 工程可测：转换核心与 UI 分离，并提供自动化测试。

## 运行

```bash
npm install
npm run dev
```

Open the printed local URL.

## 模型配置

Use an OpenAI-compatible provider:

- API Base URL: `https://api.openai.com/v1`
- API Key: provider API key
- Model: model name such as `gpt-4o-mini`

## 测试与构建

```bash
npm test
npm run build
```

## YAML Schema

See `docs/yaml-schema.md`.
```

- [ ] **Step 3: Verify docs contain final prose**

Run:

```bash
rg -n "T[B]D|Describe ever[y]|Fill th[e]" README.md docs/yaml-schema.md
```

Expected: no matches.

- [ ] **Step 4: Commit docs**

```bash
git add README.md docs/yaml-schema.md
git commit -m "docs: document screenplay yaml schema"
```

## Task 8: Final Verification

**Files:**
- No new files expected.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: production bundle succeeds.

- [ ] **Step 3: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite starts on a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser verification**

Open the local URL in the in-app browser and verify:

- AI config fields are visible.
- Sample novel contains 4 chapters.
- Chapter count and batch count render.
- Generate without API Key produces a clearly marked fallback result.
- YAML tab renders YAML.
- Preview tab renders at least one scene.
- Diagnostics tab identifies fallback mode.
- Copy and download buttons are present and enabled after generation.
- Desktop and mobile widths do not show overlapping controls or clipped button text.

- [ ] **Step 5: Final git status**

Run:

```bash
git status --short --branch
```

Expected: branch is ahead by the implementation commits and working tree is clean, except an active dev-server process if kept running for the user.
