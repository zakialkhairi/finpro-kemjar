import Database from "better-sqlite3";
import path from "path";

export interface User {
  id: number;
  username: string;
  password: string;
  full_name: string;
  nim: string;
  gpa: string;
  role: string;
  secret_note: string;
}

const dbPath = path.join(process.cwd(), "database.db");

declare global {
  // eslint-disable-next-line no-var
  var __sqlite_db: Database.Database | undefined;
}

function initDb(): Database.Database {
  const database = new Database(dbPath);

  // WAL mode for improved concurrent reads and writes
  database.pragma("journal_mode = WAL");

  // Create table users if it doesn't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      nim TEXT NOT NULL,
      gpa TEXT NOT NULL,
      role TEXT NOT NULL,
      secret_note TEXT NOT NULL
    );
  `);

  // Check if users table is empty
  const countStmt = database.prepare("SELECT COUNT(*) as count FROM users");
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    const dummyVictims = [
      {
        username: "admin",
        password: "SuperAdmin#2026",
        full_name: "Dr. Hendra Wijaya",
        nim: "19780412200501",
        gpa: "4.00",
        role: "admin",
        secret_note: "FLAG{SQLI_ADMIN_MASTER_KEY_9941}",
      },
      {
        username: "zaki",
        password: "zaki2026",
        full_name: "Muhammad Zaki Al Khairi",
        nim: "2406432375",
        gpa: "3.92",
        role: "mahasiswa",
        secret_note: "Token Akses Lab Jaringan: NETLAB-7721",
      },
      {
        username: "bryan",
        password: "bryan_ftui",
        full_name: "Bryan Nathaniel",
        nim: "2406432110",
        gpa: "3.85",
        role: "mahasiswa",
        secret_note: "Draft Kunci Jawaban UTS Kemjar 2026",
      },
      {
        username: "naufal",
        password: "naufal123",
        full_name: "Naufal Rizky Pratama",
        nim: "2406432198",
        gpa: "3.78",
        role: "mahasiswa",
        secret_note: "PIN Brankas Server Ruang 204: 482910",
      },
      {
        username: "clara",
        password: "clara_sec",
        full_name: "Clara Anastasya",
        nim: "2406432402",
        gpa: "3.95",
        role: "mahasiswa",
        secret_note: "Sertifikat Beasiswa & Rekening: 1290048192",
      },
      {
        username: "dimas",
        password: "dimas2026",
        full_name: "Dimas Aditya Nugroho",
        nim: "2406432511",
        gpa: "3.42",
        role: "mahasiswa",
        secret_note: "Surat Peringatan Akademik Semester 5",
      },
      {
        username: "salsa",
        password: "salsabila99",
        full_name: "Salsabila Putri",
        nim: "2406432634",
        gpa: "3.88",
        role: "mahasiswa",
        secret_note: "API Key AWS Penelitian: AKIAIOSFODNN7EXAMPLE",
      },
      {
        username: "farhan",
        password: "farhan_dev",
        full_name: "Farhan Ramadhan",
        nim: "2406432789",
        gpa: "3.67",
        role: "mahasiswa",
        secret_note: "Password Wi-Fi Internal Dosen: DTE_FTUI_2026!",
      },
      {
        username: "nadia",
        password: "nadia_ui",
        full_name: "Nadia Kusumawardani",
        nim: "2406432845",
        gpa: "3.91",
        role: "mahasiswa",
        secret_note: "FLAG{IDOR_CONFIDENTIAL_STUDENT_RECORD}",
      },
      {
        username: "dosen_kemjar",
        password: "kemjar2026!",
        full_name: "Ir. Budi Santoso, M.T.",
        nim: "19820915201012",
        gpa: "4.00",
        role: "dosen",
        secret_note: "Nilai Akhir Mahasiswa & Soal Remedial 2026",
      },
    ];

    const insertStmt = database.prepare(`
      INSERT INTO users (username, password, full_name, nim, gpa, role, secret_note)
      VALUES (@username, @password, @full_name, @nim, @gpa, @role, @secret_note)
    `);

    const insertMany = database.transaction((users: typeof dummyVictims) => {
      for (const u of users) {
        insertStmt.run(u);
      }
    });

    insertMany(dummyVictims);
  }

  return database;
}

export function getDb(): Database.Database {
  if (!globalThis.__sqlite_db) {
    globalThis.__sqlite_db = initDb();
  }
  return globalThis.__sqlite_db;
}

export const db = getDb();
export default db;
