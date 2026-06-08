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
