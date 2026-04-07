const TECH_OUTPUT_PATTERNS = [
  /<[a-z][\s\S]*>/i,
  /function\s*\(/,
  /SELECT\s+.+\s+FROM/i,
  /import\s+.+\s+from/,
  /```/,
  /console\.(log|error)/,
];

function validateOutput(text) {
  if (!text || typeof text !== 'string') return false;
  if (text.trim().length < 5) return false;
  for (const pattern of TECH_OUTPUT_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  return true;
}

module.exports = { validateOutput };
