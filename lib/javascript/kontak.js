initializeSupabase();

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

// Function to add data to the 'kritik' table
async function addKritik() {
  try {
    // Get values from input fields
    const nameInput = document.getElementById("name").value;
    const messageInput = document.getElementById("message").value;
    const currentDate = new Date()
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    // Retrieve the last id_kritik from the 'kritik' table to increment it
    const { data: lastEntry, error: getLastError } = await database
      .from("kritik")
      .select("id_kritik")
      .order("id_kritik", { ascending: false })
      .limit(1);

    if (getLastError) throw getLastError;

    // Calculate new id_kritik
    const newId = lastEntry.length > 0 ? lastEntry[0].id_kritik + 1 : 1;

    // Insert new record into 'kritik' table
    const { error: insertError } = await database.from("kritik").insert([
      {
        id_kritik: newId,
        nama: nameInput,
        isi: messageInput,
        tanggal: currentDate,
      },
    ]);

    if (insertError) throw insertError;

    // Clear input fields after successful submission
    document.getElementById("name").value = "";
    document.getElementById("message").value = "";

    showSuccessModal();
  } catch (error) {
    console.error("Error inserting data:", error);
    showFailedModal();
  }
}

// Add event listener to the submit button
document.querySelector(".submit-btn").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent form from submitting normally
  addKritik(); // Call function to add data to 'kritik' table
});
