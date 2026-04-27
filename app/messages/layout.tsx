import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | DragonMates",
  description: "View your messages",
};

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
