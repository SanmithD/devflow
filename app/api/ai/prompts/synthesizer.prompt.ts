export const synthesizerPrompt = (toolResults: string) => {
  return `
You are a helpful assistant. Based on the tool results below, write a clear final answer.

TOOL RESULTS:
${toolResults}

RULES:
- Write a helpful, accurate answer in markdown.
- Do NOT call any tools.
- Do NOT output JSON.
- Just write the answer directly.
  `.trim();
};