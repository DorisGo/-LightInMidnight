const STROKE = 1.8

/**
 * @typedef {import('../models/trace').MarkType} MarkType
 */

/**
 * @param {{ type: MarkType, size?: number }} props
 */
export default function MarkShape({ type, size = 28 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 28 28',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: STROKE,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (type) {
    case 'star':
      return (
        <svg {...props}>
          <polygon points="14,2 17.5,10.5 26.5,11 19.5,17 21.5,26 14,21.5 6.5,26 8.5,17 1.5,11 10.5,10.5" />
        </svg>
      )
    case 'triangle':
      return (
        <svg {...props}>
          <polygon points="14,3 25,24 3,24" />
        </svg>
      )
    case 'square':
      return (
        <svg {...props}>
          <rect x="5" y="5" width="18" height="18" />
        </svg>
      )
    case 'diamond':
      return (
        <svg {...props}>
          <polygon points="14,2 26,14 14,26 2,14" />
        </svg>
      )
    case 'target':
      return (
        <svg {...props}>
          <circle cx="14" cy="14" r="11" />
          <circle cx="14" cy="14" r="4" />
        </svg>
      )
    case 'dots':
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="19" cy="9" r="2.5" />
          <circle cx="9" cy="19" r="2.5" />
          <circle cx="19" cy="19" r="2.5" />
        </svg>
      )
    case 'squiggle':
      return (
        <svg {...props}>
          <path d="M3,14 C6,8 10,20 14,14 S22,8 25,14" />
        </svg>
      )
    default:
      return null
  }
}
