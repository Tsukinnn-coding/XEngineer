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
