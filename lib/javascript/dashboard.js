// Pastikan koneksi ke Supabase
initializeSupabase();
let currentTable;

// Fungsi untuk menampilkan data dalam tabel
async function loadTableData(tableName) {
  currentTable = tableName; // Set currentTable ke tabel yang dimuat
  console.log("Memuat data untuk tabel:", currentTable);

  try {
    const { data, error } = await database
      .from(currentTable)
      .select("*")
      .order(
        Object.keys(
          (
            await database.from(currentTable).select("*").limit(1)
          ).data[0]
        )[0],
        { ascending: true }
      );

    if (error) {
      console.error("Error saat mengambil data:", error);
      return;
    }

    const mainContent = document.querySelector(".database-table");
    mainContent.innerHTML = "";

    // Menampilkan tombol Insert hanya ketika tabel dimuat
    const insertContainer = document.createElement("div");
    insertContainer.classList.add("insert-container");
    insertContainer.innerHTML = `
      <button class="insert-button" onclick="toggleDropdown()"><i class="fas fa-plus"></i> Insert</button>
      <div class="dropdown-content" style="display: none;">
        <button type="button" onclick="insertRow('${tableName}')">Tambah Data</button>
        <button type="button" onclick="importCSV()">Import data dari CSV</button>
      </div>
    `;

    mainContent.appendChild(insertContainer);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Buat header tabel dari nama kolom dan tambah kolom "Aksi"
    if (data && data.length > 0) {
      const headerRow = document.createElement("tr");
      Object.keys(data[0]).forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });

      const aksiTh = document.createElement("th");
      aksiTh.textContent = "Aksi";
      headerRow.appendChild(aksiTh);
      thead.appendChild(headerRow);
    } else {
      console.log("Data kosong untuk tabel:", tableName);
    }
    table.appendChild(thead);

    // Isi tabel dengan data dari Supabase dan tambah kolom "Aksi"
    data.forEach((row) => {
      const tr = document.createElement("tr");

      Object.values(row).forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });

      const aksiTd = document.createElement("td");
      aksiTd.style.width = "170px"; // Set lebar 100px
      aksiTd.style.whiteSpace = "nowrap";

      // Create the Edit button with icon
      const editButton = document.createElement("button");
      const editIcon = document.createElement("i");
      editIcon.classList.add("fas", "fa-edit"); // Add Font Awesome edit icon classes
      editButton.appendChild(editIcon); // Append icon to the button
      editButton.appendChild(document.createTextNode(" Edit")); // Add text to the button
      editButton.classList.add("edit-btn");
      editButton.addEventListener("click", () => openEditModal(row));

      // Create the Delete button with icon
      const deleteButton = document.createElement("button");
      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fas", "fa-trash"); // Add Font Awesome trash icon classes
      deleteButton.appendChild(deleteIcon); // Append icon to the button
      deleteButton.appendChild(document.createTextNode(" Delete")); // Add text to the button
      deleteButton.classList.add("delete-btn");
      deleteButton.addEventListener("click", () => openDeleteConfirmation(row));

      // Append buttons to the action cell
      aksiTd.appendChild(editButton);
      aksiTd.appendChild(deleteButton);
      tr.appendChild(aksiTd);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    mainContent.appendChild(table);
    insertContainer.style.display = "block";
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
}

// Fungsi untuk membuka modal Edit dengan data yang sudah terisi
async function openEditModal(rowData) {
  console.log("Row data to edit:", rowData); // Debugging log to check rowData
  const modal = document.getElementById("edit-modal");
  const modalFields = document.getElementById("modal-fields-edit");
  const tableNameElement = document.getElementById("modal-table-name");

  if (!modal || !modalFields) {
    console.error("Modal or modal-fields-edit element not found.");
    return;
  }

  modal.style.display = "flex";
  tableNameElement.textContent = currentTable;

  // Clear previous modal fields content
  modalFields.innerHTML = "";

  // Check if rowData contains any keys
  if (!rowData || Object.keys(rowData).length === 0) {
    console.error("No data available for the selected row.");
    return;
  }

  // Determine the primary key column (assume it's the first column in rowData)
  const primaryKey = Object.keys(rowData)[0]; // Define primaryKey here

  for (const col in rowData) {
    if (col === primaryKey) continue; // Skip primary key column

    const label = document.createElement("label");
    label.textContent = col;
    label.setAttribute("for", col);
    modalFields.appendChild(label);

    let input;

    if (
      ["kode_matkul", "nip_dosen", "kode_ruangan"].includes(col) &&
      currentTable === "jadwal"
    ) {
      input = await createForeignKeySelect(col);
      input.value = rowData[col];
    } else if (col === "kode_ruangan" && currentTable === "keluhan") {
      input = await createForeignKeySelect(col);
      input.value = rowData[col];
    } else if (col === "status" && currentTable === "keluhan") {
      input = createEnumSelect([
        "Pending",
        "Accept",
        "Reject",
        "Selesai",
        "Dibatalkan",
      ]);
      input.id = col;
      input.value = rowData[col];
    } else if (col === "tanggal" && currentTable === "kritik") {
      input = document.createElement("input");
      input.type = "datetime-local";
      input.id = col;
      input.value = rowData[col] ? rowData[col].substring(0, 16) : ""; // Format to 'YYYY-MM-DDTHH:MM'
    } else if (col === "dibaca" && currentTable === "kritik") {
      input = createEnumSelect(["unseen", "seen"]);
      input.id = col;
      input.value = rowData[col];
    } else if (col === "hari" && currentTable === "jadwal") {
      input = createEnumSelect(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
      input.id = col;
      input.value = rowData[col];
    } else if (col === "semester" && currentTable === "jadwal") {
      input = document.createElement("input");
      input.type = "number";
      input.id = col;
      input.min = 1;
      input.max = 6;
      input.value = rowData[col];
    } else if (col === "kelas" && currentTable === "jadwal") {
      input = createEnumSelect(["A", "B", "C", "D", "E"]);
      input.id = col;
      input.value = rowData[col];
    } else if (
      ["jam_mulai", "jam_selesai"].includes(col) &&
      currentTable === "jadwal"
    ) {
      input = document.createElement("input");
      input.type = "time";
      input.step = 60;
      input.id = col;
      input.value = rowData[col].slice(0, 5);
    } else if (
      ["kursi", "meja", "ac", "pc", "proyektor"].includes(col) &&
      currentTable === "ruangan"
    ) {
      input = document.createElement("input");
      input.type = "number";
      input.id = col;
      input.value = rowData[col];
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.id = col;
      input.value = rowData[col];
    }

    modalFields.appendChild(input);
    console.log(`Added label and input for column: ${col}`);
  }

  // Set up the Save button to update the existing row
  const saveButton = document.getElementById("save-edit-button");
  saveButton.onclick = async function () {
    const updatedData = {};

    modalFields.querySelectorAll("input, select").forEach((input) => {
      updatedData[input.id] = input.value;
    });

    try {
      const { error } = await database
        .from(currentTable)
        .update(updatedData)
        .match({ [primaryKey]: rowData[primaryKey] });
      if (error) {
        console.error("Failed to update data:", error);
      } else {
        console.log("Data updated successfully");
        loadTableData(currentTable);
        modal.style.display = "none";
        showSuccessModal(); // Tampilkan modal konfirmasi setelah berhasil disimpan
      }
    } catch (err) {
      console.error("Error saving data:", err);
      showFailedModal();
    }
  };
      window.onclick = function (event) {
        const modal = document.getElementById("edit-modal");
        if (event.target === modal) {
          modal.style.display = "none";
        }
      };
}

// Event listener untuk tombol Edit
document.querySelectorAll(".edit-btn").forEach((editButton, index) => {
  editButton.addEventListener("click", () => openEditModal(data[index]));
});

// Fungsi untuk membuka modal konfirmasi hapus
function openDeleteConfirmation(row) {
  console.log("Membuka konfirmasi hapus untuk baris:", row); // Log untuk verifikasi

  // Ambil elemen modal hapus dari HTML
  const modal = document.getElementById("delete-modal");

  // Tampilkan modal konfirmasi hapus
  modal.style.display = "flex";

  // Event listener untuk tombol konfirmasi hapus
  document.getElementById("confirm-delete").onclick = async () => {
    console.log("Nama tabel:", currentTable); // Log nama tabel yang digunakan
    console.log("Primary key untuk penghapusan:", row.id_jadwal); // Log primary key yang akan dihapus
    await deleteRow(row); // Panggil deleteRow dengan row yang benar
    modal.style.display = "none"; // Sembunyikan modal setelah penghapusan
  };

  // Event listener untuk tombol batal
  document.getElementById("cancel-delete").onclick = () => {
    modal.style.display = "none"; // Tutup modal jika dibatalkan
  };
}

// Fungsi untuk menghapus baris dari Supabase
async function deleteRow(row) {
  console.log("Menghapus data dari tabel:", currentTable);
  console.log("Data baris yang akan dihapus:", row);

  // Tentukan primary key sesuai dengan tabel
  let primaryKey;
  switch (currentTable) {
    case "jadwal":
      primaryKey = "id_jadwal";
      break;
    case "keluhan":
      primaryKey = "id_keluhan";
      break;
    case "kritik":
      primaryKey = "id_kritik";
      break;
    case "matkul":
      primaryKey = "kode_matkul";
      break;
    case "dosen":
      primaryKey = "nip";
      break;
    case "ruangan":
      primaryKey = "kode_ruangan";
      break;
    case "users":
      primaryKey = "id";
      break;
    default:
      console.error("Tabel tidak diketahui:", currentTable);
      return;
  }

  try {
    const { error } = await database
      .from(currentTable) // Gunakan currentTable untuk menentukan tabel
      .delete()
      .match({ [primaryKey]: row[primaryKey] }); // Gunakan primary key yang sesuai

    if (error) {
      console.error("Gagal menghapus data:", error);
    } else {
      console.log("Data berhasil dihapus dari tabel:", currentTable);
      loadTableData(currentTable); // Muat ulang tabel setelah penghapusan
      showSuccessModal();
    }
  } catch (error) {
    console.error("Error saat menghapus data:", error);
    showFailedModal();
  }
}

// Fungsi untuk toggle dropdown
function toggleDropdown() {
  const dropdown = document.querySelector(".dropdown-content");
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
}

// Event listener untuk menu sidebar
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM sudah siap"); // Log untuk memastikan DOM sudah siap

  document.querySelectorAll(".sidebar-menu a").forEach((menuItem) => {
    menuItem.addEventListener("click", (event) => {
      event.preventDefault();
      const targetTable = event.currentTarget
        .getAttribute("data-target")
        .replace("table-", "");
      console.log("Item sidebar diklik, target tabel:", targetTable); // Log tabel target yang dipilih
      loadTableData(targetTable);
    });
  });
});

// Welcome message
document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username");

  if (username) {
    // Tampilkan pesan selamat datang
    const welcomeMessage = document.createElement("div");
    welcomeMessage.classList.add("welcome-message");
    welcomeMessage.innerHTML = `Selamat datang, ${username}! Kami sangat senang Anda bergabung dengan kami. Silakan jelajahi berbagai fitur yang tersedia di dashboard ini untuk memaksimalkan pengalaman Anda.`;

    // Tambahkan pesan ke dalam bagian konten utama
    const databaseTable = document.querySelector(".database-table");
    databaseTable.appendChild(welcomeMessage);
  }
});

async function insertRow(targetTable) {
  const modal = document.getElementById("insert-modal");
  const modalFields = document.getElementById("modal-fields-insert");
  const tableNameElement = document.getElementById("modal-table-name");

  modal.style.display = "flex";
  tableNameElement.textContent = targetTable;

  try {
    const { data, error } = await database
      .from(targetTable)
      .select("*")
      .limit(1);
    if (error) {
      console.error("Gagal mengambil kolom:", error);
      return;
    }

    modalFields.innerHTML = "";
    const columns = Object.keys(data[0] || {});

    for (let col of columns) {
      const label = document.createElement("label");
      label.textContent = col;
      label.setAttribute("for", col);
      modalFields.appendChild(label);

      let input;

      if (targetTable === "kritik") {
        if (col === "tanggal") {
          input = document.createElement("input");
          input.type = "datetime-local";
          input.id = col;
        } else if (col === "dibaca") {
          input = createEnumSelect(["unseen", "seen"]);
          input.id = col;
        } else if (col === "id_kritik") {
          input = document.createElement("input");
          input.type = "number";
          input.id = col;
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.id = col;
        }
      } else if (targetTable === "keluhan") {
        if (col === "kode_ruangan") {
          input = await createForeignKeySelect(col);
        } else if (col === "id_keluhan") {
          input = document.createElement("input");
          input.type = "number";
          input.id = col;
        } else if (col === "status") {
          input = createEnumSelect([
            "Pending",
            "Accept",
            "Reject",
            "Selesai",
            "Dibatalkan",
          ]);
          input.id = col;
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.id = col;
        }
      } else if (targetTable === "ruangan") {
        if (
          ["kode_ruangan", "kursi", "meja", "ac", "pc", "proyektor"].includes(
            col
          )
        ) {
          input = document.createElement("input");
          input.type = "number";
          input.id = col;
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.id = col;
        }
      } else if (targetTable === "users") {
        if (col === "id") {
          input = document.createElement("input");
          input.type = "number";
          input.id = col;
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.id = col;
        }
      } else if (targetTable === "jadwal") {
        if (["kode_matkul", "nip_dosen", "kode_ruangan"].includes(col)) {
          input = await createForeignKeySelect(col);
        } else if (col === "hari") {
          input = createEnumSelect([
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
          ]);
          input.id = col;
        } else if (col === "id_jadwal") {
          input = document.createElement("input");
          input.type = "number";
          input.id = col;
        } else if (col === "semester") {
          input = document.createElement("input");
          input.type = "number";
          input.id = col;
          input.min = 1;
          input.max = 6;
        } else if (col === "kelas") {
          input = createEnumSelect(["A", "B", "C", "D", "E"]);
          input.id = col;
        } else if (["jam_mulai", "jam_selesai"].includes(col)) {
          input = document.createElement("input");
          input.type = "time";
          input.step = 60;
          input.id = col;
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.id = col;
        }
      } else {
        input = document.createElement("input");
        input.type = "text";
        input.id = col;
      }

      modalFields.appendChild(input); // Pastikan input ditambahkan ke modalFields
    }

    window.onclick = function (event) {
      const modal = document.getElementById("insert-modal");
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  } catch (err) {
    console.error("Gagal memuat kolom untuk modal:", err);
  }

  document.getElementById("save-insert-button").onclick = async () => {
    const newData = {};
    modalFields.querySelectorAll("input, select").forEach((input) => {
      newData[input.id] = input.value;
    });

    try {
      const { error } = await database.from(targetTable).insert([newData]);
      if (error) {
        console.error("Gagal menyimpan data:", error);
      } else {
        console.log("Data berhasil disimpan");
        loadTableData(targetTable);
        modal.style.display = "none";
        showSuccessModal();
      }
    } catch (err) {
      console.error("Error saat menyimpan data:", err);
      showFailedModal();
    }
  };
}

// Helper function to create a select dropdown for foreign key columns with fetched data
async function createForeignKeySelect(column) {
  const select = document.createElement("select");
  select.id = column;

  let referenceTable = "";
  let displayColumn = "";
  let primaryKey = ""; // Define the primary key for each foreign key column

  // Map the column to the referenced table, primary key, and display column name
  switch (column) {
    case "kode_matkul":
      referenceTable = "matkul";
      primaryKey = "kode_matkul";
      displayColumn = "nama_matkul";
      break;
    case "nip_dosen":
      referenceTable = "dosen";
      primaryKey = "nip_dosen";
      displayColumn = "nama";
      break;
    case "kode_ruangan":
      referenceTable = "ruangan";
      primaryKey = "kode_ruangan";
      displayColumn = "nama_ruangan";
      break;
    default:
      console.error("Unknown foreign key column:", column);
      return select;
  }

  try {
    // Fetch and order data by the primary key
    const { data, error } = await database
      .from(referenceTable)
      .select(`${primaryKey}, ${displayColumn}`)
      .order(primaryKey, { ascending: true });

    if (error) {
      console.error(
        `Failed to fetch data from ${referenceTable} for column ${column}:`,
        error
      );
      return select;
    }

    // Populate the select box with options from the sorted data
    if (data && data.length > 0) {
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item[primaryKey]; // Set primary key as option value
        option.textContent = `${item[primaryKey]} - ${item[displayColumn]}`; // Display ID and name
        select.appendChild(option);
      });
    } else {
      console.warn(`No data found in ${referenceTable} for column ${column}.`);
    }
  } catch (err) {
    console.error(
      `Error populating select box for ${column} from ${referenceTable}:`,
      err
    );
  }

  return select;
}

// Helper function to create a select dropdown for enum-like fields
function createEnumSelect(options) {
  const select = document.createElement("select");
  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    select.appendChild(option);
  });
  return select;
}

// Fungsi untuk menampilkan modal konfirmasi
function showSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "block";

  // Sembunyikan modal setelah 3 detik
  setTimeout(() => {
    modal.style.display = "none";
  }, 3000);
}

function showFailedModal() {
  const modal = document.getElementById("failedModal");
  modal.style.display = "block";

  // Sembunyikan modal setelah 3 detik
  setTimeout(() => {
    modal.style.display = "none";
  }, 3000);
}

function showNotCompatibleModal() {
  const modal = document.getElementById("notCompatibleModal");
  modal.style.display = "block";

  // Sembunyikan modal setelah 3 detik
  setTimeout(() => {
    modal.style.display = "none";
  }, 3000);
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "none"; // Sembunyikan modal konfirmasi
}
function closeFailedModal() {
  const modal = document.getElementById("failedModal");
  modal.style.display = "none"; // Sembunyikan modal konfirmasi
}

function closeNotCompatibleModal() {
  const modal = document.getElementById("notCompatibleModal");
  modal.style.display = "none"; // Sembunyikan modal konfirmasi
}

// import csv
// Fungsi untuk membuka modal import CSV
// Fungsi untuk membuka modal import CSV
async function importCSV() {
  const modal = document.getElementById("csv-modal");
  const preview = document.getElementById("csv-preview");
  const fileInput = document.getElementById("csv-upload");

  // Bersihkan preview dan file input setiap kali modal dibuka ulang
  preview.innerHTML = ""; // Kosongkan preview CSV
  fileInput.value = ""; // Reset file input
  modal.style.display = "flex";

  // Dapatkan kolom contoh dari tabel saat ini
  const exampleCsv = document.getElementById("example-csv");
  exampleCsv.innerHTML = ""; // Kosongkan isi contoh CSV sebelumnya

  try {
    // Ambil kolom dari currentTable
    const { data, error } = await database
      .from(currentTable)
      .select("*")
      .limit(2);
    if (error) throw error;

    if (data && data.length > 0) {
      const headerRow = document.createElement("tr");
      Object.keys(data[0]).forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });
      exampleCsv.appendChild(headerRow);

      // Menambahkan dua baris data sebagai contoh
      data.forEach((row) => {
        const dataRow = document.createElement("tr");
        Object.values(row).forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          dataRow.appendChild(td);
        });
        exampleCsv.appendChild(dataRow);
      });
    }
  } catch (error) {
    console.error("Gagal mendapatkan struktur kolom:", error);
  }

  // Event listener untuk file input CSV
  document.getElementById("csv-upload").onchange = function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const csvData = e.target.result;
        displayCSVPreview(csvData);
      };
      reader.readAsText(file);
    }
  };

  // Pasang event listener untuk tombol import setiap kali modal dibuka
  document.getElementById("import-csv-button").onclick = async function () {
    console.log("Tombol 'Upload dan Import Data' diklik");

    // Ambil data dari tabel preview di modal
    const rows = Array.from(
      document.querySelectorAll(".csv-table-preview tbody tr")
    );
    if (rows.length === 0) {
      console.warn("Tidak ada data dalam preview CSV");
      return;
    }

    // Ambil data dari setiap baris dalam tabel preview
    const csvData = rows.map((row) => {
      const cells = Array.from(row.children);
      const rowData = {};
      const columnHeaders = Array.from(
        document.querySelectorAll("#example-csv th")
      ).map((th) => th.textContent);

      cells.forEach((cell, index) => {
        rowData[columnHeaders[index]] = cell.textContent;
      });

      return rowData;
    });

    // Log data sebelum konversi
    console.log("Data CSV sebelum konversi:", JSON.stringify(csvData, null, 2));
    console.log("Nama tabel saat ini:", currentTable);

    // Lakukan konversi tipe data menggunakan convertCSVDataTypes
    let formattedData;
    try {
      console.log("Memulai konversi tipe data...");
      formattedData = convertCSVDataTypes(csvData, currentTable);
      console.log(
        "Data setelah konversi:",
        JSON.stringify(formattedData, null, 2)
      );
    } catch (error) {
      console.error("Error saat memanggil convertCSVDataTypes:", error);
      return; // Hentikan eksekusi jika ada error saat konversi
    }

    // Coba kirim data ke Supabase
    try {
      const { error } = await database.from(currentTable).insert(formattedData);
      if (error) {
        console.error("Gagal mengimpor data:", error);
        showNotCompatibleModal(); // Tampilkan modal jika ada error
      } else {
        console.log("Data berhasil diimpor ke tabel:", currentTable);
        loadTableData(currentTable); // Muat ulang tabel dengan data baru
        document.getElementById("csv-modal").style.display = "none"; // Tutup modal CSV
        document.getElementById("csv-preview").innerHTML = ""; // Reset preview
        document.getElementById("csv-upload").value = ""; // Reset file input
        showSuccessModal(); // Tampilkan modal konfirmasi
      }
    } catch (error) {
      console.error("Error saat mengimpor data:", error);
      showNotCompatibleModal(); // Tampilkan modal jika terjadi kesalahan
    }
  };

  // Fungsi untuk menutup modal saat klik di luar area modal
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      preview.innerHTML = ""; // Kosongkan preview saat modal ditutup
      fileInput.value = ""; // Reset file input saat modal ditutup
    }
  };
}

// Fungsi untuk menampilkan preview data CSV dalam bentuk tabel
// Modifikasi fungsi displayCSVPreview untuk mengecek kompatibilitas data CSV
function displayCSVPreview(csvData) {
  const preview = document.getElementById("csv-preview");
  const notCompatibleModal = document.getElementById("notCompatibleModal");
  preview.innerHTML = ""; // Kosongkan preview sebelumnya

  const rows = csvData.split("\n").map((row) => row.split(","));
  const table = document.createElement("table");
  table.classList.add("csv-table-preview");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  rows[0].forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header.trim();
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  let hasNullValues = false; // Penanda adanya nilai null
  rows.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      const cellValue = cell.trim();
      td.textContent = cellValue;

      // Periksa nilai null atau kosong
      if (!cellValue) {
        hasNullValues = true;
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  preview.appendChild(table);

  // Cek kompatibilitas header CSV dengan contoh kolom di exampleCsv
  const exampleHeaders = Array.from(
    document.querySelectorAll("#example-csv th")
  ).map((th) => th.textContent);
  const csvHeaders = rows[0].map((header) => header.trim());

  const isHeaderCompatible =
    csvHeaders.length === exampleHeaders.length &&
    csvHeaders.every((header, index) => header === exampleHeaders[index]);

  // Tampilkan modal notCompatible jika header tidak sesuai atau ada nilai null
  if (!isHeaderCompatible || hasNullValues) {
    showNotCompatibleModal();
  } else {
    notCompatibleModal.style.display = "none";
  }
}

// Fungsi untuk mengirim data CSV ke database setelah dikonfirmasi
function convertCSVDataTypes(data, tableName) {
  console.log(`convertCSVDataTypes dipanggil untuk tabel: ${tableName}`);
  console.log(
    "Data yang diterima untuk konversi:",
    JSON.stringify(data, null, 2)
  );

  return data.map((row, rowIndex) => {
    const convertedRow = {};

    for (const [key, value] of Object.entries(row)) {
      const trimmedValue = value.trim();
      console.log(
        `Baris ${
          rowIndex + 1
        }, Kolom: ${key}, Nilai Sebelum Konversi: "${trimmedValue}", Tipe Sebelum: ${typeof trimmedValue}`
      );

      // Konversi tipe data berdasarkan tabel dan kolom
      switch (tableName) {
        case "dosen":
          convertedRow[key] = trimmedValue; // Kolom di tabel dosen dianggap sebagai string (varchar)
          break;

        case "jadwal":
          if (
            key === "id_jadwal" ||
            key === "kode_ruangan" ||
            key === "semester"
          ) {
            convertedRow[key] = parseInt(trimmedValue, 10); // Konversi kolom integer
          } else if (key === "jam_mulai" || key === "jam_selesai") {
            convertedRow[key] = trimmedValue; // Biarkan time tetap dalam format "HH:MM:SS"
          } else {
            convertedRow[key] = trimmedValue; // Kolom string
          }
          break;

        case "keluhan":
          if (key === "id_keluhan" || key === "kode_ruangan") {
            convertedRow[key] = parseInt(trimmedValue, 10); // Konversi kolom integer
          } else {
            convertedRow[key] = trimmedValue; // Kolom string atau enum
          }
          break;

        case "kritik":
          if (key === "id_kritik") {
            convertedRow[key] = parseInt(trimmedValue, 10); // Konversi kolom integer
          } else if (key === "tanggal") {
            convertedRow[key] = new Date(trimmedValue).toISOString(); // Konversi ke ISO untuk kolom timestamp
          } else {
            convertedRow[key] = trimmedValue; // Kolom string atau enum
          }
          break;

        case "matkul":
          convertedRow[key] = trimmedValue; // Kolom di tabel matkul dianggap sebagai string (varchar)
          break;

        case "ruangan":
          if (
            ["kode_ruangan", "kursi", "meja", "ac", "pc", "proyektor"].includes(
              key
            )
          ) {
            convertedRow[key] = parseInt(trimmedValue, 10); // Konversi kolom integer
          } else {
            convertedRow[key] = trimmedValue; // Kolom string
          }
          break;

        case "users":
          if (key === "id") {
            convertedRow[key] = parseInt(trimmedValue, 10); // Konversi kolom integer
          } else {
            convertedRow[key] = trimmedValue; // Kolom string
          }
          break;

        default:
          convertedRow[key] = trimmedValue; // Jika tabel tidak dikenali, simpan nilai apa adanya
          break;
      }

      console.log(
        `Baris ${rowIndex + 1}, Kolom: ${key}, Nilai Setelah Konversi: ${
          convertedRow[key]
        }, Tipe Setelah: ${typeof convertedRow[key]}`
      );
    }

    return convertedRow;
  });
}

// Menutup modal dan mengosongkan preview saat tombol "x" diklik
document.querySelector(".close").onclick = function () {
  document.getElementById("csv-modal").style.display = "none";
  document.getElementById("csv-preview").innerHTML = ""; // Kosongkan preview
  document.getElementById("csv-upload").value = ""; // Reset file input
  document.getElementById("insert-modal").style.display = "none";
  document.getElementById("edit-modal").style.display = "none";
};
