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

            let isProjectExistsInBookmark;
            let moveToArchive;

            if (!isProjectExists) {
                isProjectExistsInBookmark = await prisma.bookmark.findFirst({
                    where: { id, userId }
                });

                if (!isProjectExistsInBookmark) {
                    return {
                        success: false,
                        message: 'Project not found',
                    }
                }

                moveToArchive = await prisma.archive.create({
                    data: {
                        userId,
                        title: isProjectExistsInBookmark?.title,
                        projectId: isProjectExistsInBookmark?.projectId,
                        status: 1
                    }
                });

                // update project status
                await prisma.project.update({
                    where: { id: isProjectExistsInBookmark.projectId },
                    data: {
                        status: 2 // archived
                    }
                });

            } else {
                // create archive document
                moveToArchive = await prisma.archive.create({
                    data: {
                        userId,
                        title: isProjectExists?.title,
                        projectId: id,
                        status: 1
                    }
                });

                // update project status
                await prisma.project.update({
                    where: { id },
                    data: {
                        status: 2 // archived
                    }
                });
            }

            if (!moveToArchive) {
                return {
                    success: false,
                    message: 'Fail to move archive',
                }
            }

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

    findArchive = async ({ userId, limit = 40 }: { userId: number; limit: number }) => {
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

    updateArchive = async ({ id, userId, ip, updateArchiveArgs }: { id: number; userId: number; updateArchiveArgs: any; ip: string;}) => {
        try {

            if (!id || !userId) {
                return {
                    success: false,
                    message: 'Id and userId is required',
                }
            }

            const res = await prisma.archive.update({
                where: { id },
                data: { ...updateArchiveArgs }
            });

            if (!res) {
                return {
                    success: false,
                    message: 'Project not found'
                }
            }

            // if status is 2 Inactive
            if (updateArchiveArgs?.status === 2) {
                await prisma.project.update({
                    where: { id: res?.projectId, userId },
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