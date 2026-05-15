/**
 * Torneo — llave de eliminación (8 equipos)
 * =========================================
 * Edita EQUIPOS y, si quieres, RESULTADOS_INICIALES abajo.
 */

const EQUIPOS = {
  cuarto1: ["Los Cerezos", "Deportivo Norte"],
  cuarto2: ["Atlético Sur", "Unión Este"],
  cuarto3: ["Central FC", "Costa Libre"],
  cuarto4: ["Río Verde", "Cumbres FC"],
};

/** null = sin resultado aún; números = goles/puntos */
const RESULTADOS_INICIALES = {
  c1: [null, null],
  c2: [null, null],
  c3: [null, null],
  c4: [null, null],
  s1: [null, null],
  s2: [null, null],
  final: [null, null],
  tercerLugar: [null, null],
};

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

function parseScore(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function winnerFromScores(a, b, s1, s2) {
  if (s1 === null || s2 === null) return null;
  if (s1 > s2) return "a";
  if (s2 > s1) return "b";
  return "tie";
}

function teamLabel(name) {
  const t = (name || "").trim();
  return t.length ? t : "—";
}

function buildState(readInputs = true) {
  const scores = {};
  const names = {
    cuarto1: [...EQUIPOS.cuarto1],
    cuarto2: [...EQUIPOS.cuarto2],
    cuarto3: [...EQUIPOS.cuarto3],
    cuarto4: [...EQUIPOS.cuarto4],
  };

  if (readInputs) {
    qsa("input[data-score-key]").forEach((el) => {
      const key = el.getAttribute("data-score-key");
      const idx = Number(el.getAttribute("data-score-idx"));
      if (!scores[key]) scores[key] = [null, null];
      scores[key][idx] = parseScore(el.value);
    });
    qsa("[data-team-key]").forEach((el) => {
      const key = el.getAttribute("data-team-key");
      const side = el.getAttribute("data-team-side");
      if (key && side && names[key]) {
        const i = side === "a" ? 0 : 1;
        names[key][i] = el.value;
      }
    });
  } else {
    Object.assign(scores, {
      c1: [...RESULTADOS_INICIALES.c1],
      c2: [...RESULTADOS_INICIALES.c2],
      c3: [...RESULTADOS_INICIALES.c3],
      c4: [...RESULTADOS_INICIALES.c4],
      s1: [...RESULTADOS_INICIALES.s1],
      s2: [...RESULTADOS_INICIALES.s2],
      final: [...RESULTADOS_INICIALES.final],
      tercerLugar: [...RESULTADOS_INICIALES.tercerLugar],
    });
  }

  const c1w = winnerFromScores(
    names.cuarto1[0],
    names.cuarto1[1],
    scores.c1?.[0] ?? null,
    scores.c1?.[1] ?? null
  );
  const c2w = winnerFromScores(
    names.cuarto2[0],
    names.cuarto2[1],
    scores.c2?.[0] ?? null,
    scores.c2?.[1] ?? null
  );
  const c3w = winnerFromScores(
    names.cuarto3[0],
    names.cuarto3[1],
    scores.c3?.[0] ?? null,
    scores.c3?.[1] ?? null
  );
  const c4w = winnerFromScores(
    names.cuarto4[0],
    names.cuarto4[1],
    scores.c4?.[0] ?? null,
    scores.c4?.[1] ?? null
  );

  const semi1Home = c1w === "a" ? names.cuarto1[0] : c1w === "b" ? names.cuarto1[1] : null;
  const semi1Away = c2w === "a" ? names.cuarto2[0] : c2w === "b" ? names.cuarto2[1] : null;
  const semi2Home = c3w === "a" ? names.cuarto3[0] : c3w === "b" ? names.cuarto3[1] : null;
  const semi2Away = c4w === "a" ? names.cuarto4[0] : c4w === "b" ? names.cuarto4[1] : null;

  const s1 = winnerFromScores(semi1Home, semi1Away, scores.s1?.[0] ?? null, scores.s1?.[1] ?? null);
  const s2 = winnerFromScores(semi2Home, semi2Away, scores.s2?.[0] ?? null, scores.s2?.[1] ?? null);

  const semi1Loser =
    s1 === "a" ? semi1Away : s1 === "b" ? semi1Home : null;
  const semi2Loser =
    s2 === "a" ? semi2Away : s2 === "b" ? semi2Home : null;

  const finalHome = s1 === "a" ? semi1Home : s1 === "b" ? semi1Away : null;
  const finalAway = s2 === "a" ? semi2Home : s2 === "b" ? semi2Away : null;

  const fw = winnerFromScores(
    finalHome,
    finalAway,
    scores.final?.[0] ?? null,
    scores.final?.[1] ?? null
  );
  const champion = fw === "a" ? finalHome : fw === "b" ? finalAway : null;
  const second = fw === "a" ? finalAway : fw === "b" ? finalHome : null;

  const tw = winnerFromScores(
    semi1Loser,
    semi2Loser,
    scores.tercerLugar?.[0] ?? null,
    scores.tercerLugar?.[1] ?? null
  );
  const third =
    tw === "a" ? semi1Loser : tw === "b" ? semi2Loser : null;

  return {
    names,
    scores,
    quarters: {
      c1: { w: c1w, teams: names.cuarto1, s: scores.c1 },
      c2: { w: c2w, teams: names.cuarto2, s: scores.c2 },
      c3: { w: c3w, teams: names.cuarto3, s: scores.c3 },
      c4: { w: c4w, teams: names.cuarto4, s: scores.c4 },
    },
    semis: {
      teams1: [semi1Home, semi1Away],
      teams2: [semi2Home, semi2Away],
      w1: s1,
      w2: s2,
      losers: [semi1Loser, semi2Loser],
    },
    final: { teams: [finalHome, finalAway], w: fw, s: scores.final },
    podium: { champion, second, third },
    bronzeTeams: [semi1Loser, semi2Loser],
  };
}

function rowHtml({ side, teamKey, teamSide, scoreKey, scoreIdx, readOnlyTeam, teamName }) {
  const teamCell = readOnlyTeam
    ? `<span class="match__team" data-display="${scoreKey}-${side}">${teamLabel(teamName)}</span>`
    : `<label class="match__team"><input type="text" data-team-key="${teamKey}" data-team-side="${teamSide}" value="${escapeAttr(
        EQUIPOS[teamKey][teamSide === "a" ? 0 : 1]
      )}" placeholder="Nombre del equipo" autocomplete="off" /></label>`;

  const initial = RESULTADOS_INICIALES[scoreKey]?.[scoreIdx];
  const val =
    initial !== null && initial !== undefined && initial !== ""
      ? String(initial)
      : "";

  return `
    <div class="match__row" data-row="${scoreKey}-${side}">
      ${teamCell}
      <div class="match__score-stepper">
        <span class="match__score-stepper__grip" aria-hidden="true"></span>
        <div class="match__score-stepper__panel">
          <button type="button" class="match__score-btn match__score-btn--up" aria-label="Sumar un gol" data-score-nudge="up"></button>
          <input class="match__score-field" type="number" inputmode="numeric" min="0" max="99" step="1" placeholder="–"
        data-score-key="${scoreKey}" data-score-idx="${scoreIdx}" value="${val === "" ? "" : escapeAttr(val)}" />
          <button type="button" class="match__score-btn match__score-btn--down" aria-label="Restar un gol" data-score-nudge="down"></button>
        </div>
      </div>
    </div>
  `;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function matchCard(title, inner) {
  return `
    <article class="match" aria-label="${escapeAttr(title)}">
      ${inner}
    </article>
  `;
}

function renderQuarters(container) {
  const pairs = [
    { key: "cuarto1", sk: "c1", t: "Cuartos — Partido 1" },
    { key: "cuarto2", sk: "c2", t: "Cuartos — Partido 2" },
    { key: "cuarto3", sk: "c3", t: "Cuartos — Partido 3" },
    { key: "cuarto4", sk: "c4", t: "Cuartos — Partido 4" },
  ];

  container.innerHTML = pairs
    .map(({ key, sk, t }) =>
      matchCard(
        t,
        `
        ${rowHtml({ side: "a", teamKey: key, teamSide: "a", scoreKey: sk, scoreIdx: 0, readOnlyTeam: false })}
        ${rowHtml({ side: "b", teamKey: key, teamSide: "b", scoreKey: sk, scoreIdx: 1, readOnlyTeam: false })}
      `
      )
    )
    .join("");
}

function renderSemi(container) {
  container.innerHTML = [
    matchCard(
      "Semifinal 1",
      `${rowHtml({
        side: "a",
        readOnlyTeam: true,
        scoreKey: "s1",
        scoreIdx: 0,
        teamName: "",
      })}
      ${rowHtml({
        side: "b",
        readOnlyTeam: true,
        scoreKey: "s1",
        scoreIdx: 1,
        teamName: "",
      })}`
    ),
    matchCard(
      "Semifinal 2",
      `${rowHtml({
        side: "a",
        readOnlyTeam: true,
        scoreKey: "s2",
        scoreIdx: 0,
        teamName: "",
      })}
      ${rowHtml({
        side: "b",
        readOnlyTeam: true,
        scoreKey: "s2",
        scoreIdx: 1,
        teamName: "",
      })}`
    ),
  ].join("");
}

function renderFinal(container) {
  container.innerHTML = matchCard(
    "Final",
    `${rowHtml({
      side: "a",
      readOnlyTeam: true,
      scoreKey: "final",
      scoreIdx: 0,
      teamName: "",
    })}
    ${rowHtml({
      side: "b",
      readOnlyTeam: true,
      scoreKey: "final",
      scoreIdx: 1,
      teamName: "",
    })}`
  );
}

function renderBronze(container) {
  container.innerHTML = matchCard(
    "Tercer lugar",
    `${rowHtml({
      side: "a",
      readOnlyTeam: true,
      scoreKey: "tercerLugar",
      scoreIdx: 0,
      teamName: "",
    })}
    ${rowHtml({
      side: "b",
      readOnlyTeam: true,
      scoreKey: "tercerLugar",
      scoreIdx: 1,
      teamName: "",
    })}`
  );
}

function setScoreGroupDisabled(scoreKey, disabled) {
  const d = Boolean(disabled);
  qsa(`input[data-score-key="${scoreKey}"]`).forEach((input) => {
    input.disabled = d;
    const wrap = input.closest(".match__score-stepper");
    if (wrap) {
      wrap.classList.toggle("match__score-stepper--disabled", d);
      wrap.querySelectorAll(".match__score-btn").forEach((btn) => {
        btn.disabled = d;
      });
    }
  });
}

function patchDisplay(state) {
  const ready = (a, b) =>
    Boolean((a || "").trim()) && Boolean((b || "").trim());

  setScoreGroupDisabled("s1", !ready(...state.semis.teams1));
  setScoreGroupDisabled("s2", !ready(...state.semis.teams2));
  setScoreGroupDisabled("final", !ready(...state.final.teams));
  setScoreGroupDisabled(
    "tercerLugar",
    !ready(state.bronzeTeams[0], state.bronzeTeams[1])
  );

  const setText = (key, side, text) => {
    const el = qs(`[data-display="${key}-${side}"]`);
    if (el) el.textContent = teamLabel(text);
  };

  const [s1a, s1b] = state.semis.teams1;
  const [s2a, s2b] = state.semis.teams2;
  setText("s1", "a", s1a);
  setText("s1", "b", s1b);
  setText("s2", "a", s2a);
  setText("s2", "b", s2b);

  const [fa, fb] = state.final.teams;
  setText("final", "a", fa);
  setText("final", "b", fb);

  const [ba, bb] = state.bronzeTeams;
  setText("tercerLugar", "a", ba);
  setText("tercerLugar", "b", bb);

  const ch = qs("#champion-name");
  if (ch) {
    ch.textContent = state.podium.champion ? `${state.podium.champion} 🏆` : "Winner 🏆";
  }
  const s2 = qs("#second-place");
  const s3 = qs("#third-place");
  if (s2) s2.textContent = state.podium.second ? state.podium.second : "—";
  if (s3) s3.textContent = state.podium.third ? state.podium.third : "—";
}

function patchWinnerRows(state) {
  const apply = (scoreKey, winner) => {
    ["a", "b"].forEach((side) => {
      const row = qs(`[data-row="${scoreKey}-${side}"]`);
      if (!row) return;
      row.classList.remove("match__row--winner");
      const w =
        winner === "tie"
          ? null
          : winner === "a"
            ? "a"
            : winner === "b"
              ? "b"
              : null;
      if (w && w === side) row.classList.add("match__row--winner");
    });
  };

  const q = state.quarters;
  apply("c1", q.c1.w);
  apply("c2", q.c2.w);
  apply("c3", q.c3.w);
  apply("c4", q.c4.w);

  apply("s1", state.semis.w1);
  apply("s2", state.semis.w2);
  apply("final", state.final.w);
  apply(
    "tercerLugar",
    winnerFromScores(
      state.bronzeTeams[0],
      state.bronzeTeams[1],
      state.scores.tercerLugar?.[0] ?? null,
      state.scores.tercerLugar?.[1] ?? null
    )
  );
}

function bindRecalc() {
  const handler = () => {
    const st = buildState(true);
    patchDisplay(st);
    patchWinnerRows(st);
  };

  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-score-key], [data-team-key]")) {
      handler();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-score-key], [data-team-key]")) handler();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-score-nudge]");
    if (!btn || btn.disabled) return;
    const wrap = btn.closest(".match__score-stepper");
    const input = wrap?.querySelector("input[data-score-key]");
    if (!input || input.disabled) return;
    let n = parseInt(String(input.value).trim(), 10);
    if (!Number.isFinite(n)) n = 0;
    const dir = btn.getAttribute("data-score-nudge");
    if (dir === "up") {
      input.value = String(Math.min(99, n + 1));
    } else {
      const next = n - 1;
      input.value = next < 0 ? "" : String(next);
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function initHeroCounters() {
  const els = qsa(".stat-kpi__value[data-count]");
  if (!els.length) return;

  const runCount = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseInt(el.getAttribute("data-count") || "0", 10);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    els.forEach(runCount);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) runCount(e.target);
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
}

function init() {
  renderQuarters(qs("#matches-quarters"));
  renderSemi(qs("#matches-semis"));
  renderFinal(qs("#matches-final"));
  renderBronze(qs("#match-bronze"));

  bindRecalc();
  const st = buildState(true);
  patchDisplay(st);
  patchWinnerRows(st);
  initHeroCounters();
}

init();
