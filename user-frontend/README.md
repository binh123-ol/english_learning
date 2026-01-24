# User Frontend - English Learning Platform

Modern React-based frontend for students to take English exams.

## 🚀 Features

- **Authentication** - Login and registration
- **Dashboard** - View learning progress and statistics
- **Exam Browser** - Browse and filter available exams
- **Take Exams** - Interactive exam interface with timer
- **Results** - View detailed exam results and scores
- **Responsive Design** - Works on desktop and mobile

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
  port: 3000,
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
- `/login` - User login
- `/register` - User registration

### Protected Pages
- `/` - Dashboard
- `/exams` - Browse exams
- `/exams/:id` - Exam details
- `/exams/:id/take` - Take exam
- `/results` - View results

## 🎨 Styling

The app uses TailwindCSS with a custom color scheme:
- Primary: Blue shades
- Components: Cards, buttons, inputs with consistent styling

## 🔐 Authentication

Authentication is handled via JWT tokens stored in localStorage:
- Token key: `token`
- User data key: `user`

## 🌐 API Integration

All API calls are made through Axios with automatic token injection.

Example endpoints:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/exams` - Get all exams
- `POST /api/sessions` - Start exam session
- `POST /api/sessions/:id/answers` - Submit answer

## 📝 Development

```bash
# Run development server
npm run dev
```

Access at: `http://localhost:3000`

## 🏗️ Project Structure

```
user-frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ExamList.jsx
│   │   ├── ExamDetail.jsx
│   │   ├── TakeExam.jsx
│   │   └── Results.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Apache License 2.0
