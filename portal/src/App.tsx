import { sx } from './lib/sx'
import { useStore } from './state/store'
import { THEMES } from './styles/theme'
import { Shell } from './components/Shell'
import { Toast } from './components/shared'
import { Login } from './screens/Login'
import { Dashboard } from './screens/Dashboard'
import { Documents } from './screens/Documents'
import { Checklist } from './screens/Checklist'
import { CalendarScreen } from './screens/CalendarScreen'
import { Notes } from './screens/Notes'
import { Votes } from './screens/Votes'
import { Team } from './screens/Team'
import {
  AIDraftModal,
  DocuSealModal,
  EmailPreviewModal,
  ManageAccessModal,
  NewMotionModal,
} from './modals/Modals'

export default function App() {
  const store = useStore()
  const { state, currentUser } = store

  const shellStyle = {
    ...sx("font-family:'Public Sans',system-ui,-apple-system,sans-serif;min-height:100vh;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased"),
    ...sx(THEMES[state.theme]),
  }

  // Board members without admin rights never see Team & Access.
  const screen =
    state.screen === 'team' && !currentUser?.isAdmin ? 'dashboard' : state.screen

  return (
    <div style={shellStyle}>
      {!currentUser ? (
        <Login />
      ) : (
        <>
          <Shell>
            {screen === 'dashboard' && <Dashboard />}
            {screen === 'documents' && <Documents />}
            {screen === 'checklist' && <Checklist />}
            {screen === 'votes' && <Votes />}
            {screen === 'calendar' && <CalendarScreen />}
            {screen === 'notes' && <Notes />}
            {screen === 'team' && <Team />}
          </Shell>
          <DocuSealModal />
          <AIDraftModal />
          <NewMotionModal />
          <ManageAccessModal />
          <EmailPreviewModal />
        </>
      )}
      <Toast message={state.toast} />
    </div>
  )
}
