export default function S3Logo({ size = 70 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A3D98" />
          <stop offset="100%" stopColor="#4F8BFF" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="55" fill="url(#grad)" />

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".35em"
        fontSize="42"
        fontFamily="Inter, sans-serif"
        fontWeight="700"
        fill="white"
      >
        S3
      </text>
    </svg>
  );
}
