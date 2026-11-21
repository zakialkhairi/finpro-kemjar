"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  User,
  KeyRound,
  IdCard,
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    nim: "",
    username: "",
    password: "",
    secret_note: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data: { error?: string } | null = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // Non-JSON response
      }

      if (!res.ok || !data || data.error) {
        setErrorMessage(
          data?.error ||
          (text.trim() ? text : `HTTP ${res.status}: Gagal memproses pendaftaran.`)
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Pendaftaran berhasil! Mengalihkan ke halaman login...");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi ke server.";
      setErrorMessage(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0B]">
      <div className="w-full max-w-md bg-[#141416] border border-[#27272A] rounded-xl p-8 shadow-2xl">
        {/* Brand / Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6 text-[#E4E4E7]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E4E4E7] font-heading">
            Registrasi Mahasiswa
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Buat akun baru untuk portal akademik & riset keamanan jaringan
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#0F291E] border border-[#166534] text-[#4ADE80] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E]" />
            <p className="text-xs font-mono font-mono-data">{successMessage}</p>
          </div>
        )}

        {/* Error Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-[#1C1012] border border-[#7F1D1D] text-[#F87171]">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#EF4444]" />
              <div className="text-left w-full overflow-hidden">
                <p className="text-xs font-semibold text-[#EF4444] mb-1 uppercase tracking-wider">
                  Pendaftaran Gagal
                </p>
                <p className="text-xs font-mono font-mono-data break-all">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Contoh: Muhammad Budi"
                required
                className="w-full pl-10 pr-4 py-2 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Nomor Induk Mahasiswa (NIM)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                <IdCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="nim"
                value={formData.nim}
                onChange={handleChange}
                placeholder="Contoh: 2406432000"
                required
                className="w-full pl-10 pr-4 py-2 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                required
                className="w-full px-3.5 py-2 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Catatan Rahasia (Secret Note)
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3.5 pointer-events-none text-[#71717A]">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                name="secret_note"
                value={formData.secret_note}
                onChange={handleChange}
                rows={2}
                placeholder="Catatan rahasia / credential pribadi"
                className="w-full pl-10 pr-4 py-2 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data resize-none"
              />
            </div>
            <p className="text-[11px] text-[#71717A] mt-1 font-mono font-mono-data">
              Data ini tersimpan secara konfidensial pada database profil Anda.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#09090B] font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
          >
            {isLoading ? (
              <span className="font-mono font-mono-data">Mendaftarkan...</span>
            ) : (
              <span>Daftar Akun Mahasiswa</span>
            )}
          </button>
        </form>

        {/* Footer Link back to Login */}
        <div className="mt-6 pt-5 border-t border-[#27272A] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#E4E4E7] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Login</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
