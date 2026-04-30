import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
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
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </div>
  );
}
