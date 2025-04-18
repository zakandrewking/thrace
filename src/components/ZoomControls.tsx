import React from 'react';

// Remove R3F/Drei imports
// import * as THREE from 'three';
// import { Html } from '@react-three/drei';
// import { useThree } from '@react-three/fiber';

// Simplified base style
const buttonStyle: React.CSSProperties = {
  position: "absolute", // Position relative to the parent div in Step0
  top: "20px",
  padding: "10px 15px",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1.5em",
  zIndex: 1000, // Ensure buttons are on top of the canvas
};

// Define props interface
interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({
  onZoomIn,
  onZoomOut,
}: ZoomControlsProps) {
  // Remove camera logic, it will be handled in Step0

  return (
    // Return plain buttons, no <Html> wrapper
    <>
      <button
        // Keep positioning simple
        style={{ ...buttonStyle, left: "20px" }}
        onClick={onZoomOut} // Use prop callback
        title="Zoom Out"
      >
        -
      </button>
      <button
        style={{ ...buttonStyle, left: "70px" }}
        onClick={onZoomIn} // Use prop callback
        title="Zoom In"
      >
        +
      </button>
    </>
  );
}
