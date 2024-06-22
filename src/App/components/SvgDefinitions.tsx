const SvgDefinitions = () => (
  <svg id="defs" style={{ width: 0, height: 0, position: "absolute" }}>
    <defs>
      <marker
        id="arrow"
        markerWidth="10" // increased width
        markerHeight="10" // increased height
        refX="6" // offset the arrow head
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
        viewBox="0 0 10 10"
      >
        <path d="M0,0 L0,6 L9,3 z" fill="#333" />
      </marker>
    </defs>
  </svg>
);

export default SvgDefinitions;
