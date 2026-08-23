"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const supabase = createClient();

  async function signInWithGoogle() {
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-ink mb-1">Fargo</h1>
          <p className="text-sm text-muted">
            Every trip starts here.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <button
            onClick={signInWithGoogle}
            className="w-full h-11 flex items-center justify-center gap-2 bg-card border border-border rounded-md text-sm font-medium text-ink hover:bg-ground transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          No passwords. Sign in with your Google account.
        </p>
      </div>
    </div>
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
