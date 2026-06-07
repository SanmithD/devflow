export interface BookmarkActionTypes {
    item?: any;
    itemId?: string;
    openActionId: string | null | any;
    setOpenActionId: string | null | any;
}

export interface BookmarkMessages {
    id: number;
    userId: number;
    projectId: number;
    title: string;
    createdAt: string;
}

export interface BookmarkMessages {
    messages: BookmarkMessages[],
    nextCursor: number | boolean | null,
    hasMore: boolean
}