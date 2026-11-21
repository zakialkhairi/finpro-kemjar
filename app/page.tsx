"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, AlertCircle, ArrowRight, Terminal } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rawError, setRawError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRawError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setRawError(data.error || "Gagal masuk ke sistem.");
        setIsLoading(false);
        return;
      }

      // If success, cookie is set automatically by the server response
      // Redirect to /dashboard?id=<user.id>
      router.push(`/dashboard?id=${data.user.id}`);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi ke server.";
      setRawError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0B]">
      <div className="w-full max-w-md bg-[#141416] border border-[#27272A] rounded-xl p-8 shadow-2xl">
        {/* Brand / Academic Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#E4E4E7]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E4E4E7] font-heading">
            KEAMANAN JARINGAN 25
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Portal Riset & Laboratorium Keamanan Jaringan
          </p>
        </div>

        {/* Error Box (displays raw error message from backend) */}
        {rawError && (
          <div className="mb-6 p-4 rounded-lg bg-[#1C1012] border border-[#7F1D1D] text-[#F87171]">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#EF4444]" />
              <div className="text-left w-full overflow-hidden">
                <p className="text-xs font-semibold text-[#EF4444] mb-1 uppercase tracking-wider">
                  Autentikasi Gagal / Error Database
                </p>
                <pre className="text-xs font-mono font-mono-data bg-[#14080A] p-2.5 rounded border border-[#4C121A] overflow-x-auto whitespace-pre-wrap break-all select-all">
                  {rawError}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D0D0F] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] placeholder-[#52525B] focus:outline-none focus:border-[#71717A] transition-colors font-mono font-mono-data"
              />
            </div>
          </div>

          {/* Primary Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#09090B] font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="font-mono font-mono-data">Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk ke Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-8 pt-6 border-t border-[#27272A] text-center">
          <p className="text-xs text-[#71717A]">
            Belum memiliki akun mahasiswa?{" "}
            <Link
              href="/register"
              className="text-[#E4E4E7] hover:underline font-medium ml-1 inline-flex items-center gap-1"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Security Lab Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#52525B] font-mono font-mono-data">
          <Terminal className="w-3.5 h-3.5 text-[#52525B]" />
          <span>Kemjar FTUI Security Lab Environment</span>
        </div>
      </div>
    </main>
  );
}
