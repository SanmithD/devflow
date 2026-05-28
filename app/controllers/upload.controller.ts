import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { UploadRepository } from "../repository/upload.repository";
import { authOptions } from "../src/lib/auth";

export const uploadFiles = async (req: NextRequest) => {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
        }

        const userId = session?.user.id;

        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const projectIdRaw = formData.get('projectId');

        if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });

        if (!projectIdRaw || typeof projectIdRaw !== "string") {
            return NextResponse.json({ message: 'Invalid projectId' }, { status: 400 });
        }
        
        const projectId = Number(projectIdRaw);

        const uploadRepo = new UploadRepository();
        const meta_data = await uploadRepo.uploadMediaFiles(file, projectId);

        if (!meta_data) return NextResponse.json({ message: 'Failed to save' }, { status: 400 });

        return NextResponse.json({ message: 'File saved', data: meta_data }, { status: 201 });

    } catch (error) {
        console.log('server error', error);
        return NextResponse.json({ message: 'Server error' }, { status: 200 });
    }
}