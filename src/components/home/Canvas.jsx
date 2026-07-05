import './Canvas.css'

export default function Canvas({ children }) {
  return (
    <main className="trace-canvas">
      {children}
      {/* TODO: optional ambient background texture or grid */}
    </main>
  )
}
