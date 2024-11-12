import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type { youtubeAPI } from "./types";

import { Fragment } from "react";

export function Search({
    setVideoId
}: {
    setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
    const [videoSearch, setVideoSearch] = useState("");
    console.log(videoSearch)

    const { isPending, error, data } = useQuery<youtubeAPI>({
        queryKey: ["videoSearch", videoSearch],
        queryFn: () =>
            fetch(
                "https://www.googleapis.com/youtube/v3/search?" +
                    new URLSearchParams({
                        part: "snippet",
                        q: videoSearch,
                        maxResults: "25",
                        key: "AIzaSyAWzPr2cdubXGfUIYMN8-g5HyMDgq9wS5U",
                        type: "video"
                    })
            ).then(res => res.json()),
    });

    if (error) return "An error has occurred: " + error.message;

    return (
        <>
            <input
                type="text"
                value={videoSearch}
                onChange={event => {
                    setVideoSearch(event.target.value);
                }}
            />
            {isPending
                ? "Loading..."
                : data.items.map(item => (
                      <Fragment key={item.id.videoId}>
                          <h1>{item.snippet.title}</h1>
                          <p>{item.snippet.description}</p>
                          <button
                              key={item.id.videoId}
                              onClick={() => setVideoId(item.id.videoId)}
                          >
                              honjk
                          </button>
                      </Fragment>
                  ))}
        </>
    );
}
