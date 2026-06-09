import { redirect } from "next/navigation";

export default function Home() {

  if(process.env.NODE_ENV === 'development'){
    redirect(`/dashboard`)
  }else{
    redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
  }
}
