import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | DragonMates",
  description: "Create a new DragonMates account",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
