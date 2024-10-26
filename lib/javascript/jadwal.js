// Kalender-----------------------------------------
// Global variables
let selectedDate = new Date();
let lastSelectedDate = null;
let selectedDateVariable = new Date(); // Set default ke tanggal hari ini
let selectedDay = ""; // Tambahkan variabel untuk menyimpan hari yang dipilih
let startSelectedTime = ""; // Tambahkan variabel untuk menyimpan waktu Mulai
let endSelectedTime = ""; // Tambahkan variabel untuk menyimpan Waktu Selesai

// Function to render the calendar
document.addEventListener("DOMContentLoaded", function () {
  const calendarDates = document.getElementById("calendar-dates");
  const monthYearDisplay = document.getElementById("month-year");
  const prevMonthButton = document.getElementById("prev-month");
  const nextMonthButton = document.getElementById("next-month");
  let selectedDateElement = null;

  // Simulasi data bulan dan tahun
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  // Fungsi untuk mendapatkan nama hari dalam bahasa Indonesia
  function getNamaHari(date) {
    const namaHari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return namaHari[date.getDay()]; // Mengambil nama hari berdasarkan indeks
  }

  // Fungsi untuk membuat kalender
  function generateCalendar(month, year) {
    calendarDates.innerHTML = "";
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const daysInNextMonth = 35 - (firstDayOfMonth + daysInMonth);

    // Tampilkan bulan dan tahun di header kalender
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Tambahkan tanggal bulan sebelumnya
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dateElement = document.createElement("div");
      dateElement.classList.add("date", "prev-month");
      dateElement.textContent = daysInPrevMonth - i;

      const dateInPrevMonth = new Date(year, month - 1, daysInPrevMonth - i);

      if (
        selectedDateVariable &&
        dateInPrevMonth.getTime() === selectedDateVariable.getTime()
      ) {
        dateElement.classList.add("selected");
        selectedDateElement = dateElement;
      }

      calendarDates.appendChild(dateElement);
    }

    // Menghasilkan hari-hari dalam bulan ini
    for (let i = 1; i <= daysInMonth; i++) {
      const dateElement = document.createElement("div");
      dateElement.classList.add("date");
      dateElement.textContent = i;

      const selectedDateObj = new Date(year, month, i);
      const dayOfWeek = selectedDateObj.getDay();

      if (dayOfWeek === 6 || dayOfWeek === 0) {
        dateElement.classList.add("weekend");
      }

      // Tandai tanggal hari ini
      if (
        selectedDateObj.getDate() === today.getDate() &&
        selectedDateObj.getMonth() === today.getMonth() &&
        selectedDateObj.getFullYear() === today.getFullYear()
      ) {
        dateElement.classList.add("today");
      }

      // Seleksi default hari ini saat pertama kali kalender dibuka
      if (selectedDateObj.getTime() === selectedDateVariable.getTime()) {
        dateElement.classList.add("selected");
        selectedDateElement = dateElement;
      }

      dateElement.addEventListener("click", function () {
        if (selectedDateElement) {
          selectedDateElement.classList.remove("selected");
        }
        dateElement.classList.add("selected");
        selectedDateElement = dateElement;
        selectedDateVariable = new Date(year, month, i);
        updateSelectedDateText(selectedDateVariable);
      });

      calendarDates.appendChild(dateElement);
    }

    // Tambahkan tanggal bulan berikutnya
    for (let i = 1; i <= daysInNextMonth; i++) {
      const dateElement = document.createElement("div");
      dateElement.classList.add("date", "next-month");
      dateElement.textContent = i;

      const dateInNextMonth = new Date(year, month + 1, i);

      if (
        selectedDateVariable &&
        dateInNextMonth.getTime() === selectedDateVariable.getTime()
      ) {
        dateElement.classList.add("selected");
        selectedDateElement = dateElement;
      }

      dateElement.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        selectedDateVariable = new Date(currentYear, currentMonth, i);
        generateCalendar(currentMonth, currentYear);
        updateSelectedDateText(selectedDateVariable);
      });

      calendarDates.appendChild(dateElement);
    }

    // Perbarui tampilan tanggal yang dipilih
    updateSelectedDateText(selectedDateVariable);
  }

  // Fungsi untuk memperbarui tampilan tanggal yang dipilih
  function updateSelectedDateText(date) {
    const hari = getNamaHari(date);
    selectedDay = hari; // Simpan nama hari yang dipilih
    console.log("Selected hari set to:", selectedDay); // Tambahkan log ini
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    document.getElementById(
      "selected-date"
    ).textContent = `${hari}, ${date.getDate()}-${
      monthNames[date.getMonth()]
    }-${date.getFullYear()}`;
    fetchSchedule();
    fetchScheduleAndUpdate();
  }

  // Inisialisasi kalender dengan bulan dan tahun saat ini
  generateCalendar(currentMonth, currentYear);

  // Tombol untuk berpindah bulan
  prevMonthButton.addEventListener("click", function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthButton.addEventListener("click", function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });
});

// jam perkuliahan
document.addEventListener("DOMContentLoaded", function () {
  const timeSlots = {
    1: "07:00 - 07:50",
    2: "07:50 - 08:40",
    3: "08:40 - 09:30",
    4: "09:45 - 10:35",
    5: "10:35 - 11:25",
    6: "11:25 - 12:15",
    7: "13:00 - 13:50",
    8: "13:50 - 14:40",
    9: "15:30 - 16:20",
    10: "16:20 - 17:10",
    11: "17:10 - 18:00",
    12: "18:30 - 19:20",
  };

  const buttons = document.querySelectorAll(".button-container button");
  const selectedTimeDisplay = document.getElementById("selected-time");

  // Function to set the selected time
  function setSelectedTime(value) {
    buttons.forEach((button) => button.classList.remove("selected"));
    const selectedButton = document.querySelector(`button[value="${value}"]`);
    selectedButton.classList.add("selected");

    const [startTime, endTime] = timeSlots[value].split(" - ");

    const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
    startTimeDate.setMinutes(startTimeDate.getMinutes() + 1);
    const adjustedStartTime = startTimeDate.toTimeString().slice(0, 5); // Ambil format HH:mm

    const endTimeDate = new Date(`1970-01-01T${endTime}:00`);
    endTimeDate.setMinutes(endTimeDate.getMinutes() - 1);
    const adjustedEndTime = endTimeDate.toTimeString().slice(0, 5); // Ambil format HH:mm

    startSelectedTime = adjustedStartTime;
    endSelectedTime = adjustedEndTime;
    selectedTimeDisplay.innerHTML = `Jam perkuliahan ke-${value}<br>${startTime} - ${endTime}`;
    console.log("Selected times:", `Mulai: ${startTime}, Selesai: ${endTime}`);
    fetchSchedule();
    fetchScheduleAndUpdate();
  }

  // Set default to Jam ke-1 on page load
  setSelectedTime(1);

  // Add click event to all buttons
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const value = this.value;
      setSelectedTime(value);
    });
  });
});

// Denah Section

// Inisialisasi saat halaman dimuat
window.onload = async function () {
  await initializeSupabase(); // Tunggu sampai inisialisasi selesai
  fetchScheduleAndUpdate();
};

// Fungsi untuk memperbarui jadwal
async function fetchSchedule() {
  console.log("Fetching schedule hari:", selectedDay);
  console.log(
    "Fetching schedule jam mulai:",
    startSelectedTime,
    "Selesai:",
    endSelectedTime
  );

  try {
    // Mengambil seluruh data dari tabel
    const { data, error } = await database.from("jadwal").select(`
      matkul: kode_matkul(nama_matkul),
      dosen: nip_dosen(nama),
      ruangan: kode_ruangan(nama_ruangan),
      hari, semester, kelas, jam_mulai, jam_selesai
    `);

    if (error) throw error;

    // Log untuk menampilkan semua data
    console.log("Data fetched from Supabase:", data);

    // Filter data berdasarkan hari yang dipilih
    const filteredByDay = data.filter(
      (classInfo) => classInfo.hari === selectedDay
    );
    console.log("Jadwal pada hari:", selectedDay, filteredByDay);

    // Filter data berdasarkan jam yang dipilih
    const filteredByTime = filteredByDay.filter((classInfo) => {
      const classStartTime = new Date(`1970-01-01T${classInfo.jam_mulai}`);
      const classEndTime = new Date(`1970-01-01T${classInfo.jam_selesai}`);
      const selectedStartTime = new Date(`1970-01-01T${startSelectedTime}:00`);
      const selectedEndTime = new Date(`1970-01-01T${endSelectedTime}:00`);

      // Log untuk debugging
      console.log(
        `Comparing class: ${classInfo.jam_mulai} - ${classInfo.jam_selesai}`
      );
      console.log(`With selected: ${startSelectedTime} - ${endSelectedTime}`);
      console.log(
        `classStartTime: ${classStartTime}, classEndTime: ${classEndTime}`
      );
      console.log(
        `selectedStartTime: ${selectedStartTime}, selectedEndTime: ${selectedEndTime}`
      );

      // Cek tumpang tindih waktu
      return (
        classStartTime <= selectedEndTime && classEndTime >= selectedStartTime
      );
    });

    console.log(
      "Jadwal pada hari:",
      selectedDay,
      "dan rentang waktu:",
      startSelectedTime,
      "-",
      endSelectedTime,
      filteredByTime
    );
    return filteredByTime; // Mengembalikan data yang difilter berdasarkan waktu dan hari
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
}

async function fetchScheduleAndUpdate() {
  try {
    // Mengambil jadwal yang sudah difilter berdasarkan hari dan waktu dari fetchSchedule
    const schedule = await fetchSchedule();
    console.log(
      "Filtered schedule And Update based on selected day and time:",
      schedule
    );

    // Mendefinisikan jam istirahat
    const breakTimes = [
      { start: "09:30:01", end: "09:44:59" },
      { start: "12:15:01", end: "12:59:59" },
      { start: "14:40:01", end: "15:29:59" },
    ];

    // Mengecek apakah waktu yang dipilih adalah jam istirahat
    const isBreakTime = breakTimes.some(({ start, end }) => {
      const breakStart = new Date(`1970-01-01T${start}`);
      const breakEnd = new Date(`1970-01-01T${end}`);
      const selectedStartTime = new Date(`1970-01-01T${startSelectedTime}:00`);
      const selectedEndTime = new Date(`1970-01-01T${endSelectedTime}:00`);

      console.log("Checking break time:");
      console.log(`Break start: ${breakStart}, Break end: ${breakEnd}`);
      console.log(
        `Selected start time: ${selectedStartTime}, Selected end time: ${selectedEndTime}`
      );

      // Periksa apakah waktu istirahat bersinggungan dengan waktu yang dipilih
      return selectedStartTime <= breakEnd && selectedEndTime >= breakStart;
    });
    console.log("Is break time:", isBreakTime);

    // Mengambil data keluhan untuk ruangan yang dalam perbaikan
    const { data: complaints, error: keluhanError } = await database
      .from("keluhan")
      .select("kode_ruangan, status")
      .eq("status", "Accept");

    if (keluhanError) throw keluhanError;

    console.log("Complaints data (under maintenance rooms):", complaints);

    document.querySelectorAll(".class").forEach((element) => {
      const roomId = element.id;

      console.log("Processing room ID:", roomId);

      // 1. Cek apakah ruangan sedang dalam perbaikan (oranye)
      const isUnderMaintenance = complaints.some(
        (complaint) => `TI${complaint.kode_ruangan}` === roomId
      );

      if (isUnderMaintenance) {
        console.log(`Room ${roomId} is under maintenance.`);
        element.style.backgroundColor = "orange";
        element.style.color = "white";
        element.dataset.info = JSON.stringify({
          room: roomId,
          inUse: false,
          isUnderMaintenance: true,
        });
        return; // Skip pengecekan lain jika dalam perbaikan
      }

      // 2. Jika waktu yang dipilih adalah jam istirahat, buat ruangan berwarna kuning
      if (isBreakTime) {
        console.log(`Room ${roomId} is in break time.`);
        element.style.backgroundColor = "yellow";
        element.style.color = "black";
        element.dataset.info = JSON.stringify({
          room: roomId,
          inUse: false,
          isBreak: true,
        });
        return; // Skip pengecekan lain jika dalam jam istirahat
      }

      // 3. Cek apakah ruangan sedang digunakan (merah)
      const classInfo = schedule.find((info) => {
        const roomCode = `TI${info.ruangan.nama_ruangan.split("-")[1]}`;
        return roomCode === roomId;
      });

      if (classInfo) {
        console.log(`Room ${roomId} is currently in use.`);
        element.style.backgroundColor = "red";
        element.style.color = "white";
        element.dataset.info = JSON.stringify({
          room: classInfo.ruangan.nama_ruangan,
          inUse: true,
          isBreak: false,
        });
        return; // Skip pengecekan lain jika ruangan sedang digunakan
      }

      // 4. Jika tidak dalam perbaikan, bukan jam istirahat, dan tidak digunakan, warna hijau
      console.log(`Room ${roomId} is available (green).`);
      element.style.backgroundColor = "green";
      element.style.color = "white";
      element.dataset.info = JSON.stringify({
        room: roomId,
        inUse: false,
        isBreak: false,
        isUnderMaintenance: false,
      });
    });
  } catch (error) {
    console.error("Gagal memperbarui jadwal:", error);
  }
}

async function openRoomModal(roomId) {
  const schedule = await fetchSchedule();
  const roomElement = document.getElementById(roomId);
  const roomInfo = JSON.parse(roomElement.dataset.info);

  console.log(`Room ID: ${roomId}, Info:`, roomInfo); // Log informasi ruangan

  const isUnderMaintenance = roomInfo.isUnderMaintenance;
  const isUsed = roomElement.style.backgroundColor === "red";

  console.log(`Room ID: ${roomId}, Is Used: ${isUsed}`); // Log status penggunaan ruangan

  // Kolom 3: Menampilkan gambar ruangan
  const imagesHTML = `
        <h3>Preview Ruangan</h3>
        <img src="img/ruangan/${roomId}-1.jpg" alt="Ruangan ${roomId} - 1" width="100%">
        <img src="img/ruangan/${roomId}-2.jpg" alt="Ruangan ${roomId} - 2" width="100%">
        <img src="img/ruangan/${roomId}-3.jpg" alt="Ruangan ${roomId} - 3" width="100%">
    `;
  document.getElementById("modal-column-3").innerHTML = imagesHTML;

  // Kolom 2: Informasi ruangan
  if (isUnderMaintenance) {
    document.getElementById("modal-column-2").innerHTML = `
      <h3>Ruangan ${roomId}</h3><br>
      <h4>Sedang Perbaikan</h4>
    `;
  } else if (roomInfo.isBreak) {
    document.getElementById("modal-column-2").innerHTML = `
      <h3>Ruangan ${roomId}</h3><br>
      <h4>Sedang Istirahat</h4>
    `;
  } else {
    // Menggunakan data dari filteredByTime
    console.log("Filtered By Time:", schedule); // Log data filteredByTime untuk analisis

    const selectedRoomData = schedule.find(
      (item) => `TI${item.ruangan.nama_ruangan.split("-")[1]}` === roomId
    );

    console.log(`Selected Room Data for ${roomId}:`, selectedRoomData); // Log data yang ditemukan

    if (selectedRoomData) {
      // Jika ruangan sedang digunakan pada waktu yang dipilih
      const infoHTML = `
        <h3>Ruangan ${roomId}</h3> <br>
        <strong>Mata Kuliah :</strong> ${selectedRoomData.matkul.nama_matkul}<br>
        <strong>Dosen :</strong> ${selectedRoomData.dosen.nama}<br>
        <strong>Hari :</strong> ${selectedRoomData.hari}<br>
        <strong>Semester :</strong> ${selectedRoomData.semester}<br>
        <strong>Kelas :</strong> ${selectedRoomData.kelas}<br>
        <strong>Jam Mulai :</strong> ${selectedRoomData.jam_mulai}<br>
        <strong>Jam Selesai :</strong> ${selectedRoomData.jam_selesai}
      `;
      document.getElementById("modal-column-2").innerHTML = infoHTML;
    } else {
      // Jika ruangan tidak digunakan pada waktu yang dipilih
      document.getElementById("modal-column-2").innerHTML = `
        <h3>Ruangan ${roomId}</h3><br><h4>Ruangan sedang tidak digunakan</h4>
      `;
    }
  }

  roomId = roomId.replace("TI", ""); // Menghapus 'TI' sehingga hanya tersisa angka

  console.log("Room ID yang dicari:", roomId); // Cek apakah Room ID yang dicari sesuai

  // Kolom 1: Menampilkan denah dan spesifikasi ruangan
  const denahHTML = `
    <h3>Denah</h3>
    <img src="img/denah/TI${roomId.replace(
      "TI",
      ""
    )}.jpg" alt="Denah ${roomId}" width="100%">
  `;
  document.getElementById("modal-column-1").innerHTML = denahHTML;

  try {
    const { data: roomSpecs, error: roomSpecsError } = await database
      .from("ruangan")
      .select("*")
      .eq("kode_ruangan", roomId);

    if (roomSpecsError) {
      console.error("Error fetching room specifications:", roomSpecsError);
      document.getElementById("modal-column-1").innerHTML +=
        "<p>Terjadi kesalahan saat mengambil spesifikasi ruangan.</p>";
      return;
    }

    if (roomSpecs && roomSpecs.length > 0) {
      const specs = roomSpecs[0]; // Dapatkan spesifikasi ruangan

      // Spesifikasi lainnya dengan kondisi yang sama
      const kursi =
        specs.kursi === null
          ? "Data Belum Tersedia"
          : specs.kursi === 0
          ? 0
          : specs.kursi;

      const meja =
        specs.meja === null
          ? "Data Belum Tersedia"
          : specs.meja === 0
          ? 0
          : specs.meja;

      const pc =
        specs.pc === null || specs.pc === "null"
          ? "Data Belum Tersedia"
          : parseInt(specs.pc) === 0
          ? "Tidak Tersedia"
          : `${specs.pc}`;

      const ac =
        specs.ac === null || specs.ac === "null"
          ? "Data Belum Tersedia"
          : parseInt(specs.ac) === 0
          ? "Tidak Tersedia"
          : "Tersedia";

      const proyektor =
        specs.proyektor === null || specs.proyektor === "null"
          ? "Data Belum Tersedia"
          : parseInt(specs.proyektor) === 0
          ? "Tidak Tersedia"
          : "Tersedia";

      // Tampilkan modal 1 dan jika ada keluhan akan di disable
      const specsHTML = `
  <h3>Spesifikasi Ruangan</h3> <br>
  <strong>Kursi:</strong> ${kursi}<br>
  <strong>Meja:</strong> ${meja}<br>
  <strong>PC:</strong> ${pc}<br>
  <strong>AC:</strong> ${ac}<br>
  <strong>Proyektor:</strong> ${proyektor}<br><br>
  ${
    !isUnderMaintenance
      ? `
    <div id="report-complaint">
      <i class='bx bx-message-square-error' style='color: red;'></i>
      <button id="reportComplaintBtn" class="report-complaint-btn">Laporkan Keluhan</button>
    </div>
  `
      : ""
  }
`;
      document.getElementById("modal-column-1").innerHTML += specsHTML;

      // Only add event listener for complaint button if it exists
      const reportComplaintBtn = document.getElementById("reportComplaintBtn");
      if (reportComplaintBtn) {
        reportComplaintBtn.addEventListener("click", function () {
          openReportModal(roomId);
        });
      } else {
        console.log(
          "Tombol 'Laporkan Keluhan' tidak ditampilkan karena sedang perbaikan."
        );
      }

      document.getElementById("roomModal").style.display = "block";
    } else {
      document.getElementById("modal-column-1").innerHTML +=
        "<p>Data spesifikasi ruangan belum tersedia.</p>";
    }
  } catch (error) {
    console.error("Error fetching room specifications:", error);
    document.getElementById("modal-column-1").innerHTML +=
      "<p>Terjadi kesalahan saat mengambil spesifikasi ruangan.</p>";
  }

  document.getElementById("roomModal").style.display = "block";
}

function openReportModal(roomId) {
  // Isi input ruangan dengan Room ID
  document.getElementById("ruangan").value = `${roomId}`;

  // Tampilkan modal keluhan
  document.getElementById("keluhanModal").style.display = "block";
}

// Fungsi untuk menutup modal keluhan
function closeKeluhanModal() {
  document.getElementById("keluhanModal").style.display = "none";
}

// Menutup modal keluhan ketika mengklik di luar modal
window.onclick = function (event) {
  const keluhanModal = document.getElementById("keluhanModal");
  // Periksa apakah target yang diklik adalah modal (overlay)
  if (event.target === keluhanModal) {
    closeKeluhanModal();
  }
};

// Fungsi untuk menutup modal
function closeModal() {
  document.getElementById("roomModal").style.display = "none";
}

// Menutup modal ketika mengklik di luar modal
window.onclick = function (event) {
  if (event.target == document.getElementById("roomModal")) {
    closeModal();
  }
};

// Fungsi untuk menampilkan Lab 2
function showLab2() {
  document.getElementById("box1").style.display = "none";
  document.getElementById("box2").style.display = "block";
}

// Fungsi untuk menampilkan Lab 1
function showLab1() {
  document.getElementById("box2").style.display = "none";
  document.getElementById("box1").style.display = "block";
}

// Fungsi untuk mengirim keluhan
async function kirimKeluhan(event) {
  event.preventDefault(); // Mencegah form dari reload halaman

  // Ambil data dari form
  const pelapor = document.getElementById("nama").value;
  const kode_ruangan = document.getElementById("ruangan").value;
  const isi_keluhan = document.getElementById("keluhan").value;
  const gambar = document.getElementById("gambar").files[0];

  if (!pelapor || !kode_ruangan || !isi_keluhan || !gambar) {
    alert("Harap isi semua field dan unggah gambar.");
    return;
  }
  
  try {
    // Step 1: Insert keluhan data ke Supabase
    let { data: keluhan, error } = await database
      .from("keluhan")
      .insert([
        {
          pelapor: pelapor,
          kode_ruangan: kode_ruangan,
          isi_keluhan: isi_keluhan,
          status: "Pending",
        },
      ])
      .select("id_keluhan");

    if (error) {
      console.error("Error inserting data:", error);
      throw error;
    }

    // Ambil id_keluhan dari data yang baru dimasukkan
    const id_keluhan = keluhan[0].id_keluhan;

    // Step 2: Rename dan Upload gambar ke Supabase Storage di bucket "images", folder "keluhan"
    const newFileName = `keluhan-${id_keluhan}.jpg`; // Ubah nama file menjadi keluhan-x.jpg
    const { data: fileUpload, error: uploadError } = await database.storage
      .from("images") // Menggunakan bucket "images"
      .upload(`keluhan/${newFileName}`, gambar, {
        cacheControl: "3600",
        upsert: false, // Mencegah overwrite jika file sudah ada
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    alert("Keluhan anda berhasil dikirim dan akan segera ditangani.");

    // Menutup modal keluhan setelah alert
    closeKeluhanModal();

    // Reset form setelah pengiriman
    document.getElementById("keluhanForm").reset();
  } catch (error) {
    console.error("Error mengirim keluhan:", error);
    alert("Terjadi kesalahan saat mengirim keluhan. Coba lagi.");
  }
}

// Event listener untuk tombol submit
document.getElementById("kirimKeluhan").addEventListener("click", kirimKeluhan);


// Sidebar mobile
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.querySelector(".sidebar-toggle");
  let sidebarVisible = false; // Status untuk mengecek apakah sidebar terlihat

  // Fungsi untuk mengubah posisi sidebar dan ikon
  toggleButton.addEventListener("click", function () {
    if (sidebarVisible) {
      sidebar.style.left = "-370px"; // Sembunyikan sidebar
      toggleButton.style.left = "0"; // Kembali ke kiri
      toggleButton.innerHTML =
        '<span class="material-symbols-outlined">chevron_right</span>'; // Ganti ikon
    } else {
      sidebar.style.left = "0"; // Tampilkan sidebar
      toggleButton.style.left = "360px"; // Atur posisi toggle di kanan
      toggleButton.innerHTML =
        '<span class="material-symbols-outlined">chevron_left</span>'; // Ganti ikon
    }
    sidebarVisible = !sidebarVisible; // Toggle status
  });
});
