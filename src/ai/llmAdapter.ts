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
