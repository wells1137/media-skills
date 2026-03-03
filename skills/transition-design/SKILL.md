---
name: transition-design
description: 分析相邻片段边界帧，设计最优转场效果，输出转场设计指令。使用场景：所有片段已处理完成、需要设计片段间转场。避免场景：片段处理未完成、缺少素材Handle信息
---

## When to use

使用此 skill 当：
- 所有片段已处理完成
- 需要设计片段间转场

避免使用当：
- 片段处理未完成
- 缺少素材Handle信息

## Core principles

- **Golden Rule**：转场不能"吃掉"叙事内容帧，粗剪边界是绝对边界
- **Handle不足时强制硬切**
- **默认使用硬切**，除非叙事需要其他转场

## Workflow

**Step 1: 帧级分析**
获取三个关键数据点：
- 粗剪数据：Clip A和Clip B的入点/出点及可用Handle
- 视觉内容：边界帧的运动矢量、光线、构图
- 分镜意图：脚本中建议的转场类型

**Step 2: Handle验证**
查阅 [handle-logic-kb.md](references/handle-logic-kb.md) 验证转场可行性：
- 计算 (Tail Handle + Head Handle)
- 如果 < 所需转场帧数 → 强制Hard Cut

**Step 3: 策略选择**
查阅 [transition-kb.md](references/transition-kb.md) 根据叙事意图和技术可行性选择转场类型：
- **Hard Cut**: 默认选择，用于连续动作、对话，或Handle不足时
- **Dissolve**: 用于时间流逝或地点变换
- **Wipe/Other**: 特殊叙事需求

**Step 4: 生成转场设计指令**
- **Decision Status**:
  - Validation Result: Following / Adapting / Overriding
  - Rationale: 解释与脚本意图的差异（如有）
- **Transition Strategy**:
  - Type: 最终转场类型
  - Timing Mode: Center Cut / Start Cut / End Cut
- **Frame-Level Specifications**:
  - Total Duration (Frames)
  - Handle Consumption: A的尾部延伸帧数 / B的头部延伸帧数
- **Effect Parameters**:
  - Interpolation: Linear / Ease-In / Ease-Out
  - Visual Attributes: 方向、边缘柔和度等

**Step 5: 输出转场设计**
组装 transition_designs

## References

详细参考资料请查阅：

- [transition-kb.md](references/transition-kb.md) - 定义转场类型、使用场景和效果参数
- [handle-logic-kb.md](references/handle-logic-kb.md) - 定义Handle的概念、计算方法和转场约束

## Tools
