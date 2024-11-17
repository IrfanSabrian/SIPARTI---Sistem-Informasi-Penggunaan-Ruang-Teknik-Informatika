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
        changeBackground(); // If less than 2 times, keep the same background
      } else {
        // If displayed twice, reset the count and move to the next background
        displayCount = 0;
        currentBackground = (currentBackground + 1) % backgrounds.length;

        // Add a slight delay for smoother transitions when looping back to the first background
        setTimeout(changeBackground, 100); // Wait 100ms to allow transition reset
      }
    }, 3000); // Wait for 3 seconds between each transition
  };

  // Optional error handling for image loading
  img.onerror = function () {
    console.error("Error loading image:", img.src);

    // Proceed to the next background after an error
    displayCount = 0;
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
