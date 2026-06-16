# 📚 Skenario & Materi Presentasi Lengkap: Digital Library Management System

Dokumen ini adalah naskah presentasi dan rangkuman komprehensif yang dirancang khusus untuk memenuhi ekspektasi penilaian dosen/penguji pada mata kuliah **EAI (Enterprise Application Integration)** atau Pemrograman Web Lanjut.

---

## 1. Pendahuluan & Latar Belakang

**Tantangan Perpustakaan Tradisional:**
Perpustakaan manual sering mengalami kesulitan dalam melacak ketersediaan buku (stok), mencatat riwayat peminjaman yang akurat, serta menangani keterlambatan pengembalian buku (overdue). Sering terjadi ketidaksesuaian antara data buku yang ada di rak dengan data di buku catatan pengelola.

**Solusi yang Ditawarkan:**
Aplikasi **Digital Library Management System** ini hadir untuk mendigitalisasi proses tersebut secara *end-to-end*. Aplikasi ini tidak hanya mencatat peminjaman, tetapi mengotomatisasi perhitungan stok, memberikan peringatan keterlambatan secara otomatis, dan menerapkan sistem **Approval (Persetujuan)** yang realistis untuk setiap pengembalian buku.

---

## 2. Relevansi dengan Konsep EAI (Enterprise Application Integration)
*(Poin ini sangat penting jika presentasi ini ditujukan untuk mata kuliah EAI)*

Dalam arsitektur *Enterprise*, antarmuka (UI), logika bisnis (Server), dan penyimpanan data (Database) seringkali merupakan entitas yang terpisah. Sistem ini mempraktikkan konsep integrasi yang modern:

- **GraphQL sebagai Middleware Integrasi:** 
  Alih-alih menggunakan REST API tradisional yang sering mengirimkan data berlebih (*Over-fetching*) atau data kurang (*Under-fetching*), sistem ini menggunakan **GraphQL**. GraphQL bertindak sebagai *Smart Hub* atau perantara. Frontend hanya meminta data yang benar-benar dibutuhkan secara spesifik dalam 1 kali pemanggilan (*single request*), dan GraphQL akan mengambilkannya dari database PostgreSQL. Ini sangat efisien dan cepat.
- **Dockerisasi (Containerization):**
  Untuk memastikan sistem terintegrasi dengan mulus di lingkungan apapun (baik di komputer *developer* maupun di *cloud server*), seluruh sistem (*Node.js* dan *PostgreSQL*) dibungkus di dalam **Docker**. Ini menjamin konsistensi infrastruktur ("Bisa jalan di laptop saya, pasti bisa jalan di server").

---

## 3. Detail Arsitektur & Tech Stack

Sistem ini dibangun dengan arsitektur **Modern Full-Stack**:

1. **Frontend Layer (Antarmuka Pengguna):**
   - Menggunakan Vanilla HTML5, CSS3, dan JavaScript.
   - *Keunggulan:* Performa maksimal, ukuran file kecil, memuat dengan sangat cepat di browser tanpa overhead dari *framework* yang berat. Antarmuka dibuat responsif dan modern dengan efek transisi interaktif.
2. **Backend & Integration Layer (API):**
   - **Node.js & Express:** Menjalankan *environment* server di latar belakang.
   - **Apollo Server:** Engine GraphQL yang menerjemahkan *Queries* dan *Mutations* dari Frontend.
3. **Data Layer (Database):**
   - **PostgreSQL:** Digunakan sebagai Relational Database Management System (RDBMS) utama karena kemampuannya menangani relasi data yang kompleks secara andal.
   - **Sequelize (ORM):** Bertindak sebagai *Object-Relational Mapper*, mengubah perintah JavaScript menjadi *Query* SQL secara otomatis.
4. **File Management Layer:**
   - Menggunakan library **Multer** untuk menerima upload gambar (cover buku) dari klien, dan menyimpannya di file sistem lokal (`/uploads`) yang kemudian disajikan sebagai URL statis.

---

## 4. Alur Kerja & Fitur Unggulan (Bahan Live Demo)

Aplikasi ini memisahkan hak akses menjadi dua peran: **User (Peminjam)** dan **Admin (Pengelola)**.

### A. Fitur Peminjam (User Portal)
- **Katalog Real-Time:** User dapat melihat daftar buku. Sistem akan mengecek **Stok Ketersediaan** (misal: 3/5 artinya tersedia 3 kopi dari total 5 buku). Jika stok 0, tombol pinjam akan mati (Disabled).
- **Alur Peminjaman (Borrow Workflow):**
  Saat User meminjam buku, sistem di *backend* secara otomatis:
  1. Membuat rekam jejak (Loan Record).
  2. Menentukan **Batas Waktu (Due Date)** tepat 7 hari dari tanggal pinjam.
  3. Mengurangi angka ketersediaan stok buku terkait.
- **Peringatan Keterlambatan Terotomatisasi:** Jika hari ini melewati batas *Due Date* dan buku belum dikembalikan, sistem otomatis memberikan label **🚨 OVERDUE**.

### B. Fitur Pengelola (Admin Dashboard)
- **Manajemen Inventaris:** Admin dapat menambah buku beserta foto sampulnya, serta mengatur jumlah Total Kopi (Stok Awal) untuk tiap buku.
- **Sistem Approval Pengembalian (Return Workflow):**
  Ini adalah fitur paling realistis dari sistem ini. Buku tidak langsung dikembalikan saat User menekan tombol.
  - **Tahap 1:** User menekan "Request Return". Status di database berubah dari `BORROWED` menjadi `RETURN_REQUESTED`.
  - **Tahap 2:** Admin melihat permintaan tersebut di *Dashboard* mereka.
  - **Tahap 3:** Admin memvalidasi fisik buku. Jika buku dalam kondisi baik, Admin menekan **✅ ACC**. Status berubah menjadi `RETURNED`, tanggal kembali dicatat, dan stok buku bertambah secara otomatis di katalog. Jika buku bermasalah, Admin dapat menekan **❌ Tolak** (Reject), dan status pinjaman dikembalikan menjadi `BORROWED`.

---

## 5. Desain Database (Skema Relasional)

Sistem ini sangat menjaga integritas data melalui 3 tabel yang saling berelasi:

1. **Tabel `Users` (Pengguna)**
   - `id` (Primary Key)
   - `name`, `email` (Unique), `password` (Hashed dengan Bcrypt).
   - `role` (Admin atau User).
2. **Tabel `Books` (Buku)**
   - `id` (Primary Key)
   - `title`, `author`, `isbn` (Unique).
   - `stock` (Total jumlah buku fisik yang dimiliki).
   - `coverUrl` (Lokasi penyimpanan gambar).
3. **Tabel `Loans` (Transaksi Pinjaman)**
   - `id` (Primary Key).
   - `userId` (Foreign Key mengarah ke Users).
   - `bookId` (Foreign Key mengarah ke Books).
   - `loanDate` (Tanggal dipinjam).
   - `dueDate` (Batas waktu / +7 hari dari loanDate).
   - `returnDate` (Tanggal dikembalikan, Nullable).
   - `status` (Nilai: `BORROWED`, `RETURN_REQUESTED`, `RETURNED`).

---

## 6. Penutup (Kesimpulan)
> "Dengan memadukan *GraphQL* sebagai jembatan pertukaran data yang dinamis, *PostgreSQL* untuk keamanan basis data yang ketat, dan konsep *Approval Workflow* pada sistem peminjaman, proyek ini telah membuktikan bahwa integrasi aplikasi skala perusahaan (EAI) dapat dibangun secara efisien, aman, dan berorientasi penuh pada *User Experience* yang modern."

---

### 📝 Tips Urutan *Live Demo* Saat Presentasi:
1. **Layar 1 (Kiri): Buka halaman `index.html` (Admin Dashboard).** Tunjukkan daftar buku, coba tambahkan 1 buku baru beserta stok dan gambarnya.
2. **Layar 2 (Kanan): Buka halaman `user.html` (User Portal).** Lakukan registrasi akun baru atau login.
3. **Eksekusi Pinjam:** Di layar User, pinjam buku yang baru saja ditambahkan. Tunjukkan bahwa stok buku di katalog langsung berkurang seketika.
4. **Eksekusi Pengembalian (Approval):**
   - Di layar User, minta izin pengembalian (*Request Return*).
   - Beralih ke layar Admin, buka tab *Loans*. Tunjukkan bahwa ada notifikasi persetujuan yang menunggu.
   - Lakukan **ACC** di layar Admin, lalu beralih kembali ke layar User untuk menunjukkan bahwa buku tersebut sudah sukses dikembalikan dan stoknya bertambah lagi.
