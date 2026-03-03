---
name: seedance-prompt-designer
description: 基于 Seedance 2.0 的多模态特性，智能识别用户上传的素材和意图，自动生成最优的视频生成提示词。
---

# Seedance Prompt Designer Skill

本 Skill 的核心目标是：将用户提供的、零散的多模态素材（图片、视频、音频）和模糊的创作意图，转化为一段能够被 Seedance 2.0 模型精确理解和执行的、结构化的提示词。

## 核心工作流

请严格遵循以下三阶段工作流。每一步的输出都是下一步的输入。

### Phase 1: 识别 (Recognition)

**目标**: 理解用户输入，形成初步的创作元素清单。

1.  **解析用户意图**: 从用户的自然语言描述中，提取核心的 **动作指令** (Action) 和 **风格/情绪指令** (Style)。
2.  **分析上传素材**: 遍历所有用户上传的素材，使用 `references/atomic_element_mapping.md` 知识库中的 **“素材类型 -> 原子元素”** 映射表，为每个素材标注其最可能的 **原子元素角色**。

    > **示例**: 
    > - 输入一张人像图 `portrait.png`，根据知识库，其最可能的角色是 `主体身份`。
    > - 输入一段运镜视频 `dolly.mp4`，其最可能的角色是 `镜头语言`。

3.  **输出**: 生成一个内部的 `recognition_output.json` 文件，结构如下：

    ```json
    {
      "action_intent": "让蒙娜丽莎喝可乐",
      "style_intent": "电影感、特写镜头",
      "assets": [
        {
          "asset_name": "monalisa.png",
          "asset_type": "image",
          "potential_atomic_elements": ["主体身份", "美学风格"]
        },
        {
          "asset_name": "coke.png",
          "asset_type": "image",
          "potential_atomic_elements": ["主体身份-物体"]
        }
      ]
    }
    ```

### Phase 2: 映射与策略设计 (Mapping & Strategy)

**目标**: 将初步的识别结果，转化为精确的、可执行的参考策略。

1.  **确定最优参考方式**: 遍历 `recognition_output.json` 中的每一个 `potential_atomic_elements`，查阅 `references/atomic_element_mapping.md` 知识库中的 **“原子元素 -> 最优参考方式”** 判断框架，为每一个元素确定其是应该用 **文本(Text)**、**资产(Asset)** 还是 **混合(Hybrid)** 方式来参考。

2.  **输出**: 生成一个 `strategy_output.json` 文件，这是构建最终 Prompt 的核心依据。

    ```json
    {
      "prompt_elements": {
        "text_prompts": [
          "一个女人拿起一瓶可乐喝了一口", // 来自 action_intent
          "特写镜头，电影感光效" // 来自 style_intent
        ],
        "asset_references": [
          {
            "atomic_element": "主体身份",
            "asset_name": "monalisa.png",
            "reference_syntax": "以@monalisa作为主体参考"
          },
          {
            "atomic_element": "主体身份-物体",
            "asset_name": "coke.png",
            "reference_syntax": "视频中出现的物体为@coke"
          }
        ]
      }
    }
    ```

### Phase 3: 构建与组装 (Construction & Assembly)

**目标**: 生成最终的、可以直接喂给 Seedance 2.0 的完整提示词。

1.  **组装文本**: 将 `strategy_output.json` 中 `text_prompts` 数组里的所有文本，连接成一段通顺、完整的自然语言描述。
2.  **组装@语法**: 将 `asset_references` 数组里的所有 `reference_syntax` 字符串，附加到文本描述的末尾。
3.  **查阅模板**: （可选）根据用户的意图，可以查阅 `references/prompt_templates.md`，使用更高级的模板来组织语言。
4.  **最终输出**: 输出一个包含 `final_prompt` 和 `recommended_parameters` 的 JSON 对象。

    ```json
    {
      "final_prompt": "一个女人拿起一瓶可乐喝了一口。特写镜头，电影感光效。以@monalisa作为主体参考，视频中出现的物体为@coke。",
      "recommended_parameters": {
        "duration": 8,
        "aspect_ratio": "16:9"
      }
    }
    ```

## 知识库 (Knowledge Base)

- **`/references/atomic_element_mapping.md`**: **核心知识库**。包含“素材类型->原子元素”和“原子元素->最优参考方式”两大映射表。**在执行 Phase 1 和 Phase 2 时必须查阅**。
- **`/references/seedance_syntax_guide.md`**: Seedance 2.0 的“@素材名”语法参考。**在执行 Phase 3 时必须查阅**，确保生成的@语法正确无误。
- **`/references/prompt_templates.md`**: 高级提示词模板。在执行 Phase 3 时可选查阅，用于提升 Prompt 的润色和风格优化。
