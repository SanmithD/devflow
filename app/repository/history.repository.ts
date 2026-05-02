import { prisma } from "../src/lib/db";

export class HistoryRepository {

    findHistory = async ({ userId, limit }: { userId: number; limit: number }) => {
        try {

            if (!limit || !userId) {
                return {
                    success: false,
                    data: null,
                    message: 'Limit and userId is required',
                }
            }

            const res = await prisma.project.findMany({
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

    updateHistory = async ({ id, userId, title, ip }: { id: number; userId: number; title: string; ip: string }) => {
        try {

            if (!id || !userId || !title) {
                return {
                    success: false,
                    message: 'Id, Title and userId is required',
                }
            }

            const project = await prisma.project.findFirst({
                where: { id, userId }
            });

            if (!project) {
                return {
                    success: false,
                    message: 'Project not found or unauthorized'
                };
            }

            const res = await prisma.project.update({
                where: { id },
                data: { title }
            });

            if (!res) {
                return {
                    success: false,
                    message: 'Project not found'
                }
            }

            // create audit trial
            await prisma.auditTrial.create({
                data: {
                    userId,
                    action: 'update',
                    table: 'project',
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

    deleteHistory = async ({ id, userId, ip }: { id: number; userId: number; ip: string }) => {
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
                    table: 'project',
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