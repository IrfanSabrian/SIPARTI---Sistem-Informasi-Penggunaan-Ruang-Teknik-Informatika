// Section Jadwal Sedang Berlangsung 
async function fetchSchedule() {
  try {
    const { data, error } = await database.from("jadwal").select(`
                matkul: kode_matkul(nama_matkul),
                dosen: nip_dosen(nama),
                ruangan: kode_ruangan(nama_ruangan),
                hari, semester, kelas, jam_mulai, jam_selesai
            `);

    if (error) throw error;

    console.log("Data fetched from Supabase:", data);

    // Get today's day name
    const now = new Date();
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const dayName = days[now.getDay()];

    // Filter schedule based on today's day
    const todaySchedule = data.filter(
      (classInfo) => classInfo.hari === dayName
    );
    console.log("Jadwal Hari ini:", todaySchedule);
    return todaySchedule;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
}

// Fungsi untuk memperbarui waktu
function updateTime() {
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
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
  const dayName = days[now.getDay()];
  const day = now.getDate().toString().padStart(2, "0");
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const timeString = `${dayName}, ${day}-${month}-${year} <br> ${hours}:${minutes}:${seconds}`;

  document.getElementById("current-time").innerHTML = timeString;

  // Update jadwal berdasarkan waktu baru
  fetchScheduleAndUpdate();
}

// Fungsi untuk memeriksa apakah waktu dalam rentang tertentu
function isTimeInRange(currentTime, startTime, endTime) {
  const currentDate = new Date();
  const start = new Date(
    `${currentDate.toISOString().split("T")[0]}T${startTime}`
  );
  const end = new Date(`${currentDate.toISOString().split("T")[0]}T${endTime}`);

  const [currentHours, currentMinutes] = currentTime.split(":");
  const current = new Date(currentDate);
  current.setHours(currentHours);
  current.setMinutes(currentMinutes);
  current.setSeconds(0);

  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    return current >= start && current <= end;
  } else {
    console.error("Start time atau End time tidak valid.");
    return false;
  }
}

// Fungsi untuk memperbarui tampilan jadwal
async function fetchScheduleAndUpdate() {
  try {
    const schedule = await fetchSchedule(); // Mengambil jadwal dari koneksi.js
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const currentDay = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const breakTimes = [
      { start: "09:30", end: "09:45" },
      { start: "12:15", end: "13:00" },
      { start: "14:40", end: "15:30" },
    ];
    const isWeekday = currentDay >= 1 && currentDay <= 5;
    const isBreakTime =
      isWeekday &&
      breakTimes.some(({ start, end }) =>
        isTimeInRange(currentTime, start, end)
      );

    // Ambil data keluhan untuk perbaikan ruangan
    const { data: complaints, error: keluhanError } = await database
      .from("keluhan")
      .select("kode_ruangan, status")
      .eq("status", "Accept"); // Ambil keluhan dengan status 'Accept'

    if (keluhanError) throw keluhanError;

    const roomUsageStatus = {};

    document.querySelectorAll(".class").forEach((element) => {
      const roomId = element.id;

      // Prioritas warna: oranye > kuning > merah > hijau

      // 1. Cek apakah ruangan sedang dalam perbaikan (oranye)
      const isUnderMaintenance = complaints.some(
        (complaint) => `TI${complaint.kode_ruangan}` === roomId
      );

      if (isUnderMaintenance) {
        element.style.backgroundColor = "orange";
        element.style.color = "white";
        element.dataset.info = JSON.stringify({
          room: roomId,
          inUse: false,
          isUnderMaintenance: true,
        });
        return; // Skip further checks if under maintenance
      }

      // 2. Jika jam istirahat, buat ruangan berwarna kuning
      if (isBreakTime) {
        element.style.backgroundColor = "yellow";
        element.style.color = "black";
        element.dataset.info = JSON.stringify({
          room: roomId,
          inUse: false,
          isBreak: true,
        });
        return; // Skip further checks if it's break time
      }

      // 3. Cek apakah ruangan sedang digunakan (merah)
      const classInfo = schedule.find((info) => {
        const roomCode = `TI${info.ruangan.nama_ruangan.split("-")[1]}`;
        return roomCode === roomId && isTimeInRange(currentTime, info.jam_mulai, info.jam_selesai);
      });

      if (classInfo) {
        element.style.backgroundColor = "red";
        element.style.color = "white";
        element.dataset.info = JSON.stringify({
          room: classInfo.ruangan.nama_ruangan,
          inUse: true,
          isBreak: false,
        });
        return; // Skip further checks if the room is in use
      }

      // 4. Jika tidak dalam perbaikan, tidak jam istirahat, dan tidak digunakan, warna hijau
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

// Fungsi untuk membuka modal ketika ruangan diklik
async function openRoomModal(roomId) {
  const roomElement = document.getElementById(roomId);
  const roomInfo = JSON.parse(roomElement.dataset.info);

  console.log(`Room ID: ${roomId}, Info:`, roomInfo);

  const isUnderMaintenance = roomInfo.isUnderMaintenance;
  const isUsed = roomElement.style.backgroundColor === "red";

  console.log(`Room ID: ${roomId}, Is Used: ${isUsed}`);

  // Ambil gambar ruangan (Column 3)
  const imagesHTML = `
        <h3>Preview Ruangan</h3>
        <img src="img/ruangan/${roomId}-1.jpg" alt="Ruangan ${roomId} - 1" width="100%">
        <img src="img/ruangan/${roomId}-2.jpg" alt="Ruangan ${roomId} - 2" width="100%">
        <img src="img/ruangan/${roomId}-3.jpg" alt="Ruangan ${roomId} - 3" width="100%">
    `;
  document.getElementById("modal-column-3").innerHTML = imagesHTML;

  // Kolom 2 (Informasi ruangan)
  // Cek apakah waktu sekarang adalah waktu istirahat
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const breakTimes = [
    { start: "09:30", end: "09:45" },
    { start: "12:15", end: "13:00" },
    { start: "14:40", end: "15:30" },
  ];

  // Mendapatkan hari dalam angka (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
  const currentDay = now.getDay();

  // Hanya berlaku untuk hari Senin hingga Jumat (1 sampai 5)
  const isWeekday = currentDay >= 1 && currentDay <= 5;

  const isBreak =
    isWeekday &&
    breakTimes.some(
      (breakTime) =>
        currentTime >= breakTime.start && currentTime <= breakTime.end
    );

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
    try {
      // Ambil data jadwal ruangan
      const { data, error } = await database.from("jadwal").select(`
                matkul: kode_matkul(nama_matkul),
                dosen: nip_dosen(nama),
                ruangan: kode_ruangan(nama_ruangan),
                hari, semester, kelas, jam_mulai, jam_selesai
            `);

      if (error) {
        console.error("Error fetching room data:", error);
        document.getElementById("modal-column-2").innerHTML =
          "<p>Terjadi kesalahan saat mengambil data ruangan.</p>";
        return;
      }

      // Ambil hari ini dan waktu sekarang
      const today = new Date().toLocaleString("id-ID", { weekday: "long" });

      // Filter data berdasarkan roomId dan hari ini
      const roomData = data.filter(
        (item) =>
          `TI${item.ruangan.nama_ruangan.split("-")[1]}` === roomId &&
          item.hari === today
      );

      // Variabel untuk menandai apakah ruangan sedang digunakan
      let isRoomInUse = false;

      // Cek setiap jadwal untuk melihat apakah ada yang sedang berlangsung
      for (const classInfo of roomData) {
        if (
          isTimeInRange(currentTime, classInfo.jam_mulai, classInfo.jam_selesai)
        ) {
          isRoomInUse = true;

          let infoHTML = `
                <h3>Ruangan ${roomId}</h3> <br>
                <strong>Mata Kuliah :</strong> ${classInfo.matkul.nama_matkul}<br>
                <strong>Dosen :</strong> ${classInfo.dosen.nama}<br>
                <strong>Hari :</strong> ${classInfo.hari}<br>
                <strong>Semester :</strong> ${classInfo.semester}<br>
                <strong>Kelas :</strong> ${classInfo.kelas}<br>
                <strong>Jam Mulai :</strong> ${classInfo.jam_mulai}<br>
                <strong>Jam Selesai :</strong> ${classInfo.jam_selesai}
            `;
          document.getElementById("modal-column-2").innerHTML = infoHTML;
          break; // Hentikan loop setelah menemukan ruangan sedang digunakan
        }
      }

      // Jika tidak ada jadwal yang cocok, ruangan tidak digunakan
      if (!isRoomInUse) {
        document.getElementById("modal-column-2").innerHTML = `
        <h3>Ruangan ${roomId}</h3><br><h4>Ruangan sedang tidak digunakan</h4>
        `;
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      document.getElementById("modal-column-2").innerHTML =
        "<p>Terjadi kesalahan saat mengambil data.</p>";
    }
  }

  // Tampilkan denah ruangan dan spesifikasi ruangan (Column 1)
  roomId = roomId.replace("TI", ""); // Menghapus 'TI' sehingga hanya tersisa angka

  console.log("Room ID yang dicari:", roomId); // Cek apakah Room ID yang dicari sesuai

  // Tampilkan denah ruangan dan spesifikasi ruangan
  const denahHTML = `
  <h3>Denah</h3>
  <img src="img/denah/TI${roomId}.jpg" alt="Denah ${roomId}" width="100%">
`;
  document.getElementById("modal-column-1").innerHTML = denahHTML;

  try {
    // Ambil data spesifikasi ruangan dari tabel 'ruangan' berdasarkan kode_ruangan
    const { data: roomSpecs, error: roomSpecsError } = await database
      .from("ruangan")
      .select("*")
      .eq("kode_ruangan", roomId); // Menggunakan angka 'roomId' yang sesuai dengan kode_ruangan di database

    console.log("Data yang diambil dari database:", roomSpecs); // Log data yang diambil untuk memastikan

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

      // Tampilkan modal
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

  // Menampilkan modal
  document.getElementById("roomModal").style.display = "block";
}

// modal untuk menampilkan keluhan
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

// Fungsi untuk memeriksa apakah waktu saat ini berada dalam rentang waktu
function isTimeInRange(currentTime, startTime, endTime) {
  return currentTime >= startTime && currentTime < endTime;
}

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

// Inisialisasi saat halaman dimuat
window.onload = function () {
  initializeSupabase(); // Panggil inisialisasi Supabase dari koneksi.js
  updateTime();
  setInterval(updateTime, 1000); // Perbarui waktu setiap detik
  setInterval(fetchScheduleAndUpdate, 60000); // Perbarui jadwal setiap menit
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
