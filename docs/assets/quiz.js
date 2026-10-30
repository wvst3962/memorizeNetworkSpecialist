(() => {
  const sectionSelect = document.getElementById("quiz-section");
  const countSelect = document.getElementById("quiz-count");
  const startButton = document.getElementById("quiz-start");
  const loadStatus = document.getElementById("quiz-load-status");
  const sessionElement = document.getElementById("quiz-session");
  const completeElement = document.getElementById("quiz-complete");
  const progressElement = document.getElementById("quiz-progress");
  const positionElement = document.getElementById("quiz-position");
  const categoryElement = document.getElementById("quiz-category");
  const questionIdElement = document.getElementById("quiz-question-id");
  const questionElement = document.getElementById("question-title");
  const ownAnswer = document.getElementById("quiz-own-answer");
  const revealButton = document.getElementById("quiz-reveal");
  const answerPanel = document.getElementById("quiz-answer-panel");
  const answerElement = document.getElementById("quiz-answer");
  const noteElement = document.getElementById("quiz-note");
  const studyLink = document.getElementById("quiz-study-link");
  const nextButton = document.getElementById("quiz-next");
  const againButton = document.getElementById("quiz-again");

  let bank = [];
  let currentQuestions = [];
  let currentIndex = 0;

  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function renderQuestion() {
    const item = currentQuestions[currentIndex];
    positionElement.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
    categoryElement.textContent = item.section;
    progressElement.max = currentQuestions.length;
    progressElement.value = currentIndex + 1;
    questionIdElement.textContent = item.id;
    questionElement.textContent = item.question;
    ownAnswer.value = "";
    answerElement.textContent = item.answer;
    noteElement.textContent = item.note;
    studyLink.href = item.study_href;
    studyLink.setAttribute("aria-label", `${item.study_title}を新しいタブで開く`);
    answerPanel.hidden = true;
    revealButton.hidden = false;
    nextButton.textContent = currentIndex + 1 === currentQuestions.length ? "終了する →" : "次の問題へ →";
    questionElement.focus();
  }

  function start() {
    const selectedSection = sectionSelect.value;
    const pool = bank.filter((item) => selectedSection === "all" || item.section === selectedSection);
    const requested = countSelect.value === "all" ? pool.length : Number(countSelect.value);
    currentQuestions = shuffled(pool).slice(0, Math.min(requested, pool.length));
    if (currentQuestions.length === 0) return;
    currentIndex = 0;
    completeElement.hidden = true;
    sessionElement.hidden = false;
    renderQuestion();
    sessionElement.scrollIntoView({ block: "start" });
  }

  startButton.addEventListener("click", start);
  revealButton.addEventListener("click", () => {
    answerPanel.hidden = false;
    revealButton.hidden = true;
    answerPanel.focus();
  });
  nextButton.addEventListener("click", () => {
    currentIndex += 1;
    if (currentIndex < currentQuestions.length) {
      renderQuestion();
      sessionElement.scrollIntoView({ block: "start" });
      return;
    }
    sessionElement.hidden = true;
    completeElement.hidden = false;
    document.getElementById("complete-title").focus();
  });
  againButton.addEventListener("click", () => {
    completeElement.hidden = true;
    sectionSelect.focus();
    document.getElementById("setup-title").scrollIntoView({ block: "start" });
  });

  fetch("questions.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((questions) => {
      if (!Array.isArray(questions) || questions.length === 0) throw new Error("Question bank is empty");
      bank = questions;
      const sections = [...new Set(bank.map((item) => item.section))];
      for (const section of sections) {
        const option = document.createElement("option");
        option.value = section;
        option.textContent = `${section}（${bank.filter((item) => item.section === section).length}問）`;
        sectionSelect.append(option);
      }
      document.querySelector("[data-bank-size]").textContent = String(bank.length);
      document.querySelector("[data-section-size]").textContent = String(sections.length);
      loadStatus.textContent = `${bank.length}問からランダムに出題します。`;
      startButton.disabled = false;
    })
    .catch(() => {
      loadStatus.textContent = "問題を読み込めませんでした。ページを再読み込みしてください。";
    });
})();
