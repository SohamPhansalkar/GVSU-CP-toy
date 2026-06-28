document.addEventListener("DOMContentLoaded", () => {
  // Logic for Signup Form Validation
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        let isValid = true;
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");

        // Basic Bootstrap validation
        if (!signupForm.checkValidity()) {
          event.stopPropagation();
          isValid = false;
        }

        // Custom Password Match Validation
        if (
          password.value !== confirmPassword.value &&
          confirmPassword.value !== ""
        ) {
          confirmPassword.setCustomValidity("Passwords do not match.");
          isValid = false;
        } else {
          confirmPassword.setCustomValidity("");
        }

        signupForm.classList.add("was-validated");

        if (isValid) {
          // Here you would typically send data to your backend
          console.log("Signup form is valid. Proceeding with registration...");
          alert("Signup successful! (Placeholder action)");
        }
      },
      false,
    );

    // Live feedback as the user types in the confirm password field
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordInput = document.getElementById("password");

    if (confirmPasswordInput && passwordInput) {
      confirmPasswordInput.addEventListener("input", function () {
        if (passwordInput.value !== confirmPasswordInput.value) {
          confirmPasswordInput.setCustomValidity("Passwords do not match.");
        } else {
          confirmPasswordInput.setCustomValidity("");
        }
      });
    }
  }

  // Logic for Login Form Validation
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
          event.stopPropagation();
        } else {
          // Here you would typically send data to your backend
          console.log("Login form is valid. Proceeding with authentication...");
          alert("Login successful! (Placeholder action)");
        }

        loginForm.classList.add("was-validated");
      },
      false,
    );
  }
});
