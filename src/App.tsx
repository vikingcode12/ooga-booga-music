import { useRef, useState } from "react";
import { Search } from "./Search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import usePartySocket from "partysocket/react";
import YouTube, { type YouTubePlayer } from 'react-youtube';



const queryClient = new QueryClient();

export default function App() {
    //"u9n7Cw-4_HQ"
    const [player, setPlayer] = useState<YouTubePlayer>();
    const [videoId, setVideoId] = useState<string>("u9n7Cw-4_HQ"); // Turn into array of future videos
    const [message, setMessages] = useState("");
    const lastState = useRef(0)

    const ws = usePartySocket({
        host: "https://humble-pancake-g655xpppgx92749-1999.app.github.dev/", // or localhost:1999 in dev
        room: new URL(document.location.toString()).searchParams.get("room") ?? "main",
        onOpen() {
            console.log("connected");
        },
        onMessage(e) {
            const data = JSON.parse(e.data)
            console.log(data)

            if (typeof data === "string") return setMessages(data);

            if (data.id === "videoId") {
                return setVideoId(data.videoId)
            }

            if (data.id === "videoInfo") {
                const playing = data.playing
                const time = data.time

                player.seekTo(time, true)

                if (playing) {
                    player.playVideo();
                } else {
                    player.pauseVideo();
                }

            }
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
                <YouTube videoId={videoId} opts={{
                    height: "360",
                    width: "640",
                }} onReady={(e) => {
                    ws.send(
                        JSON.stringify({
                            id: "videoInfo",
                            playing: false,
                            time: 0,
                        })
                    );
                    setPlayer(e.target)
                }} onStateChange={(e) => {
                    const state = e.target.getPlayerState();

                    const PLAYER_STATE = {
                        UNSTARTED: -1,
                        ENDED: 0,
                        PLAYING: 1,
                        PAUSED: 2,
                        BUFFERING: 3,
                        CUED: 5
                    };
                    console.log("")
                    console.log("")
                    console.log(state)
                    console.log(lastState.current)

                    if (state === PLAYER_STATE.PLAYING  && lastState.current !== PLAYER_STATE.BUFFERING) {
                        ws.send(
                            JSON.stringify({
                                id: "videoInfo",
                                playing: true,
                                time: player.getCurrentTime(),
                            })
                        );
                    } else if (state === PLAYER_STATE.PAUSED) {
                        ws.send(
                            JSON.stringify({
                                id: "videoInfo",
                                playing: false,
                                time: player.getCurrentTime(),
                            })
                        );
                    }

                    lastState.current = state
                }}/>
                <div>{message}</div>
                <Search setVideoId={setVideoId} ws={ws}></Search>
            </div>
        </QueryClientProvider>
    );
}
