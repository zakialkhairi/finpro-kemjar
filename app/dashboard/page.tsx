"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  User,
  GraduationCap,
  KeyRound,
  LogOut,
  Search,
  AlertCircle,
  FileCode,
  Terminal,
  Database,
  Lock,
  ChevronRight,
  BookOpen,
  Award,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  password?: string;
  full_name: string;
  nim: string;
  gpa: string;
  semester_gpas: string;
  role: string;
  secret_note: string;
}

interface SearchRow {
  full_name: string;
  nim: string;
  role: string;
  [key: string]: unknown;
}

function parseSemesterGpas(raw: string | undefined): {
  sem1: string;
  sem2: string;
  sem3: string;
  sem4: string;
} {
  if (!raw) return { sem1: "-", sem2: "-", sem3: "-", sem4: "-" };
  try {
    const parsed = JSON.parse(raw);
    return {
      sem1: parsed.sem1 || "-",
      sem2: parsed.sem2 || "-",
      sem3: parsed.sem3 || "-",
      sem4: parsed.sem4 || "-",
    };
  } catch {
    const parts = raw.split(",").map((s) => s.trim());
    return {
      sem1: parts[0] || "-",
      sem2: parts[1] || "-",
      sem3: parts[2] || "-",
      sem4: parts[3] || "-",
    };
  }
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id");

  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Search State (for Admin view)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Quick IDOR Input State
  const [targetIdInput, setTargetIdInput] = useState(profileId || "1");

  // Fetch Profile data from /api/profile?id=...
  const fetchProfile = useCallback(
    async (id: string) => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const res = await fetch(`/api/profile?id=${encodeURIComponent(id)}`);
        const text = await res.text();
        let data: { error?: string; user?: UserProfile } | null = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          // Non-JSON response
        }

        if (!res.ok || !data || data.error) {
          if (res.status === 401) {
            router.push("/");
            return;
          }
          const errorMsg =
            data?.error ||
            (text.trim() ? text : `HTTP ${res.status}: Gagal memuat data profil.`);
          setProfileError(errorMsg);
          setProfile(null);
          return;
        }

        if (data.user) {
          setProfile(data.user);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Gagal menghubungi server.";
        setProfileError(errorMsg);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (profileId) {
      setTargetIdInput(profileId);
      fetchProfile(profileId);
    } else {
      setProfileError("Parameter id tidak ditemukan pada URL.");
      setProfileLoading(false);
    }
  }, [profileId, fetchProfile]);

  // Search API Call (Admin Only)
  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery !== undefined ? customQuery : searchQuery;
    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const text = await res.text();
      let data: { error?: string; results?: SearchRow[] } | null = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // Non-JSON response
      }

      if (!res.ok || !data || data.error) {
        setSearchError(
          data?.error ||
          (text.trim() ? text : `HTTP ${res.status}: Pencarian gagal diproses.`)
        );
        setSearchResults([]);
        return;
      }

      setSearchResults(data.results || []);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Gagal melakukan pencarian.";
      setSearchError(errorMsg);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Initial search load for admin
  useEffect(() => {
    if (profile?.role === "admin") {
      handleSearch(undefined, "");
    }
  }, [profile?.role]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      router.push("/");
    }
  };

  // Switch ID directly (demonstrates IDOR)
  const handleSwitchId = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetIdInput.trim()) {
      router.push(`/dashboard?id=${encodeURIComponent(targetIdInput.trim())}`);
    }
  };

  const semGpa = parseSemesterGpas(profile?.semester_gpas);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5] flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-[#27272A] bg-[#141416] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#E4E4E7]" />
            </div>
            <div>
              <span className="font-heading font-bold text-base text-[#F4F4F5]">
                KEAMANAN JARINGAN 25
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-[#71717A] border-l border-[#27272A] pl-2 font-mono font-mono-data">
                Security Lab
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden md:flex items-center gap-2 text-xs text-[#A1A1AA] font-mono font-mono-data bg-[#0D0D0F] border border-[#27272A] px-3 py-1.5 rounded-md">
                <span
                  className={`w-2 h-2 rounded-full ${
                    profile.role === "admin" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                ></span>
                <span>User ID:</span>
                <span className="text-[#F4F4F5] font-semibold">{profile.id}</span>
                <span className="text-[#52525B]">|</span>
                <span className="text-[#F4F4F5]">{profile.username}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold rounded-lg text-[#F4F4F5] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-heading text-[#F4F4F5] flex items-center gap-2">
              <User className="w-5 h-5 text-[#A1A1AA]" />
              {profile?.role === "admin"
                ? "Portal Administrasi Keamanan Jaringan"
                : "Detail Profil Akademik Mahasiswa"}
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5 font-mono font-mono-data">
              Endpoint: /api/profile?id={profileId || "..."}
            </p>
          </div>

          {/* Quick IDOR Inspector Tool */}
          <form
            onSubmit={handleSwitchId}
            className="flex items-center gap-2 bg-[#141416] border border-[#27272A] p-1.5 rounded-lg"
          >
            <span className="text-xs font-mono font-mono-data text-[#71717A] pl-2">
              ?id=
            </span>
            <input
              type="text"
              value={targetIdInput}
              onChange={(e) => setTargetIdInput(e.target.value)}
              placeholder="1-21"
              className="w-16 px-2 py-1 bg-[#0D0D0F] border border-[#27272A] rounded text-xs font-mono font-mono-data text-[#F4F4F5] focus:outline-none focus:border-[#71717A]"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#09090B] font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              Inspect IDOR
            </button>
          </form>
        </div>

        {/* Profile Card & Details */}
        {profileLoading ? (
          <div className="bg-[#141416] border border-[#27272A] rounded-xl p-8 text-center">
            <p className="text-sm text-[#A1A1AA] font-mono font-mono-data">
              Memuat data profil...
            </p>
          </div>
        ) : profileError ? (
          <div className="bg-[#1C1012] border border-[#7F1D1D] rounded-xl p-6 text-[#F87171]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#EF4444] mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#EF4444] uppercase tracking-wider mb-1">
                  Gagal Mengambil Profil
                </h3>
                <pre className="text-xs font-mono font-mono-data bg-[#14080A] p-3 rounded border border-[#4C121A] whitespace-pre-wrap break-all">
                  {profileError}
                </pre>
              </div>
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* ID */}
                <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg">
                  <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                    User ID
                  </span>
                  <span className="text-xl font-bold font-mono font-mono-data text-[#F4F4F5]">
                    #{profile.id}
                  </span>
                </div>

                {/* Nama Lengkap */}
                <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg md:col-span-2">
                  <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                    Nama Lengkap
                  </span>
                  <span className="text-xl font-bold font-heading text-[#F4F4F5] block truncate">
                    {profile.full_name}
                  </span>
                  <span className="text-xs text-[#71717A] font-mono font-mono-data">
                    @{profile.username}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg">
                  <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                    Peran / Role
                  </span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-mono-data font-semibold uppercase tracking-wider ${
                      profile.role === "admin"
                        ? "bg-rose-950/60 text-rose-300 border border-rose-800"
                        : "bg-blue-950/60 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Academic Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NIM */}
                <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                      Nomor Induk Mahasiswa / Pegawai
                    </span>
                    <span className="text-lg font-bold font-mono font-mono-data text-[#F4F4F5]">
                      {profile.nim}
                    </span>
                  </div>
                  <GraduationCap className="w-8 h-8 text-[#27272A]" />
                </div>

                {/* Cumulative GPA */}
                <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                      IPK Kumulatif
                    </span>
                    <span className="text-lg font-bold font-mono font-mono-data text-[#F4F4F5]">
                      {profile.gpa} / 4.00
                    </span>
                  </div>
                  <Database className="w-8 h-8 text-[#27272A]" />
                </div>
              </div>

              {/* Secret Note Container */}
              <div className="bg-[#0D0D0F] border border-[#27272A] p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#A1A1AA]" />
                  <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Catatan Rahasia (Confidential Secret Note)
                  </span>
                </div>
                <div className="bg-[#141416] border border-[#27272A] p-4 rounded-lg">
                  <pre className="text-sm font-mono font-mono-data text-[#F4F4F5] whitespace-pre-wrap break-all select-all">
                    {profile.secret_note || "Tidak ada catatan rahasia."}
                  </pre>
                </div>
              </div>
            </div>

            {/* ROLE-BASED VIEW 1: MAHASISWA ROLE VIEW */}
            {/* Displays Semester GPAs Table, NO Search Directory */}
            {profile.role === "mahasiswa" && (
              <section className="bg-[#141416] border border-[#27272A] rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#A1A1AA]" />
                    <h3 className="text-lg font-bold font-heading text-[#F4F4F5]">
                      Rincian IPK per Semester
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-mono-data text-[#71717A]">
                    Data Transkrip: semester_gpas
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Rincian indeks prestasi yang diperoleh mahasiswa pada semester 1 sampai 4.
                </p>

                {/* Semester GPAs 4-Column Grid & Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg text-center">
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                      Semester 1
                    </span>
                    <span className="text-xl font-bold font-mono font-mono-data text-[#F4F4F5]">
                      {semGpa.sem1}
                    </span>
                  </div>
                  <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg text-center">
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                      Semester 2
                    </span>
                    <span className="text-xl font-bold font-mono font-mono-data text-[#F4F4F5]">
                      {semGpa.sem2}
                    </span>
                  </div>
                  <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg text-center">
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                      Semester 3
                    </span>
                    <span className="text-xl font-bold font-mono font-mono-data text-[#F4F4F5]">
                      {semGpa.sem3}
                    </span>
                  </div>
                  <div className="bg-[#0D0D0F] border border-[#27272A] p-4 rounded-lg text-center">
                    <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                      Semester 4
                    </span>
                    <span className="text-xl font-bold font-mono font-mono-data text-[#F4F4F5]">
                      {semGpa.sem4}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-xs font-mono font-mono-data text-[#71717A] flex items-center justify-between">
                  <span>Raw JSON: {profile.semester_gpas}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Akademik
                  </span>
                </div>
              </section>
            )}

            {/* ROLE-BASED VIEW 2: ADMIN ROLE VIEW */}
            {/* Displays Directory Search Panel (UNION SELECT Target) ONLY for Admin */}
            {profile.role === "admin" && (
              <section className="bg-[#141416] border border-[#27272A] rounded-xl p-6 shadow-xl space-y-6">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-rose-400" />
                      <h3 className="text-lg font-bold font-heading text-[#F4F4F5]">
                        Pencarian Direktori Mahasiswa (Hak Akses Administrator)
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-mono-data text-[#71717A]">
                      Endpoint: /api/search?q=...
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Fitur ini hanya dapat diakses melalui akun Administrator. Cari data mahasiswa atau uji parameter pencarian.
                  </p>
                </div>

                {/* Search Bar Form */}
                <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ketik nama mahasiswa atau payload SQL..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#F4F4F5] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="px-5 py-2.5 bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#09090B] font-semibold text-sm rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {searchLoading ? (
                      <span className="font-mono font-mono-data">Mencari...</span>
                    ) : (
                      <span>Cari Data</span>
                    )}
                  </button>
                </form>

                {/* Raw SQL Error Box */}
                {searchError && (
                  <div className="p-4 rounded-lg bg-[#1C1012] border border-[#7F1D1D] text-[#F87171]">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#EF4444]" />
                      <div className="w-full overflow-hidden">
                        <p className="text-xs font-semibold text-[#EF4444] mb-1 uppercase tracking-wider">
                          Error Eksekusi Kueri Database (SQL Error)
                        </p>
                        <pre className="text-xs font-mono font-mono-data bg-[#14080A] p-2.5 rounded border border-[#4C121A] overflow-x-auto whitespace-pre-wrap break-all select-all">
                          {searchError}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3-Column Results Table */}
                <div className="overflow-x-auto border border-[#27272A] rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0D0D0F] border-b border-[#27272A] text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                        <th className="py-3 px-4 w-1/2">Nama Lengkap / Kolom 1</th>
                        <th className="py-3 px-4 w-1/4 font-mono font-mono-data">
                          NIM / Kolom 2
                        </th>
                        <th className="py-3 px-4 w-1/4 font-mono font-mono-data">
                          Role / Kolom 3
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272A] text-sm">
                      {searchResults.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-[#71717A] text-xs font-mono font-mono-data"
                          >
                            {searchLoading
                              ? "Sedang mengambil data..."
                              : "Tidak ada data yang ditemukan."}
                          </td>
                        </tr>
                      ) : (
                        searchResults.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-[#18181B] transition-colors"
                          >
                            <td className="py-3 px-4 text-[#F4F4F5] font-medium break-all">
                              {String(row.full_name ?? "-")}
                            </td>
                            <td className="py-3 px-4 text-[#A1A1AA] font-mono font-mono-data break-all">
                              {String(row.nim ?? "-")}
                            </td>
                            <td className="py-3 px-4 font-mono font-mono-data">
                              <span className="inline-block px-2 py-0.5 rounded text-xs bg-[#18181B] border border-[#27272A] text-[#F4F4F5]">
                                {String(row.role ?? "-")}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A] font-mono font-mono-data pt-2">
                  <span>Total Hasil: {searchResults.length} baris</span>
                  <span>Skema Kolom: [full_name, nim, role]</span>
                </div>
              </section>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
          <p className="text-sm font-mono font-mono-data text-[#71717A]">
            Memuat dashboard...
          </p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
