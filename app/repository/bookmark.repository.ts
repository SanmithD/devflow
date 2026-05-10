import { prisma } from "../src/lib/db";

export class BookmarkRepository {

    insertToBookmark = async ({ userId, id, ip }: { userId: number; id: number; ip: string }) => {
        try {

            if (!id || !userId) {
                return {
                    success: false,
                    message: 'id and userId is required',
                }
            }

            // find is project exits
            const isProjectExists = await prisma.project.findFirst({
                where: { id, userId }
            });

            let isProjectExistsInArchive;
            let moveToArchive;

            if (!isProjectExists) {
                isProjectExistsInArchive = await prisma.archive.findFirst({
                    where: { id, userId }
                });

                if (!isProjectExistsInArchive) {
                    return {
                        success: false,
                        message: 'Project not found',
                    }
                }

                moveToArchive = await prisma.bookmark.create({
                    data: {
                        userId,
                        title: isProjectExistsInArchive?.title,
                        projectId: isProjectExistsInArchive?.projectId
                    }
                });

            } else {
                // create archive document
                moveToArchive = await prisma.bookmark.create({
                    data: {
                        userId,
                        title: isProjectExists?.title,
                        projectId: id
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
                    table: 'bookmark',
                    ipAddress: ip
                }
            })

            return {
                success: true,
                message: 'Project bookmarked',
            }

        } catch (error) {
            console.log('Server error', error);
            return {
                success: false,
                message: 'Internal Server error',
            }
        }
    }

    getAllBookmarked = async ({ userId, limit }: { userId: number; limit: number }) => {
        try {

            if (!limit || !userId) {
                return {
                    success: false,
                    data: null,
                    message: 'Limit and userId is required',
                }
            }

            const res = await prisma.bookmark.findMany({
                where: {
                    userId: Number(userId),
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

    removeProjectFromBookmark = async ({ id, userId, ip }: { id: number; userId: number; ip: string }) => {
        try {

            if (!id || !userId) {
                return {
                    success: false,
                    message: 'Id and userId is required',
                }
            }

            const res = await prisma.bookmark.delete({
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
                    table: 'bookmark',
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
}