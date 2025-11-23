-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 09 Des 2024 pada 23.02
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cf_fc`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_admin`
--

CREATE TABLE `tb_admin` (
  `kode_user` varchar(6) NOT NULL,
  `nama_user` varchar(50) NOT NULL,
  `user` varchar(16) NOT NULL,
  `pass` varchar(16) DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data untuk tabel `tb_admin`
--

INSERT INTO `tb_admin` (`kode_user`, `nama_user`, `user`, `pass`, `level`) VALUES
('U001', 'Renta Y D', 'admin', 'admin', 'admin'),
('U002', 'Renta Y D', 'renta', 'renta', 'user');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_diagnosa`
--

CREATE TABLE `tb_diagnosa` (
  `kode_diagnosa` varchar(16) NOT NULL,
  `nama_diagnosa` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `referensi` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data untuk tabel `tb_diagnosa`
--

INSERT INTO `tb_diagnosa` (`kode_diagnosa`, `nama_diagnosa`, `keterangan`, `referensi`) VALUES
('P001', 'Abses', 'Abses merupakan kantong berisi nanah yang muncul sebagai respons sistem imun terhadap infeksi. Abses bisa terjadi pada manusia maupun hewan, termasuk kucing. Abses pada kucing paling sering disebabkan oleh bakteri yang masuk ke dalam kulit melalui luka gigitan, tusukan, atau cakaran.\r\n\r\nAbses pada kucing merupakan salah satu kondisi yang perlu ditangani oleh dokter hewan. Sebelum memberikan penanganan, dokter hewan umumnya akan melakukan serangkaian pemeriksaan untuk mengevaluasi kondisi kucing yang sakit dan menentukan lokasi munculnya abses.\r\n\r\nSelain itu, dokter juga akan melakukan pemeriksaan lain, seperti foto Rontgen atau USG, tes darah, dan analisis nanah untuk memastikan jenis kuman penyebab abses pada kucing.', 'https://www.alodokter.com/seputar-abses-pada-kucing-yang-cat-lovers-wajib-ketahui'),
('P002', 'Ringworm', 'Berikut adalah beberapa perawatan yang kerap diberikan pada anabul dengan ringworm.\n\nPotong bulu: untuk memastikan tidak ada jamur yang tersisa dan memudahkan pemantauan perawatan.\n\nSampo antijamur: diberikan 1–2 kali dalam satu minggu sampai infeksi hilang sepenuhnya.\n\nObat antijamur: pemberian salep atau obat antijamur melalui mulut.\n\nDekontaminasi lingkungan: jamur bisa bertahan di lingkungan yang terinfeksi sampai dua tahun. Oleh karena itu, lakukan dekontaminasi dengan membersihkan tempat tinggal kucing secara teratur.\n\nLama pengobatan infeksi jamur pada kulit kucing bisa bervariasi, tergantung dengan kesehatan anabul secara menyeluruh dan area yang terinfeksi.\n', 'https://hellosehat.com/sehat/informasi-kesehatan/ringworm-kucing/'),
('P003', 'Scabies', 'Scabies pada kucing disebabkan oleh infeksi tungau Sarcoptes scabei dan Notoedres cati. Pada kucing, penyakit ini bisa menimbulkan rasa tidak nyaman, gatal-gatal, iritiasi kulit, bahkan kulit berkerak.\n\nUntuk mengobati kucing sakit yang terkena scabies, dokter dapat meresepkan obat antiparasit, misalnya ivermectin, baik yang diminum, dioles, atau disuntikkan. Pillhan obat ini akan disesuaikan dengan jenis tungau, area tubuh yang terkena, dan tingkat keparahan scabies pada kucing.\n\nSelain dengan meresepkan obat-obatan, dokter juga mungkin akan menyarankanmu untuk menggunakan sampo khusus antitungau saat memandikan kucing. Sampo ini bisa membantu meredakan peradangan dan menenangkan luka pada kulit kucing kesayanganmu.', 'https://www.alodokter.com/scabies-pada-kucing-ini-gejala-dan-cara-mengobatinya#:~:text=Scabies%20pad'),
('P004', 'Panleukopenia', 'Perawatan berfokus untuk mencegah dehidrasi, pemberian nutrisi dan pencegahan infeksi sekunder. Meskipun tidak membunuh virus, antibiotik sering kali diperlukan karena kucing yang terinfeksi berisiko lebih tinggi terkena infeksi bakteri, karena sistem kekebalannya tidak berfungsi sepenuhnya.\n\nJika kucing bertahan selama lima hari, peluangnya untuk pulih sangat meningkat. Isolasi ketat dari kucing lain diperlukan untuk mencegah penyebaran virus.', 'https://www.halodoc.com/artikel/kenali-lebih-jauh-virus-panleukopenia-pada-kucing-peliharaan?srsltid'),
('P005', 'Rabies', 'Tidak ada pengobatan untuk rabies pada kucing. Tapi, rabies dapat dengan mudah dicegah pada kucing melalui vaksinasi rutin dan memelihara mereka di dalam ruangan.\n', 'https://health.detik.com/berita-detikhealth/d-6932863/12-ciri-ciri-kucing-rabies-yang-perlu-diwaspad');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_gejala`
--

CREATE TABLE `tb_gejala` (
  `kode_gejala` varchar(16) NOT NULL,
  `nama_gejala` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data untuk tabel `tb_gejala`
--

INSERT INTO `tb_gejala` (`kode_gejala`, `nama_gejala`, `keterangan`) VALUES
('G001', 'Bengkak atau benjolan yang berwarna kemerahan', 'Bermunculan bengkak atau benjolan yang berwarna kemerahan pada kulit kucing.'),
('G002', 'Sering menggaruk, menggigit, atau menjilat tubuh', 'Kucing mulai sering menggaruk, menggigit, atau menjilat tubuh.'),
('G003', 'Sering menggeram', 'Sering menggeram ketakutan'),
('G004', 'Perilaku agresif', 'Perilaku lebih agresif dari biasanya'),
('G005', 'Ekor terkulai', 'Ekor terkulai karena merasa takut dan resah.'),
('G006', 'Pincang', 'Kucing berjalan pincang'),
('G007', 'Demam', 'Demam'),
('G008', 'Tampak lesu', 'Tampak lesu'),
('G009', 'Hilang nafsu makan', 'Kucing mengalami penurunan nafsu makan'),
('G010', 'Tidak mau berinteraksi', 'Enggan untuk berinteraksi dengan apapun'),
('G011', 'Bulu rontok atau pitak', 'Bulu rontok atau pitak akibat aktivitas menggaruk oleh kucing secara terus-menerus.'),
('G012', 'Sering menggaruk, menggigit, atau menjilat tubuh', 'Sering menggaruk, menggigit, atau menjilat tubuh karena gatal'),
('G013', 'Kuku kucing terasa lebih kasar dan menebal atau distorsi kuku', 'Kuku kucing terasa lebih kasar dan menebal atau distorsi kuku'),
('G014', 'Kulit iritasi dan kemerahan', 'Kulit iritasi dan kemerahan'),
('G015', 'Kulit berkerak atau berkerut', 'Kulit berkerak atau berkerut'),
('G016', 'Terdapat luka atau koreng pada kulit', 'Terdapat luka atau koreng pada kulit'),
('G017', 'Mual dan muntah', 'Mual dan muntah'),
('G018', 'Diare parah', 'Diare parah'),
('G019', 'Keluar ingus', 'Keluar ingus'),
('G020', 'Dehidrasi', 'Dehidrasi'),
('G021', 'Sering bersembunyi', 'Sering bersembunyi'),
('G022', 'Mudah terprovokasi', 'Mudah terprovokasi'),
('G023', 'Air liur terus menerus keluar', 'Air liur terus menerus keluar'),
('G024', 'Takut terhadap cahaya', 'Takut terhadap cahaya'),
('G025', 'Mengalami hydrophobia (ketakutan terhadap air)', 'Mengalami hydrophobia (ketakutan terhadap air)'),
('G026', 'Kejang', 'Kejang'),
('G027', 'Perubahan perilaku', 'Perubahan perilaku'),
('G028', 'Rahang terkunci', 'Rahang terkunci'),
('G029', 'Tidak dapat menelan makanan', 'Tidak dapat menelan makanan'),
('G030', 'Mengalami kelumpuhan', 'Mengalami kelumpuhan');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_konsultasi`
--

CREATE TABLE `tb_konsultasi` (
  `ID` int(11) NOT NULL,
  `kode_gejala` varchar(16) DEFAULT NULL,
  `jawaban` varchar(6) DEFAULT 'Tidak'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_relasi`
--

CREATE TABLE `tb_relasi` (
  `ID` int(11) NOT NULL,
  `kode_diagnosa` varchar(16) DEFAULT NULL,
  `kode_gejala` varchar(16) DEFAULT NULL,
  `cf` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data untuk tabel `tb_relasi`
--

INSERT INTO `tb_relasi` (`ID`, `kode_diagnosa`, `kode_gejala`, `cf`) VALUES
(1, 'P001', 'G004', 0.4),
(2, 'P001', 'G001', 1),
(3, 'P001', 'G002', 0.8),
(4, 'P001', 'G003', 0.2),
(5, 'P001', 'G005', 0.4),
(6, 'P001', 'G006', 0.6),
(7, 'P001', 'G007', 0.6),
(8, 'P001', 'G008', 0.8),
(9, 'P001', 'G009', 1),
(10, 'P001', 'G010', 0.6),
(11, 'P002', 'G011', 1),
(12, 'P002', 'G012', 0.6),
(13, 'P002', 'G013', 0),
(14, 'P002', 'G001', 0.8),
(16, 'P003', 'G002', 1),
(17, 'P003', 'G011', 1),
(18, 'P003', 'G014', 0.8),
(19, 'P003', 'G015', 0.8),
(20, 'P003', 'G016', 0.6),
(21, 'P004', 'G009', 0.8),
(22, 'P004', 'G007', 1),
(23, 'P004', 'G017', 0.8),
(24, 'P004', 'G018', 1),
(25, 'P004', 'G019', 0.2),
(26, 'P004', 'G020', 0.6),
(27, 'P005', 'G027', 0.8),
(28, 'P005', 'G021', 0.4),
(29, 'P005', 'G009', 1),
(30, 'P005', 'G022', 0.4),
(31, 'P005', 'G023', 0.8),
(32, 'P005', 'G024', 0.6),
(33, 'P005', 'G025', 0.6),
(34, 'P005', 'G026', 0.6),
(35, 'P005', 'G004', 1),
(36, 'P005', 'G029', 0.8),
(37, 'P005', 'G030', 1),
(38, 'P005', 'G026', 0.6),
(143, 'P001', 'G009', 0.8);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `tb_admin`
--
ALTER TABLE `tb_admin`
  ADD PRIMARY KEY (`user`);

--
-- Indeks untuk tabel `tb_diagnosa`
--
ALTER TABLE `tb_diagnosa`
  ADD PRIMARY KEY (`kode_diagnosa`);

--
-- Indeks untuk tabel `tb_gejala`
--
ALTER TABLE `tb_gejala`
  ADD PRIMARY KEY (`kode_gejala`);

--
-- Indeks untuk tabel `tb_konsultasi`
--
ALTER TABLE `tb_konsultasi`
  ADD PRIMARY KEY (`ID`);

--
-- Indeks untuk tabel `tb_relasi`
--
ALTER TABLE `tb_relasi`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `tb_konsultasi`
--
ALTER TABLE `tb_konsultasi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tb_relasi`
--
ALTER TABLE `tb_relasi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
