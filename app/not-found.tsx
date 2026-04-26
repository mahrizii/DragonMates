// app/not-found.tsx

import Link from "next/link";

export default function NotFound() {

   const DOTS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  duration: `${4 + (i % 4)}s`,
  delay: `${(i % 4)}s`,
}));
  return (

<main className="min-h-screen flex flex-col items-center justify-center bg-[#07294d] px-6 text-center relative overflow-hidden font-[family-name:var(--font-geist-sans)]">
     
     <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-[#ffc600] opacity-5 animate-pulse pointer-events-none" />
<div className="absolute bottom-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full bg-[#ffc600] opacity-5 animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
<div className="absolute top-1/2 left-[-200px] w-80 h-80 rounded-full bg-blue-400 opacity-5 animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />
   
   <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {DOTS.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-1 h-1 rounded-full bg-[#ffc600] opacity-30"
            style={{
              left: dot.left,
              top: dot.top,
              animation: `float ${dot.duration} ease-in-out infinite`,
              animationDelay: dot.delay,
            }}
          />
        ))}
      </div>
   
      {/* Dragon emoji */}
      <div className="relative mb-2">
  <div className="absolute inset-0 rounded-full bg-[#ffc600] opacity-20 blur-2xl scale-150 animate-pulse" />
  <div className="relative text-8xl select-none" style={{ animation: "dragonFloat 3s ease-in-out infinite" }} aria-hidden="true">
    🐉
  </div>
</div>

      {/* 404 heading */}
      <h1
  className="text-[130px] font-extrabold leading-none text-[#ffc600] tracking-tight"
  style={{
    textShadow: "0 0 40px rgba(255, 198, 0, 0.4), 0 0 80px rgba(255, 198, 0, 0.2)",
    animation: "fadeSlideUp 0.6s ease-out both",
  }}
>
  404
</h1>

<h2
  className="mt-2 text-2xl font-bold text-white tracking-wide"
  style={{ animation: "fadeSlideUp 0.6s ease-out 0.15s both" }}
>
  Page Not Found
</h2>

<p
  className="mt-3 max-w-sm text-blue-200 text-base leading-relaxed"
  style={{ animation: "fadeSlideUp 0.6s ease-out 0.25s both" }}
>
  Looks like this dragon flew off course. The page you&apos;re looking for
  doesn&apos;t exist or may have been moved.
</p>

<div className="mt-8 w-16 h-[2px] rounded-full bg-[#ffc600] mx-auto" style={{ animation: "fadeSlideUp 0.6s ease-out 0.35s both" }} />

      {/* Home button */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 bg-[#ffc600] text-[#07294d] font-bold text-base px-8 py-3 rounded-full shadow-lg transition-all duration-200 hover:bg-yellow-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,198,0,0.5)] active:scale-95"
        style={{ animation: "fadeSlideUp 0.6s ease-out 0.45s both" }}
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

<p
  className="mt-12 text-xs text-blue-300 opacity-50 tracking-widest uppercase"
  style={{ animation: "fadeSlideUp 0.6s ease-out 0.55s both" }}
>
  DragonMates &mdash; Drexel University Roommate Matching
</p>

<style>{`
        @keyframes dragonFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </main>
  );
}
