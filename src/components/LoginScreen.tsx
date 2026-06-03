"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onLogin();
    } catch {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-20"
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.97) 100%)",
      }}
    >
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-12">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">FunJeju</h1>
        <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          제주도라는 무대 위의 디지털 월드
        </p>
      </div>

      {/* 로그인 버튼 */}
      <div className="w-full max-w-xs px-6 flex flex-col gap-3">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm transition-all"
          style={{
            background: loading ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.95)",
            color: "#1a1a1a",
          }}
        >
          {loading ? (
            <span style={{ color: "rgba(255,255,255,0.6)" }}>로그인 중...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 탐험 시작
            </>
          )}
        </button>

        {error && (
          <p className="text-center text-xs" style={{ color: "#EF4444" }}>{error}</p>
        )}

        <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          로그인 시 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
