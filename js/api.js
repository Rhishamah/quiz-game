const API_BASE = "http://127.0.0.1:8000/api";
const ALLOWED_CATEGORIES = ["Geography", "Science", "Programming", "Art & History"];

async function fetchQuestions(category = null) {
  const validCategory = category && ALLOWED_CATEGORIES.includes(category) ? category : null;
  const url = validCategory
    ? `${API_BASE}/questions/?category=${encodeURIComponent(validCategory)}`
    : `${API_BASE}/questions/`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch questions");
  return await response.json();
}

async function fetchLeaderboard() {
  const response = await fetch(`${API_BASE}/leaderboard/`);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return await response.json();
}

async function submitScore(playerName, score, totalQuestions) {
  const response = await fetch(`${API_BASE}/leaderboard/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_name: playerName,
      score,
      total_questions: totalQuestions,
    }),
  });
  if (!response.ok) throw new Error("Failed to submit score");
  return await response.json();
}
