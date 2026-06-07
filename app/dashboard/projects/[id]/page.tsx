import { getUser } from "@/app/src/lib/getUser";
import DashboardPage from "../../page";

export default async function ProjectPage() {
  const user = await getUser();

  if (!user) throw new Error("User not found");

  return <DashboardPage user={user} />;
}
