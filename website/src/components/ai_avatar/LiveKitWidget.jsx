import { useState, useCallback, useEffect } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import AvatarVoiceAgent from "./AvatarVoiceAgent";
import "./LiveKitWidget.css";

const LiveKitWidget = ({ setShowSupport }) => {
  const [token, setToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const getToken = useCallback(async () => {
    try {
      console.log("run");
      const response = await fetch(
        `/api/getToken?name=${encodeURIComponent("admin")}`
      );
      const token = await response.text();
      
      setToken(token);
      setIsConnecting(false);
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    getToken();
  }, [getToken]);

  return (
    
    <div className="modal-content">
      <div className="support-room">
        {isConnecting ? (
          <div className="connecting-status">
            <h2>Initiating the call...</h2>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowSupport(false)}
            >
              Cancel
            </button>
          </div>
        ) : token ? (
          <LiveKitRoom
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
            token={token}
            connect={true}
            connectOptions={{
              // Many US corporate/VPN networks block UDP; force TURN relay
              rtcConfig: { iceTransportPolicy: "relay" },
              // Some LiveKit client builds expect rtcConfiguration
              rtcConfiguration: { iceTransportPolicy: "relay" },
            }}
            video={false}
            audio={true}
            onDisconnected={() => {
              setShowSupport(false);
              setIsConnecting(true);
            }}
          >
            <RoomAudioRenderer />
            <AvatarVoiceAgent />
          </LiveKitRoom>
        ) : null}
      </div>
    </div>
  );
};

export default LiveKitWidget;