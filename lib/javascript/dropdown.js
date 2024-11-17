initializeSupabase();

async function updateComplaintStatus(id_keluhan, status) {
  try {
    const { data, error } = await database
      .from("keluhan")
      .update({ status: status })
      .eq("id_keluhan", id_keluhan);

    if (error) {
      console.error("Error updating complaint status:", error.message);
    } else {
      console.log("Complaint status updated:", data);

      // Refresh complaints to reflect the updated status
      loadComplaints();

      // Close the modal after updating status
      closeModalDetailKeluhan();

      // Refresh modal-notifikasi content after status update
      const notifModal = document.getElementById("modal-notifikasi");
      if (notifModal && notifModal.style.display === "flex") {
        loadComplaints(); // Refresh complaints in modal-notifikasi
      }
    }
  } catch (err) {
    console.error("An error occurred:", err);
  }
}


function openComplaintDetails(complaint) {
  const detailModal = document.createElement("div");
  detailModal.className = "modal-detail-keluhan";
  detailModal.innerHTML = `
        <div class="modal-content-detail">
          <span class="close-btn" onclick="document.body.removeChild(this.parentNode.parentNode)">&times;</span>
          <h3 style="text-align: center;">Keluhan</h3>
          <div class="complaint-detail-columns">
            <div class="complaint-detail-left" style="text-align: left;">
              <strong>Pelapor:</strong><br>${complaint.pelapor}<br><br>
              <strong>Ruangan:</strong><br>TI-${complaint.kode_ruangan}<br><br>
              <strong>Status:</strong><br>${complaint.status}<br><br>
              <strong>Isi Keluhan:</strong><br>${complaint.isi_keluhan}<br>
            </div>
            <div class="complaint-detail-right">
              <img src="https://xnpisnfwnlwvovyfpfhs.supabase.co/storage/v1/object/public/images/keluhan/keluhan-${
                complaint.id_keluhan
              }.jpg" alt="Gambar Keluhan">
            </div>
          </div>
          <div class="modal-actions">
            ${renderStatusButtons(complaint)}
          </div>
        </div>
      `;
  loadComplaints();
  document.body.appendChild(detailModal);
}

function closeModalDetailKeluhan() {
  const modalContentDetails = document.querySelectorAll(
    ".modal-detail-keluhan"
  );
  modalContentDetails.forEach((modalContentDetail) => {
    if (modalContentDetail) {
      modalContentDetail.style.display = "none";
    }
  });
}

function renderStatusButtons(complaint) {
  if (complaint.status === "Pending") {
    return `
      <button class="btn-confirm" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Accept')">Accept</button>
      <button class="btn-cancel" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Reject')">Reject</button>
    `;
  } else if (complaint.status === "Accept") {
    return `
      <button class="btn-confirm" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Selesai')">Selesai</button>
      <button class="btn-cancel" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Dibatalkan')">Batal</button>
    `;
  }
  return "";
}

// Function to reload complaints list
async function loadComplaints() {
  const { data: complaints, error } = await database
    .from("keluhan")
    .select("*")
    .order("id_keluhan", { ascending: false });

  const complaintsContainer = document.getElementById("complaints-container");
  complaintsContainer.innerHTML = `
    <div class="complaint-row-header">
      <div class="complaint-column-header">Ruangan</div>
      <div class="complaint-column-header">Pelapor</div>
      <div class="complaint-column-header">Status</div>
    </div>
  `;

  if (error) {
    complaintsContainer.innerHTML += `<p>Error loading complaints: ${error.message}</p>`;
    return;
  }

  complaints.forEach((complaint) => {
    const complaintRow = document.createElement("div");
    complaintRow.className = "complaint-row";
    if (["Reject", "Selesai", "Dibatalkan"].includes(complaint.status)) {
      complaintRow.style.backgroundColor = "#ddd";
    }
    complaintRow.innerHTML = `
      <div class="complaint-room complaint-column">Ruangan TI-${complaint.kode_ruangan}</div>
      <div class="complaint-reporter complaint-column">${complaint.pelapor}</div>
      <div class="complaint-status complaint-column">${complaint.status}</div>
    `;
    if (["Reject", "Selesai", "Dibatalkan"].includes(complaint.status)) {
      complaintRow.style.backgroundColor = "#ddd";
    }
    complaintRow
      .querySelectorAll(".complaint-column")
      .forEach((column) =>
        column.addEventListener("click", () => openComplaintDetails(complaint))
      );

    complaintsContainer.appendChild(complaintRow);
  });
}
// Event listener for "Accept," "Reject," "Selesai," and "Dibatalkan" buttons
document.querySelectorAll(".status-button").forEach((button) => {
  button.addEventListener("click", () => {
    const idKeluhan = button.getAttribute("data-id-keluhan");
    const status = button.getAttribute("data-status");
    updateComplaintStatus(idKeluhan, status);
  });
});

document.addEventListener("DOMContentLoaded", async function () {
  const username = localStorage.getItem("username");
  const loginLink = document.getElementById("login-link");

  if (username) {
    loginLink.innerHTML = `<i class="fas fa-user"></i> ${username}`;

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown-navbar";
    loginLink.parentNode.insertBefore(dropdown, loginLink.nextSibling);

    const dropdownContent = document.createElement("div");
    dropdownContent.className = "dropdown-content-navbar";

    // Tambahkan red dot untuk login link
    const loginRedDot = document.createElement("span");
    loginRedDot.className = "red-dot";
    loginRedDot.style.display = "none";
    loginLink.querySelector(".fas.fa-user").appendChild(loginRedDot);

    const notifBtn = document.createElement("a");
    notifBtn.id = "notif-btn";
    notifBtn.innerHTML = `<i class="fas fa-bell"></i> Notifikasi`;

    const notifRedDot = document.createElement("span");
    notifRedDot.className = "red-dot";
    notifRedDot.style.display = "none";
    notifBtn.querySelector(".fas.fa-bell").appendChild(notifRedDot);

    async function checkNotifications() {
      const { data: complaints } = await database
        .from("keluhan")
        .select("status")
        .eq("status", "Pending");

      const { data: kritik } = await database
        .from("kritik")
        .select("dibaca")
        .eq("dibaca", "unseen");

      const btnKeluhan = document.getElementById("btn-keluhan");
      const btnKritikSaran = document.getElementById("btn-kritik-saran");

      if (btnKeluhan) {
        const keluhanRedDot =
          btnKeluhan.querySelector(".red-dot") ||
          document.createElement("span");
        keluhanRedDot.className = "red-dot";
        if (!btnKeluhan.querySelector(".red-dot")) {
          btnKeluhan.appendChild(keluhanRedDot);
        }
        keluhanRedDot.style.display =
          complaints && complaints.length > 0 ? "block" : "none";
      }

      if (btnKritikSaran) {
        const kritikRedDot =
          btnKritikSaran.querySelector(".red-dot") ||
          document.createElement("span");
        kritikRedDot.className = "red-dot";
        if (!btnKritikSaran.querySelector(".red-dot")) {
          btnKritikSaran.appendChild(kritikRedDot);
        }
        kritikRedDot.style.display =
          kritik && kritik.length > 0 ? "block" : "none";
      }

      const hasNotifications =
        (complaints && complaints.length > 0) || (kritik && kritik.length > 0);
      notifRedDot.style.display = hasNotifications ? "block" : "none";
      loginRedDot.style.display = hasNotifications ? "block" : "none";
    }

    setInterval(checkNotifications, 3000);
    checkNotifications();

    notifBtn.addEventListener("click", function () {
      document.getElementById("modal-notifikasi").style.display = "flex";
      document.getElementById("complaints-container").style.display = "block";
      document.getElementById("kritik-container").style.display = "none";
      document.getElementById("btn-keluhan").classList.add("active");
      document.getElementById("btn-kritik-saran").classList.remove("active");
      dropdownContent.classList.remove("show");
      notifRedDot.style.display = "none";
      loginRedDot.style.display = "none";
      loadComplaints();
    });

    dropdownContent.appendChild(notifBtn);

    const dbBtn = document.createElement("a");
    dbBtn.id = "db-btn";
    dbBtn.innerHTML = `<i class="fas fa-database"></i> Database`;
    dbBtn.addEventListener("click", function () {
      window.location.href = "dashboard.html";
    });
    dropdownContent.appendChild(dbBtn);

    const logoutBtn = document.createElement("a");
    logoutBtn.id = "logout-btn";
    logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("logout-modal").style.display = "flex";
      dropdownContent.classList.remove("show");
    });
    dropdownContent.appendChild(logoutBtn);

    dropdown.appendChild(dropdownContent);

    loginLink.addEventListener("click", function (event) {
      event.preventDefault();
      dropdownContent.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target) && event.target !== loginLink) {
        dropdownContent.classList.remove("show");
      }
    });

    const notifModal = document.createElement("div");
    notifModal.id = "modal-notifikasi";
    notifModal.className = "modal-notifikasi";
    notifModal.innerHTML = `
      <div class="modal-content-notif">
        <div class="modal-header">
          <h3>Notifikasi</h3>
          <button id="btn-keluhan" class="active">Keluhan</button>
          <button id="btn-kritik-saran">Kritik & Saran</button> <br>
        </div>
        <div id="content-container">
          <div id="complaints-container"></div>
          <div id="kritik-container" style="display:none;"></div>
        </div>
      </div>`;
    document.body.appendChild(notifModal);

    document
      .getElementById("btn-keluhan")
      .addEventListener("click", function () {
        document.getElementById("complaints-container").style.display = "block";
        document.getElementById("kritik-container").style.display = "none";
        this.classList.add("active");
        document.getElementById("btn-kritik-saran").classList.remove("active");
        loadComplaints();
      });

    document
      .getElementById("btn-kritik-saran")
      .addEventListener("click", function () {
        document.getElementById("complaints-container").style.display = "none";
        document.getElementById("kritik-container").style.display = "block";
        this.classList.add("active");
        document.getElementById("btn-keluhan").classList.remove("active");
        loadKritikSaran();
      });

    const logoutModal = document.createElement("div");
    logoutModal.id = "logout-modal";
    logoutModal.className = "modal-dialog";
    logoutModal.innerHTML = `
      <div class="modal-popup">
        <p>Apakah Anda yakin ingin logout?</p>
        <div class="modal-actions">
          <button id="confirm-logout" class="btn-confirm">Logout</button>
          <button id="cancel-logout" class="btn-cancel">Batal</button>
        </div>
      </div>`;
    document.body.appendChild(logoutModal);

    const confirmLogout = document.getElementById("confirm-logout");
    const cancelLogout = document.getElementById("cancel-logout");

    confirmLogout.addEventListener("click", function () {
      localStorage.removeItem("username");
      window.location.href = "index.html";
    });

    cancelLogout.addEventListener("click", function () {
      logoutModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target === logoutModal || event.target === notifModal) {
        event.target.style.display = "none";
      }
    });

    // Define loadComplaints globally
    async function loadComplaints() {
      const { data: complaints, error } = await database
        .from("keluhan")
        .select("*")
        .order("id_keluhan", { ascending: false });

      const complaintsContainer = document.getElementById(
        "complaints-container"
      );
      complaintsContainer.innerHTML = `
    <div class="complaint-row-header">
      <div class="complaint-column-header">Ruangan</div>
      <div class="complaint-column-header">Pelapor</div>
      <div class="complaint-column-header">Status</div>
    </div>
  `;

      if (error) {
        complaintsContainer.innerHTML += `<p>Error loading complaints: ${error.message}</p>`;
        return;
      }

      complaints.forEach((complaint) => {
        const complaintRow = document.createElement("div");
        complaintRow.className = "complaint-row";
        if (["Reject", "Selesai", "Dibatalkan"].includes(complaint.status)) {
          complaintRow.style.backgroundColor = "#ddd";
        }
        complaintRow.innerHTML = `
      <div class="complaint-room complaint-column">Ruangan TI-${complaint.kode_ruangan}</div>
      <div class="complaint-reporter complaint-column">${complaint.pelapor}</div>
      <div class="complaint-status complaint-column">${complaint.status}</div>
    `;
        if (["Reject", "Selesai", "Dibatalkan"].includes(complaint.status)) {
          complaintRow.style.backgroundColor = "#ddd";
        }
        complaintRow
          .querySelectorAll(".complaint-column")
          .forEach((column) =>
            column.addEventListener("click", () =>
              openComplaintDetails(complaint)
            )
          );

        complaintsContainer.appendChild(complaintRow);
      });

      checkNotifications(); // Update notifications after loading complaints
    }

    async function loadKritikSaran() {
      const { data: kritikSaran, error } = await database
        .from("kritik")
        .select("*")
        .order("id_kritik", { ascending: false });

      const kritikContainer = document.getElementById("kritik-container");
      kritikContainer.innerHTML = `
    <div class="kritik-row-header">
      <div class="kritik-column-header">Nama</div>
      <div class="kritik-column-header">Tanggal</div>
      <div class="kritik-column-header">Isi</div>
    </div>
  `;

      if (error) {
        kritikContainer.innerHTML += `<p>Error loading kritik & saran: ${error.message}</p>`;
        return;
      }

      kritikSaran.forEach((kritik) => {
        const kritikRow = document.createElement("div");
        kritikRow.className = "kritik-row";
        // Tambahkan background color berdasarkan status dibaca
        if (kritik.dibaca === "seen") {
          kritikRow.style.backgroundColor = "#ddd";
        }
        kritikRow.innerHTML = `
      <div class="kritik-nama kritik-column">${kritik.nama}</div>
      <div class="kritik-tanggal kritik-column">${new Date(
        kritik.tanggal
      ).toLocaleString()}</div>
      <div class="kritik-isi kritik-column">${truncateText(
        kritik.isi,
        25
      )}</div>
    `;

        kritikRow
          .querySelectorAll(".kritik-column")
          .forEach((column) =>
            column.addEventListener("click", () => openKritikDetails(kritik))
          );

        kritikContainer.appendChild(kritikRow);
      });

      // Cek apakah ada kritik yang belum dibaca (unseen)
      const hasUnread = kritikSaran.some(
        (kritik) => kritik.dibaca === "unseen"
      );
      const kritikRedDot = document.querySelector("#btn-kritik-saran .red-dot");
      if (kritikRedDot) {
        kritikRedDot.style.display = hasUnread ? "block" : "none";
      }

      checkNotifications();
    }
    function openComplaintDetails(complaint) {
      const detailModal = document.createElement("div");
      detailModal.className = "modal-detail-keluhan";
      detailModal.innerHTML = `
        <div class="modal-content-detail">
          <span class="close-btn" onclick="document.body.removeChild(this.parentNode.parentNode)">&times;</span>
          <h3 style="text-align: center;">Keluhan</h3>
          <div class="complaint-detail-columns">
            <div class="complaint-detail-left" style="text-align: left;">
              <strong>Pelapor:</strong><br>${complaint.pelapor}<br><br>
              <strong>Ruangan:</strong><br>TI-${complaint.kode_ruangan}<br><br>
              <strong>Status:</strong><br>${complaint.status}<br><br>
              <strong>Isi Keluhan:</strong><br>${complaint.isi_keluhan}<br>
            </div>
            <div class="complaint-detail-right">
              <img src="https://xnpisnfwnlwvovyfpfhs.supabase.co/storage/v1/object/public/images/keluhan/keluhan-${
                complaint.id_keluhan
              }.jpg" alt="Gambar Keluhan">
            </div>
          </div>
          <div class="modal-actions">
            ${renderStatusButtons(complaint)}
          </div>
        </div>
      `;
      loadComplaints();
      document.body.appendChild(detailModal);
    }

    async function openKritikDetails(kritik) {
      // Update status dibaca menjadi "seen"
      const { error } = await database
        .from("kritik")
        .update({ dibaca: "seen" })
        .eq("id_kritik", kritik.id_kritik);

      if (!error) {
        // Refresh tampilan setelah mengupdate status
        loadKritikSaran();
      }

      const detailModal = document.createElement("div");
      detailModal.className = "modal-detail-kritik";
      detailModal.innerHTML = `
    <div class="modal-content-detail">
      <span class="close-btn" onclick="document.body.removeChild(this.parentNode.parentNode)">&times;</span>
      <h3 style="text-align: center;">Kritik & Saran</h3>
      <div class="kritik-detail-columns">
        <div class="kritik-detail-left" style="text-align: left;">
          <strong>Nama:</strong><br>${kritik.nama}<br><br>
          <strong>Tanggal:</strong><br>${new Date(
            kritik.tanggal
          ).toLocaleString()}<br>
        </div>
        <div class="kritik-detail-right">
          <strong>Isi:</strong><br>${kritik.isi}<br>
        </div>
      </div>
    </div>
  `;
      document.body.appendChild(detailModal);
    }
    function truncateText(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    }

    function renderStatusButtons(complaint) {
      if (complaint.status === "Pending") {
        return `
      <button class="btn-confirm" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Accept')">Accept</button>
      <button class="btn-cancel" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Reject')">Reject</button>
    `;
      } else if (complaint.status === "Accept") {
        return `
      <button class="btn-confirm" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Selesai')">Selesai</button>
      <button class="btn-cancel" onclick="updateComplaintStatus(${complaint.id_keluhan}, 'Dibatalkan')">Batal</button>
    `;
      }
      return "";
    }
  }
});
