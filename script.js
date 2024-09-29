// Background Animation ------------------------------------------------------------------- 
const backgrounds = [
  "img/assets/Background1.jpg",
  "img/assets/Background2.jpg",
  "img/assets/Background3.jpg",
  "img/assets/Background4.jpg",
];

let currentBackground = 0;
let displayCount = 0; // Menghitung berapa kali gambar ditampilkan
const homeSection = document.querySelector(".background-layer");

// Function to change the background
function changeBackground() {
  // Create a new image object
  const img = new Image();
  img.src = backgrounds[currentBackground];

  // Set the new background only when the image has successfully loaded
  img.onload = function () {
    homeSection.style.backgroundImage = `url(${backgrounds[currentBackground]})`;

    // Set a timeout to wait for 3 seconds before changing to the next background
    setTimeout(() => {
      displayCount++;

      // Check if the current background has been displayed twice
      if (displayCount < 2) {
        // If less than 2 times, call changeBackground again for the same image
        changeBackground();
      } else {
        // If displayed twice, reset the count and move to the next background
        displayCount = 0;
        currentBackground = (currentBackground + 1) % backgrounds.length;
        changeBackground(); // Call changeBackground again for the next image
      }
    }, 2000); // Wait for 3 seconds
  };

  // Set an optional error handling for image loading
  img.onerror = function () {
    console.error("Error loading image:", img.src);

    // Still proceed to the next background after an error
    displayCount = 0; // Reset display count
    currentBackground = (currentBackground + 1) % backgrounds.length;
    changeBackground(); // Proceed to the next image immediately
  };
}

// Start the first background change
changeBackground();

// Preload all images to avoid any initial delay
backgrounds.forEach((image) => {
  const img = new Image();
  img.src = image;
});

// Responsif Menu -------------------------------------------------------------------
// Sticky Navigation Menu JS Code
let nav = document.querySelector("nav");
let scrollBtn = document.querySelector(".scroll-button a");
console.log(scrollBtn);
let val;
window.onscroll = function () {
  if (document.documentElement.scrollTop > 20) {
    nav.classList.add("sticky");
    scrollBtn.style.display = "block";
  } else {
    nav.classList.remove("sticky");
    scrollBtn.style.display = "none";
  }
};

// Side NavIgation Menu JS Code
let body = document.querySelector("body");
let navBar = document.querySelector(".navbar");
let menuBtn = document.querySelector(".menu-btn");
let cancelBtn = document.querySelector(".cancel-btn");
menuBtn.onclick = function () {
  navBar.classList.add("active");
  menuBtn.style.opacity = "0";
  menuBtn.style.pointerEvents = "none";
  body.style.overflow = "hidden";
  scrollBtn.style.pointerEvents = "none";
};
cancelBtn.onclick = function () {
  navBar.classList.remove("active");
  menuBtn.style.opacity = "1";
  menuBtn.style.pointerEvents = "auto";
  body.style.overflow = "auto";
  scrollBtn.style.pointerEvents = "auto";
};

// Side Navigation Bar Close While We Click On Navigation Links
let navLinks = document.querySelectorAll(".menu li a");
for (var i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener("click", function () {
    navBar.classList.remove("active");
    menuBtn.style.opacity = "1";
    menuBtn.style.pointerEvents = "auto";
    body.style.overflow = "auto";
    scrollBtn.style.pointerEvents = "auto";
  });
}

// Login Page---------------------------------------------------------------------
// Toggle Password Visibility
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

// Function to handle form submission
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const usernameInput = form.querySelector('input[type="text"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Fetch users from users.json
    fetch("users.json")
      .then((response) => response.json())
      .then((users) => {
        const user = users.find(
          (user) => user.username === username && user.password === password
        );
        if (user) {
          // Redirect to index.html if authentication is successful
          window.location.href = "index.html";
        } else {
          // Show an error message if authentication fails
          errorMessage.textContent = "Invalid username or password";
          errorMessage.style.display = "block";

          // Clear the input fields
          usernameInput.value = "";
          passwordInput.value = "";
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        errorMessage.textContent =
          "An error occurred while processing your request. Please try again.";
        errorMessage.style.display = "block";
        // Clear the input fields
        usernameInput.value = "";
        passwordInput.value = "";
      });
  });
});

// Live Schedule----------------------------------------------------------------
function updateTime() {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayName = days[now.getDay()];
  const day = now.getDate().toString().padStart(2, "0");
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const timeString = `${dayName}, ${day}-${month}-${year} 
  ${hours}:${minutes}:${seconds}`;

  document.getElementById("current-time").innerText = timeString;

  // Update the schedule based on the new time
  fetchSchedule();
}

function isTimeInRange(currentTime, startTime, endTime) {
  const current = new Date(`1970-01-01T${currentTime}:00`);
  const start = new Date(`1970-01-01T${startTime.replace(".", ":")}:00`);
  const end = new Date(`1970-01-01T${endTime.replace(".", ":")}:00`);

  console.log(`Current Time: ${current}`);
  console.log(`Start Time: ${start}`);
  console.log(`End Time: ${end}`);

  return current >= start && current <= end;
}

async function fetchSchedule() {
  try {
    const response = await fetch("schedule.json");
    const schedule = await response.json();
    updateSchedule(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
  }
}

function updateSchedule(schedule) {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  console.log(`Current day: ${dayName}, Current time: ${currentTime}`);

  const todaySchedule = [
    ...(schedule.semester_2[dayName] || []),
    ...(schedule.semester_4[dayName] || []),
    ...(schedule.semester_6[dayName] || []),
  ];

  console.log("Today's Schedule:", todaySchedule);

  // Reset all classes to green first and store default empty info
  document.querySelectorAll(".class").forEach((element) => {
    element.style.backgroundColor = "green";
    element.dataset.info = JSON.stringify({
      room: element.id,
      inUse: false,
    });
  });

  // Then, update the classes based on the schedule
  todaySchedule.forEach((classInfo) => {
    const classElement = document.getElementById(
      `TI${classInfo.ruang.split("-")[1]}`
    );
    if (classElement) {
      console.log(
        `Checking class: ${classInfo.ruang}, Time range: ${classInfo.start_time} - ${classInfo.end_time}`
      );
      if (
        isTimeInRange(currentTime, classInfo.start_time, classInfo.end_time)
      ) {
        console.log(`Class ${classInfo.ruang} is in use.`);
        classElement.style.backgroundColor = "red";
        classElement.dataset.info = JSON.stringify({
          semester: classInfo.semester,
          kelas: classInfo.kelas,
          makul: classInfo.makul,
          dosen: classInfo.dosen,
          ruang: classInfo.ruang,
          start_time: classInfo.start_time,
          end_time: classInfo.end_time,
          inUse: true,
        });
      } else {
        console.log(`Class ${classInfo.ruang} is not in use.`);
      }
    }
  });

  // Add click event listener to all classes
  document.querySelectorAll(".class").forEach((element) => {
    element.addEventListener("click", function () {
      const classInfo = JSON.parse(this.dataset.info || "{}");
      showModal(classInfo);
    });
  });
}

function showModal(classInfo) {
  if (classInfo && classInfo.inUse) {
    document.getElementById(
      "roomTitle"
    ).innerText = `Ruangan ${classInfo.ruang}`;
    document.getElementById("roomInfo").innerHTML = `
            <strong>Semester:</strong> ${classInfo.semester}<br>
            <strong>Kelas:</strong> ${classInfo.kelas}<br>
            <strong>Makul:</strong> ${classInfo.makul}<br>
            <strong>Dosen:</strong> ${classInfo.dosen}<br>
            <strong>Ruang:</strong> ${classInfo.ruang}<br>
            <strong>Time:</strong> ${classInfo.start_time} - ${classInfo.end_time}
        `;
  } else {
    document.getElementById("roomTitle").innerText = "Information";
    document.getElementById("roomInfo").innerText =
      "This room is currently not in use.";
  }
  document.getElementById("roomModal").style.display = "block";
}

function closeModal() {
  document.getElementById("roomModal").style.display = "none";
}

window.onclick = function (event) {
  if (event.target == document.getElementById("roomModal")) {
    closeModal();
  }
};

// Update the time and schedule initially and then every second for the time and every minute for the schedule
updateTime();
setInterval(updateTime, 1000); // Update time every second
setInterval(fetchSchedule, 60000); // Update schedule every minute

// Fetch and update schedule initially and then every minute
fetchSchedule();
setInterval(() => {
  fetchSchedule().then(() => {
    updateTime();
  });
}, 60000);

// Lantai 1 switch Lantai 2 -----------------------------------------------------------------
function showLab2() {
  document.getElementById("box1").style.display = "none";
  document.getElementById("box2").style.display = "block";
}

function showLab1() {
  document.getElementById("box2").style.display = "none";
  document.getElementById("box1").style.display = "block";
}