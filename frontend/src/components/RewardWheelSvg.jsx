import React from "react";

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSector(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function RewardWheelSvg() {
  const cx = 200;
  const cy = 200;
  const r = 168;

  const segments = [
    { label: "TRƯỢT", fill: "#D1D5DB", color: "#0F766E" },
    { label: "+10 ĐIỂM", fill: "#FACC15", color: "#14532D" },
    { label: "+20 ĐIỂM", fill: "#D1D5DB", color: "#0F766E" },
    { label: "+50 ĐIỂM", fill: "#16A34A", color: "#FFFFFF" },
    { label: "TRƯỢT", fill: "#D1D5DB", color: "#0F766E" },
    { label: "+10 ĐIỂM", fill: "#FACC15", color: "#14532D" },
    { label: "+20 ĐIỂM", fill: "#D1D5DB", color: "#0F766E" },
    { label: "+50 ĐIỂM", fill: "#16A34A", color: "#FFFFFF" },
  ];

  const angleSize = 360 / segments.length;
  const lightDots = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="8" floodOpacity="0.18" />
        </filter>

        <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#99F6E4" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0F9F99" />
        </linearGradient>

        <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#EAB308" />
        </radialGradient>

        <linearGradient id="lightArc1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="lightArc2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#99F6E4" stopOpacity="0" />
          <stop offset="50%" stopColor="#CCFBF1" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#99F6E4" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="194" fill="url(#outerGlow)" />

      {/* Viền xanh ngoài mỏng hơn */}
      <circle cx="200" cy="200" r="186" fill="url(#ringGradient)" filter="url(#wheelShadow)" />

      {/* Vòng trắng giữa để tách rõ */}
      <circle cx="200" cy="200" r="176" fill="#FFFFFF" opacity="0.98" />

      {/* Viền xanh trong mảnh */}
      <circle cx="200" cy="200" r="171" fill="none" stroke="#14B8A6" strokeWidth="4" />

      {/* Vệt sáng bay */}
      <circle
        cx="200"
        cy="200"
        r="182"
        fill="none"
        stroke="url(#lightArc1)"
        strokeWidth="4"
        strokeDasharray="110 1060"
        strokeLinecap="round"
        transform="rotate(-35 200 200)"
      />
      <circle
        cx="200"
        cy="200"
        r="178"
        fill="none"
        stroke="url(#lightArc2)"
        strokeWidth="3"
        strokeDasharray="90 1060"
        strokeLinecap="round"
        transform="rotate(38 200 200)"
      />

      {/* Đèn tròn quanh viền */}
      {lightDots.map((angle, idx) => {
        const p = polarToCartesian(cx, cy, 183, angle);
        return (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="8" fill="rgba(255,255,255,0.28)" />
            <circle cx={p.x} cy={p.y} r="5.3" fill="url(#dotGlow)" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        );
      })}

      {/* Mặt wheel */}
      {segments.map((segment, index) => {
        const startAngle = index * angleSize;
        const endAngle = startAngle + angleSize;
        const midAngle = startAngle + angleSize / 2;

        const textPoint = polarToCartesian(cx, cy, 108, midAngle);
        const rotation = midAngle - 90;

        return (
          <g key={index}>
            <path
              d={describeSector(cx, cy, r, startAngle, endAngle)}
              fill={segment.fill}
              stroke="#111827"
              strokeWidth="1.8"
            />
            <text
              x={textPoint.x}
              y={textPoint.y}
              fill={segment.color}
              fontSize="14"
              fontWeight="800"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${rotation} ${textPoint.x} ${textPoint.y})`}
              style={{ letterSpacing: "0.35px" }}
            >
              {segment.label}
            </text>
          </g>
        );
      })}

      <circle cx="200" cy="200" r="16" fill="url(#ringGradient)" stroke="#FFFFFF" strokeWidth="5" />
    </svg>
  );
}

export default RewardWheelSvg;