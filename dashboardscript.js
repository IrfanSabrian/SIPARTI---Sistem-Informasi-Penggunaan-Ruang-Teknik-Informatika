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

// table
document.addEventListener("DOMContentLoaded", () => {
  const scheduleTableBody = document.querySelector("#schedule-table tbody");
  const addRowBtn = document.getElementById("add-row-btn");
  const saveBtn = document.getElementById("save-btn");
  const addRowModal = document.getElementById("add-row-modal");
  const closeModal = document.querySelector(".close-dash");
  const addRowForm = document.getElementById("add-row-form");
  const filterRadios = document.querySelectorAll('input[name="filter"]');
  const daySelect = document.getElementById("day-select");
  const semesterSelect = document.getElementById("semester-select");
  const ruangSelect = document.getElementById("ruang-select");

  let filterType = "none"; // Default filter type
  let scheduleData = []; // Store the schedule data
  let editRowIndex = null; // Store index of the row being edited

  // Function to show modal
  function showModal() {
    addRowModal.style.display = "block";
  }

  // Function to hide modal
  function hideModal() {
    addRowModal.style.display = "none";
    addRowForm.reset();
    editRowIndex = null; // Reset edit index
  }

  // Open modal on Add Row button click
  addRowBtn.addEventListener("click", showModal);

  // Close modal on close button click
  closeModal.addEventListener("click", hideModal);

  // Handle form submission for adding/editing row
  addRowForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(addRowForm);
    const newRow = {
      day: formData.get("day"),
      semester: formData.get("semester"),
      kelas: formData.get("class"),
      makul: formData.get("course"),
      dosen: formData.get("lecturer"),
      ruang: formData.get("room"),
      start_time: formData.get("start-time"),
      end_time: formData.get("end-time"),
    };

    if (editRowIndex !== null) {
      // Edit existing row
      const row = scheduleTableBody.rows[editRowIndex];
      updateRow(row, newRow);
    } else {
      // Add new row
      createRow(newRow);
    }

    hideModal(); // Close modal after saving
  });

  // Function to create a new row in the table
  function createRow(rowData) {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${rowData.day}</td>
            <td>${rowData.semester}</td>
            <td>${rowData.kelas}</td>
            <td>${rowData.makul}</td>
            <td>${rowData.dosen}</td>
            <td>${rowData.ruang}</td>
            <td>${rowData.start_time}</td>
            <td>${rowData.end_time}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
    scheduleTableBody.appendChild(row);

    attachRowEvents(row);
  }

  // Function to update an existing row
  function updateRow(row, rowData) {
    row.cells[0].innerText = rowData.day;
    row.cells[1].innerText = rowData.semester;
    row.cells[2].innerText = rowData.kelas;
    row.cells[3].innerText = rowData.makul;
    row.cells[4].innerText = rowData.dosen;
    row.cells[5].innerText = rowData.ruang;
    row.cells[6].innerText = rowData.start_time;
    row.cells[7].innerText = rowData.end_time;
  }

  // Function to attach events to a row
  function attachRowEvents(row) {
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    // Edit button click event
    editBtn.addEventListener("click", function () {
      editRowIndex = Array.from(scheduleTableBody.rows).indexOf(row);
      populateModalWithRowData(row);
      showModal();
    });

    // Delete button click event
    deleteBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this row?")) {
        row.remove();
      }
    });
  }

  // Function to populate the modal with row data for editing
  function populateModalWithRowData(row) {
    addRowForm.elements["day"].value = row.cells[0].innerText;
    addRowForm.elements["semester"].value = row.cells[1].innerText;
    addRowForm.elements["class"].value = row.cells[2].innerText;
    addRowForm.elements["course"].value = row.cells[3].innerText;
    addRowForm.elements["lecturer"].value = row.cells[4].innerText;
    addRowForm.elements["room"].value = row.cells[5].innerText;
    addRowForm.elements["start-time"].value = row.cells[6].innerText;
    addRowForm.elements["end-time"].value = row.cells[7].innerText;
  }

  // Function to update filter options based on selected filter type
  function updateFilterOptions() {
    // Hide all filter options initially
    document.querySelectorAll(".filter-option").forEach((option) => {
      option.style.display = "none";
    });

    // Show relevant filter options based on filterType
    switch (filterType) {
      case "day":
        document.getElementById("day-filter").style.display = "block";
        break;
      case "semester":
        document.getElementById("semester-filter").style.display = "block";
        break;
      case "ruang":
        document.getElementById("ruang-filter").style.display = "block";
        break;
      default:
        break;
    }
  }

  // Function to render the schedule based on the selected filter
  function renderSchedule() {
  scheduleTableBody.innerHTML = ""; // Clear table

  for (const [semester, days] of Object.entries(scheduleData)) {
    for (const [day, classes] of Object.entries(days)) {
      // Filter based on selected filter options
      const selectedDay = daySelect.value;
      const selectedSemester = semesterSelect.value;
      const selectedRuang = ruangSelect.value;

      classes.forEach((classInfo) => {
        const matchDay = selectedDay === "all" || selectedDay === day;
        const matchSemester =
          selectedSemester === "all" || selectedSemester === semester;
        const matchRuang =
          selectedRuang === "all" || selectedRuang === classInfo.ruang;

        if (
          filterType === "none" ||
          (filterType === "day" && matchDay) ||
          (filterType === "semester" && matchSemester) ||
          (filterType === "ruang" && matchRuang)
        ) {
          // Pastikan data hari diatur dengan benar
          classInfo.day = day;
          createRow(classInfo);
        }
      });
    }
  }
}

  // Event listener for radio button filter changes
  filterRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      filterType = event.target.value;
      updateFilterOptions();
      renderSchedule(); // Ensure rendering after filter type change
    });
  });

  // Event listener for select box changes
  daySelect.addEventListener("change", renderSchedule);
  semesterSelect.addEventListener("change", renderSchedule);
  ruangSelect.addEventListener("change", renderSchedule);

  // Fetch and display the schedule
  function fetchSchedule() {
    fetch("schedule.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        scheduleData = data;
        renderSchedule();
      })
      .catch((error) => {
        console.error("Error fetching schedule:", error);
        scheduleTableBody.innerHTML =
          '<tr><td colspan="9">Error loading schedule. Please try again later.</td></tr>';
      });
  }

  // Initial fetch when the page loads
  fetchSchedule();
});
