function normalizeBdNumber(input) {
  if (!input) return "";
  let s = String(input).trim();

  // remove spaces, hyphens
  s = s.replace(/[\s-]/g, "");

  // +88017xxxxxxxx -> 88017xxxxxxxx
  if (/^\+8801\d{9}$/.test(s)) return s.slice(1);

  // 88017xxxxxxxx -> 88017xxxxxxxx
  if (/^8801\d{9}$/.test(s)) return s;

  // 017xxxxxxxx -> 88017xxxxxxxx
  if (/^01\d{9}$/.test(s)) return `880${s.slice(1)}`;

  return s; // keep as-is (will fail validation)
}

function isValidBdNumber(input) {
  const s = normalizeBdNumber(input);
  return /^8801\d{9}$/.test(s);
}

function computeNextRetry(attempts) {
  // 1st retry after 30s, then 2m, then 10m
  const scheduleSeconds = [30, 120, 600];
  const idx = Math.min(Math.max(0, Number(attempts) - 1), scheduleSeconds.length - 1);
  return new Date(Date.now() + scheduleSeconds[idx] * 1000);
}

module.exports = { normalizeBdNumber, isValidBdNumber, computeNextRetry };
