(() => {
  const storageKey = "network-study-red-sheet";
  const root = document.documentElement;
  const toggle = document.querySelector("[data-sheet-toggle]");
  const label = document.querySelector("[data-sheet-label]");
  const answers = document.querySelectorAll(".memory-answer");

  function saveMode(enabled) {
    try { localStorage.setItem(storageKey, enabled ? "on" : "off"); } catch (_) {}
  }

  function loadMode() {
    try { return localStorage.getItem(storageKey) === "on"; } catch (_) { return false; }
  }

  function applyMode(enabled) {
    root.classList.toggle("sheet-active", enabled);
    if (toggle) toggle.setAttribute("aria-pressed", String(enabled));
    if (label) label.textContent = enabled ? "赤シート ON" : "赤シート OFF";
    answers.forEach((answer) => {
      answer.removeAttribute("data-revealed");
      if (enabled) {
        answer.tabIndex = 0;
        answer.setAttribute("role", "button");
        answer.setAttribute("aria-label", "暗記する語句。操作すると答えを表示");
        answer.setAttribute("aria-pressed", "false");
      } else {
        answer.removeAttribute("tabindex");
        answer.removeAttribute("role");
        answer.removeAttribute("aria-label");
        answer.removeAttribute("aria-pressed");
      }
    });
  }

  function reveal(answer) {
    if (!root.classList.contains("sheet-active")) return;
    const shown = answer.hasAttribute("data-revealed");
    answer.toggleAttribute("data-revealed", !shown);
    answer.setAttribute("aria-label", shown ? "暗記する語句。操作すると答えを表示" : `答え: ${answer.textContent.trim()}`);
    answer.setAttribute("aria-pressed", String(!shown));
  }

  applyMode(loadMode());
  if (toggle) {
    toggle.addEventListener("click", () => {
      const enabled = !root.classList.contains("sheet-active");
      applyMode(enabled);
      saveMode(enabled);
    });
  }

  document.addEventListener("click", (event) => {
    const answer = event.target.closest(".memory-answer");
    if (!answer || !root.classList.contains("sheet-active")) return;
    if (answer.closest("a")) event.preventDefault();
    reveal(answer);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const answer = event.target.closest(".memory-answer");
    if (!answer || !root.classList.contains("sheet-active")) return;
    event.preventDefault();
    reveal(answer);
  });

  const search = document.querySelector("[data-site-search]");
  const items = document.querySelectorAll("[data-search]");
  const chapters = document.querySelectorAll("[data-chapter]");
  const chapterNav = document.querySelector(".chapter-nav");
  const chapterLinks = document.querySelectorAll("[data-chapter-target]");
  const count = document.querySelector("[data-result-count]");
  const empty = document.querySelector("[data-no-results]");
  if (search) {
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const matches = item.dataset.search.includes(query);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      chapters.forEach((chapter) => {
        chapter.hidden = !chapter.querySelector("[data-search]:not([hidden])");
      });
      chapterLinks.forEach((link) => {
        link.hidden = document.getElementById(link.dataset.chapterTarget).hidden;
      });
      if (chapterNav) chapterNav.hidden = visible === 0;
      if (count) count.textContent = `${visible} 件`;
      if (empty) empty.hidden = visible !== 0;
    });
  }
})();
