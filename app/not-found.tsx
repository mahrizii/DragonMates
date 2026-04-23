// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#07294d] px-6 text-center font-[family-name:var(--font-geist-sans)]">

      {/* Dragon emoji */}
      <div className="text-8xl mb-4" aria-hidden="true">
        🐉
      </div>

      {/* 404 heading */}
      <h1 className="text-[130px] font-extrabold leading-none text-[#ffc600] tracking-tight">
        404
      </h1>

      {/* Subtitle */}
      <h2 className="mt-2 text-2xl font-bold text-white tracking-wide">
        Page Not Found
      </h2>

      {/* Description */}
      <p className="mt-3 max-w-sm text-blue-200 text-base leading-relaxed">
        Looks like this dragon flew off course. The page you&apos;re looking for
        doesn&apos;t exist or may have been moved.
      </p>

      {/* Home button */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 bg-[#ffc600] text-[#07294d] font-bold text-base px-8 py-3 rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Back to Home
      </Link>

    </main>
  );
}