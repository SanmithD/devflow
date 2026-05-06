"use server"

import { NextResponse } from "next/server";

export const handleErrors = (error: any) => {
    console.error(error);

    return NextResponse.json({ message: 'Internal Server error' },{ status: 500 });
}