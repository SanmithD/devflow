import { LogoutButton } from "../auth/logout/page";

export default async function DashboardPage() {

  return <div>
    <h1>Dashboard</h1>
    <div>
      <LogoutButton/>
    </div>
  </div>;
}