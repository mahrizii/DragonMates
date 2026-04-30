import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#07294d]">
          DragonMates
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-3 text-gray-600">
          Your student profile details and roommate preferences live here.
        </p>
        <Link
          href="/preferences"
          className="mt-6 inline-block rounded-lg bg-[#07294d] px-6 py-2 font-semibold text-white transition hover:bg-[#0a3a6e]"
        >
          Edit Preferences
        </Link>
      </div>
    </div>
  );
}
