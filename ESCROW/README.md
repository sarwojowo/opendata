# PixelHub

Platform komisi seni digital berbasis blockchain. Menghubungkan klien dan seniman digital dengan sistem pembayaran escrow on-chain, resolusi sengketa, dan penyimpanan karya di IPFS.

---

## Fitur Utama

- **Komisi Seni** — klien memesan layanan dari seniman, pembayaran terkunci di escrow
- **Escrow Blockchain** — smart contract otomatis mengatur alur dana: deposit → mulai → kirim → approve/sengketa
- **Resolusi Sengketa** — arbiter netral menyelesaikan perselisihan antara klien dan seniman
- **IPFS Storage** — karya yang dikirim disimpan di Pinata IPFS, tidak bisa dihapus/dimanipulasi
- **Wallet Auth** — login via dompet Ethereum (SIWE), tanpa username/password
- **Galeri & Feed** — tampilkan portofolio, like karya, dan jelajahi seniman
- **Chat** — komunikasi langsung antara klien dan seniman per order

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Auth | NextAuth v4 + SIWE (Sign-In with Ethereum) |
| Database | PostgreSQL + Prisma ORM |
| Blockchain | Solidity 0.8.28, Hardhat, Ethers.js v6 |
| Storage | Pinata SDK (IPFS) |
| Form | Formik + Yup |

---

## Arsitektur Sistem

```
Klien ──► PixelHub (Next.js)
                │
                ├── PostgreSQL (data order, user, service)
                ├── Pinata IPFS (gambar & file karya)
                └── Ethereum Network
                        ├── EscrowFactory.sol  ← deploy escrow baru
                        └── RemotePayment.sol  ← kelola dana tiap order
```

### Alur Order

```
Klien buat order → Artist terima → EscrowFactory deploy RemotePayment
     → Klien deposit ETH → Artist startWork() → Artist submitWork(ipfsHash)
     → Klien approveWork() → Artist withdraw()
          └─ (atau) Klien raiseDispute() → Arbiter resolveDispute()
```

---

## Smart Contracts

### `EscrowFactory.sol`
Factory untuk deploy contract `RemotePayment` baru per order. Menyimpan mapping escrow per klien dan per seniman.

### `RemotePayment.sol`
Contract escrow individual per order. Status lifecycle:

| Status | Keterangan |
|---|---|
| `Pending` | Order dibuat, menunggu deposit & start |
| `Submitted` | Karya dikirim oleh seniman |
| `Disputed` | Klien mengajukan sengketa |
| `Completed` | Karya diapprove, dana dirilis ke seniman |
| `Refunded` | Dana dikembalikan ke klien |

**Deadline otomatis:**
- `startDeadline` — 2 hari: jika seniman tidak mulai, klien bisa refund
- `workDeadline` — 7 hari setelah start: jika tidak dikirim, klien bisa refund
- `reviewDeadline` — 3 hari setelah submit: jika tidak ada aksi, dana auto-release ke seniman

---

## Prasyarat

- Node.js >= 18
- PostgreSQL
- MetaMask (atau wallet Ethereum lainnya)
- Akun Pinata (untuk IPFS)

---

## Setup & Instalasi

### 1. Clone & Install

```bash
# Install dependencies web app
cd pixelhub
npm install

# Install dependencies smart contract
cd smart-contract
npm install
```

### 2. Environment Variables

Buat file `.env` di folder `pixelhub/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pixelhub"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Pinata IPFS
PINATA_JWT="your-pinata-jwt-token"
NEXT_PUBLIC_PINATA_GATEWAY="gateway.pinata.cloud"

# Smart Contract
NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS="0x..."
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
```

### 3. Setup Database

```bash
cd pixelhub
npx prisma migrate dev
npx prisma db seed
```

### 4. Deploy Smart Contract

```bash
# Jalankan node Ethereum lokal
cd smart-contract
npx hardhat node

# Deploy di terminal lain
npx hardhat run scripts/deploy.ts --network localhost
```

Salin alamat `EscrowFactory` yang muncul ke `NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS` di `.env`.

### 5. Jalankan Aplikasi

```bash
cd pixelhub
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Struktur Direktori

```
pixelhub/
├── src/
│   ├── app/
│   │   ├── (user)/          # Halaman utama (dashboard, orders, profile, settings)
│   │   │   ├── arbiter/     # Halaman resolusi sengketa
│   │   │   ├── orders/      # Manajemen order
│   │   │   ├── profile/     # Profil pengguna
│   │   │   └── settings/    # Pengaturan akun
│   │   ├── api/             # API routes (Next.js)
│   │   └── ui/              # Komponen UI
│   ├── lib/                 # Utilities, repository functions, Pinata helper
│   ├── auth.ts              # Konfigurasi NextAuth + SIWE
│   └── middleware.ts        # Route protection middleware
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Data awal
└── smart-contract/
    ├── contracts/
    │   ├── EscrowFactory.sol
    │   └── RemotePayment.sol
    ├── scripts/deploy.ts
    └── hardhat.config.ts
```

---

## Scripts

### Web App

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

### Smart Contract

```bash
npx hardhat compile           # Compile contracts
npx hardhat test              # Jalankan tests
npx hardhat node              # Local Ethereum node
npx hardhat run scripts/deploy.ts --network localhost   # Deploy lokal
```

---

## Database Schema

| Model | Keterangan |
|---|---|
| `User` | Pengguna, login via wallet address |
| `Creator` | Seniman yang terdaftar, punya layanan |
| `Service` | Layanan/komisi yang ditawarkan seniman |
| `Order` | Order komisi antara klien dan seniman |
| `Escrow` | Data escrow on-chain per order |
| `Posting` | Postingan karya di feed galeri |
| `Like` | Like pada posting |
| `ChattingRoom` | Ruang chat per sesi |
| `Message` | Pesan dalam chat |
| `OrderHistorical` | Log riwayat transaksi on-chain per order |

---

## Lisensi
Proyek skripsi — tidak untuk distribusi komersial.
