import { SetupUrlState } from '@figurl/interface'
import './App.css'
import MainWindow from './MainWindow'
import SetupStatusBar from './StatusBar/SetupStatusBar'

function App() {
  return (
    <SetupUrlState>
      <SetupStatusBar>
        <MainWindow />
      </SetupStatusBar>
    </SetupUrlState>
  )
}

export default App
