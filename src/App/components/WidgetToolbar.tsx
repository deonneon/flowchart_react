import React from "react";

interface WidgetToolbarProps {
  id: string;
  onDelete: (id: string) => void;
}

function TrashIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="black"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M5 7l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -14" />
        <path d="M9 7v-3h6v3" />
      </svg>
    );
  }
  

const WidgetToolbar: React.FC<WidgetToolbarProps> = ({ id, onDelete }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "-20px",
        display: "flex",
        background: "rgba(255, 255, 255, 0.8)",
        padding: "1px",
        borderRadius: "4px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
        pointerEvents: "auto",
        zIndex: 10,
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
        onClick={() => onDelete(id)}
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default WidgetToolbar; 