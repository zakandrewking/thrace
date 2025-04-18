import React from 'react';

// Updated panel style for mobile
const panelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "10px", // Position at the bottom
  left: "50%", // Center horizontally
  transform: "translateX(-50%)", // Fine-tune centering
  width: "calc(100% - 20px)", // Responsive width with padding
  maxWidth: "400px", // Max width on larger screens
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  color: "white",
  padding: "10px",
  borderRadius: "8px",
  fontFamily: "sans-serif",
  fontSize: "14px",
  zIndex: 1000,
  textAlign: "center", // Center content
};

// Style for grouping step buttons
const stepGroupStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-around", // Space out step buttons
  marginBottom: "10px",
};

// Style for individual step buttons
const stepButtonStyle: React.CSSProperties = {
  flex: "1", // Allow buttons to share space
  margin: "0 5px", // Add spacing between buttons
  padding: "8px 5px",
  backgroundColor: "#444",
  color: "white",
  border: "1px solid #666",
  borderRadius: "5px",
  cursor: "pointer",
  textAlign: "center",
  fontSize: "12px", // Slightly smaller text
};

const stepButtonActiveStyle: React.CSSProperties = {
  ...stepButtonStyle,
  backgroundColor: "#0077ff",
  borderColor: "#0055cc",
};

// Style for zoom controls row
const zoomGroupStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "10px",
};

// Style for zoom buttons
const zoomButtonStyle: React.CSSProperties = {
  padding: "8px 15px",
  margin: "0 10px", // Space around zoom buttons
  backgroundColor: "#555",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1.2em", // Larger font for zoom
};

// Define props interface
interface SimulationControlsProps {
  // Step toggles
  showBoundary: boolean;
  setShowBoundary: (show: boolean) => void;
  showFuel: boolean;
  setShowFuel: (show: boolean) => void;
  // Zoom handlers
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function SimulationControls({
  showBoundary,
  setShowBoundary,
  showFuel,
  setShowFuel,
  onZoomIn,
  onZoomOut,
}: SimulationControlsProps) {
  return (
    <div style={panelStyle}>
      {/* Simulation Step Toggles */}
      <div style={stepGroupStyle}>
        <button
          style={showBoundary ? stepButtonActiveStyle : stepButtonStyle}
          onClick={() => setShowBoundary(!showBoundary)}
        >
          {showBoundary ? "Hide Boundary" : "Show Boundary"}
        </button>
        <button
          style={showFuel ? stepButtonActiveStyle : stepButtonStyle}
          onClick={() => setShowFuel(!showFuel)}
        >
          {showFuel ? "Hide Fuel" : "Show Fuel"}
        </button>
      </div>

      {/* Zoom Controls */}
      <div style={zoomGroupStyle}>
        <button style={zoomButtonStyle} onClick={onZoomOut} title="Zoom Out">
          -
        </button>
        <span
          style={{ minWidth: "40px", textAlign: "center", fontSize: "12px" }}
        >
          Zoom
        </span>
        <button style={zoomButtonStyle} onClick={onZoomIn} title="Zoom In">
          +
        </button>
      </div>
      {/* Removed Parameter Sliders */}
      {/* Removed Parameter details */}
    </div>
  );
}
