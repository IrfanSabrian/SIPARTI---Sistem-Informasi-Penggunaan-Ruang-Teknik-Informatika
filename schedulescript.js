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

// Schedules Page-------------------------------------------------------------------
let selectedDate = new Date();

function updateTime(date) {
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
  const dayName = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Format waktu yang hanya menunjukkan hari dan tanggal
  const timeString = `${dayName}, ${day}-${month}-${year}`;
  document.getElementById("current-time").innerText = timeString;

  // Update the schedule based on the new time
  fetchSchedule(date);
}

function isTimeInRange(currentTime, startTime, endTime) {
  const current = new Date(`1970-01-01T${currentTime}:00`);
  const start = new Date(`1970-01-01T${startTime.replace(".", ":")}:00`);
  const end = new Date(`1970-01-01T${endTime.replace(".", ":")}:00`);

  return current >= start && current <= end;
}

async function fetchSchedule(date) {
  try {
    const response = await fetch("schedule.json");
    const schedule = await response.json();
    updateSchedule(schedule, date);
  } catch (error) {
    console.error("Error fetching schedule:", error);
  }
}

function updateSchedule(schedule, date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[date.getDay()];
  const currentTime = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // Create an object to track room usage
  const roomUsage = {};

  // Initialize all rooms as unused
  document.querySelectorAll(".class").forEach((element) => {
    roomUsage[element.id] = {
      element: element,
      inUse: false,
      data: [],
    };
  });

  // Iterate over the schedule for the day and update room usage
  const todaySchedule = [
    ...(schedule.semester_2[dayName] || []),
    ...(schedule.semester_4[dayName] || []),
    ...(schedule.semester_6[dayName] || []),
  ];

  todaySchedule.forEach((classInfo) => {
    const roomId = `TI${classInfo.ruang.split("-")[1]}`;
    const classElement = document.getElementById(roomId);

    if (classElement) {
      roomUsage[roomId].data.push({
        semester: classInfo.semester,
        kelas: classInfo.kelas,
        makul: classInfo.makul,
        dosen: classInfo.dosen,
        ruang: classInfo.ruang,
        start_time: classInfo.start_time,
        end_time: classInfo.end_time,
      });

      // Mark the room as in use if the current time falls within the class time range
      if (
        isTimeInRange(currentTime, classInfo.start_time, classInfo.end_time)
      ) {
        roomUsage[roomId].inUse = true;
      }
    }
  });

  // Update the class elements based on the room usage
  document.querySelectorAll(".class").forEach((element) => {
    const usage = roomUsage[element.id];
    if (usage.data.length > 0) {
      // If there is any data for the room, color it red
      element.style.backgroundColor = "red";
    } else {
      // If no data, color it green
      element.style.backgroundColor = "green";
    }
    element.dataset.info = JSON.stringify(usage.data);
  });

  // Add click event listener to all classes
  document.querySelectorAll(".class").forEach((element) => {
    element.addEventListener("click", function () {
      const classInfo = JSON.parse(this.dataset.info || "[]");
      showModal(classInfo);
    });
  });
}

function showModal(classInfoArray) {
  const roomTitleElement = document.getElementById("roomTitle");
  const roomInfoElement = document.getElementById("roomInfo");

  if (classInfoArray.length > 0) {
    roomTitleElement.innerText = `Ruangan ${classInfoArray[0].ruang}`;
    roomInfoElement.innerHTML = classInfoArray
      .map(
        (classInfo) => `
        <p><strong>Semester:</strong> ${classInfo.semester}</p>
        <p><strong>Kelas:</strong> ${classInfo.kelas}</p>
        <p><strong>Mata Kuliah:</strong> ${classInfo.makul}</p>
        <p><strong>Dosen:</strong> ${classInfo.dosen}</p>
        <p><strong>Waktu:</strong> ${classInfo.start_time} - ${classInfo.end_time}</p>
        <hr />
      `
      )
      .join("");
  } else {
    roomTitleElement.innerText = "Room not in use";
    roomInfoElement.innerText = "This room is currently not in use.";
  }

  document.getElementById("roomModal").style.display = "block";
}

function closeModal() {
  document.getElementById("roomModal").style.display = "none";
}

// Calendar Logic
let lastSelectedDate = null; // Menyimpan tanggal yang terakhir dipilih

function renderCalendar() {
  const monthYearElement = document.getElementById("month-year");
  const datesElement = document.getElementById("dates");
  datesElement.innerHTML = "";

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  monthYearElement.innerText = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Tanggal dari bulan sebelumnya
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dateDiv = document.createElement("div");
    dateDiv.innerText = prevMonthDays - i;
    dateDiv.classList.add("other-month");
    datesElement.appendChild(dateDiv);
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // Tanggal di bulan saat ini
  for (let day = 1; day <= daysInMonth; day++) {
    const dateDiv = document.createElement("div");
    dateDiv.innerText = day;

    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();

    // Tambahkan kelas 'weekend' untuk Sabtu dan Minggu
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dateDiv.classList.add("weekend");
    }

    if (isCurrentMonth && day === today.getDate()) {
      dateDiv.classList.add("today");
    }

    // Highlight the selected date only if it is in the current month
    if (
      lastSelectedDate &&
      lastSelectedDate.getFullYear() === currentYear &&
      lastSelectedDate.getMonth() === currentMonth &&
      day === lastSelectedDate.getDate()
    ) {
      dateDiv.classList.add("selected");
    }

    dateDiv.addEventListener("click", () => {
      lastSelectedDate = new Date(currentYear, currentMonth, day);
      updateTime(lastSelectedDate);
      renderCalendar();
    });

    datesElement.appendChild(dateDiv);
  }

  // Tanggal dari bulan berikutnya
  const remainingDays = (7 - (datesElement.children.length % 7)) % 7;
  for (let i = 1; i <= remainingDays; i++) {
    const dateDiv = document.createElement("div");
    dateDiv.innerText = i;
    dateDiv.classList.add("other-month");
    datesElement.appendChild(dateDiv);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  selectedDate.setMonth(selectedDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  selectedDate.setMonth(selectedDate.getMonth() + 1);
  renderCalendar();
});

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  updateTime(selectedDate);
});

// Initialize
renderCalendar();
updateTime(new Date());

document.addEventListener("DOMContentLoaded", () => {
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.querySelector(".sidebar");
  const liveSchedule = document.querySelector(".live-schedules");

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    liveSchedule.classList.toggle("sidebar-open");
  });
});
