import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import {
  HomeIcon,
  PhotoIcon,
  CpuChipIcon,
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  CameraIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

const navItems = [
  { label: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { label: 'Gallery', icon: PhotoIcon, path: '/gallery' },
  { label: 'My Models', icon: CpuChipIcon, path: '/mymodels' },
  { label: 'My Packs', icon: ArchiveBoxIcon, path: '/packs' },
  { label: 'Train Model', icon: ArrowUpTrayIcon, path: '/models' },
  { label: 'Generate', icon: SparklesIcon, path: '/generate' },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useClerk()

  const handleNav = (path: string) => {
    navigate(path)
    onClose?.()
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="p-2 bg-blue-500 rounded-full">
          <CameraIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg">DreamSnap</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-colors text-left w-full
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-2 mt-4 border-t border-gray-800 pt-4">
        <button
          onClick={() => signOut({ redirectUrl: '/signin' })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-red-600/10 hover:text-red-400 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  )
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 bg-gray-950 border-b border-gray-800 px-4 py-3">
        <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500 rounded-full">
            <CameraIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">DreamSnap</span>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-gray-950 border-r border-gray-800 flex flex-col py-6"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-gray-950 border-r border-gray-800 flex-col py-6 z-50">
        <SidebarContent />
      </div>
    </>
  )
}
