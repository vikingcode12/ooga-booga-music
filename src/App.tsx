import { useState } from "react";
import { Search } from "./Search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import usePartySocket from "partysocket/react";

const queryClient = new QueryClient();

export default function App() {
    const [videoId, setVideoId] = useState<string | null>("Z6dqIYKIBSU");

    const ws = usePartySocket({
        // usePartySocket takes the same arguments as PartySocket.
        host: "ws://rp4r6d-1999.csb.app/", // or localhost:1999 in dev
        room: "c-dog",

        // in addition, you can provide socket lifecycle event handlers
        // (equivalent to using ws.addEventListener in an effect hook)
        onOpen() {
            console.log("connected");
        },
        onMessage(e) {
            console.log("message", e.data);
        },
        onClose() {
            console.log("closed");
        },
        onError(e) {
            console.log("error", e);
        }
    });

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
