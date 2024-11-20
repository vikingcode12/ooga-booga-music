import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Fragment } from "react";

import type { youtubeAPI } from "./types";
import PartySocket from "partysocket";
import keys from "./keys.json";

export function Search({
    setVideoId,
    ws
}: {
    setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
    ws: PartySocket;
}) {
    const [videoSearch, setVideoSearch] = useState("");
    const [debouncedVideoSearch, setDebouncedVideoSearch] = useState("");
    const [videoPlaying, setVideoPlaying] = useState("");
    const resultCount = 3;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedVideoSearch(videoSearch);
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [videoSearch]);

    const { isPending, error, data } = useQuery<youtubeAPI>({
        queryKey: ["videoSearch", debouncedVideoSearch],
        queryFn: () =>
            fetch(
                "https://www.googleapis.com/youtube/v3/search?" +
                    new URLSearchParams({
                        part: "snippet",
                        q: debouncedVideoSearch,
                        maxResults: resultCount.toString(),
                        key: keys[0],
                        type: "video"
                    })
            ).then(res => res.json()),
        enabled: debouncedVideoSearch !== "" // This is so when videoSearch is blank to stop query from running
    });

    if (error) return "An error has occurred: " + error.message;

    return (
        <>
            <div>{videoPlaying}</div>
            <input
                type="text"
                value={videoSearch}
                onChange={event => {
                    setVideoSearch(event.target.value);
                }}
            />
            {/* Make a skeleton for no data or loading data */}
            {/* When debounceSearch is different than the actual search results from videoSearch
                We make sure that we're in skeleton instead of showing previous results even while typing
                We could try using the new optimistic hooks in react */}
            {(videoSearch === debouncedVideoSearch && data?.items
                ? data.items
                : [...Array(resultCount).keys()].map(index => ({
                      id: {
                          videoId: index
                      },
                      snippet: {
                          title: "string",
                          description: "string"
                      }
                  }))
            ).map(item => (
                <Fragment key={item.id.videoId}>
                    <h1>{item.snippet.title}</h1>
                    <p>{item.snippet.description}</p>
                    <button
                        onClick={() => {
                            ws.send(
                                "Player has suggested " + item.snippet.title
                            );
                            // setVideoId(item.id.videoId);
                        }}
                    >
                        honjk
                    </button>
                </Fragment>
            ))}
        </>
    );
}
