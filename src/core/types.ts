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
