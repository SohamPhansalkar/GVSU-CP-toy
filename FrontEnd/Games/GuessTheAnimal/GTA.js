// Game Data - 5 Questions
const questions = [
  {
    imgSrc:
      "https://images.squarespace-cdn.com/content/v1/5b061f0e0dbda31446baccc0/1527895159358-L9MJ3G7A5ITWRIB8F0SZ/image-asset.jpeg?format=2500w",
    options: ["Lion", "Tiger", "Cheetah", "Leopard"],
    correctAnswer: 0,
  },
  {
    imgSrc: "https://njaes.rutgers.edu/fs1325/FS1325-1-big.jpg",
    options: ["Dog", "Wolf", "Fox", "Coyote"],
    correctAnswer: 2,
  },
  {
    imgSrc:
      "https://www.wildlifetrusts.org/sites/default/files/styles/spotlight_default/public/2017-12/Short-eared%20Owl%20%C2%A9%20Danny%20Green%202020VISION.jpg?h=77754cc7&itok=-HR1UGRV",
    options: ["Eagle", "Hawk", "Falcon", "Owl"],
    correctAnswer: 3,
  },
  {
    imgSrc:
      "https://cdn.britannica.com/22/215322-050-96B2996D/dolphin-Delphinidae-swimming-in-red-sea.jpg",
    options: ["Dolphin", "Shark", "Whale", "Seal"],
    correctAnswer: 0,
  },
  {
    imgSrc: "https://dcist.com/wp-content/uploads/sites/3/2023/10/0C2A0214.jpg",
    options: ["Bear", "Panda", "Koala", "Sloth"],
    correctAnswer: 1,
  },
];

// Game State
let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const animalImage = document.getElementById("animal-image");
const questionTracker = document.getElementById("question-tracker");
const buttons = [
  document.getElementById("btn-0"),
  document.getElementById("btn-1"),
  document.getElementById("btn-2"),
  document.getElementById("btn-3"),
];

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
});

function loadQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  // Update Tracker
  questionTracker.innerText = `Question ${currentQuestionIndex + 1} / 5`;

  // Set Image
  animalImage.src = currentQuestion.imgSrc;

  // Set Button Text and Reset Classes/State
  buttons.forEach((btn, index) => {
    btn.innerText = currentQuestion.options[index];
    btn.className = "btn option-btn w-100 py-3 fw-bold fs-5"; // reset classes
    btn.disabled = false; // re-enable buttons
  });
}

function checkAnswer(selectedIndex) {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswer;

  // Disable all buttons to prevent multiple clicks
  buttons.forEach((btn) => (btn.disabled = true));

  // Check if correct
  if (selectedIndex === correctIndex) {
    buttons[selectedIndex].classList.add("correct");
    score++;
  } else {
    buttons[selectedIndex].classList.add("incorrect");
    // Highlight the correct answer as well
    buttons[correctIndex].classList.add("correct");
  }

  // Wait 1.5 seconds, then go to next question or end game
  setTimeout(() => {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
      loadQuestion();
    } else {
      endGame();
    }
  }, 500);
}

function endGame() {
  // Store the score in localStorage so the score.html page can access it
  localStorage.setItem("gta_score", score);
  localStorage.setItem("gta_total", questions.length);

  // Redirect to score page
  window.location.href = "score.html";
}
