import { useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventContext'

export default function TimelinePage() {
  const navigate = useNavigate()
  const { todayEvents } = useEvents()

  const formatTime = (date) =>
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ padding: '24px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '16px' }}>
        ← 返回
      </button>
      <h1>今日时间轴</h1>
      <p style={{ margin: '8px 0 24px', opacity: 0.6 }}>
        共 {todayEvents.length} 条记录
      </p>

      {todayEvents.length === 0 ? (
        <p>今天还没有记录，点击 now 添加第一条吧。</p>
      ) : (
        <ul style={{ listStyle: 'none' }}>
          {todayEvents.map((event) => (
            <li
              key={event.id}
              style={{
                borderBottom: '1px solid #ddd',
                padding: '12px 0',
              }}
            >
              <time style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                {formatTime(event.timestamp)}
              </time>
              <p style={{ marginTop: '4px' }}>
                {event.note || `（${event.symbol}）`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
