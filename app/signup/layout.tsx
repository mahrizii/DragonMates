import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | DragonMates",
  description: "Join DragonMates to find your perfect roommate",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
