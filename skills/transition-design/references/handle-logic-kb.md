id: handle-logic-kb
description: 定义Handle的概念、计算方法和转场约束

definitions:
  handle:
    description: 粗剪点之外的可用素材
    purpose: 为转场效果提供帧重叠区域
    
  tail_handle:
    description: Clip A出点之后原始文件中可用的帧
    calculation: source_duration - out_point
    
  head_handle:
    description: Clip B入点之前原始文件中可用的帧
    calculation: in_point - 0

constraint_rule: |
  如果 (Tail Handle + Head Handle) < 所需转场帧数
  → 强制使用 Hard Cut

timing_modes:
  center_cut:
    description: 转场效果居中于剪辑点
    handle_requirement: A和B都需要Handle
    calculation: 
      a_extension: transition_duration / 2
      b_extension: transition_duration / 2
      
  start_cut:
    description: 转场从B的入点开始（向前延伸）
    handle_requirement: 仅A需要Handle
    calculation:
      a_extension: transition_duration
      b_extension: 0
      
  end_cut:
    description: 转场在A的出点结束（向后延伸）
    handle_requirement: 仅B需要Handle
    calculation:
      a_extension: 0
      b_extension: transition_duration

handle_consumption_example:
  scenario: "12帧Dissolve，Center Cut模式"
  clip_a_tail_handle: 8帧
  clip_b_head_handle: 6帧
  total_available: 14帧
  required: 12帧
  result: "可行，A延伸6帧，B延伸6帧"