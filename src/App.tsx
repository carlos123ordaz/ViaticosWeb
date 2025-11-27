import './App.css'
import { Route, Routes } from 'react-router-dom'
import { HomeLayout } from './layouts/HomeLayout'
import DashboardPage from './pages/DashboardPage'
import { GastosPage } from './pages/GastosPage'
import { GirasPage } from './pages/GirasPage'
import { UsersPage } from './pages/UsersPage'
import { SedePage } from './pages/SedePage'
import { IncidenceList } from './pages/incidences/IncidenceList'
import { AsistenciaPage } from './pages/AsistenciaPage'
import LoginPage from './pages/auth/LoginPage'

function App() {

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomeLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/giras" element={<GirasPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/asistencia" element={<AsistenciaPage />} />
          <Route path="/sedes" element={<SedePage />} />
          <Route path="/gastos/:giraId" element={<GastosPage />} />
          <Route path="/incidencias" element={<IncidenceList />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
