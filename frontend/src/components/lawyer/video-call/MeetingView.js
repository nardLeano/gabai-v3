import React, { useState, useEffect } from "react";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk"; // Importing custom hooks for managing participants and meetings
import ParticipantView from "./ParticipantView"; // Importing ParticipantView component
import Controls from "./Controls"; // Importing Controls component

const btnStyle = "p-2 rounded-xl bg-azure text-white"; // Button style

function MeetingView(props) {
  const [joined, setJoined] = useState(null); // State to track meeting join status
  const [mediaStream, setMediaStream] = useState(null); // State to hold media stream

  // Destructuring functions from useMeeting hook
  const { join, participants, toggleWebcam, toggleMic } = useMeeting({
    // Callback for meeting joined event
    onMeetingJoined: () => {
      setJoined("JOINED"); // Update joined state to indicate successful meeting join
    },
    // Callback for meeting left event
    onMeetingLeft: () => {
      props.onMeetingLeave(); // Call parent component's onMeetingLeave function
    },
  });

  // Effect to request access to user's media devices (webcam and microphone)
  useEffect(() => {
    const requestMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        }); // Requesting access to webcam and microphone
        setMediaStream(stream); // Set the media stream to state
      } catch (error) {
        console.error("Error accessing media devices:", error); // Log error if access is denied or fails
      }
    };

    requestMediaStream(); // Call the function to request media stream

    // Cleanup function to stop media tracks when component unmounts
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop()); // Stop all tracks in the media stream
      }
    };
  }, []);

  // Function to join the meeting
  const joinMeeting = () => {
    setJoined("JOINING"); // Update joined state to indicate joining
    join(); // Call the join function from the useMeeting hook
  };

  return (
    <div>
      <div className="container">
        <h3>Meeting Id: {props.meetingId}</h3> {/* Display meeting ID */}
        {joined && joined === "JOINED" ? ( // If meeting joined successfully
          <div>
            {/* Display preview of user's webcam and microphone */}
            {mediaStream && (
              <div className="bg-gray-300 flex flex-row items-center justify-center w-[480px] h-[360px] rounded-xl">
                {" "}
              </div>
            )}
            {/* Render ParticipantView component for each participant */}
            {[...participants.keys()].map((participantId) => (
              <div>
                <ParticipantView
                  participantId={participantId} // Pass participant ID as prop
                  key={participantId}
                />
              </div>
            ))}
            <div></div>
            <Controls
              toggleWebcam={() => toggleWebcam()} // Pass toggleWebcam function to Controls component
              toggleMic={() => toggleMic()} // Pass toggleMic function to Controls component
            />
          </div>
        ) : joined && joined === "JOINING" ? ( // If joining the meeting
          <p>Joining the meeting...</p>
        ) : (
          <button onClick={joinMeeting} className={btnStyle}>
            Join
          </button> // Render join button
        )}
      </div>
    </div>
  );
}

export default MeetingView; // Export MeetingView component
