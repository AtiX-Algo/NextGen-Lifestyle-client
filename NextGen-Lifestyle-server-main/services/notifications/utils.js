function normalizeBdNumber(input) {
  if (!input) return "";
  let s = String(input).trim();

  // remove spaces, hyphens
  s = s.replace(/[\s-]/g, "");

  // If user entered 8801..., add +
  if (/^8801\d{9}$/.test(s)) return `+${s}`;

  // If user entered 01..., convert to +8801...
  if (/^01\d{9}$/.test(s)) return `+880${s.slice(1)}`;

  // If already +8801...
  if (/^\+8801\d{9}$/.test(s)) return s;

  return s; // keep as-is (will fail validation)
}

function isValidBdNumber(input) {
  const s = normalizeBdNumber(input);
  return /^\+8801\d{9}$/.test(s);
}

function computeNextRetry(attempts) {
  // 1st retry after 30s, then 2m, then 10m
  const scheduleSeconds = [30, 120, 600];
  const idx = Math.min(attempts, scheduleSeconds.length - 1);
  return new Date(Date.now() + scheduleSeconds[idx] * 1000);
}

module.exports = { normalizeBdNumber, isValidBdNumber, computeNextRetry };
