import type * as Party from "partykit/server";

import type { VideoInfoMessage, VideoIdMessage } from "../types/index"

type ConnectionMessage = string;

type ServerMessage = VideoInfoMessage | VideoIdMessage | ConnectionMessage;

export default class Server implements Party.Server {
  // Track connected users and their states
  private users: Map<string, { buffering: boolean }> = new Map();
  // Track current video state
  private currentState: { playing: boolean; time: number; videoId: string } = {
    playing: false,
    time: 0,
    videoId: ""
  };
  // Track which user is the "leader" (first to connect becomes leader by default)
  private leader: string | null = null;

  constructor(readonly room: Party.Room) {
    console.log(`Room created: ${room.id}`);
  }

  async onStart() {
    console.log(`Room ${this.room.id} started`);
  }

  async onConnect(
    connection: Party.Connection,
    ctx: Party.ConnectionContext
  ) {
    // Add user to our tracking map
    this.users.set(connection.id, { buffering: false });
    
    // Set as leader if this is the first user
    if (this.leader === null) {
      this.leader = connection.id;
      console.log(`User ${connection.id} set as leader`);
    }
    
    // Notify everyone about the new connection
    this.room.broadcast(JSON.stringify(`${connection.id} has connected`));
    
    // Send current state to the new user
    if (this.currentState.videoId) {
      connection.send(JSON.stringify({
        id: "videoId",
        videoId: this.currentState.videoId
      } as VideoIdMessage));
      
      // Send video info immediately after videoId
      connection.send(JSON.stringify({
        id: "videoInfo",
        playing: this.currentState.playing,
        time: this.currentState.time,
        syncSequence: true // Indicates this is part of an initial sync sequence
      } as VideoInfoMessage));
    }
  }

  async onClose(connection: Party.Connection) {
    // Remove user from tracking
    this.users.delete(connection.id);
    
    // If leader disconnected, assign a new leader
    if (connection.id === this.leader) {
      const nextLeader = this.users.keys().next().value || null;
      this.leader = nextLeader;
      if (nextLeader) {
        console.log(`New leader assigned: ${nextLeader}`);
        this.room.broadcast(JSON.stringify(`${nextLeader} is now the session leader`));
      }
    }
    
    this.room.broadcast(JSON.stringify(`${connection.id} has disconnected`));
    console.log(`User ${connection.id} disconnected`);
  }

  async onError(connection: Party.Connection, error: Error) {
    console.log(`Error for user ${connection.id}:`, error);
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as ServerMessage;
      
      if (typeof data === "string") {
        // Handle string messages (like chat)
        this.room.broadcast(message);
        return;
      }

      // Add the sender's ID to the message
      const enhancedData = { ...data, userId: sender.id };
      
      switch (data.id) {
        case "videoId":
          // Update stored video ID
          this.currentState.videoId = data.videoId;
          this.currentState.time = 0;
          this.currentState.playing = false;
          break;
          
        case "videoInfo":
          // Handle buffering state
          if (data.buffering !== undefined) {
            const userState = this.users.get(sender.id);
            if (userState) {
              userState.buffering = data.buffering;
              
              // If any user is buffering, pause for everyone
              if (data.buffering) {
                const pauseMessage: VideoInfoMessage = {
                  id: "videoInfo",
                  playing: false,
                  time: data.time,
                  buffering: true
                };
                this.room.broadcast(JSON.stringify(pauseMessage));
                this.currentState.playing = false;
                return; // Don't broadcast the original message
              } else {
                // Check if all users are done buffering
                const anyBuffering = Array.from(this.users.values()).some(u => u.buffering);
                if (!anyBuffering && this.currentState.playing) {
                  // Resume playback for everyone
                  const resumeMessage: VideoInfoMessage = {
                    id: "videoInfo",
                    playing: true,
                    time: data.time,
                    buffering: false
                  };
                  this.room.broadcast(JSON.stringify(resumeMessage));
                  return; // Don't broadcast the original message
                }
              }
            }
          } else {
            // Update stored state with latest info
            this.currentState.playing = data.playing;
            this.currentState.time = data.time;
          }
          break;
      }
      
      // Broadcast the enhanced message to all clients
      this.room.broadcast(JSON.stringify(enhancedData));
      
    } catch (e) {
      console.error("Error processing message:", e);
    }
  }
}