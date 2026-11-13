/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../types/game';

export const PAI_QUESTIONS: Question[] = [
  // ==========================================
  // LANTAI 4 (5 Soal - Mudah)
  // Materi: Berpikir Kritis & Cinta IPTEK, Tajwid, Syu'abul Iman
  // ==========================================
  {
    id: 'f4_q1',
    floor: 4,
    title: 'Soal 1 (Lantai 4) - Berpikir Kritis (Q.S. Ali \'Imran/3: 191)',
    topic: 'Al-Qur\'an & Karakter Ulil Albab',
    type: 'word_arrange',
    prompt: 'Susunlah potongan terjemahan Q.S. Ali \'Imran/3: 191 berikut mengenai ciri-ciri utama orang yang berakal (Ulil Albab):',
    hint: 'Ketuk potongan kata sesuai urutan terjemahan ayat yang benar.',
    scrambledWords: [
      { id: 'w1', text: '(yaitu) orang-orang yang' },
      { id: 'w2', text: 'mengingat Allah' },
      { id: 'w3', text: 'sambil berdiri,' },
      { id: 'w4', text: 'duduk,' },
      { id: 'w5', text: 'atau dalam keadaan berbaring' },
    ],
    correctOrder: ['w1', 'w2', 'w3', 'w4', 'w5'],
    explanation: 'Ulil Albab menurut Q.S. Ali \'Imran: 191 adalah mereka yang senantiasa berdzikir kepada Allah dalam segala keadaan (berdiri, duduk, berbaring) serta memikirkan penciptaan langit dan bumi.',
  },
  {
    id: 'f4_q2',
    floor: 4,
    title: 'Soal 2 (Lantai 4) - Hukum Bacaan Tajwid Dasar',
    topic: 'Tajwid Q.S. Ali \'Imran/3: 190',
    type: 'multiple_choice',
    prompt: 'Perhatikan potongan ayat berikut: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ". Apa hukum bacaan tajwid pada lafal "السَّمَاوَاتِ" dan apa alasannya?',
    options: [
      { id: 'opt_a', text: 'Alif Lam Qamariyah, karena huruf Alif Lam dibaca jelas tanpa idgham.' },
      { id: 'opt_b', text: 'Alif Lam Syamsiyah, karena huruf Alif Lam melebur ke huruf Sin yang bertasydid.' },
      { id: 'opt_c', text: 'Idgham Bighunnah, karena ada nun mati bertemu salah satu huruf ya, nun, mim, wau.' },
      { id: 'opt_d', text: 'Mad Wajib Muttashil, karena mad thabi\'i bertemu hamzah dalam satu kalimat.' },
    ],
    correctOptionId: 'opt_b',
    explanation: 'Pada lafal "السَّمَاوَاتِ", huruf alif lam bertemu dengan salah satu huruf syamsiyah yaitu Sin (س) sehingga alif lam tidak dibaca melainkan diidghamkan ke huruf Sin.',
  },
  {
    id: 'f4_q3',
    floor: 4,
    title: 'Soal 3 (Lantai 4) - Mencintai IPTEK (Q.S. Ar-Rahman/55: 33)',
    topic: 'IPTEK dalam Perspektif Islam',
    type: 'multiple_choice',
    prompt: 'Dalam Q.S. Ar-Rahman/55: 33 Allah menantang jin dan manusia untuk menembus penjuru langit dan bumi, "la tanfudzuna illa bi-sulthan". Menurut mayoritas ulama tafsir, apa makna kata "Sulthan" dalam ayat ini yang sangat relevan bagi siswa SMK?',
    options: [
      { id: 'opt_a', text: 'Kekayaan materi dan modal uang yang melimpah ruah' },
      { id: 'opt_b', text: 'Kekuasaan jabatan politik serta pengaruh keturunan raja' },
      { id: 'opt_c', text: 'Kekuatan ilmu pengetahuan, teknologi, dan kecakapan akal pikiran' },
      { id: 'opt_d', text: 'Kekuatan fisik dan kesaktian supranatural' },
    ],
    correctOptionId: 'opt_c',
    explanation: 'Para mufassir seperti Ibnu Abbas memaknai "Sulthan" sebagai ilmu pengetahuan dan bukti akal. Manusia hanya dapat menjelajah alam semesta dan menguasai teknologi dengan riset dan sains.',
  },
  {
    id: 'f4_q4',
    floor: 4,
    title: 'Soal 4 (Lantai 4) - Dimensi Syu\'abul Iman (Cabang-Cabang Iman)',
    topic: 'Akidah & Cabang-Cabang Iman',
    type: 'category_sort',
    prompt: 'Kelompokkan setiap amalan berikut ke dalam dimensi Syu\'abul Iman yang tepat sesuai klasifikasi Syekh Nawawi Al-Bantani:',
    categories: [
      { id: 'cat_qalb', name: 'Cabang Hati (Qalbu)', description: 'Keyakinan & niat batin' },
      { id: 'cat_lisan', name: 'Cabang Lisan', description: 'Ucapan & lisan' },
      { id: 'cat_arkan', name: 'Cabang Perbuatan', description: 'Tindakan fisik anggota tubuh' },
    ],
    items: [
      { id: 'it_1', text: 'Ikhlas semata-mata karena Allah & menjauhi riya\'', correctCategoryId: 'cat_qalb' },
      { id: 'it_2', text: 'Membaca kitab suci Al-Qur\'an dan berdzikir', correctCategoryId: 'cat_lisan' },
      { id: 'it_3', text: 'Menyingkirkan paku/benda berbahaya dari jalan', correctCategoryId: 'cat_arkan' },
      { id: 'it_4', text: 'Menjaga lisan dari ghibah (menggunjing) & fitnah', correctCategoryId: 'cat_lisan' },
      { id: 'it_5', text: 'Menegakkan shalat dan menunaikan zakat', correctCategoryId: 'cat_arkan' },
      { id: 'it_6', text: 'Mencintai Allah dan Rasul-Nya melebihi segalanya', correctCategoryId: 'cat_qalb' },
    ],
    explanation: 'Syu\'abul Iman terbagi 3 rumpun: Ma\'rifatun bil qalb (hati/keyakinan), Iqrarun bil lisan (ucapan/lisan), dan \'Amalun bil arkan (perbuatan raga/anggota badan).',
  },
  {
    id: 'f4_q5',
    floor: 4,
    title: 'Soal 5 (Lantai 4) - Perilaku Terpuji Cabang Iman',
    topic: 'Akhlak Pelajar Muslim',
    type: 'match_pairs',
    prompt: 'Jodohkan prinsip perilaku Syu\'abul Iman di sebelah kiri dengan contoh penerapannya bagi pelajar di sebelah kanan:',
    pairs: [
      {
        id: 'p1',
        left: 'Menjaga Lisan',
        right: 'Tidak berkomentar jahat (cyberbullying) dan tidak menyebar hoaks di medsos',
      },
      {
        id: 'p2',
        left: 'Memenuhi Janji',
        right: 'Menyelesaikan tugas kelompok praktik kejuruan tepat waktu sesuai komitmen',
      },
      {
        id: 'p3',
        left: 'Mensyukuri Nikmat',
        right: 'Mengoptimalkan bakat kejuruan dan peralatan bengkel/lab untuk kemaslahatan',
      },
      {
        id: 'p4',
        left: 'Menutupi Aib Teman',
        right: 'Tidak membeberkan kekhilafan teman ke publik serta menasihatinya secara bijak',
      },
    ],
    explanation: 'Keimanan sejati tercermin dari integritas sehari-hari: menjaga lisan, menepati janji, mensyukuri nikmat dengan berkarya, dan menjaga kehormatan sesama saudara muslim.',
  },

  // ==========================================
  // LANTAI 3 (5 Soal - Sedang)
  // Materi: Menghindari Tawuran, Bahaya Khamr/Narkoba, Dakwah Khutbah & Tabligh
  // ==========================================
  {
    id: 'f3_q1',
    floor: 3,
    title: 'Soal 6 (Lantai 3) - Menghindari Perkelahian Pelajar (Tawuran)',
    topic: 'Akhlak Sosial & Resolusi Konflik',
    type: 'multiple_choice',
    prompt: 'Tawuran antar-pelajar sering dipicu oleh fanatisme sempit dan emosi sesaat. Berdasarkan Q.S. Al-Hujurat/49: 10, langkah paling tepat yang harus diambil siswa muslim jika melihat dua kelompok siswa berselisih adalah:',
    options: [
      { id: 'opt_a', text: 'Melakukan ishlah (mendamaikan kedua pihak secara adil) atas dasar ukhuwah islamiyah' },
      { id: 'opt_b', text: 'Membela kelompok dari sekolah sendiri tanpa memperdulikan siapa yang bersalah' },
      { id: 'opt_c', text: 'Membiarkan perkelahian berlangsung agar mereka menyelesaikan masalah secara fisik' },
      { id: 'opt_d', text: 'Merekam video kejadian dan mengunggahnya ke media sosial agar viral' },
    ],
    correctOptionId: 'opt_a',
    explanation: 'Q.S. Al-Hujurat: 10 menegaskan bahwa orang-orang mukmin itu bersaudara, maka wajib mendamaikan (ishlah) di antara saudara yang berselisih serta bertakwa kepada Allah.',
  },
  {
    id: 'f3_q2',
    floor: 3,
    title: 'Soal 7 (Lantai 3) - Bahaya Khamr dalam Q.S. Al-Ma\'idah/5: 90-91',
    topic: 'Larangan Minuman Keras (Khamr)',
    type: 'multiple_choice',
    prompt: 'Dalam Q.S. Al-Ma\'idah/5: 90-91, khamr disebut sebagai "rijsun min \'amalisy-syaithan" (najis/keji perbuatan setan). Mengapa setan sengaja menjerumuskan manusia melalui khamr menurut ayat 91?',
    options: [
      { id: 'opt_a', text: 'Agar manusia menghabiskan seluruh uangnya untuk berdagang' },
      { id: 'opt_b', text: 'Untuk menimbulkan permusuhan, kebencian, dan menghalangi manusia dari mengingat Allah serta shalat' },
      { id: 'opt_c', text: 'Agar manusia mudah tertidur di ruang kelas saat jam belajar' },
      { id: 'opt_d', text: 'Supaya manusia menjadi lelah dan tidak bisa bekerja mencari nafkah' },
    ],
    correctOptionId: 'opt_b',
    explanation: 'Ayat 91 menyatakan: Sesungguhnya setan bermaksud hendak menimbulkan permusuhan dan kebencian di antara kamu lantaran khamr dan judi, serta menghalangi kamu dari mengingat Allah dan shalat.',
  },
  {
    id: 'f3_q3',
    floor: 3,
    title: 'Soal 8 (Lantai 3) - Dampak Bahaya Narkoba dalam Fikih & Medis',
    topic: 'Kesehatan & Hukum Fikih Narkoba',
    type: 'category_sort',
    prompt: 'Kategorikan fakta-fakta bahaya penyalahgunaan Narkoba berikut ke dalam bidang tinjauan yang tepat:',
    categories: [
      { id: 'cat_medis', name: 'Dampak Medis & Fisik', description: 'Kerusakan organ tubuh' },
      { id: 'cat_mental', name: 'Dampak Mental & Perilaku', description: 'Kerusakan psikologis' },
      { id: 'cat_fikih', name: 'Tinjauan Hukum Fikih', description: 'Hukum syariat Islam' },
    ],
    items: [
      { id: 'it_m1', text: 'Kerusakan sistem saraf pusat, gagal ginjal, dan gangguan jantung', correctCategoryId: 'cat_medis' },
      { id: 'it_p1', text: 'Halusinasi, kepribadian paranoid, dan kecenderungan berbuat kriminal', correctCategoryId: 'cat_mental' },
      { id: 'it_f1', text: 'Diharamkan berdasarkan qiyas (analogi) illat memabukkan dan merusak akal', correctCategoryId: 'cat_fikih' },
      { id: 'it_f2', text: 'Melanggar Maqashid Syariah daruriyat: Hifzhu al-\'Aql (menjaga akal)', correctCategoryId: 'cat_fikih' },
      { id: 'it_m2', text: 'Daya tahan tubuh menurun drastis dan rentan tertular infeksi mematikan', correctCategoryId: 'cat_medis' },
      { id: 'it_p2', text: 'Depresi berkepanjangan dan kehilangan motivasi masa depan', correctCategoryId: 'cat_mental' },
    ],
    explanation: 'Narkoba diharamkan secara mutlak dalam fikih Islam melalui qiyas terhadap khamr demi menjaga kelangsungan akal (Hifzhu al-\'Aql) dan jiwa (Hifzhu an-Nafs).',
  },
  {
    id: 'f3_q4',
    floor: 3,
    title: 'Soal 9 (Lantai 3) - Karakteristik Dakwah, Khutbah, & Tabligh',
    topic: 'Syiar Islam (Dakwah, Khutbah, Tabligh)',
    type: 'match_pairs',
    prompt: 'Jodohkan istilah syiar Islam di sebelah kiri dengan karakteristik khasnya di sebelah kanan:',
    pairs: [
      {
        id: 'p_khutbah',
        left: 'Khutbah',
        right: 'Terikat rukun dan syarat sah tertentu, ada mimbar, satu arah, seperti shalat Jumat',
      },
      {
        id: 'p_tabligh',
        left: 'Tabligh',
        right: 'Menyampaikan risalah ajaran Islam secara lisan ke khalayak tanpa rukun formal shalat',
      },
      {
        id: 'p_dakwah',
        left: 'Dakwah',
        right: 'Seruan mengajak kebaikan dengan perkataan (lisan), tulisan (qalam), maupun teladan nyata (hal)',
      },
    ],
    explanation: 'Khutbah terikat syarat dan rukun baku; Tabligh fokus pada penyampaian materi ajaran; Dakwah memiliki cakupan paling luas mencakup perkataan, tindakan, dan keteladanan.',
  },
  {
    id: 'f3_q5',
    floor: 3,
    title: 'Soal 10 (Lantai 3) - Urutan Rukun Khutbah Jumat',
    topic: 'Ketentuan Rukun Khutbah Jumat',
    type: 'word_arrange',
    prompt: 'Susunlah 5 rukun khutbah Jumat berikut sesuai urutan pelaksanaannya yang sah:',
    hint: 'Mulai dari pujian kepada Allah sampai doa untuk kaum mukminin.',
    scrambledWords: [
      { id: 'rk1', text: '1. Membaca hamdalah (pujian kepada Allah)' },
      { id: 'rk2', text: '2. Membaca shalawat kepada Nabi Muhammad SAW' },
      { id: 'rk3', text: '3. Berwasiat taqwa kepada jamaah' },
      { id: 'rk4', text: '4. Membaca ayat Al-Qur\'an pada salah satu khutbah' },
      { id: 'rk5', text: '5. Mendoakan kaum mukminin pada khutbah kedua' },
    ],
    correctOrder: ['rk1', 'rk2', 'rk3', 'rk4', 'rk5'],
    explanation: 'Rukun khutbah Jumat ada 5: Mengucapkan hamdalah, shalawat nabi, wasiat taqwa, membaca minimal satu ayat Al-Qur\'an, dan mendoakan ampunan bagi mukminin di khutbah kedua.',
  },

  // ==========================================
  // LANTAI 2 (5 Soal - Sulit)
  // Materi: Fikih Muamalah (Syirkah, Bank/Asuransi Syariah) & Tokoh Pembaru Islam
  // ==========================================
  {
    id: 'f2_q1',
    floor: 2,
    title: 'Soal 11 (Lantai 2) - Bentuk-Bentuk Syirkah (Kerjasama Usaha)',
    topic: 'Fikih Muamalah: Jenis Syirkah',
    type: 'match_pairs',
    prompt: 'Jodohkan nama akad Syirkah di sebelah kiri dengan deskripsi kerjasama usahanya di sebelah kanan:',
    pairs: [
      {
        id: 'sy_inan',
        left: 'Syirkah \'Inan',
        right: 'Kerjasama dua orang atau lebih dengan menyertakan modal uang dan kerja bersama',
      },
      {
        id: 'sy_mudharabah',
        left: 'Syirkah Mudharabah',
        right: 'Kerjasama modal 100% dari pemilik modal (shahibul mal) dan dikelola pihak pelaksana',
      },
      {
        id: 'sy_abdan',
        left: 'Syirkah Abdan',
        right: 'Kerjasama usaha bermodalkan keahlian tenaga fisik/profesi tanpa penyertaan modal uang',
      },
      {
        id: 'sy_wujuh',
        left: 'Syirkah Wujuh',
        right: 'Kerjasama berdasarkan ketokohan, kredibilitas nama baik, atau kepercayaan dagang',
      },
    ],
    explanation: 'Dalam Fikih Muamalah: Syirkah \'Inan menggabungkan modal+kerja; Mudharabah modal murni vs kerja; Abdan mengandalkan profesi/tenaga; Wujuh mengandalkan reputasi/kredibilitas nama baik.',
  },
  {
    id: 'f2_q2',
    floor: 2,
    title: 'Soal 12 (Lantai 2) - Prinsip & Larangan Transaksi Perbankan Syariah',
    topic: 'Ekonomi Islam & Perbankan Syariah',
    type: 'category_sort',
    prompt: 'Kelompokkan konsep-konsep keuangan berikut ke dalam "Prinsip/Akad Halal" atau "Larangan Muamalah":',
    categories: [
      { id: 'cat_halal', name: 'Akad & Instrumen Halal', description: 'Sesuai syariat Islam' },
      { id: 'cat_haram', name: 'Larangan Pokok Muamalah', description: 'Diharamkan dalam Islam' },
    ],
    items: [
      { id: 'it_mrb', text: 'Murabahah (jual-beli dengan margin keuntungan disepakati terbuka)', correctCategoryId: 'cat_halal' },
      { id: 'it_rba', text: 'Riba (tambahan nilai tanpa kompensasi aset riil yang diperjanjikan di awal)', correctCategoryId: 'cat_haram' },
      { id: 'it_ghr', text: 'Gharar (ketidakjelasan objek akad yang berpotensi merugikan salah satu pihak)', correctCategoryId: 'cat_haram' },
      { id: 'it_mys', text: 'Maysir (spekulasi perjudian/taruhan yang untung-untungan)', correctCategoryId: 'cat_haram' },
      { id: 'it_wdh', text: 'Wadi\'ah (akad titipan murni yang harus dijaga keutuhannya)', correctCategoryId: 'cat_halal' },
      { id: 'it_msk', text: 'Musyarakah (kemitraan permodalan bagi hasil dan berbagi risiko)', correctCategoryId: 'cat_halal' },
    ],
    explanation: 'Perbankan syariah beroperasi bebas dari 3 larangan pokok: Riba, Gharar, dan Maysir, serta mengedepankan akad amanah seperti Wadi\'ah, Mudharabah, Murabahah, dan Musyarakah.',
  },
  {
    id: 'f2_q3',
    floor: 2,
    title: 'Soal 13 (Lantai 2) - Esensi Asuransi Syariah (Takaful)',
    topic: 'Asuransi Syariah (Takaful)',
    type: 'multiple_choice',
    prompt: 'Asuransi Syariah (Takaful) berbeda secara fundamental dari asuransi konvensional. Mengapa akad dalam asuransi syariah dinyatakan sah dan bersih dari unsur judi (maysir)?',
    options: [
      { id: 'opt_a', text: 'Karena premi dikelola dengan akad tabarru\' (hibah kebajikan saling tolong-menolong atas risiko musibah)' },
      { id: 'opt_b', text: 'Karena premi diinvestasikan pada instrumen pasar uang berkeuntungan bunga tinggi' },
      { id: 'opt_c', text: 'Karena perusahaan asuransi menanggung seluruh kerugian tanpa melibatkan dana nasabah lain' },
      { id: 'opt_d', text: 'Karena nasabah yang tidak pernah klaim akan mendapat ganti rugi bunga dua kali lipat' },
    ],
    correctOptionId: 'opt_a',
    explanation: 'Asuransi syariah berlandaskan prinsip Ta\'awun (tolong-menolong) dan akad Tabarru\' (dana kebajikan), sehingga nasabah berniat saling membantu jika terjadi musibah, bukan berspekulasi untung-rugi.',
  },
  {
    id: 'f2_q4',
    floor: 2,
    title: 'Soal 14 (Lantai 2) - Tokoh Pembaru Islam Masa Modern Dunia',
    topic: 'Sejarah Peradaban Islam Modern',
    type: 'match_pairs',
    prompt: 'Jodohkan Tokoh Pembaru Islam Dunia Masa Modern dengan gagasan pembaharuan utamanya:',
    pairs: [
      {
        id: 'tok_afghani',
        left: 'Jamaluddin Al-Afghani',
        right: 'Mencetuskan Pan-Islamisme untuk menyatukan solidaritas umat Islam melawan penjajahan Barat',
      },
      {
        id: 'tok_abduh',
        left: 'Muhammad Abduh',
        right: 'Membuka kembali pintu ijtihad serta mereformasi kurikulum sains modern di Univ. Al-Azhar',
      },
      {
        id: 'tok_ridha',
        left: 'Rasyid Ridha',
        right: 'Menerbitkan majalah Al-Manar dan menyusun tafsir Al-Qur\'an berwawasan sosial modern',
      },
    ],
    explanation: 'Jamaluddin Al-Afghani terkenal dengan gerakan Pan-Islamisme; Muhammad Abduh memadukan akal dan wahyu serta mereformasi Al-Azhar; Rasyid Ridha menyebarluaskan ide-ide tersebut lewat Majalah Al-Manar.',
  },
  {
    id: 'f2_q5',
    floor: 2,
    title: 'Soal 15 (Lantai 2) - Tokoh Pembaru Islam di Indonesia',
    topic: 'Tokoh Islam Nusantara Modern',
    type: 'multiple_choice',
    prompt: 'Dua ulama besar Nusantara abad ke-20, K.H. Ahmad Dahlan dan K.H. Hasyim Asy\'ari, bersahabat karib saat berguru di Mekkah dan mendirikan dua ormas Islam terbesar di Indonesia. Manakah pernyataan yang paling akurat mengenai kekhasan kontribusi pembaharuan keduanya?',
    options: [
      { id: 'opt_a', text: 'K.H. Ahmad Dahlan menolak teknologi barat, sementara K.H. Hasyim Asy\'ari mendirikan sekolah barat' },
      { id: 'opt_b', text: 'K.H. Ahmad Dahlan (Muhammadiyah) memelopori modernisasi sekolah Islam & rumah sakit, sedangkan K.H. Hasyim Asy\'ari (NU) memperkokoh pesantren & mazhab Ahlussunnah wal Jama\'ah' },
      { id: 'opt_c', text: 'Kedua tokoh mendirikan partai politik yang menentang kemerdekaan Republik Indonesia' },
      { id: 'opt_d', text: 'K.H. Hasyim Asy\'ari menghapus tradisi pesantren, sedangkan K.H. Ahmad Dahlan mewajibkan tradisi tarekat' },
    ],
    correctOptionId: 'opt_b',
    explanation: 'K.H. Ahmad Dahlan memelopori pendidikan Islam modern (integrasi agama dan umum) serta PKU (amalan sosial), sedangkan K.H. Hasyim Asy\'ari menjaga benteng tradisi keilmuan pesantren dan persatuan umat berakidah Ahlussunnah wal Jama\'ah.',
  },
];
