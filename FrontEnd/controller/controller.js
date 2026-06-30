document.addEventListener("DOMContentLoaded", () => {
  const btnLeft = document.getElementById("btnLeft");
  const btnSelect = document.getElementById("btnSelect");
  const btnRight = document.getElementById("btnRight");

  const API_BASE_URL = "http://localhost:8000/api";

  // Function to handle sending the command to the backend
  const sendCommand = async (action) => {
    console.log(`Command triggered: ${action}`);

    // Retrieve the necessary user and device identifiers
    const userEmail = localStorage.getItem("user_email");

    // Grab the controller ID and ensure it doesn't accidentally use the string "null"
    let controllerId =
      localStorage.getItem("latest_controller") ||
      localStorage.getItem("controller1");

    if (controllerId === "null") {
      controllerId = null;
    }

    // Check if identifiers exist
    if (!userEmail || !controllerId) {
      console.error(
        "Missing user email or controller ID in local storage. Cannot send command.",
      );
      alert(
        "Missing controller ID. Please go back and link a controller code first.",
      );
      return;
    }

    // Debug log to verify exactly what is being sent to your Python backend
    console.log("Sending payload:", {
      email: userEmail,
      controller_id: controllerId,
      action: action,
    });

    try {
      // Send the POST request to the endpoint
      const response = await fetch(`${API_BASE_URL}/controller-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          controller_id: controllerId,
          action: action,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to process action on server:", errorData);
      } else {
        const successData = await response.json();
        console.log("Server response:", successData);
      }
    } catch (error) {
      console.error("Network error while sending command:", error);
    }
  };

  // -------------------------------------------------------------
  // Event Binding Helper
  // -------------------------------------------------------------
  const bindControllerButton = (buttonElement, actionName) => {
    // Touch Events (Mobile)
    buttonElement.addEventListener("touchstart", (e) => {
      e.preventDefault();
      buttonElement.classList.add("active-touch");
      sendCommand(actionName);
    });

    buttonElement.addEventListener("touchend", (e) => {
      e.preventDefault();
      buttonElement.classList.remove("active-touch");
    });

    buttonElement.addEventListener("touchcancel", (e) => {
      buttonElement.classList.remove("active-touch");
    });

    // Mouse Events (Desktop Testing)
    buttonElement.addEventListener("mousedown", (e) => {
      buttonElement.classList.add("active-touch");
      sendCommand(actionName);
    });

    buttonElement.addEventListener("mouseup", (e) => {
      buttonElement.classList.remove("active-touch");
    });

    buttonElement.addEventListener("mouseleave", (e) => {
      buttonElement.classList.remove("active-touch");
    });
  };

  // -------------------------------------------------------------
  // Initialize Buttons with precise Action strings
  // -------------------------------------------------------------
  if (btnLeft && btnSelect && btnRight) {
    bindControllerButton(btnLeft, "L");
    bindControllerButton(btnSelect, "SEL");
    bindControllerButton(btnRight, "R");
  } else {
    console.error("One or more controller buttons are missing from the DOM.");
  }
});
