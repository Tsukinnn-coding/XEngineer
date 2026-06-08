import { useMemo, useState } from "react";
import { parseChapters } from "./core/chapterParser";
import { convertNovelToScreenplay } from "./core/orchestrator";
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
    if (!result) {
      return;
    }

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
          <button type="button" onClick={() => setNovelText(sampleNovel)}>
            载入示例
          </button>
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
            <button type="button" className={activeTab === "yaml" ? "active" : ""} onClick={() => setActiveTab("yaml")}>
              YAML
            </button>
            <button
              type="button"
              className={activeTab === "preview" ? "active" : ""}
              onClick={() => setActiveTab("preview")}
            >
              剧本预览
            </button>
            <button
              type="button"
              className={activeTab === "diagnostics" ? "active" : ""}
              onClick={() => setActiveTab("diagnostics")}
            >
              改编诊断
            </button>
          </div>

          <div className="output-actions">
            <button type="button" onClick={handleCopy} disabled={!result}>
              复制
            </button>
            <button type="button" onClick={handleDownload} disabled={!result}>
              下载 YAML
            </button>
          </div>

          {!result && <div className="empty">生成后将在这里展示 YAML、剧本场景和改编诊断。</div>}
          {result && activeTab === "yaml" && <pre>{result.yaml}</pre>}
          {result && activeTab === "preview" && (
            <div className="preview-list">
              {result.screenplay.scenes.map((scene) => (
                <article key={scene.id} className="scene-card">
                  <h3>{scene.title}</h3>
                  <p>
                    {scene.location} · {scene.time}
                  </p>
                  <p>
                    <strong>冲突：</strong>
                    {scene.conflict}
                  </p>
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
              <ul>
                {result.diagnostics.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
