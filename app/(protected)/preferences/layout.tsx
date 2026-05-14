import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferences | DragonMates",
  description: "Set your roommate preferences",
};

export default function PreferencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
