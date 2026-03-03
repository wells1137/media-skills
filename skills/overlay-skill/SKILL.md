---
name: overlay-skill
description: 为视频添加专业的包装和动效，包括片头/片尾、字幕、转场、水印和下三分之一标题条。支持多种风格和自定义选项。
---

# Overlay Skill

本技能用于为视频添加各种专业的包装和动效，提升视频的整体质感。支持 FFmpeg 和 MoviePy 两种底层实现，并提供丰富的预设模板和灵活的自定义参数。

## 功能概览

本技能支持以下五种核心功能：

1.  **片头/片尾 (Intro/Outro)**：为视频添加引人入胜的开场和专业的结尾。
2.  **字幕/标题 (Subtitles/Titles)**：在视频上叠加静态或动态的文字信息。
3.  **转场 (Transitions)**：在两个视频片段之间创建平滑或炫酷的过渡效果。
4.  **水印/边框 (Watermark/Borders)**：为视频添加版权信息或装饰性边框。
5.  **下三分之一标题条 (Lower Thirds)**：在屏幕下方显示人名、地点或其他信息。

## 工作流程

使用本技能为视频添加包装效果，通常遵循以下步骤：

1.  **选择功能**：根据你的需求，从上述五种功能中选择一种。
2.  **选择风格和模板**：为选定的功能选择一个预设的风格或模板。你也可以选择“自定义”以进行更详细的参数设置。
3.  **配置参数**：根据提示，提供必要的参数，例如文本内容、图片路径、颜色、位置等。
4.  **执行脚本**：运行对应的 Python 脚本来生成效果。
5.  **预览和调整**：预览生成的效果，如有需要，可返回上一步调整参数并重新生成。

## 使用指南

### 1. 片头/片尾

使用 `add_intro_outro.py` 脚本为你的视频添加片头或片尾。

**使用方法：**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_intro_outro.py [options]
```

**参数选项：**

*   `--input <video_path>`：输入视频文件路径。
*   `--output <video_path>`：输出视频文件路径。
*   `--type <intro|outro>`：指定是添加片头还是片尾。
*   `--template <template_name>`：选择一个预设模板 (例如 `modern`, `cyberpunk`)。
*   `--text <text>`：在片头/片尾中显示的文本。

### 2. 字幕/标题

使用 `add_subtitles.py` 脚本为你的视频添加字幕或标题。

**使用方法：**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_subtitles.py [options]
```

**参数选项：**

*   `--input <video_path>`：输入视频文件路径。
*   `--output <video_path>`：输出视频文件路径。
*   `--text <text>`：要显示的字幕文本。
*   `--start <time>`：字幕开始显示的时间 (格式：`HH:MM:SS`)。
*   `--end <time>`：字幕结束显示的时间 (格式：`HH:MM:SS`)。
*   `--style <style_name>`：选择一个预设的字幕风格 (例如 `simple`, `animated`)。

### 3. 转场

使用 `add_transition.py` 脚本在两个视频片段之间创建转场效果。

**使用方法：**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_transition.py [options]
```

**参数选项：**

*   `--input1 <video_path>`：第一个视频片段的路径。
*   `--input2 <video_path>`：第二个视频片段的路径。
*   `--output <video_path>`：输出视频文件路径。
*   `--type <fade|slide|wipe>`：选择转场类型。

### 4. 水印/边框

使用 `add_watermark.py` 脚本为你的视频添加水印或边框。

**使用方法：**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_watermark.py [options]
```

**参数选项：**

*   `--input <video_path>`：输入视频文件路径。
*   `--output <video_path>`：输出视频文件路径。
*   `--image <image_path>`：作为水印的图片路径。
*   `--position <top-left|bottom-right|center>`：水印的位置。
*   `--border-color <color>`：边框颜色 (例如 `white`, `#FF0000`)。

### 5. 下三分之一标题条

使用 `add_lower_third.py` 脚本为你的视频添加下三分之一标题条。

**使用方法：**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_lower_third.py [options]
```

**参数选项：**

*   `--input <video_path>`：输入视频文件路径。
*   `--output <video_path>`：输出视频文件路径。
*   `--title <text>`：主标题文本。
*   `--subtitle <text>`：副标题文本。
*   `--template <template_name>`：选择一个预设模板 (例如 `business`, `cartoon`)。

## 资源文件

*   **脚本**: 位于 `/home/ubuntu/skills/overlay-skill/scripts/` 目录下，包含了所有功能的实现代码。
*   **模板**: 位于 `/home/ubuntu/skills/overlay-skill/templates/` 目录下，包含了各种预设的动画、样式和配置文件。
*   **参考**: 位于 `/home/ubuntu/skills/overlay-skill/references/` 目录下，提供了 FFmpeg 和 MoviePy 的常用命令和技巧。
