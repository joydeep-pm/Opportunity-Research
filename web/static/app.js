const state = {
  runId: null,
  initialized: false,
  prdGenerated: false,
  initConfig: null,
  opportunities: [],
  documents: [],
};

const el = {
  form: document.getElementById("research-form"),
  status: document.getElementById("status"),
  runBtn: document.getElementById("run-btn"),
  loadRunId: document.getElementById("load-run-id"),
  loadRunBtn: document.getElementById("load-run-btn"),
  runOverview: document.getElementById("run-overview"),
  globalActions: document.getElementById("global-actions"),
  copyRunId: document.getElementById("copy-run-id"),
  downloadAll: document.getElementById("download-all"),
  docsPanel: document.getElementById("documents-panel"),
  docGrid: document.getElementById("document-grid"),
  viewerPanel: document.getElementById("viewer-panel"),
  viewerMeta: document.getElementById("viewer-meta"),
  viewerContent: document.getElementById("viewer-content"),
  opportunitiesPanel: document.getElementById("opportunities-panel"),
  opportunitiesGrid: document.getElementById("opportunities-grid"),
  initPanel: document.getElementById("init-panel"),
  initBtn: document.getElementById("init-btn"),
  initStatus: document.getElementById("init-status"),
  selectedRank: document.getElementById("selected-rank"),
  projectName: document.getElementById("project-name"),
  stackPref: document.getElementById("stack-pref"),
  prdPanel: document.getElementById("prd-panel"),
  prdLock: document.getElementById("prd-lock"),
  generatePrd: document.getElementById("generate-prd"),
  prdStatus: document.getElementById("prd-status"),
  prdMd: document.getElementById("prd-md"),
  prdJson: document.getElementById("prd-json"),
  prdPdf: document.getElementById("prd-pdf"),
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function show(node) {
  node.classList.remove("hidden");
}

function hide(node) {
  node.classList.add("hidden");
}

function setStatus(message, target = el.status) {
  target.textContent = message;
}

function formPayload() {
  const data = new FormData(el.form);
  return {
    category: data.get("category"),
    country: data.get("country"),
    lang: data.get("lang"),
    query: data.get("query"),
    chartLimit: Number(data.get("chartLimit") || 25),
    deepDiveCount: Number(data.get("deepDiveCount") || 8),
    shortlistLimit: 12,
    reviewCount: 200,
  };
}

function runUrl(runId) {
  return `${window.location.origin}${window.location.pathname}?run=${runId}`;
}

function extLink(runId, docKey, ext) {
  return `/api/runs/${encodeURIComponent(runId)}/documents/${docKey}.${ext}`;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

function hydrateState(payload) {
  state.runId = payload.runId;
  state.initialized = Boolean(payload.initialized);
  state.prdGenerated = Boolean(payload.prdGenerated);
  state.initConfig = payload.initConfig || null;
  state.opportunities = payload.opportunities || [];
  state.documents = payload.documents || [];
}

function renderRunOverview(payload) {
  const market = payload.marketSummary || {};
  const dist = Object.entries(market.installBracketDistribution || {})
    .map(([k, v]) => `<span class="chip">${esc(k)}: ${esc(v)}</span>`)
    .join("");

  const initializedBadge = state.initialized
    ? `<span class="badge good">Initialized</span>`
    : `<span class="badge warn">Not Initialized</span>`;

  el.runOverview.innerHTML = `
    <h2>Run Overview</h2>
    <div class="overview-grid">
      <div><strong>Run ID</strong><br><code>${esc(payload.runId)}</code></div>
      <div><strong>Generated</strong><br>${esc(payload.generatedAt || "-")}</div>
      <div><strong>Chart Apps</strong><br>${esc(market.chartAppsCollected || 0)}</div>
      <div><strong>Deep-Dive Apps</strong><br>${esc(market.deepDiveApps || 0)}</div>
    </div>
    <p style="margin-top:10px;">${initializedBadge}</p>
    <div>${dist}</div>
  `;
  show(el.runOverview);
}

function renderDocuments() {
  const runId = state.runId;
  const cards = state.documents.map((doc) => {
    const generated = Boolean(doc.generated);
    const formats = doc.formats || [];
    const mdEnabled = generated && formats.includes("md");
    const jsonEnabled = generated && formats.includes("json");
    const pdfEnabled = generated && formats.includes("pdf");

    const pdfHint = doc.pdfError ? `<p class="status">PDF: ${esc(doc.pdfError)}</p>` : "";

    return `
      <article class="doc-card">
        <h3>${esc(doc.title || doc.docKey)}</h3>
        <p>${generated ? "Generated" : "Not generated"}</p>
        <div class="doc-actions">
          <button class="btn ghost mini" ${mdEnabled ? "" : "disabled"} data-action="view" data-doc="${esc(doc.docKey)}">View</button>
          <a class="btn ghost mini ${mdEnabled ? "" : "disabled-link"}" ${mdEnabled ? `href="${extLink(runId, doc.docKey, "md")}"` : "href=\"#\""} download>MD</a>
          <a class="btn ghost mini ${jsonEnabled ? "" : "disabled-link"}" ${jsonEnabled ? `href="${extLink(runId, doc.docKey, "json")}"` : "href=\"#\""} download>JSON</a>
          <a class="btn ghost mini ${pdfEnabled ? "" : "disabled-link"}" ${pdfEnabled ? `href="${extLink(runId, doc.docKey, "pdf")}"` : "href=\"#\""} download>PDF</a>
        </div>
        ${pdfHint}
      </article>
    `;
  }).join("");

  el.docGrid.innerHTML = cards;
  show(el.docsPanel);

  el.docGrid.querySelectorAll("button[data-action='view']").forEach((btn) => {
    btn.addEventListener("click", () => viewDocumentMarkdown(btn.dataset.doc));
  });
}

function renderOpportunities() {
  const cards = state.opportunities.map((opp) => `
    <article class="opp-card">
      <h3>#${esc(opp.rank)} ${esc(opp.name)}</h3>
      <p><strong>Pitch:</strong> ${esc(opp.pitch)}</p>
      <p><strong>Gap:</strong> ${esc(opp.gap)}</p>
      <p><strong>Target User:</strong> ${esc(opp.targetUser)}</p>
      <p><strong>Monetization:</strong> ${esc(opp.monetization)}</p>
      <p><strong>Competition:</strong> ${esc(opp.competition)}</p>
      <p><strong>Complexity:</strong> ${esc(opp.complexity)} | <strong>Score:</strong> ${esc(opp.score)}</p>
      <label class="opp-select">
        <input type="radio" name="opp-rank" value="${esc(opp.rank)}" ${Number(opp.rank) === Number(el.selectedRank.value) ? "checked" : ""}>
        Select for initialization
      </label>
    </article>
  `).join("");

  el.opportunitiesGrid.innerHTML = cards;
  show(el.opportunitiesPanel);

  el.opportunitiesGrid.querySelectorAll("input[name='opp-rank']").forEach((radio) => {
    radio.addEventListener("change", () => {
      el.selectedRank.value = radio.value;
    });
  });
}

function updatePrdPanel() {
  show(el.prdPanel);
  if (state.initialized) {
    el.prdLock.textContent = "Initialization complete. You can now generate PRD.";
    el.generatePrd.disabled = false;
  } else {
    el.prdLock.textContent = "PRD is locked until project initialization is complete.";
    el.generatePrd.disabled = true;
  }

  const hasPrd = state.documents.some((d) => d.docKey === "prd" && d.generated);
  const prdDoc = state.documents.find((d) => d.docKey === "prd") || { formats: [] };

  if (hasPrd) {
    el.prdMd.href = extLink(state.runId, "prd", "md");
    el.prdJson.href = extLink(state.runId, "prd", "json");
    el.prdPdf.href = prdDoc.formats.includes("pdf") ? extLink(state.runId, "prd", "pdf") : "#";

    [el.prdMd, el.prdJson].forEach((a) => a.classList.remove("disabled-link"));
    if (prdDoc.formats.includes("pdf")) {
      el.prdPdf.classList.remove("disabled-link");
    } else {
      el.prdPdf.classList.add("disabled-link");
    }
  } else {
    [el.prdMd, el.prdJson, el.prdPdf].forEach((a) => {
      a.href = "#";
      a.classList.add("disabled-link");
    });
  }
}

async function viewDocumentMarkdown(docKey) {
  if (!state.runId) return;
  try {
    const res = await fetch(extLink(state.runId, docKey, "md"));
    const text = await res.text();
    if (!res.ok) throw new Error(`Unable to load ${docKey}.md`);
    el.viewerMeta.innerHTML = `<strong>${esc(docKey)}.md</strong> in run <code>${esc(state.runId)}</code>`;
    el.viewerContent.textContent = text;
    show(el.viewerPanel);
  } catch (err) {
    setStatus(`View failed: ${err.message}`);
  }
}

function renderCommon(payload) {
  hydrateState(payload);
  renderRunOverview(payload);
  renderDocuments();
  renderOpportunities();
  show(el.globalActions);
  show(el.initPanel);
  updatePrdPanel();

  el.downloadAll.href = `/api/runs/${encodeURIComponent(state.runId)}/download/all`;
  el.loadRunId.value = state.runId;
  history.replaceState({}, "", `?run=${encodeURIComponent(state.runId)}`);
}

async function runResearch() {
  setStatus("Running research. This may take around 60-120 seconds.");
  el.runBtn.disabled = true;
  try {
    const payload = await fetchJson("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload()),
    });
    renderCommon(payload);
    setStatus("Research complete. Documents generated.");
    setStatus("", el.initStatus);
    setStatus("", el.prdStatus);
  } catch (err) {
    setStatus(`Research failed: ${err.message}`);
  } finally {
    el.runBtn.disabled = false;
  }
}

async function loadRun(runId) {
  setStatus(`Loading run ${runId} ...`);
  try {
    const payload = await fetchJson(`/api/runs/${encodeURIComponent(runId)}`);
    renderCommon(payload);
    setStatus("Run loaded successfully.");
  } catch (err) {
    setStatus(`Load failed: ${err.message}`);
  }
}

async function initializeProject() {
  if (!state.runId) {
    setStatus("Run research first.", el.initStatus);
    return;
  }

  const selectedRank = Number(el.selectedRank.value || 1);
  const body = {
    selectedOpportunityRank: selectedRank,
    projectName: el.projectName.value.trim(),
    platform: "android",
    stackPreference: el.stackPref.value,
  };

  setStatus("Initializing project...", el.initStatus);
  el.initBtn.disabled = true;
  try {
    await fetchJson(`/api/runs/${encodeURIComponent(state.runId)}/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = await fetchJson(`/api/runs/${encodeURIComponent(state.runId)}`);
    renderCommon(payload);
    setStatus("Project initialized. PRD unlocked.", el.initStatus);
  } catch (err) {
    setStatus(`Initialization failed: ${err.message}`, el.initStatus);
  } finally {
    el.initBtn.disabled = false;
  }
}

async function generatePrd() {
  if (!state.runId) return;
  el.generatePrd.disabled = true;
  setStatus("Generating PRD...", el.prdStatus);

  try {
    await fetchJson(`/api/runs/${encodeURIComponent(state.runId)}/prd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeTechStackNotes: true, includeLaunchPlan: true }),
    });

    const payload = await fetchJson(`/api/runs/${encodeURIComponent(state.runId)}`);
    renderCommon(payload);
    setStatus("PRD generated and available for download.", el.prdStatus);
  } catch (err) {
    setStatus(`PRD generation failed: ${err.message}`, el.prdStatus);
  } finally {
    updatePrdPanel();
  }
}

el.form.addEventListener("submit", (event) => {
  event.preventDefault();
  runResearch();
});

el.loadRunBtn.addEventListener("click", () => {
  const runId = el.loadRunId.value.trim();
  if (!runId) {
    setStatus("Enter a run ID.");
    return;
  }
  loadRun(runId);
});

el.copyRunId.addEventListener("click", async () => {
  if (!state.runId) return;
  try {
    await navigator.clipboard.writeText(state.runId);
    setStatus("Run ID copied.");
  } catch {
    setStatus(`Copy failed. Run ID: ${state.runId}`);
  }
});

el.initBtn.addEventListener("click", initializeProject);
el.generatePrd.addEventListener("click", generatePrd);

const queryRun = new URLSearchParams(window.location.search).get("run");
if (queryRun) {
  el.loadRunId.value = queryRun;
  loadRun(queryRun);
}
