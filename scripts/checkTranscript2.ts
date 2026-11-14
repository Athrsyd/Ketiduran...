import fs from 'fs';
const lines = fs.readFileSync('C:/Users/urahm/.gemini/antigravity/brain/eca72461-6e46-4da9-a60a-8d8d658d79be/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index >= 1115 && obj.step_index <= 1145) {
      if (obj.type === 'USER_INPUT') console.log('STEP', obj.step_index, 'USER:', obj.content);
      if (obj.type === 'PLANNER_RESPONSE' && obj.content) console.log('STEP', obj.step_index, 'BOT:', obj.content.substring(0, 300));
    }
  } catch (e) {}
}
