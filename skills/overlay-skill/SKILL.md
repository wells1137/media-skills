---
name: overlay-skill
description: Adds professional packaging and motion graphics to videos, including intros/outros, subtitles, transitions, watermarks, and lower thirds. Supports multiple styles and custom options.
version: 1.1.0
---

# Overlay Skill

This skill adds a variety of professional packaging and motion graphics to videos, enhancing their overall quality. It supports both FFmpeg and MoviePy as backend engines and provides a rich set of preset templates and flexible custom parameters.

## Core Features

This skill supports five core features:

1.  **Intro/Outro**: Add an engaging opening or a professional closing to your video.
2.  **Subtitles/Titles**: Overlay static or dynamic text information on the video.
3.  **Transitions**: Create smooth or dynamic transitions between two video clips.
4.  **Watermark/Borders**: Add copyright information or decorative borders to your video.
5.  **Lower Thirds**: Display names, locations, or other information in the lower part of the screen.

## Workflow

To use this skill, follow these general steps:

1.  **Select Feature**: Choose one of the five core features based on your needs.
2.  **Choose Style/Template**: Select a preset style or template for the chosen feature. You can also choose "custom" for more detailed parameter settings.
3.  **Configure Parameters**: Provide the necessary parameters as prompted, such as text content, image paths, colors, and positions.
4.  **Execute Script**: Run the corresponding Python script to generate the effect.
5.  **Preview & Adjust**: Preview the generated effect and, if necessary, return to the previous step to adjust parameters and regenerate.

## Usage Guide

### 1. Intro/Outro

Use the `add_intro_outro.py` script to add an intro or outro to your video.

**Usage:**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_intro_outro.py [options]
```

**Options:**

*   `--input <video_path>`: Path to the input video file.
*   `--output <video_path>`: Path to the output video file.
*   `--type <intro|outro>`: Specify whether to add an intro or outro.
*   `--template <template_name>`: Choose a preset template (e.g., `modern`, `cyberpunk`).
*   `--text <text>`: Text to display in the intro/outro.

### 2. Subtitles/Titles

Use the `add_subtitles.py` script to add subtitles or titles to your video.

**Usage:**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_subtitles.py [options]
```

**Options:**

*   `--input <video_path>`: Path to the input video file.
*   `--output <video_path>`: Path to the output video file.
*   `--text <text>`: The subtitle text to display.
*   `--start <time>`: Start time for the subtitle (format: `HH:MM:SS`).
*   `--end <time>`: End time for the subtitle (format: `HH:MM:SS`).
*   `--style <style_name>`: Choose a preset subtitle style (e.g., `simple`, `animated`).

### 3. Transitions

Use the `add_transition.py` script to create a transition effect between two video clips.

**Usage:**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_transition.py [options]
```

**Options:**

*   `--input1 <video_path>`: Path to the first video clip.
*   `--input2 <video_path>`: Path to the second video clip.
*   `--output <video_path>`: Path to the output video file.
*   `--type <fade|slide|wipe>`: Choose the transition type.

### 4. Watermark/Borders

Use the `add_watermark.py` script to add a watermark or border to your video.

**Usage:**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_watermark.py [options]
```

**Options:**

*   `--input <video_path>`: Path to the input video file.
*   `--output <video_path>`: Path to the output video file.
*   `--image <image_path>`: Path to the watermark image.
*   `--position <top-left|bottom-right|center>`: Position of the watermark.
*   `--border-color <color>`: Border color (e.g., `white`, `#FF0000`).

### 5. Lower Thirds

Use the `add_lower_third.py` script to add a lower third to your video.

**Usage:**

```bash
python /home/ubuntu/skills/overlay-skill/scripts/add_lower_third.py [options]
```

**Options:**

*   `--input <video_path>`: Path to the input video file.
*   `--output <video_path>`: Path to the output video file.
*   `--title <text>`: Main title text.
*   `--subtitle <text>`: Subtitle text.
*   `--template <template_name>`: Choose a preset template (e.g., `business`, `cartoon`).

## Resources

*   **Scripts**: Located in `/home/ubuntu/skills/overlay-skill/scripts/`, containing the implementation code for all features.
*   **Templates**: Located in `/home/ubuntu/skills/overlay-skill/templates/`, containing various preset animations, styles, and configuration files.
*   **References**: Located in `/home/ubuntu/skills/overlay-skill/references/`, providing common commands and tips for FFmpeg and MoviePy.
