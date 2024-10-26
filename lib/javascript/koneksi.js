// Konfigurasi Supabase
const supabaseUrl = "https://pphvxsqevkxfomflvgjs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwaHZ4c3Fldmt4Zm9tZmx2Z2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4Nzk5MTEsImV4cCI6MjA0MzQ1NTkxMX0.pbKWvOVa2tF-fFM-GDidsjA1Yr21-XbP7WW6otQKP1w";

  
  // Fungsi untuk memulai koneksi
  async function initializeSupabase() {
    database = supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Database initialized:", database);
    if (!database) {
      throw new Error("Gagal menginisialisasi database");
    }
  }
  
  // Buat variabel untuk klien Supabase
  let database;