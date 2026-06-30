const API_BASE_URL = "http://localhost:8000/api";
console.log("home.js");

document.addEventListener("DOMContentLoaded", () => {
  const userNameEl = document.getElementById("user-name");
  if (userNameEl) {
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      userNameEl.innerText = "👋 Hi, " + storedName.split(" ")[0] + "!";
    }
  }
});

async function btnAddControllerClicked() {
  const controllerCodeInput = document.getElementById("controllerCode");
  const btnAddController = document.getElementById("btnAddController");

  const code = controllerCodeInput.value.trim();
  const userEmail = localStorage.getItem("user_email");

  if (!code) {
    controllerCodeInput.classList.add("is-invalid");
    return;
  }
  controllerCodeInput.classList.remove("is-invalid");

  if (!userEmail) {
    alert("User session not found. Please log in again.");
    window.location.href = "../Accounts/login.html";
    return;
  }

  const originalText = btnAddController.innerText;
  btnAddController.innerText = "Adding...";
  btnAddController.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/add-controller`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        controller_code: code,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Controller successfully linked to your account!");
      localStorage.setItem("latest_controller", code);
      controllerCodeInput.value = "";
    } else {
      alert(`❌ Failed to add: ${data.detail || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error adding controller:", error);
    alert("❌ Could not connect to server.");
  } finally {
    btnAddController.innerText = originalText;
    btnAddController.disabled = false;
  }
}

function redirectToVirtualController() {
  const controllerCodeInput = document.getElementById("controllerCode");
  const code = controllerCodeInput.value.trim();

  if (!code) {
    controllerCodeInput.classList.add("is-invalid");
    alert("Please enter a controller code first!");
    return;
  }

  controllerCodeInput.classList.remove("is-invalid");
  localStorage.setItem("latest_controller", code);
  alert(
    "Heading to virtual controller! (Note: Make sure you clicked 'Add Controller' first so the database recognizes this code).",
  );
  window.location.href = "../controller/controller.html";
}

function toControllerPageClicked() {
  window.location.href = "../Home/controller.html";
}
