export interface youtubeAPI {
    items: {
        id: {
            videoId: string;
        };
        snippet: {
            title: string;
            description: string;
        };
    }[];
}
