import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <header className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Motion-U" className="w-9 h-9 rounded-md" />
            <div className="leading-none">
              <div className="font-display font-semibold text-lg tracking-tight">
                Motion-U
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase mt-1">
                Route Control
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wider px-3 py-2 rounded-md text-muted hover:bg-ink-soft transition-colors"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-5 sm:px-8 py-16">
        <div className="max-w-md mx-auto">
          <div className="rounded-xl border border-line-paper bg-white/70 overflow-hidden">
            <div className="bg-ink text-paper px-6 py-5">
              <h1 className="font-display font-semibold text-sm">Sign in required</h1>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted leading-relaxed">
                Route performance, click data, and link management are locked.
                Sign in with your workspace account to get access.
              </p>
              <LoginError error={error} />
              <form action="/api/auth/login" method="GET">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-route hover:bg-route-dark text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sign in with Zitadel
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-ink text-paper mt-auto">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 text-center">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
            Powered by Motion-U, Develop and Maintain by Kaiden-A
          </span>
        </div>
      </footer>
    </>
  );
}

function LoginError({ error }: { error?: string }) {
  const message = (() => {
    switch (error) {
      case "access_denied":
        return "Sign in was cancelled or not allowed.";
      case "invalid_state":
        return "Sign in failed. Please try again.";
      case "token_exchange_failed":
        return "Could not complete sign in. Please try again.";
      case "invalid_token":
        return "Sign in verification failed. Please try again.";
      case "forbidden_org":
        return "Your account is not authorized to access this workspace.";
      default:
        return error ? "Sign in failed. Please try again." : "";
    }
  })();

  if (!message) return null;

  return (
    <p className="font-mono text-xs text-route-dark bg-paper-dim rounded-lg px-3 py-2">
      {message}
    </p>
  );
}
