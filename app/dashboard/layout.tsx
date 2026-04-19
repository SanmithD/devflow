import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export  default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = getServerSession();

    if(!session){
        redirect("/login")
    }

    return <div>{children}</div>
}