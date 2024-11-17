// Konfigurasi Supabase
const supabaseUrl = "https://xnpisnfwnlwvovyfpfhs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucGlzbmZ3bmx3dm92eWZwZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzODQ3MzYsImV4cCI6MjA0NTk2MDczNn0.Qqq9nfMF4fDH_f-gDkBxk6-HjQPItW-3Q0MSrjmBC7k";

  
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