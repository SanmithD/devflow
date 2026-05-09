"use client";

import Archive from "./tabs/Archive";


function Details({ isActive }: { isActive: boolean }) {
    
  return (
    <div><Archive isActive={isActive} /></div>
  )
}

export default Details