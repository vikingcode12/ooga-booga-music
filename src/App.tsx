import { useState } from "react";
import { Search } from "./Search";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
    const [videoId, setVideoId] = useState<string | null>("Z6dqIYKIBSU");

    return (
        <QueryClientProvider client={queryClient}>
            <div className="App">
                <h1>Welcome to Ooga Booga Music</h1>
                <h2>Spen!</h2>
                {videoId != null && (
                    <iframe
                        id="ytplayer"
                        width="640"
                        height="360"
                        src={`https://www.youtube.com/embed/${videoId}??controls=0&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=https%3A%2F%2Fjukebox.today&widgetid=1`}
                    ></iframe>
                )}
                <div>sio</div>
                <Search setVideoId={setVideoId}></Search>
            </div>
        </QueryClientProvider>
    );
}
