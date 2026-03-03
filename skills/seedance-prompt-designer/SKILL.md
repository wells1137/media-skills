---
name: seedance-prompt-designer
description: Intelligently analyzes user-provided multimodal assets and creative intent to generate optimal, structured video generation prompts for the Seedance 2.0 model.
version: 1.1.0
---

# Seedance Prompt Designer Skill

This skill transforms a user's scattered multimodal assets (images, videos, audio) and ambiguous creative intent into a structured, executable prompt for the Seedance 2.0 video generation model.

## Core Workflow

This skill follows a strict three-phase workflow. The output of each phase is the input for the next.

### Phase 1: Recognition

**Goal**: Understand user input and form a preliminary list of creative elements.

1.  **Parse User Intent**: Extract core **Action** and **Style** directives from the user's natural language description.
2.  **Analyze Assets**: Iterate through all uploaded assets. Use the **"Asset Type -> Atomic Element"** mapping table in the `references/atomic_element_mapping.md` knowledge base to tag each asset with its most likely **Atomic Element** role.

    > **Example**:
    > - Input `portrait.png` -> Most likely role is `Subject Identity`.
    > - Input `dolly.mp4` -> Most likely role is `Cinematic Language`.

3.  **Output**: Generate an internal `recognition_output.json` file.

    ```json
    {
      "action_intent": "Make Mona Lisa drink a Coke",
      "style_intent": "Cinematic, close-up shot",
      "assets": [
        {
          "asset_name": "monalisa.png",
          "asset_type": "image",
          "potential_atomic_elements": ["Subject Identity", "Aesthetic Style"]
        },
        {
          "asset_name": "coke.png",
          "asset_type": "image",
          "potential_atomic_elements": ["Subject Identity-Object"]
        }
      ]
    }
    ```

### Phase 2: Mapping & Strategy

**Goal**: Convert the preliminary recognition results into a precise, executable reference strategy.

1.  **Determine Optimal Reference Method**: For each `potential_atomic_element` in `recognition_output.json`, consult the **"Atomic Element -> Optimal Reference Method"** framework in `references/atomic_element_mapping.md` to decide whether it should be referenced via **Text**, **Asset**, or a **Hybrid** approach.

2.  **Output**: Generate a `strategy_output.json` file, which is the core blueprint for the final prompt.

    ```json
    {
      "prompt_elements": {
        "text_prompts": [
          "A woman picks up a bottle of Coke and takes a sip",
          "Close-up shot, cinematic lighting"
        ],
        "asset_references": [
          {
            "atomic_element": "Subject Identity",
            "asset_name": "monalisa.png",
            "reference_syntax": "Use @monalisa as the subject reference"
          },
          {
            "atomic_element": "Subject Identity-Object",
            "asset_name": "coke.png",
            "reference_syntax": "The object appearing in the video is @coke"
          }
        ]
      }
    }
    ```

### Phase 3: Construction & Assembly

**Goal**: Generate the final, complete prompt that can be directly fed to Seedance 2.0.

1.  **Assemble Text**: Concatenate all `text_prompts` into a coherent natural language description.
2.  **Assemble @-Syntax**: Append all `reference_syntax` strings to the end of the text description.
3.  **Consult Templates (Optional)**: Based on user intent, consult `references/prompt_templates.md` to use more advanced templates for structuring the language.
4.  **Final Output**: Output a JSON object containing the `final_prompt` and `recommended_parameters`.

    ```json
    {
      "final_prompt": "A woman picks up a bottle of Coke and takes a sip. Close-up shot, cinematic lighting. Use @monalisa as the subject reference, the object appearing in the video is @coke.",
      "recommended_parameters": {
        "duration": 8,
        "aspect_ratio": "16:9"
      }
    }
    ```

## Knowledge Base

- **`/references/atomic_element_mapping.md`**: **Core Knowledge**. Contains the "Asset Type -> Atomic Element" and "Atomic Element -> Optimal Reference Method" mapping tables. **Must be consulted** during Phase 1 and Phase 2.
- **`/references/seedance_syntax_guide.md`**: Seedance 2.0 "@asset_name" syntax reference. **Must be consulted** during Phase 3 to ensure correct syntax generation.
- **`/references/prompt_templates.md`**: Advanced prompt templates. Optional consultation during Phase 3 for stylistic enhancement.
