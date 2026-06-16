# 🎓 Prediksi Pertanyaan Dosen / Penguji & Jawaban (Q&A)

Berikut adalah daftar pertanyaan menjebak/kritis yang sangat sering ditanyakan oleh dosen penguji pada mata kuliah EAI atau Pemrograman Web Lanjut, beserta cara menjawabnya secara profesional dan meyakinkan.

---

### 1. Pertanyaan: "Mengapa Anda memilih menggunakan GraphQL daripada REST API tradisional?"
**Cara Menjawab:**
"Dalam konteks Integrasi Aplikasi (EAI), kita sering berhadapan dengan masalah *Over-fetching* (mengambil data berlebih yang tidak dipakai) atau *Under-fetching* (harus memanggil API berkali-kali). Dengan GraphQL, Frontend bertindak lebih mandiri. Frontend hanya perlu melakukan 1 kali pemanggilan ke 1 *endpoint* (yaitu `/graphql`) dan secara spesifik meminta data apa saja yang dibutuhkan (misalnya, hanya minta 'Judul' dan 'Status', tanpa menarik seluruh data 'Deskripsi' atau 'Gambar'). Ini membuat transfer data antar-sistem jauh lebih efisien, cepat, dan hemat *bandwidth*."

---

### 2. Pertanyaan: "Kenapa Anda tidak memakai *framework* Frontend seperti React.js atau Vue.js, dan malah memakai HTML/JS murni (Vanilla)?"
**Cara Menjawab:**
"Tujuan utama pengembangan antarmuka (Frontend) ini adalah untuk membuktikan pemahaman fundamental mengenai manipulasi DOM (Document Object Model) dan pengiriman HTTP Request (via `fetch`) murni tanpa campur tangan "sihir" dari *framework*. Selain itu, Vanilla JavaScript membuat aplikasi ini sangat ringan (tanpa perlu proses *build/compile*) namun tetap bisa menghasilkan antarmuka (UI) yang dinamis, reaktif, dan terintegrasi dengan mulus ke GraphQL."

---

### 3. Pertanyaan: "Coba jelaskan bagaimana sistem menghitung buku yang telat (Overdue)? Apakah menggunakan penjadwalan (*Cron Job/Background Task*)?"
**Cara Menjawab:**
"Tidak, Pak/Bu. Sistem ini tidak membebani server dengan *background task* (penjadwalan) yang berjalan terus-menerus. Kami menggunakan pendekatan dinamis (*on-the-fly calculation*). Saat antarmuka web meminta data peminjaman, *Resolver* GraphQL di Backend akan mengecek apakah tanggal hari ini (`new Date()`) sudah melewati batas `dueDate` di database. Jika iya, maka sistem akan mengembalikan nilai boolean `isOverdue: true` seketika itu juga. Pendekatan ini jauh lebih hemat *resource* (kinerja server) dan selalu akurat secara *real-time*."

---

### 4. Pertanyaan: "Bagaimana jika ada dua pengguna (User) yang menekan tombol pinjam secara bersamaan pada buku yang sisa stoknya tinggal 1 (Satu)? Apa yang terjadi?"
*(Ini adalah pertanyaan klasik tentang 'Race Condition' di Database)*
**Cara Menjawab:**
"Di sinilah peran penting penggunaan **PostgreSQL** sebagai database utama kita. PostgreSQL menerapkan prinsip **ACID** *(Atomicity, Consistency, Isolation, Durability)*. Jika ada 2 *request* masuk secara milidetik bersamaan, database akan memprosesnya secara antrean (sekuensial/Isolation). Pengguna pertama akan berhasil mengurangi stok menjadi 0. Saat pengguna kedua diproses sepersekian detik kemudian, sistem *backend* akan mendeteksi bahwa ketersediaan stok sudah tidak memenuhi (stok <= 0), dan akan mengembalikan *error message* kepada pengguna kedua bahwa buku sudah habis dipinjam. Sehingga, jumlah stok minus (bernilai negatif) mustahil terjadi."

---

### 5. Pertanyaan: "Mengapa arsitektur aplikasi ini harus dibungkus menggunakan Docker? Kenapa tidak di-*run* biasa saja pakai Node.js?"
**Cara Menjawab:**
"Docker menyelesaikan masalah klasik dalam *software engineering* yaitu: *'Di laptop saya jalan, tapi kenapa di komputer server error?'*. Dengan melakukan kontainerisasi (Docker), kita membungkus aplikasi Node.js beserta database PostgreSQL menjadi satu paket terisolasi yang sudah terstandarisasi. Ini sangat merepresentasikan arsitektur *Enterprise* modern, di mana *deployment* ke Cloud Server, skalabilitas, dan *maintenance* menjadi sangat mudah tanpa perlu takut ada bentrok versi *software* di mesin server."

---

### 6. Pertanyaan: "Kenapa pengembalian buku harus melalui sistem persetujuan (Request Return -> Admin ACC)? Kenapa tidak langsung saja stoknya bertambah ketika User menekan tombol 'Kembalikan'?"
**Cara Menjawab:**
"Hal ini dirancang untuk mensimulasikan **Logika Bisnis (Business Logic)** yang realistis di dunia nyata. Jika User bisa mengembalikan buku secara sepihak, perpustakaan tidak memiliki kendali mutu (Quality Control). Admin perpustakaan harus melakukan validasi fisik buku terlebih dahulu (apakah bukunya benar-benar dikembalikan, rusak, atau robek?). Jika fisik buku disetujui baik, barulah Admin menekan **ACC** yang akan menambah kembali stok buku secara otomatis di sistem."

---

### 7. Pertanyaan: "Bagaimana cara sistem menyimpan kata sandi (Password) User? Apakah aman?"
**Cara Menjawab:**
"Sangat aman. Password pengguna sama sekali tidak disimpan dalam bentuk teks mentah (*Plain Text*). Saat User melakukan registrasi, Backend menggunakan pustaka (library) **Bcrypt** untuk melakukan proses *Hashing* pada password tersebut. Jadi, meskipun seandainya seseorang berhasil membobol masuk ke dalam database PostgreSQL kita, mereka hanya akan melihat susunan karakter acak (Hash) yang tidak bisa dikembalikan ke password aslinya."

---
*💡 **Saran Tambahan:** Jangan menghafal jawaban ini secara kaku. Pahami alur ceritanya, dan jawab dengan bahasa Anda sendiri yang rileks namun penuh percaya diri. Dosen sangat menyukai mahasiswa yang memahami 'KENAPA' sebuah teknologi dipilih, bukan hanya sekadar 'BAGAIMANA' kode itu ditulis.*
