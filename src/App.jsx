import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import ClientBottomNav from './components/client/ClientBottomNav'
import ManagerSidebar from './components/manager/ManagerSidebar'
import ManagerBottomNav from './components/manager/ManagerBottomNav'
import Landing from './pages/client/Landing'
import ServiceSelection from './pages/client/ServiceSelection'
import StaffSelection from './pages/client/StaffSelection'
import DateTimeSelection from './pages/client/DateTimeSelection'
import Confirmation from './pages/client/Confirmation'
import Profile from './pages/client/Profile'
import ManagerOverview from './pages/manager/Overview'
import ManagerCalendar from './pages/manager/Calendar'
import GalleryStaff from './pages/manager/GalleryStaff'
import Marketing from './pages/manager/Marketing'
import BusinessSettings from './pages/manager/Settings'

export default function App() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Skip when a hash anchor is present — the destination page owns scrolling to it.
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  const isManager = pathname.startsWith('/manager')

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {isManager && <ManagerSidebar />}
      <main className={`flex-1 min-w-0 ${isManager ? 'pb-24 lg:pb-0' : 'pb-24 md:pb-0'}`}>
        <Routes key={pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<ServiceSelection />} />
          <Route path="/professional" element={<StaffSelection />} />
          <Route path="/datetime" element={<DateTimeSelection />} />
          <Route path="/confirm" element={<Confirmation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/manager" element={<ManagerOverview />} />
          <Route path="/manager/calendar" element={<ManagerCalendar />} />
          <Route path="/manager/staff" element={<GalleryStaff />} />
          <Route path="/manager/marketing" element={<Marketing />} />
          <Route path="/manager/settings" element={<BusinessSettings />} />
        </Routes>
      </main>
      {!isManager && <ClientBottomNav />}
      {isManager && <ManagerBottomNav />}
    </div>
  )
}
