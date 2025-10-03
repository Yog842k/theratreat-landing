"use client";
import React, { useState } from "react";
import { HMSRoomProvider, useHMSActions, useHMSStore, selectIsConnectedToRoom } from "@100mslive/react-sdk";

function JoinRoomForm({ onJoin }: { onJoin: (name: string, room: string) => void }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onJoin(name, room);
      }}
      className="flex flex-col gap-2 max-w-xs mx-auto mt-10"
    >
      <input
        className="border p-2 rounded"
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded"
        placeholder="Room ID"
        value={room}
        onChange={e => setRoom(e.target.value)}
        required
      />
      <button className="bg-blue-600 text-white p-2 rounded" type="submit">
        Join Room
      </button>
    </form>
  );
}

function VideoRoom({ name, room }: { name: string; room: string }) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  React.useEffect(() => {
    const join = async () => {
      try {
        const res = await fetch("/api/100ms-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: name, room_id: room }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch token: ${res.status} ${text}`);
        }
        const data = await res.json();
        if (!data.token) {
          throw new Error("No token returned from API");
        }
        await hmsActions.join({ userName: name, authToken: data.token });
      } catch (err: any) {
        alert(err.message || "Failed to join room");
      }
    };
    join();
    // eslint-disable-next-line
  }, []);
  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold mb-4">Room: {room}</h2>
      {isConnected ? (
        <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
          {/* Video tiles would go here, but this is a minimal demo */}
          <span>Connected! (Video tiles not shown in this minimal demo)</span>
        </div>
      ) : (
        <span>Connecting...</span>
      )}
    </div>
  );
}

export default function Page() {
  const [joined, setJoined] = useState<{ name: string; room: string } | null>(null);
  return (
    <HMSRoomProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Minimal 100ms Video Call Demo</h1>
        {!joined ? (
          <JoinRoomForm onJoin={(name, room) => setJoined({ name, room })} />
        ) : (
          <VideoRoom name={joined.name} room={joined.room} />
        )}
      </div>
    </HMSRoomProvider>
  );
}
