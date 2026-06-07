type ArchiveMessage = {
id: number;
    title: string;
    userId: number;
    projectId: number;
    status: 1,
    createdAt: string;
}

export interface ArchiveDetailsType {
    messages: ArchiveMessage[];
    nextCursor?: boolean | null;
    hasMore: boolean
}