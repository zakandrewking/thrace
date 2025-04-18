import React from 'react';

// Styles (similar to previous mobile version, adjusted)
const panelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "calc(100% - 20px)",
  maxWidth: "450px", // Slightly wider for more text
  backgroundColor: "rgba(0, 0, 0, 0.8)", // Darker background
  color: "white",
  padding: "15px",
  borderRadius: "10px",
  fontFamily: "sans-serif",
  fontSize: "14px",
  zIndex: 1000,
  textAlign: "left", // Align text left for readability
};

const stageContainerStyle: React.CSSProperties = {
  marginBottom: "15px",
  paddingBottom: "15px",
  borderBottom: "1px solid #444",
};

const stageTitleStyle: React.CSSProperties = {
  margin: "0 0 5px 0",
  fontSize: "1.1em",
  color: "#aaa", // Dim color for titles
};

const stageDescStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
  fontSize: "0.95em",
  lineHeight: "1.4",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 15px",
  backgroundColor: "#0077ff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "1em",
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#555",
  cursor: "not-allowed",
};

// --- Stage Descriptions ---
const stageDescriptions = [
  {
    // Stage 0: Base environment
    title: "Primordial Ocean",
    desc: "An early Earth ocean, rich in dissolved CO2 but lacking complex life. A potential protocell structure exists.",
    buttonText: "Add Hydrothermal Vent",
  },
  {
    // Stage 1: Add Vent
    title: "Hydrothermal Vent",
    desc: "An alkaline hydrothermal vent releases chemically reduced compounds like H₂S from the Earth's crust.",
    buttonText: "Release H₂S Molecules",
  },
  {
    // Stage 2: Add H2S
    title: "Hydrogen Sulfide (H₂S)",
    desc: "H₂S provides a chemical energy source (redox potential) when reacting with dissolved CO₂.",
    buttonText: "Form Cell Boundary",
  },
  {
    // Stage 3: Add Boundary
    title: "Protocell Boundary",
    desc: "A lipid membrane forms, separating the internal environment and allowing energy capture.",
    buttonText: "Simulation Complete", // Or next step
  },
  {
    // Stage 4: Complete (or future steps)
    title: "Early Chemosynthesis",
    desc: "The protocell can now potentially harness the H₂S energy gradient.",
    buttonText: null, // No button for the last stage
  },
];

// --- Component Props ---
interface SimulationControlsProps {
  currentStage: number;
  setCurrentStage: (stage: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

// --- Component ---
export default function SimulationControls({
  currentStage,
  setCurrentStage,
  onZoomIn,
  onZoomOut,
}: SimulationControlsProps) {
  const canAdvance = currentStage < stageDescriptions.length - 1;
  const stageInfo = stageDescriptions[currentStage];

  const handleNextStage = () => {
    if (canAdvance) {
      setCurrentStage(currentStage + 1);
    }
  };

  return (
    <div style={panelStyle}>
      {/* Current Stage Info */}
      <div style={stageContainerStyle}>
        <h4 style={stageTitleStyle}>
          Stage {currentStage}: {stageInfo.title}
        </h4>
        <p style={stageDescStyle}>{stageInfo.desc}</p>
        {stageInfo.buttonText && (
          <button
            style={canAdvance ? buttonStyle : buttonDisabledStyle}
            onClick={handleNextStage}
            disabled={!canAdvance}
          >
            {stageInfo.buttonText}
          </button>
        )}
      </div>

      {/* Zoom Controls (kept separate for clarity) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          style={{ ...buttonStyle, padding: "5px 10px", marginRight: "10px" }}
          onClick={onZoomOut}
          title="Zoom Out"
        >
          -
        </button>
        <span style={{ fontSize: "0.9em" }}>Zoom</span>
        <button
          style={{ ...buttonStyle, padding: "5px 10px", marginLeft: "10px" }}
          onClick={onZoomIn}
          title="Zoom In"
        >
          +
        </button>
      </div>
    </div>
  );
}
