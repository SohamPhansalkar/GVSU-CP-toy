// Game Data - 5 Questions
console.log("GTA.js");
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

// Controller State
let selectedOptionIndex = 0;
let isWaitingForNextQuestion = false;
let pollingInterval = null;
let previousCounts = { count1: 0, count2: 0, count3: 0 };
const API_BASE_URL = "http://localhost:8000/api";

// DOM Elements
const animalImage = document.getElementById("animal-image");
const questionTracker = document.getElementById("question-tracker");
const buttons = [
  document.getElementById("btn-0"),
  document.getElementById("btn-1"),
  document.getElementById("btn-2"),
  document.getElementById("btn-3"),
];

// Initialize the game and the controller
document.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
  initController();
});

// Updates the visual highlight based on selectedOptionIndex
function updateSelectionUI() {
  buttons.forEach((btn, index) => {
    if (index === selectedOptionIndex) {
      btn.classList.add("controller-selected");
    } else {
      btn.classList.remove("controller-selected");
    }
  });
  console.log("updateSelectionUI()");
}

function loadQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  isWaitingForNextQuestion = false;

  // Update Tracker
  questionTracker.innerText = `Question ${currentQuestionIndex + 1} / 5`;

  // Set Image
  animalImage.src = currentQuestion.imgSrc;

  // Set Button Text and Reset Classes/State
  buttons.forEach((btn, index) => {
    btn.innerText = currentQuestion.options[index];
    btn.className = "btn option-btn w-100 py-3 fw-bold fs-5"; // reset classes
    btn.disabled = false;
  });

  // Reset highlight to the first option (index 0)
  selectedOptionIndex = 0;
  updateSelectionUI();
}

function checkAnswer(selectedIndex) {
  if (isWaitingForNextQuestion) return; // Prevent double-clicking via controller
  isWaitingForNextQuestion = true;

  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.correctAnswer;

  // Disable all buttons to prevent multiple clicks
  buttons.forEach((btn) => (btn.disabled = true));

  // Remove the controller highlight ring temporarily
  buttons.forEach((btn) => btn.classList.remove("controller-selected"));

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
  }, 1500); // Set to 1500 to match standard visual feedback timing
}

function endGame() {
  // Stop polling the server once the game is over
  if (pollingInterval) clearInterval(pollingInterval);

  // Store the score in localStorage so the score.html page can access it
  localStorage.setItem("gta_score", score);
  localStorage.setItem("gta_total", questions.length);

  // Redirect to score page
  window.location.href = "score.html";
}

// -------------------------------------------------------------
// Controller Integration Backend Logic
// -------------------------------------------------------------

async function initController() {
  const userEmail = localStorage.getItem("user_email");
  if (!userEmail) return;

  try {
    // Hit /reset API
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save controller IDs
      if (data.controller1)
        localStorage.setItem("controller1", data.controller1);
      if (data.controller2)
        localStorage.setItem("controller2", data.controller2);

      console.log("Controller counts reset successfully. Starting poll...");

      // Start polling every 500ms
      pollingInterval = setInterval(pollController, 500);
    } else {
      console.error("Failed to reset controller counts:", data);
    }
  } catch (error) {
    console.error("Error during controller reset:", error);
  }
}

async function pollController() {
  // Don't shift selection or accept inputs if we are waiting for the next question to load
  if (isWaitingForNextQuestion) return;

  let controllerId =
    localStorage.getItem("latest_controller") ||
    localStorage.getItem("controller1");
  if (!controllerId || controllerId === "null") return;

  try {
    const response = await fetch(`${API_BASE_URL}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ controller_id: controllerId }),
    });

    if (response.ok) {
      const result = await response.json();
      const currentData = result.data;
      let uiNeedsUpdate = false;

      // 1. Check if count1 increased (Move Right / Next)
      if (currentData.count1 > previousCounts.count1) {
        selectedOptionIndex = (selectedOptionIndex + 1) % 4; // Loops 0->1->2->3->0
        uiNeedsUpdate = true;
      }

      // 2. Check if count2 increased (Move Left / Previous)
      if (currentData.count2 > previousCounts.count2) {
        selectedOptionIndex = (selectedOptionIndex - 1 + 4) % 4; // Loops 3->2->1->0->3
        uiNeedsUpdate = true;
      }

      // Update the visual box if the index changed
      if (uiNeedsUpdate) {
        updateSelectionUI();
      }

      // 3. Check if count3 increased (Select current option)
      if (currentData.count3 > previousCounts.count3) {
        checkAnswer(selectedOptionIndex);
      }

      // Update local state to the new current counts to compare on the next loop
      previousCounts.count1 = currentData.count1;
      previousCounts.count2 = currentData.count2;
      previousCounts.count3 = currentData.count3;
    }
  } catch (error) {
    console.error("Error polling controller:", error);
  }
}
