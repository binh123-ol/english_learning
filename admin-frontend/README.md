# Admin Frontend - English Learning Platform

Modern React-based admin panel for managing the English learning platform.

## 🚀 Features

- **Dashboard** - Overview of platform statistics
- **Exam Management** - Create, edit, and delete exams
- **User Management** - View and manage users
- **Session Management** - Monitor exam sessions
- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Clean sidebar navigation

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Lucide React** - Icons

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

The app connects to the backend API at `http://localhost:8080` by default.

To change this, edit `vite.config.js`:

```javascript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://your-backend-url:8080',
      changeOrigin: true,
    },
  },
}
```

## 📱 Pages

### Public Pages
- `/login` - Admin login

### Protected Pages
- `/` - Dashboard with statistics
- `/exams` - Exam management (CRUD)
- `/users` - User management
- `/sessions` - Session monitoring

## 🎨 Styling

The app uses TailwindCSS with a custom color scheme:
- Primary: Sky blue shades
- Sidebar: White with shadow
- Components: Cards, tables, modals with consistent styling

## 🔐 Authentication

Authentication is handled via JWT tokens stored in localStorage:
- Token key: `admin_token`
- User data key: `admin_user`

## 🌐 API Integration

All API calls are made through Axios with automatic token injection.

Example endpoints:
- `POST /api/auth/login` - Admin login
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `GET /api/users` - Get all users
- `DELETE /api/users/:id` - Delete user

## 📝 Development

```bash
# Run development server
npm run dev
```

Access at: `http://localhost:3001`

## 🏗️ Project Structure

```
admin-frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ExamManagement.jsx
│   │   ├── UserManagement.jsx
│   │   └── SessionManagement.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Features Detail

### Exam Management
- Create new exams with title, type, level, duration, and score
- Edit existing exams
- Delete exams
- Search and filter exams
- Modal-based forms

### User Management
- View all registered users
- Search users by name or email
- Delete users
- View user statistics

### Session Management
- Monitor active and completed sessions
- View session details
- Delete sessions
- Track user progress

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Apache License 2.0
