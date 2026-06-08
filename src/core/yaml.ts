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
