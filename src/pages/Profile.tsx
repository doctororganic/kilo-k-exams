import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, GraduationCap, Calendar } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return <div>يرجى تسجيل الدخول</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary-100 rounded-full p-3">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div className="mr-4">
            <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
            <p className="text-gray-600">معلومات حسابك</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-400 ml-3" />
            <div>
              <div className="text-sm text-gray-600">الاسم الكامل</div>
              <div className="font-medium text-gray-900">{user.name}</div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-400 ml-3" />
            <div>
              <div className="text-sm text-gray-600">البريد الإلكتروني</div>
              <div className="font-medium text-gray-900">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <GraduationCap className="h-5 w-5 text-gray-400 ml-3" />
            <div>
              <div className="text-sm text-gray-600">الصف الدراسي</div>
              <div className="font-medium text-gray-900">
                {user.grade_level === '10' ? 'الصف العاشر' : 'الصف الحادي عشر'}
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-400 ml-3" />
            <div>
              <div className="text-sm text-gray-600">تاريخ التسجيل</div>
              <div className="font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString('ar-KW')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}