export type VideoInfoMessage = {
    id: "videoInfo";
    playing: boolean;
    time: number;
    buffering?: boolean;
    userId?: string;
    start?: boolean;
};

export type VideoIdMessage = {
    id: "videoId";
    videoId: string;
    userId?: string;
};