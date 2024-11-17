window.onload = function () {
  initializeSupabase(); // Panggil inisialisasi Supabase dari koneksi.js
};

// Login Page---------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Log username and password from the form
    console.log("Username from form: ", username);
    console.log("Password from form: ", password);

    try {
      // Fetch users from Supabase
      const { data: users, error } = await database
        .from("users")
        .select("*")
        .eq("username", username);

      if (error) {
        throw error; // Handle Supabase fetch error
      }

      // Log the fetched users from the database
      console.log("Fetched users: ", users);

      if (users.length > 0) {
        const user = users[0]; // Assuming username is unique

        // Log the stored password from the database
        console.log("Password from database: ", user.password);

        // Compare the input password with the stored password
        if (password === user.password) {
          // Store the username in localStorage after successful login
          localStorage.setItem("username", username);

          // Show a success message in the same position as error
          errorMessage.textContent = "Login Berhasil";
          errorMessage.style.color = "green"; // Change color to green for success
          errorMessage.style.display = "block";
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000); // Delay for 2 seconds before redirect
        } else {
          // Show an error message if authentication fails
          errorMessage.textContent = "Invalid username or password";
          errorMessage.style.display = "block";

          // Clear the input fields
          usernameInput.value = "";
          passwordInput.value = "";
        }
      } else {
        // Show an error message if user not found
        errorMessage.textContent = "Invalid username or password";
        errorMessage.style.display = "block";

        // Clear the input fields
        usernameInput.value = "";
        passwordInput.value = "";
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      errorMessage.textContent =
        "An error occurred while processing your request. Please try again.";
      errorMessage.style.display = "block";

      // Clear the input fields
      usernameInput.value = "";
      passwordInput.value = "";
    }
  });
});

// Function to toggle password visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const togglePasswordIcon = document.getElementById("togglePasswordIcon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePasswordIcon.classList.remove("fa-eye");
    togglePasswordIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    togglePasswordIcon.classList.remove("fa-eye-slash");
    togglePasswordIcon.classList.add("fa-eye");
  }
}
