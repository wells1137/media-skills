---

id: transition-kb
description: 定义转场类型、使用场景和效果参数

golden_rule: |
  粗剪定义的入点和出点代表叙事内容的绝对边界。
  转场效果不允许遮挡或"吃掉"这些活动帧。
  转场必须完全在Handle区域内完成。

transition_types:
  hard_cut:
    description: 硬切，直接切换
    use_for:
      - 连续动作
      - 对话场景
      - Handle不足时
      - 快节奏序列
    handle_required: 0帧
    parameters: null
    
  dissolve:
    description: 溶解，画面渐变过渡
    use_for:
      - 时间流逝
      - 地点变换
      - 梦境/回忆
    typical_duration: 12-24帧
    parameters:
      - duration_frames
      - curve (linear/ease)
      
  fade:
    description: 淡入淡出（通过黑场/白场）
    use_for:
      - 段落分隔
      - 开场/结尾
    typical_duration: 12-24帧
    parameters:
      - fade_color (black/white)
      - duration_frames
      
  wipe:
    description: 划变，一个画面推开另一个
    use_for:
      - 风格化转场
      - 平行叙事
    typical_duration: 12-18帧
    parameters:
      - direction (left/right/up/down)
      - edge_softness

default_choice: hard_cut
override_conditions:
  - 分镜脚本明确指定其他转场
  - 叙事需要时间/空间跳跃的视觉提示