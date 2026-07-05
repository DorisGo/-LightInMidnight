import './Header.css'

export default function Header({ unlockCount, onTodayClick }) {
  return (
    <header className="home-header">
      <button className="header-link" onClick={onTodayClick}>
        <h1 className="home-title">Today's Traces</h1>
        <svg className="title-underline" viewBox="0 0 200 12" preserveAspectRatio="none">
          <path
            d="M2,8 C30,2 50,10 80,6 S130,2 160,8 S190,4 198,7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="unlock-count">{unlockCount} unlocks</p>
      </button>
      {/* TODO: show date subtitle or streak count */}
    </header>
  )
}
