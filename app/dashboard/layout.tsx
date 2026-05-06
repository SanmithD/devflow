import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "../ReactQueryProvider";
import { authOptions } from "../src/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div>
      <Toaster position="bottom-left" />
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </div>
  );
}
