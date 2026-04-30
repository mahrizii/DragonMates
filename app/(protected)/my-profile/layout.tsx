import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | DragonMates",
  description: "View your roommate profile",
};

export default function MyProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
