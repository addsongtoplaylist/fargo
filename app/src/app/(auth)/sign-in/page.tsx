"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  no_code: "Sign-in was cancelled. Please try again.",
  exchange_failed: "Something went wrong during sign-in. Please try again.",
};

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage =
    error && ERROR_MESSAGES[error]
      ? ERROR_MESSAGES[error]
      : error
        ? "Something went wrong. Please try again."
        : null;

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 bg-ground">
      <div className="w-full max-w-[360px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/mascot.png"
            alt="Fargo mascot"
            width={100}
            height={114}
            className="mb-2"
          />
          <img
            src="/logo.png"
            alt="Fargo"
            width={150}
            height={56}
            className="mb-2"
          />
          <p className="text-sm text-muted">
            Every trip starts here.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          {errorMessage && (
            <p className="text-xs text-money-over mb-3 text-center">
              {errorMessage}
            </p>
          )}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-card border border-border rounded-md text-sm font-medium text-ink hover:bg-ground transition-colors disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          No passwords. Sign in with your Google account.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
