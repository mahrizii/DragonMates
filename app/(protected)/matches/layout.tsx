import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches | DragonMates",
  description: "View your roommate matches",
};

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
