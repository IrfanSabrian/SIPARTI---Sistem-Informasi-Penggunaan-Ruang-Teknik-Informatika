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
      toggleButton.style.left = "350px"; // Atur posisi toggle di kanan
      toggleButton.innerHTML =
        '<span class="material-symbols-outlined">chevron_left</span>'; // Ganti ikon
    }
    sidebarVisible = !sidebarVisible; // Toggle status
  });
});
