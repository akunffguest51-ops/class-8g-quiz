// SERVER-ONLY question bank. Never import this file from anything under /public.
// correctIndex is 0-based (A=0, B=1, C=2, D=3).

module.exports = [
  {
    id: 1,
    category: "Logical Deduction",
    question:
      "Premis 1: Semua Zorb adalah Mion. Premis 2: Sebagian Mion adalah Talp. Kesimpulan manakah yang PASTI benar?",
    options: [
      "Semua Zorb adalah Talp",
      "Sebagian Zorb pasti adalah Talp",
      "Tidak dapat ditentukan apakah ada Zorb yang merupakan Talp",
      "Tidak ada Zorb yang merupakan Talp",
    ],
    correctIndex: 2,
  },
  {
    id: 2,
    category: "Number Pattern",
    question: "Lanjutkan pola berikut: 2, 6, 12, 20, 30, ...?",
    options: ["36", "40", "42", "44"],
    correctIndex: 2,
  },
  {
    id: 3,
    category: "Mathematical Reasoning",
    question:
      "Keran A dapat mengisi penuh sebuah bak dalam 4 jam. Keran B dapat mengisi bak yang sama dalam 6 jam. Jika kedua keran dibuka bersamaan sejak bak kosong, berapa jam waktu yang dibutuhkan untuk mengisi bak sampai penuh?",
    options: ["2 jam", "2,4 jam", "3 jam", "5 jam"],
    correctIndex: 1,
  },
  {
    id: 4,
    category: "Spatial / Logical Thinking",
    question:
      "Sebuah dadu standar (jumlah dua sisi yang berhadapan selalu 7) diletakkan dengan sisi atas menunjukkan angka 2 dan sisi depan menunjukkan angka 3. Berapakah angka pada sisi bawah dan sisi belakang secara berurutan?",
    options: ["5 dan 4", "5 dan 3", "4 dan 5", "6 dan 4"],
    correctIndex: 0,
  },
  {
    id: 5,
    category: "Conditional Logic",
    question:
      "Jika hari ini hujan, maka Budi memakai jas hujan. Hari ini Budi TIDAK memakai jas hujan. Kesimpulan manakah yang PASTI benar?",
    options: [
      "Hari ini hujan",
      "Hari ini tidak hujan",
      "Budi lupa membawa jas hujan",
      "Tidak dapat disimpulkan apa-apa",
    ],
    correctIndex: 1,
  },
  {
    id: 6,
    category: "Word Logic",
    question: "BUKU : PERPUSTAKAAN = OBAT : ?",
    options: ["Rumah Sakit", "Dokter", "Apotek", "Pasien"],
    correctIndex: 2,
  },
  {
    id: 7,
    category: "Probability",
    question:
      "Sebuah kotak berisi 4 bola merah dan 6 bola biru. Dua bola diambil sekaligus secara acak. Berapa peluang keduanya berwarna merah?",
    options: ["1/5", "2/15", "4/25", "6/45 disederhanakan jadi 3/22"],
    correctIndex: 1,
  },
  {
    id: 8,
    category: "Sequence",
    question: "Lanjutkan deret huruf berikut: A, C, F, J, O, ...?",
    options: ["S", "T", "U", "V"],
    correctIndex: 2,
  },
  {
    id: 9,
    category: "Lateral Thinking",
    question:
      "Seorang pria tinggal di lantai 10 sebuah apartemen. Setiap pagi ia naik lift langsung ke lantai dasar tanpa masalah. Tapi setiap sore saat pulang, ia hanya menekan tombol lift sampai lantai 7, lalu naik tangga untuk sisa 3 lantai — KECUALI pada hari hujan, saat itu ia bisa menekan tombol sampai lantai 10 langsung. Mengapa demikian?",
    options: [
      "Karena liftnya rusak jika cuaca cerah",
      "Karena tinggi badannya hanya cukup menekan tombol lantai 7, tapi saat hujan ia memakai payung untuk menekan tombol lantai 10",
      "Karena ia ingin berolahraga naik tangga saat cuaca cerah",
      "Karena penghuni lain melarangnya memakai lift sampai lantai 10",
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    category: "FINAL BOSS",
    question:
      "Ada 3 sakelar di luar sebuah ruangan tertutup. Masing-masing mengontrol satu dari 3 lampu di dalam ruangan, tetapi Anda tidak bisa melihat ke dalam dari luar. Anda HANYA boleh masuk ke ruangan itu SATU KALI untuk memeriksa lampu. Bagaimana cara yang PASTI berhasil untuk mengetahui sakelar mana yang mengontrol lampu mana?",
    options: [
      "Nyalakan semua sakelar sekaligus lalu masuk dan lihat lampu mana yang menyala",
      "Nyalakan sakelar 1 selama beberapa menit lalu matikan, kemudian nyalakan sakelar 2 dan langsung masuk: lampu yang menyala dikontrol sakelar 2, lampu mati tapi terasa panas dikontrol sakelar 1, lampu mati dan dingin dikontrol sakelar 3",
      "Nyalakan sakelar secara bergantian sambil mengintip dari lubang pintu",
      "Tidak mungkin diketahui hanya dengan satu kali masuk ruangan",
    ],
    correctIndex: 1,
  },
];
