import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container my-5">
        <Outlet />
      </main>
      <footer className="bg-light text-center text-muted py-3 mt-auto">
        &copy; {new Date().getFullYear()} RocketDashboard
      </footer>
    </>
  )
}
