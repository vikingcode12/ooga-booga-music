import { useRef, useState, useEffect } from "react";
import { Search } from "./Search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import usePartySocket from "partysocket/react";
import YouTube, { type YouTubePlayer } from 'react-youtube';
import type { VideoInfoMessage, VideoIdMessage } from "../types/index"

const queryClient = new QueryClient();

// Define player states as constants for clarity
const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

export default function App() {
  const [player, setPlayer] = useState<YouTubePlayer>();
  const [videoId, setVideoId] = useState<string>("7bK5EPjGri4");
  const [messages, setMessages] = useState<string[]>([]);
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  
  // Refs to track player state
  const lastState = useRef(0);
  const isRemoteChange = useRef(false);
  const isBuffering = useRef(false);
  
  // Time sync tolerance (in seconds)
  const TIME_SYNC_TOLERANCE = 2;

  const ws = usePartySocket({
    host: "https://humble-pancake-g655xpppgx92749-1999.app.github.dev/",
    room: new URL(document.location.toString()).searchParams.get("room") ?? "main",
    onOpen() {
      console.log("Connected to room");
      setSyncStatus("Connected");
    },
    onMessage(e) {
      try {
        const data = JSON.parse(e.data);
        console.log("Received message:", data);

        // Handle string messages (like notifications)
        if (typeof data === "string") {
          // Check if the message indicates a leader change
          if (data.includes("is now the session leader")) {
            const newLeader = data.split(" ")[0];
            setIsLeader(newLeader === ws.id);
          }
          
          setMessages(prev => [...prev.slice(-4), data]);
          return;
        }

        // Skip processing our own messages unless it's a broadcast from server
        if (data.userId === ws.id && !data.broadcast) {
          return;
        }

        // Handle video ID changes
        if (data.id === "videoId") {
          isRemoteChange.current = true;
          setVideoId((data as VideoIdMessage).videoId);
          return;
        }

        // Handle video playback info
        if (data.id === "videoInfo" && player) {
          isRemoteChange.current = true;
          
          const { playing, time, buffering, userId, start } = data as VideoInfoMessage;
          
          // Track buffering users
          if (buffering !== undefined && userId) {
            setBufferingUsers(prev => {
              const newSet = new Set(prev);
              if (buffering) {
                newSet.add(userId);
              } else {
                newSet.delete(userId);
              }
              return newSet;
            });
          }
          
          // If anyone is buffering, we pause
          if (buffering) {
            player.pauseVideo();
            return;
          }
          
          // Check if we need to sync time (if difference is significant)
          const currentTime = player.getCurrentTime();
          const timeDiff = currentTime - time;
          
          // if (timeDiff > TIME_SYNC_TOLERANCE || start) {
          //   player.seekTo(time + timeDiff, true);
          //   setSyncStatus(`Synced time: ${time.toFixed(1)}s`);
          // }

          // Apply play/pause state
          if (playing) {
            player.seekTo(time + timeDiff * 1.05, true);
            player.playVideo();  
            setSyncStatus("Playback resumed");
          } else {
            player.seekTo(time, true);
            player.pauseVideo();
            setSyncStatus("Playback paused");
          }
          
          // Reset remote change flag - insures this runs after the yotube player 
          window.requestAnimationFrame(() => {
            isRemoteChange.current = false;
          });
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
    onClose() {
      console.log("Connection closed");
      setSyncStatus("Disconnected");
    },
    onError(e) {
      console.error("WebSocket error:", e);
      setSyncStatus("Connection error");
    }
  });

  // Send buffering status to server
  const handleBufferingChange = (isBuffering: boolean) => {
    if (!player) return;
    
    ws.send(
      JSON.stringify({
        id: "videoInfo",
        playing: !isBuffering && player.getPlayerState() === PLAYER_STATE.PLAYING,
        time: player.getCurrentTime(),
        buffering: isBuffering
      })
    );
  };

  // Track all users' buffering states
  const [bufferingUsers, setBufferingUsers] = useState<Set<string>>(new Set());
  
  // Update UI when buffering users change
  useEffect(() => {
    if (bufferingUsers.size > 0) {
      setSyncStatus(`Waiting for ${bufferingUsers.size} user(s) to buffer...`);
    }
  }, [bufferingUsers]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Welcome to Ooga Booga Music</h1>
        <h2>Spen!</h2>
        
        <span>{syncStatus}</span>
        <br />
        
        <YouTube 
          videoId={videoId} 
          opts={{
            height: "360",
            width: "640",
          }} 
          onReady={(e) => {
            setPlayer(e.target);
            // Send initial state when player is ready
            ws.send(
              JSON.stringify({
                id: "videoInfo",
                playing: false,
                time: 0,
                buffering: false
              })
            );
          }} 
          onStateChange={(e) => {
            const state = e.target.getPlayerState();
            console.log("Player state changed:", state);
             
            
            // Handle buffering state
            // if (state === PLAYER_STATE.BUFFERING) {
            //   isBuffering.current = true;
            //   handleBufferingChange(true);
            // } else if (isBuffering.current && 
            //           (state === PLAYER_STATE.PLAYING || 
            //            state === PLAYER_STATE.PAUSED)) {
            //   // No longer buffering
            //   isBuffering.current = false;
            //   handleBufferingChange(false);
            // }
            
            // Only send updates if this is a local change (not from remote)
            if (!isRemoteChange.current) {
              if (state === PLAYER_STATE.PLAYING) {
                ws.send(
                  JSON.stringify({
                    id: "videoInfo",
                    playing: true,
                    time: e.target.getCurrentTime()
                  })
                );
              } else if (state === PLAYER_STATE.PAUSED) {
                ws.send(
                  JSON.stringify({
                    id: "videoInfo",
                    playing: false,
                    time: e.target.getCurrentTime()
                  })
                );
              }
            }
            
            lastState.current = state;
          }}
          onPlay={() => {
            // Additional handler if needed
          }}
          onPause={() => {
            // Additional handler if needed
          }}
          onEnd={() => {
            // Handle video end
            ws.send(
              JSON.stringify({
                id: "videoInfo",
                playing: false,
                time: player?.getDuration() || 0
              })
            );
          }}
          onError={(e) => {
            console.error("YouTube player error:", e);
            setSyncStatus("Player error occurred");
          }}
        />
        
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className="message">{msg}</div>
          ))}
        </div>
        
        <Search setVideoId={(id) => {
          setVideoId(id);
          ws.send(
            JSON.stringify({
              id: "videoId",
              videoId: id
            })
          );
        }} ws={ws} />
      </div>
    </QueryClientProvider>
  );
}