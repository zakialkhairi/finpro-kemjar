import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface User {
  id: number;
  username: string;
  password: string;
  full_name: string;
  nim: string;
  gpa: string;
  semester_gpas: string;
  role: string;
  secret_note: string;
}

// In Vercel / AWS Lambda, root directory is read-only.
// Use /tmp for writable SQLite database.
const isVercel = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION
);

const dbDir = isVercel ? "/tmp" : process.cwd();
const dbPath = path.join(dbDir, "database.db");

declare global {
  // eslint-disable-next-line no-var
  var __sqlite_db: Database.Database | undefined;
}

function initDb(): Database.Database {
  if (isVercel && !fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      // Ignore directory already exists
    }
  }

  const database = new Database(dbPath);

  if (!isVercel) {
    database.pragma("journal_mode = WAL");
  } else {
    database.pragma("journal_mode = DELETE");
  }

  // Check if users table exists and has the semester_gpas column
  const tableCheck = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    .get();

  if (tableCheck) {
    const columns = database.prepare("PRAGMA table_info(users)").all() as Array<{
      name: string;
    }>;
    const hasSemesterGpas = columns.some((col) => col.name === "semester_gpas");
    if (!hasSemesterGpas) {
      database.exec("DROP TABLE users");
    }
  }

  // Create table users if it doesn't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      nim TEXT NOT NULL,
      gpa TEXT NOT NULL,
      semester_gpas TEXT NOT NULL,
      role TEXT NOT NULL,
      secret_note TEXT NOT NULL
    );
  `);

  // Check if users table has the 21 dummy accounts
  const countStmt = database.prepare("SELECT COUNT(*) as count FROM users");
  const result = countStmt.get() as { count: number };

  if (result.count < 21) {
    database.exec("DELETE FROM users");

    const dummyVictims = [
      {
        username: "admin",
        password: "SuperAdmin#2026",
        full_name: "Dr. Hendra Wijaya",
        nim: "19780412200501",
        gpa: "4.00",
        semester_gpas: '{"sem1":"4.00","sem2":"4.00","sem3":"4.00","sem4":"4.00"}',
        role: "admin",
        secret_note: "FLAG{SQLI_ADMIN_MASTER_KEY_9941}",
      },
      {
        username: "zaki",
        password: "zaki2026",
        full_name: "Muhammad Zaki Al Khairi",
        nim: "2406432375",
        gpa: "3.92",
        semester_gpas: '{"sem1":"3.88","sem2":"3.90","sem3":"3.94","sem4":"3.96"}',
        role: "mahasiswa",
        secret_note: "Token Akses Lab Jaringan: NETLAB-7721",
      },
      {
        username: "bryan",
        password: "bryan_ftui",
        full_name: "Bryan Nathaniel",
        nim: "2406432110",
        gpa: "3.85",
        semester_gpas: '{"sem1":"3.80","sem2":"3.84","sem3":"3.86","sem4":"3.90"}',
        role: "mahasiswa",
        secret_note: "Draft Kunci Jawaban UTS Kemjar 2026",
      },
      {
        username: "naufal",
        password: "naufal123",
        full_name: "Naufal Rizky Pratama",
        nim: "2406432198",
        gpa: "3.78",
        semester_gpas: '{"sem1":"3.70","sem2":"3.75","sem3":"3.81","sem4":"3.86"}',
        role: "mahasiswa",
        secret_note: "PIN Brankas Server Ruang 204: 482910",
      },
      {
        username: "clara",
        password: "clara_sec",
        full_name: "Clara Anastasya",
        nim: "2406432402",
        gpa: "3.95",
        semester_gpas: '{"sem1":"3.92","sem2":"3.94","sem3":"3.96","sem4":"3.98"}',
        role: "mahasiswa",
        secret_note: "Sertifikat Beasiswa & Rekening: 1290048192",
      },
      {
        username: "dimas",
        password: "dimas2026",
        full_name: "Dimas Aditya Nugroho",
        nim: "2406432511",
        gpa: "3.42",
        semester_gpas: '{"sem1":"3.30","sem2":"3.38","sem3":"3.46","sem4":"3.54"}',
        role: "mahasiswa",
        secret_note: "Surat Peringatan Akademik Semester 5",
      },
      {
        username: "salsa",
        password: "salsabila99",
        full_name: "Salsabila Putri",
        nim: "2406432634",
        gpa: "3.88",
        semester_gpas: '{"sem1":"3.82","sem2":"3.86","sem3":"3.90","sem4":"3.94"}',
        role: "mahasiswa",
        secret_note: "API Key AWS Penelitian: AKIAIOSFODNN7EXAMPLE",
      },
      {
        username: "farhan",
        password: "farhan_dev",
        full_name: "Farhan Ramadhan",
        nim: "2406432789",
        gpa: "3.67",
        semester_gpas: '{"sem1":"3.58","sem2":"3.64","sem3":"3.70","sem4":"3.76"}',
        role: "mahasiswa",
        secret_note: "Password Wi-Fi Internal Dosen: DTE_FTUI_2026!",
      },
      {
        username: "nadia",
        password: "nadia_ui",
        full_name: "Nadia Kusumawardani",
        nim: "2406432845",
        gpa: "3.91",
        semester_gpas: '{"sem1":"3.87","sem2":"3.90","sem3":"3.92","sem4":"3.95"}',
        role: "mahasiswa",
        secret_note: "FLAG{IDOR_CONFIDENTIAL_STUDENT_RECORD}",
      },
      {
        username: "dosen_asisten",
        password: "asdos2026!",
        full_name: "Budi Santoso",
        nim: "2406432890",
        gpa: "3.90",
        semester_gpas: '{"sem1":"3.85","sem2":"3.88","sem3":"3.92","sem4":"3.95"}',
        role: "mahasiswa",
        secret_note: "Rekap Nilai Kuis Matematika Lanjut",
      },
      {
        username: "bagas",
        password: "bagas2026",
        full_name: "Bagas Prakoso",
        nim: "2406432901",
        gpa: "3.74",
        semester_gpas: '{"sem1":"3.65","sem2":"3.70","sem3":"3.78","sem4":"3.83"}',
        role: "mahasiswa",
        secret_note: "Kredensial GitLab Privat: bagas_deploy_99",
      },
      {
        username: "alya",
        password: "alya_ui26",
        full_name: "Alya Rahmawati",
        nim: "2406432914",
        gpa: "3.96",
        semester_gpas: '{"sem1":"3.92","sem2":"3.95","sem3":"3.98","sem4":"4.00"}',
        role: "mahasiswa",
        secret_note: "Kandidat Mahasiswa Berprestasi FTUI 2026",
      },
      {
        username: "kevin",
        password: "kevin_net",
        full_name: "Kevin Gunawan",
        nim: "2406432928",
        gpa: "3.58",
        semester_gpas: '{"sem1":"3.45","sem2":"3.52","sem3":"3.64","sem4":"3.71"}',
        role: "mahasiswa",
        secret_note: "Catatan Remedial Kalkulus Lanjut",
      },
      {
        username: "putri",
        password: "putri88",
        full_name: "Putri Maharani",
        nim: "2406432940",
        gpa: "3.89",
        semester_gpas: '{"sem1":"3.84","sem2":"3.88","sem3":"3.90","sem4":"3.94"}',
        role: "mahasiswa",
        secret_note: "Nomor Rekening Pencairan Asisten: 1570098123",
      },
      {
        username: "rafi",
        password: "rafi_dev",
        full_name: "Rafi Ahmad Fauzan",
        nim: "2406432955",
        gpa: "3.81",
        semester_gpas: '{"sem1":"3.75","sem2":"3.79","sem3":"3.82","sem4":"3.88"}',
        role: "mahasiswa",
        secret_note: "SSH Key Server Praktikum: SHA256:x89aLmP",
      },
      {
        username: "tiara",
        password: "tiara2026",
        full_name: "Tiara Dewi Lestari",
        nim: "2406432967",
        gpa: "3.93",
        semester_gpas: '{"sem1":"3.89","sem2":"3.91","sem3":"3.95","sem4":"3.97"}',
        role: "mahasiswa",
        secret_note: "Surat Rekomendasi Magang Telkom",
      },
      {
        username: "ilham",
        password: "ilham_sec",
        full_name: "Ilham Saputra",
        nim: "2406432973",
        gpa: "3.62",
        semester_gpas: '{"sem1":"3.50","sem2":"3.58","sem3":"3.66","sem4":"3.74"}',
        role: "mahasiswa",
        secret_note: "Token Ujian Susulan Praktikum Kemjar",
      },
      {
        username: "citra",
        password: "citra99",
        full_name: "Citra Kirana",
        nim: "2406432989",
        gpa: "3.87",
        semester_gpas: '{"sem1":"3.80","sem2":"3.85","sem3":"3.90","sem4":"3.93"}',
        role: "mahasiswa",
        secret_note: "Draft Proposal Skripsi IoT Smart Grid",
      },
      {
        username: "reza",
        password: "reza_ftui",
        full_name: "Reza Pahlevi",
        nim: "2406432992",
        gpa: "3.71",
        semester_gpas: '{"sem1":"3.60","sem2":"3.68","sem3":"3.75","sem4":"3.81"}',
        role: "mahasiswa",
        secret_note: "PIN Akses Lab Elektronika: 739104",
      },
      {
        username: "melati",
        password: "melati26",
        full_name: "Melati Kusuma",
        nim: "2406433005",
        gpa: "3.94",
        semester_gpas: '{"sem1":"3.90","sem2":"3.92","sem3":"3.96","sem4":"3.98"}',
        role: "mahasiswa",
        secret_note: "FLAG{IDOR_SEMESTER_TRANSCRIPT_LEAKED}",
      },
      {
        username: "hendra_m",
        password: "hendra2026",
        full_name: "Hendra Pratama",
        nim: "2406433018",
        gpa: "3.49",
        semester_gpas: '{"sem1":"3.35","sem2":"3.42","sem3":"3.55","sem4":"3.64"}',
        role: "mahasiswa",
        secret_note: "Status Evaluasi Studi: Peringatan Tahap 1",
      },
    ];

    const insertStmt = database.prepare(`
      INSERT INTO users (username, password, full_name, nim, gpa, semester_gpas, role, secret_note)
      VALUES (@username, @password, @full_name, @nim, @gpa, @semester_gpas, @role, @secret_note)
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

// Lazy proxy so that database initialization only executes on demand
export const db = new Proxy({} as Database.Database, {
  get(_target, prop) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    if (typeof value === "function") {
      return (value as Function).bind(instance);
    }
    return value;
  },
});

export default db;
