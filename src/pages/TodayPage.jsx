import { useNavigate } from 'react-router-dom'
import { useTraces } from '../context/TraceContext'
import BottomNavigation from '../components/home/BottomNavigation'
import './TodayPage.css'

export default function TodayPage() {
  const navigate = useNavigate()
  const { todayTraces } = useTraces()

  const formatTime = (date) =>
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="today-page">
      <header className="today-page__header">
        <button
          type="button"
          className="today-page__back"
          onClick={() => navigate('/')}
          aria-label="返回"
        >
          ‹
        </button>
        <div>
          <h1 className="today-page__title">今日时间轴</h1>
          <p className="today-page__count">共 {todayTraces.length} 条记录</p>
        </div>
      </header>

      <div className="today-page__content">
        {todayTraces.length === 0 ? (
          <p className="today-page__empty">今天还没有记录，点击 now 添加第一条吧。</p>
        ) : (
          <ul className="today-page__list">
            {todayTraces.map((trace) => (
              <li key={trace.id} className="today-page__item">
                <time className="today-page__time">
                  {formatTime(trace.recordedAt)}
                </time>
                <p className="today-page__memory">{trace.memory}</p>
                {trace.note && (
                  <p className="today-page__note">{trace.note}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
