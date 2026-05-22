# ANSWERS

## How to run
1. Install Node.js 18+.
2. In root run:
   - npm install
   - npm run dev
3. Open the client shown by Vite (typically http://localhost:5173). The server runs on the port configured in server/index.js.

## Stack choice
I chose a Node/Express API + React (Vite) client because the task needs a simple REST proxy to the Hugging Face API and a fast interactive UI. This stack is quick to iterate on, has strong ecosystem support, and is easy to deploy. A worse choice would have been a heavy framework like Next.js or a typed backend (Java/Spring) for this small scope, because it adds setup and build complexity without clear benefit.

## One real edge case
The HF API sometimes returns cardData.base_model as an array (not a string). I handle that in server/routes/models.js lines 12-13 by selecting the first entry when it is an array, and then using that value in the normalized output (line 33). Without this, the UI would show "—" or render an array as a string, which would make the "fine-tune of" line incorrect or unreadable.

## AI usage
- Tool: GitHub Copilot (GPT-5.2-Codex). Asked to update the HF API params and normalize the response fields. It produced the initial params and normalization changes. I then changed the output to add fallbacks to cardData and handle base_model arrays after inspecting a real API response, because the first version left many fields as "—".
- Tool: GitHub Copilot (GPT-5.2-Codex). Asked to update ModelCard and comparison views to display new normalized fields. It generated the JSX updates and formatting helpers.
- Tool: GitHub Copilot (GPT-5.2-Codex). Asked to adjust comparison panel widths, remove horizontal scroll, and align row headers. It provided the CSS/JSX tweaks.
- Tool: Claude Chat (Sonnet 4.6). Used for initial planning and research.

## Honest gap
The UI still lacks a polished empty/loading state for new fields (for example, showing a subtle placeholder for missing architecture or datasets). With another day, I would add a compact “metadata completeness” indicator and improve formatting for long lists (datasets/languages) with collapsible chips or tooltips. Overall Ui needs refinement too.
