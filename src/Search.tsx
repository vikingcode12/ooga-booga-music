import { useRef } from "react";

import { useQuery } from "@tanstack/react-query";

export function Search({
    setVideoId
}: {
    setVideoId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
    const { isPending, error, data } = useQuery({
        queryKey: ["repoData"],
        queryFn: () =>
            fetch(
                "https://www.googleapis.com/youtube/v3/search?" +
                    new URLSearchParams({
                      part: "snippet",
                      q: "chromakopia",
                      maxResults: "25",
                      key: "AIzaSyAWzPr2cdubXGfUIYMN8-g5HyMDgq9wS5U",
                      type: "video"
                    }),
            ).then(res => res.json())
    });

    if (isPending) return "Loading...";

    if (error) return "An error has occurred: " + error.message;

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.description}</p>
            {data.items.map((item) => {
              const id = item.id.videoId
              return <button key={id} onClick={() => setVideoId(id)}>honjk</button>
            })}
        </div>
    );
}
