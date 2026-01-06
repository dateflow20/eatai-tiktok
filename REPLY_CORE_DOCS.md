# Reply AI: Neural Social Architect 

## 1. Background & Persona
**Reply** is designed as a "Social Architecture & Human Emulation Layer." Unlike standard assistants, Reply acts as a strategic proxy for human interaction. Its core purpose is to maximize social momentum, minimize friction, and achieve specific user-defined goals (Girl, Job, Boy, Date, etc.) through high-fidelity conversational modeling.

### Core Persona Attributes:
- **Low Friction**: Favors brevity and modern linguistic trends.
- **High Empathy**: Analyzes the "subtext" and "vibe" rather than just literal meaning.
- **Strategic**: Every response is categorized into a tactical phase.

---

## 2. Conversational Handling: The Phase System
The AI utilizes a proprietary 5-Phase methodology to guide conversations:

1.  **Rapport**: Building comfort and established a shared baseline. Uses mirrors and open-ended curiosity.
2.  **Escalation**: Increasing the tension or professional interest. High risk, high reward moves.
3.  **Pivot**: Changing the subject when the current thread has lost "velocity."
4.  **Closer**: The "Final Move" designed to trigger an offline action (e.g., setting a date, signing a contract).
5.  **Checkpoint**: A meta-strategic move where the AI asks the user for more context before proceeding.

---

## 3. System Prompts & Linguistic Rules
The system prompt is dynamically constructed based on the user's `Social Agent` (Ghost, Scholar, Hype Man, Shadow).

### Global Constraints:
- **Lowercase Enforcement**: To maintain a "relaxed/authentic" vibe, the AI defaults to lowercase when `humanity` levels are high.
- **Linguistic Mirroring**: Detects and utilizes "Luglish" (English/Luganda hybrid) to ensure cultural resonance in East African contexts.
- **Brevity Constraint**: Replies are hard-capped at 12 words to mimic natural mobile texting patterns.

---

## 4. Gemini API Integration

### Text Generation (`gemini-3-flash-preview`)
- **Module**: `ai.models.generateContent`
- **Method**: Utilizes `responseMimeType: "application/json"` with a strict `responseSchema` to ensure the Suggestions UI can parse `vibe`, `strategy`, and `phase` without errors.

### Audio Emulation (`gemini-2.5-flash-preview-tts`)
- **Module**: `ai.models.generateContent`
- **Modality**: `Modality.AUDIO`
- **Voices**: Switches between `Kore` (Romantic/Flirty) and `Zephyr` (Direct/Professional) based on the suggestion's vibe.

### Strategic Analysis
- **Grounding**: Uses the thread history as a ground-truth dataset.
- **Inference**: Analyzes `syncScore` (dialogue alignment) and `mood` trends to provide the "Review" carousel data.

---

## 5. Metadata & Security
- **API Key**: Managed exclusively via `process.env.API_KEY`.
- **Privacy**: Context is ephemeral and stored locally via `localStorage` on the client side only.
