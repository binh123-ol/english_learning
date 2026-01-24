import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Account() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    levelTarget: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchUser()
  }, [user])

  const fetchUser = async () => {
    try {
      const res = await axios.get(`/users/${user.userId}`)
      setForm({
        username: res.data.username || '',
        email: res.data.email || '',
        levelTarget: res.data.levelTarget || ''
      })
    } catch (e) {
      console.error('Error fetching user profile', e)
      setError('Không tải được thông tin tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await axios.put(`/users/${user.userId}`, {
        username: form.username,
        email: form.email,
        levelTarget: form.levelTarget,
        // password không đổi ở đây
        password: 'dummy-password-ignore' // backend bỏ qua nếu cập nhật user từ admin, nhưng DTO yêu cầu; tuỳ chỉnh lại nếu cần
      })
      // Cập nhật context
      updateUser({
        ...user,
        username: res.data.username,
        email: res.data.email,
        levelTarget: res.data.levelTarget
      })
      setSuccess('Cập nhật tài khoản thành công.')
    } catch (e) {
      console.error('Error updating profile', e)
      if (e.response?.status === 409) {
        setError('Email đã được sử dụng.')
      } else {
        setError('Có lỗi xảy ra khi cập nhật tài khoản.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Đang tải thông tin...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tài khoản của bạn</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin cá nhân và mục tiêu học tập.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu (Level Target)</label>
          <input
            type="text"
            name="levelTarget"
            value={form.levelTarget}
            onChange={handleChange}
            className="input"
            placeholder="VD: IELTS 7.0, TOEIC 800..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}


