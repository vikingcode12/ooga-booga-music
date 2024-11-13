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
    console.log(videoSearch);

    const { isPending, error, data } = useQuery<youtubeAPI>({
        queryKey: ["videoSearch", videoSearch],
        queryFn: () =>
            fetch(
                "https://www.googleapis.com/youtube/v3/search?" +
                    new URLSearchParams({
                        part: "snippet",
                        q: videoSearch,
                        maxResults: "25",
                        key: "AIzaSyCH6iOA2Mmbl8tPzcqKQ_oI6p3xatVnUbs",
                        type: "video"
                    })
            ).then(res => res.json()),
        enabled: videoSearch !== "" // This is so when videoSearch is blank to stop query from running
    });

    if (error) return "An error has occurred: " + error.message;

    console.log(data);

    return (
        <>
            <input
                type="text"
                value={videoSearch}
                onChange={event => {
                    setVideoSearch(event.target.value);
                }}
            />
            {/* Make a skeleton for no data or loading data */}
            {isPending
                ? [...Array(10).keys()].map(item => (
                      <Fragment key={item}>
                          <h1>Load</h1>
                          <p>Load Desc</p>
                          <button>Load Button</button>
                      </Fragment>
                  ))
                : data.items?.map(item => (
                      <Fragment key={item.id.videoId}>
                          <h1>{item.snippet.title}</h1>
                          <p>{item.snippet.description}</p>
                          <button onClick={() => setVideoId(item.id.videoId)}>
                              honjk
                          </button>
                      </Fragment>
                  ))}
        </>
    );
}
