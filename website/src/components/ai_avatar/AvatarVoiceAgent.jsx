import {
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useTracks, VideoTrack } from '@livekit/components-react';
import "./AvatarVoiceAgent.css";

const Message = ({ type, text }) => {
  return <div className="message">
    <strong className={`message-${type}`}>
      {type === "agent" ? "Agent: " : "You: "}
    </strong>
    <span className="message-text">{text}</span>
  </div>;
};

const AvatarVoiceAgent = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const room = useRoomContext();
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });
  // Include camera and unknown sources to catch custom video publishers
  const trackRefs = useTracks([Track.Source.Camera, Track.Source.Unknown]);
  // Prefer any non-local (remote) video track; fall back to matching agent identity/name
  const agentVideoTrackRef =
    trackRefs.find((tr) => tr?.participant && !tr.participant.isLocal) ||
    trackRefs.find(
      (tr) =>
        tr?.participant?.identity === "agent" ||
        tr?.participant?.name === "agent"
    );

  const [messages, setMessages] = useState([]);
  // Track which transcription segments have been sent already without causing re-renders
  const sentKeysRef = useRef(new Set());

  useEffect(() => {
    const allMessages = [
      ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" })) ?? []),
      ...(userTranscriptions?.map((t) => ({ ...t, type: "user" })) ?? []),
    ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
    setMessages(allMessages);
  }, [agentTranscriptions, userTranscriptions]);

  // Push new transcription segments to the backend for persistent logging
  useEffect(() => {
    const backendUrl = (import.meta.env?.VITE_BACKEND_URL) || "/api";
    const roomName = room?.name || "unknown-room";
    const toSend = [];

    for (const m of messages) {
      const key = `${m.type}:${m.firstReceivedTime}`;
      if (!sentKeysRef.current.has(key)) {
        sentKeysRef.current.add(key);
        toSend.push({
          room: roomName,
          type: m.type,
          text: m.text || m.alternatives?.[0]?.text || "",
          ts: m.firstReceivedTime,
          participant:
            m.participantIdentity ||
            (m.type === "user"
              ? localParticipant?.localParticipant?.identity
              : "agent"),
        });
      }
    }

    if (toSend.length > 0) {
      for (const payload of toSend) {
        fetch(`${backendUrl}/transcriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => { });
      }
    }
  }, [messages, room, localParticipant]);

  return (
    <div className="voice-assistant-container">
      <div className="visualizer-container">
        <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      </div>
      <>
        {agentVideoTrackRef ? (
          <VideoTrack trackRef={agentVideoTrackRef} />
        ) : (
          <div>Calling your Scrum Master...</div>
        )}
      </>
      <div className="control-section">
        <VoiceAssistantControlBar />
      </div>
    </div>
  );
};

export default AvatarVoiceAgent;
