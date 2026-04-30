import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | DragonMates",
  description: "Browse and explore potential roommates",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
