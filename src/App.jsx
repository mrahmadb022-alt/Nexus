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
import Staff from './pages/manager/Staff'
import PublicPage from './pages/manager/PublicPage'
import BusinessSettings from './pages/manager/Settings'
import Finance from './pages/manager/Finance'
import Messages from './pages/manager/Messages'
import PaymentConfirmation from './pages/manager/PaymentConfirmation'

export default function App() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Skip when a hash anchor is present — the destination page owns scrolling to it.
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  const isManager = pathname.startsWith('/manager')
  // The printable payment confirmation is a standalone document: no app navigation around it.
  const isDocument = pathname.startsWith('/manager/confirmation/')

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {isManager && !isDocument && <ManagerSidebar />}
      <main className={`flex-1 min-w-0 ${isDocument ? '' : isManager ? 'pb-24 lg:pb-0' : 'pb-24 md:pb-0'}`}>
        <Routes key={pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<ServiceSelection />} />
          <Route path="/professional" element={<StaffSelection />} />
          <Route path="/datetime" element={<DateTimeSelection />} />
          <Route path="/confirm" element={<Confirmation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/manager" element={<ManagerOverview />} />
          <Route path="/manager/calendar" element={<ManagerCalendar />} />
          <Route path="/manager/staff" element={<Staff />} />
          <Route path="/manager/public-page" element={<PublicPage />} />
          <Route path="/manager/settings" element={<BusinessSettings />} />
          <Route path="/manager/finance" element={<Finance />} />
          <Route path="/manager/messages" element={<Messages />} />
          <Route path="/manager/confirmation/:id" element={<PaymentConfirmation />} />
        </Routes>
      </main>
      {!isManager && <ClientBottomNav />}
      {isManager && !isDocument && <ManagerBottomNav />}
    </div>
  )
}
