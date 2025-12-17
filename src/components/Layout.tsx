import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { BookOpen, BarChart3, User, Home } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  const navigation = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'التحليل', href: '/analytics', icon: BarChart3 },
    { name: 'الملف الشخصي', href: '/profile', icon: User },
  ]

  const handleSignOut = async () => {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">امتحانات الأحياء</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Auth removed */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
