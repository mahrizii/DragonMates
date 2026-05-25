import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07294d] font-sans selection:bg-amber-400/30">
      {/* Navigation Bar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 font-bold text-[#07294d]">
            D
          </div>
          <span className="text-xl font-bold tracking-wide text-amber-400">
            DragonMates
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-blue-200 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-[#07294d] transition hover:bg-amber-300">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
            The exclusive roommate finder for Drexel students
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Find your perfect roommate <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              without the guesswork.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-200/80">
            Compare academic schedules, living habits, and shared interests to
            discover the best match for your next housing term. Stop rolling the
            dice on random assignments.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-xl bg-amber-400 px-8 py-3.5 text-base font-semibold text-[#07294d] shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300">
              Create your profile
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md transition hover:bg-white/10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl">
              🎓
            </div>
            <h3 className="text-xl font-semibold text-white">Academic Alignment</h3>
            <p className="mt-3 text-blue-200/70">
              Match with peers in similar majors or academic years to ensure
              your study schedules and workloads sync up perfectly.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md transition hover:bg-white/10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl">
              🌙
            </div>
            <h3 className="text-xl font-semibold text-white">Lifestyle Sync</h3>
            <p className="mt-3 text-blue-200/70">
              Filter by sleep schedules, cleanliness preferences, and noise
              tolerance. No more conflicts over 3 AM alarm clocks.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md transition hover:bg-white/10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl">
              🎮
            </div>
            <h3 className="text-xl font-semibold text-white">Shared Interests</h3>
            <p className="mt-3 text-blue-200/70">
              Connect over shared hobbies like gaming, fitness, or music. Find a
              roommate who is also a great friend.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-32 rounded-[28px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white">About DragonMates</h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-200/70">
            DragonMates is a roommate-matching platform built exclusively for Drexel
            University students. We use compatibility scoring across lifestyle,
            academics, and shared interests to help you find a roommate — not just
            a stranger.
          </p>
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">For</p>
            <p className="mt-2 text-sm font-medium text-white">Drexel University</p>
            <p className="mt-0.5 text-sm font-medium text-blue-200/60">Philadelphia, PA</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-blue-200/50">
        <p>© {new Date().getFullYear()} DragonMates · Built for Drexel University</p>
      </footer>
    </div>
  );
}
