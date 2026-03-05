const form = document.getElementById("research-form");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const oppEl = document.getElementById("opportunities");
const chartsEl = document.getElementById("charts");
const deepEl = document.getElementById("deepdive");
const runBtn = document.getElementById("run-btn");

function show(el) {
  el.classList.remove("hidden");
}

function toObject(formData) {
  const payload = {};
  for (const [k, v] of formData.entries()) payload[k] = v;
  payload.chartLimit = Number(payload.chartLimit || 25);
  payload.deepDiveCount = Number(payload.deepDiveCount || 8);
  payload.shortlistLimit = 12;
  payload.reviewCount = 200;
  return payload;
}

function esc(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSummary(data) {
  const s = data.marketSummary;
  const dist = Object.entries(s.installBracketDistribution || {})
    .map(([k, v]) => `<div class="stat"><strong>${esc(k)}</strong><br>${esc(v)} apps</div>`)
    .join("");
  summaryEl.innerHTML = `
    <h2>Market Summary</h2>
    <div class="stat-list">
      <div class="stat"><strong>${s.chartAppsCollected}</strong><br>Chart Apps</div>
      <div class="stat"><strong>${s.shortlistedApps}</strong><br>Shortlisted by Query</div>
      <div class="stat"><strong>${s.deepDiveApps}</strong><br>Deep-Dive Apps</div>
      <div class="stat"><strong>${esc(data.generatedAt)}</strong><br>Generated At (UTC)</div>
    </div>
    <h3>Install Bracket Distribution</h3>
    <div class="stat-list">${dist}</div>
  `;
  show(summaryEl);
}

function renderOpportunities(data) {
  const cards = (data.opportunities || []).map((o) => `
    <article class="opp">
      <h3>#${o.rank} ${esc(o.name)}</h3>
      <p><strong>Pitch:</strong> ${esc(o.pitch)}</p>
      <p><strong>Gap:</strong> ${esc(o.gap)}</p>
      <p><strong>Target User:</strong> ${esc(o.targetUser)}</p>
      <p><strong>Monetization:</strong> ${esc(o.monetization)}</p>
      <p><strong>Complexity:</strong> ${esc(o.complexity)} | <strong>Score:</strong> ${esc(o.score)}</p>
    </article>
  `).join("");
  oppEl.innerHTML = `<h2>Top 3 Opportunities</h2><div class="opps">${cards}</div>`;
  show(oppEl);
}

function renderCharts(data) {
  const rows = (data.charts || []).slice(0, 20).map((a) => `
    <tr>
      <td>${esc(a.rank)}</td>
      <td>${esc(a.title || a.appId)}</td>
      <td>${esc(a.developer || "-")}</td>
      <td>${esc(a.installs || "-")}</td>
      <td>${esc(a.score || "-")}</td>
      <td>${esc(a.reviews || "-")}</td>
      <td>${esc(a.offersIAP ? "IAP" : "No IAP")}</td>
    </tr>
  `).join("");
  chartsEl.innerHTML = `
    <h2>Category Chart Snapshot</h2>
    <table>
      <thead>
        <tr><th>Rank</th><th>App</th><th>Developer</th><th>Installs</th><th>Rating</th><th>Reviews</th><th>Monetization</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  show(chartsEl);
}

function renderDeepDive(data) {
  const cards = (data.deepDive || []).map((row) => {
    const app = row.app || {};
    const themes = row.reviewSummary?.oneStarThemes || {};
    const themeLine = Object.entries(themes).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(" | ") || "No strong theme detected";
    return `
      <article class="deep-card">
        <h3>${esc(app.title || app.appId)}</h3>
        <p class="muted">${esc(app.installs || "-")} installs | Rating ${esc(app.score || "-")} | Reviews ${esc(app.reviews || "-")}</p>
        <p><strong>Themes:</strong> ${esc(themeLine)}</p>
        <p><strong>Signals:</strong> weak@scale=${esc(row.opportunitySignals?.weakRatingAtScale)} , repeatedTheme=${esc(row.opportunitySignals?.repeatedComplaintTheme)}</p>
      </article>
    `;
  }).join("");
  deepEl.innerHTML = `<h2>Competitor Deep-Dive</h2>${cards}`;
  show(deepEl);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Running research. This can take 30-90 seconds.";
  runBtn.disabled = true;
  try {
    const payload = toObject(new FormData(form));
    const res = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API failed: ${res.status}`);
    const data = await res.json();
    renderSummary(data);
    renderOpportunities(data);
    renderCharts(data);
    renderDeepDive(data);
    statusEl.textContent = "Research complete.";
  } catch (err) {
    statusEl.textContent = `Failed: ${err.message}`;
  } finally {
    runBtn.disabled = false;
  }
});
