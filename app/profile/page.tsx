"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Page</h1>
        <p className="text-gray-600 mb-6">Your profile will be displayed here.</p>
        <Link
          href="/preferences"
          className="inline-block px-6 py-2 bg-[#07294d] text-white font-semibold rounded-lg hover:bg-[#0a3a6e] transition"
        >
          Edit Preferences
        </Link>
      </div>
    </div>
  );
}
