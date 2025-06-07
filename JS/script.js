let questions = [];
let currentQuestion = 0;
let selectedResponseIds = [];
let totalQuestions = 0;
let quizType = 'online'; // fallback

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('quiz')) quizType = urlParams.get('quiz');

  const questionFile = quizType === 'online' ? 'onlineQuestions.json' : 'IRLquestions.json';

  fetch(`meta/${questionFile}`)
    .then(res => res.json())
    .then(data => {
      questions = data;
      totalQuestions = questions.length;
      showQuestion();
    });
});

function showQuestion() {
  const questionData = questions[currentQuestion];
  const box = document.getElementById("question-box");
  box.innerHTML = `
    <h2>${questionData.question}</h2>
    ${questionData.details ? `<p>${questionData.details}</p>` : ""}
  `;

  questionData.answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.classList.add("answer-btn");
    btn.textContent = answer.text || answer;
    btn.onclick = () => {
      if (answer.resultId) selectedResponseIds.push(answer.resultId);
      nextQuestion();
    };
    box.appendChild(btn);
  });

  updateProgress(currentQuestion + 1, totalQuestions);
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < totalQuestions) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  fetch(`meta/results_bank.json`)
    .then(res => res.json())
    .then(resultBank => {
      const box = document.getElementById("question-box");
      box.innerHTML = `<h2>What This Might Mean</h2>`;

      const uniqueIds = [...new Set(selectedResponseIds)];
      const matchedResults = resultBank.filter(result => uniqueIds.includes(result.id));

      if (matchedResults.length === 0) {
        box.innerHTML += `<p>You didn’t select anything that raised a red flag — but your feelings still matter. If something felt wrong, you’re allowed to talk about it.</p>`;
      }

      matchedResults.forEach(result => {
        const div = document.createElement("div");
        div.classList.add("result-card");
        div.innerHTML = `
          <h3>${result.title}</h3>
          <p>${result.description}</p>
          <ul>
            ${result.tips.map(t => `<li>${t}</li>`).join("")}
          </ul>
        `;
        box.appendChild(div);
      });

      const helpBtn = document.createElement("a");
      helpBtn.href = "help.html";
      helpBtn.classList.add("result-button");
      helpBtn.textContent = "Find someone you can talk to →";
      box.appendChild(helpBtn);

    });
}

function updateProgress(current, total) {
  const percent = Math.floor((current / total) * 100);
  document.getElementById('question-count').innerText = `Question ${current} of ${total}`;
  document.getElementById('progress-fill').style.width = `${percent}%`;
}
