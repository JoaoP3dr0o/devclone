import { HashRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import ScanPage from './pages/ScanPage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App
