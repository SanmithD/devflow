import { prisma } from "../src/lib/db";

export class ArchiveRepository {

    insertArchive = async ({ userId, id, ip }: { userId: number; id: number; ip: string }) => {
        try {

            if (!id || !userId) {
                return {
                    success: false,
                    message: 'id and userId is required',
                }
            }

            // find is project exits
            const isProjectExists = await prisma.project.findFirst({
                where: { id, userId, status: 1 }
            });

            if (!isProjectExists) {
                return {
                    success: false,
                    message: 'Project not found',
                }
            }

            // create archive document
            const moveToArchive = await prisma.archive.create({
                data: {
                    userId,
                    title: isProjectExists?.title,
                    status: 1,
                    projectId: id
                }
            });

            if (!moveToArchive) {
                return {
                    success: false,
                    message: 'Fail to move archive',
                }
            }

            // update project status
            await prisma.project.update({
                where: { id },
                data: {
                    status: 2 // archived
                }
            });

            // create audit trail
            await prisma.auditTrial.create({
                data: {
                    userId,
                    action: 'insert',
                    table: 'archive',
                    ipAddress: ip
                }
            })

            return {
                success: true,
                message: 'Project moved to archive',
            }

        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }

    findArchive = async ({ userId, limit }: { userId: number; limit: number }) => {
        try {

            if (!limit || !userId) {
                return {
                    success: false,
                    data: null,
                    message: 'Limit and userId is required',
                }
            }

            const res = await prisma.archive.findMany({
                where: {
                    userId: Number(userId),
                    status: 1
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            if (!res) {
                return {
                    success: false,
                    data: null,
                    message: 'Project not found'
                }
            }

            return {
                success: true,
                data: res,
                message: 'Project found'
            }

        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }

    updateArchive = async ({ id, userId, title, ip, status }: { id: number; userId: number; title: string; ip: string; status: number; }) => {
        try {

            if (!id || !userId || !title) {
                return {
                    success: false,
                    message: 'Id, Title and userId is required',
                }
            }

            const res = await prisma.archive.update({
                where: { id },
                data: { title, status }
            });

            if (!res) {
                return {
                    success: false,
                    message: 'Project not found'
                }
            }

            // if status is 2 Inactive
            if(status === 2){
                await prisma.project.update({
                    where: { id: id, userId },
                    data: { status: 1 }
                })
            }

            // create audit trial
            await prisma.auditTrial.create({
                data: {
                    userId,
                    action: 'update',
                    table: 'archive',
                    ipAddress: ip
                }
            });

            return {
                success: true,
                message: 'Project updated'
            }
        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }

    deleteArchive = async ({ id, userId, ip }: { id: number; userId: number; ip: string }) => {
        try {

            if (!id || !userId) {
                return {
                    success: false,
                    message: 'Id and userId is required',
                }
            }

            const res = await prisma.project.delete({
                where: { id, userId }
            });

            if (!res) {
                return {
                    success: false,
                    message: 'Project not found'
                }
            }

            await prisma.auditTrial.create({
                data: {
                    userId,
                    action: 'delete',
                    table: 'archive',
                    ipAddress: ip
                }
            });

            return {
                success: true,
                message: 'Project deleted'
            }
        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }

    deleteAllSavedArchive = async ({ userId, ip }: { userId: number; ip: string }) => {
        try {

            if (!userId) {
                return {
                    success: false,
                    message: 'userId is required',
                }
            }

            const res = await prisma.archive.deleteMany({
                where: { userId }
            });

            if (!res) {
                return {
                    success: false,
                    message: 'Project not found'
                }
            }

            await prisma.auditTrial.create({
                data: {
                    userId,
                    action: 'delete all',
                    table: 'archive',
                    ipAddress: ip
                }
            });

            return {
                success: true,
                message: 'All Archive Project deleted'
            }
        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }
}