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
    chapters: z
      .array(
        z.object({
          id: nonEmptyString,
          title: nonEmptyString,
          summary: nonEmptyString,
          word_count: z.number().int().min(0),
        }),
      )
      .min(1),
    coverage: nonEmptyString,
  }),
  characters: z.array(
    z.object({
      name: nonEmptyString,
      role: nonEmptyString,
      traits: z.array(nonEmptyString),
      goal: z.string(),
      relationships: z.array(z.string()),
      source_chapters: z.array(nonEmptyString),
    }),
  ),
  acts: z
    .array(
      z.object({
        id: nonEmptyString,
        title: nonEmptyString,
        narrative_function: nonEmptyString,
        theme: z.string(),
        scenes: z.array(nonEmptyString).min(1),
      }),
    )
    .min(1),
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
