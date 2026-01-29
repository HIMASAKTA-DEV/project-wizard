# 🧙‍♂️ ProjectWizard

> **Ubah Visi Menjadi Blueprint Teknis Secara Instan.**

ProjectWizard adalah platform berbasis AI yang dirancang untuk membantu Project Manager dan Developer dalam melakukan breakdown kebutuhan software. Dari ide kasar hingga menjadi dokumen spesifikasi teknis (PDF) yang siap eksekusi.

![ProjectWizard Preview](https://via.placeholder.com/1280x720/000000/FFFFFF?text=ProjectWizard+Web+Preview)

---

## ✨ Fitur Utama
- **AI-Powered Interview**: Wawancara mendalam yang adaptif untuk menangkap detail fungsionalitas.
- **Detailed Technical Breakdown**: Menganalisis kebutuhan akun (admin vs public), arsitektur halaman, dan fitur konten.
- **Instant PDF Blueprint**: Dokumen spesifikasi teknis yang dapat diunduh langsung.
- **Discord Integration**: Notifikasi real-time dan pengiriman laporan otomatis ke server Discord.
- **Local History**: Menyimpan riwayat proyek Anda secara lokal di browser.

---

## 🛠️ Tech Stack
- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with Persistence Middleware
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Engine**: [OpenAI GPT-4o-mini](https://openai.com/) via AI.CC
- **Documentation**: [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html)

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone Repository**
   ```powershell
   git clone https://github.com/HIMASAKTA-DEV/ProjectWizard.git
   cd ProjectWizard
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env.local` di root directory:
   ```env
   AICC_API_KEY=your_aicc_token_here
   ```

4. **Jalankan Aplikasi**
   ```powershell
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000)

---

## 👥 Anggota Kelompok (HIMASAKTA DEV)

| Nama | Peran | GitHub |
| :--- | :--- | :--- |
| **Brahma** | Project Manager | [@Fastering18](https://github.com/Fastering18) |
| **Lula** | UI/UX Designer | [@fuhuavl](https://github.com/fuhuavl) |
| **Lillip** | Frontend Dev | [@cholipahnoerr](https://github.com/cholipahnoerr) |
| **Bagus** | Frontend Dev | [@proogramer-u](https://github.com/proogramer-u) |
| **Fakhrul** | Frontend Dev | [@ahmadfakhrulbawani2-arch](https://github.com/ahmadfakhrulbawani2-arch) |
| **Kyla** | Backend Dev | [@kylarhm03](https://github.com/kylarhm03) |
| **Diza** | UI/UX Designer | [@aisyahdiza](https://github.com/aisyahdiza) |
| **Anang** | Backend Dev | [@ArdhiCode](https://github.com/ArdhiCode) |

---

## 📜 Lisensi & Catatan
Laporan PDF yang dihasilkan **tidak disimpan di server** kami untuk menjamin keamanan data pengguna. Harap segera mengunduh laporan setelah inisiasi selesai.

Dibuat dengan ❤️ oleh **HIMASAKTA DEV** © 2026.
