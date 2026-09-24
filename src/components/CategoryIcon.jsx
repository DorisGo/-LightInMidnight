/**
 * @param {{ type: import('../models/trace').TraceCategory }} props
 */
export default function CategoryIcon({ type }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 22 22',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (type) {
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 4h6v14H5a1 1 0 0 1-1-1V4z" />
          <path d="M12 4h6v13a1 1 0 0 1-1 1h-5V4z" />
        </svg>
      )
    case 'movie':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="16" height="12" rx="1" />
          <path d="M7 5v12M11 5v12M15 5v12" />
        </svg>
      )
    case 'music':
      return (
        <svg {...props}>
          <path d="M9 16a2 2 0 1 1-2-2c0-1.1.9-2 2-2V4l7-2v10" />
          <circle cx="16" cy="14" r="2" />
        </svg>
      )
    case 'place':
      return (
        <svg {...props}>
          <path d="M11 3a5 5 0 0 1 5 5c0 4-5 11-5 11S6 12 6 8a5 5 0 0 1 5-5z" />
          <circle cx="11" cy="8" r="1.5" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="6" cy="11" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="11" cy="11" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="16" cy="11" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}
