import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type { youtubeAPI } from "./types";

export function Search({
    setVideoId
}: {
    setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
    const [videoSearch, setVideoSearch] = useState("");

    const { isPending, error, data } = useQuery<youtubeAPI>({
        queryKey: ["videoSearch"],
        queryFn: () =>
            fetch(
                "https://www.googleapis.com/youtube/v3/search?" +
                    new URLSearchParams({
                        part: "snippet",
                        q: "chromakopia",
                        maxResults: "25",
                        key: "AIzaSyAWzPr2cdubXGfUIYMN8-g5HyMDgq9wS5U",
                        type: "video"
                    })
            ).then(res => res.json()),
    });

    if (isPending) return "Loading...";

    if (error) return "An error has occurred: " + error.message;

    return data.items.map(item => (
        <>
            <h1>{item.snippet.title}</h1>
            <p>{item.snippet.description}</p>
            <button
                key={item.id.videoId}
                onClick={() => setVideoId(item.id.videoId)}
            >
                honjk
            </button>
        </>
    ))
}
