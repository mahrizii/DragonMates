import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | DragonMates",
  description: "Sign in to your DragonMates account",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
