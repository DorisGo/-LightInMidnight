import { useNavigate, useParams } from 'react-router-dom'
import { useTraces } from '../context/TraceContext'
import TraceForm from '../components/trace/TraceForm'
import './EditTracePage.css'

export default function EditTracePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { traces, updateTrace, deleteTrace } = useTraces()
  const trace = traces.find((item) => item.id === id)

  if (!trace) {
    return (
      <div className="edit-trace-page">
        <p className="edit-trace-page__missing">Trace not found.</p>
        <button type="button" className="edit-trace-page__link" onClick={() => navigate('/')}>
          Back to home
        </button>
      </div>
    )
  }

  const handleSave = (input) => {
    updateTrace(trace.id, input)
    navigate(-1)
  }

  const handleDelete = () => {
    deleteTrace(trace.id)
    navigate('/')
  }

  return (
    <div className="edit-trace-page">
      <TraceForm
        heading="Edit Trace"
        initial={trace}
        onBack={() => navigate(-1)}
        onSubmit={handleSave}
        className="edit-trace-page__form"
      >
        <button type="button" className="edit-trace-page__delete" onClick={handleDelete}>
          Delete trace
        </button>
      </TraceForm>
    </div>
  )
}
