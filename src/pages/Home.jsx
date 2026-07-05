import { useNavigate } from 'react-router-dom'
import { useTraces } from '../context/TraceContext'
import Header from '../components/home/Header'
import Canvas from '../components/home/Canvas'
import FloatingShapes from '../components/home/FloatingShapes'
import AddButton from '../components/home/AddButton'
import BottomNavigation from '../components/home/BottomNavigation'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { todayTraces, addTrace } = useTraces()

  return (
    <div className="home-page">
      <Header
        unlockCount={todayTraces.length}
        onTodayClick={() => navigate('/today')}
      />
      <Canvas>
        <FloatingShapes traces={todayTraces} />
      </Canvas>
      <AddButton onAdd={addTrace} />
      <BottomNavigation />
    </div>
  )
}
