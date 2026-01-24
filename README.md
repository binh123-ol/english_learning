# English Learning Platform API

A comprehensive RESTful API for English exam management system with IELTS support, built with Spring Boot.

## 🚀 Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Automatic Scoring** - Real-time answer evaluation
- ✅ **IELTS Band Scoring** - Automatic band score calculation
- ✅ **Time Management** - Session time tracking and validation
- ✅ **Complete CRUD** - Full management for all entities
- ✅ **Exception Handling** - Comprehensive error responses
- ✅ **API Documentation** - Interactive Swagger UI
- ✅ **Multi-Environment** - Dev, Prod, Test profiles

## 📋 Tech Stack

- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT
- **Database:** MySQL 8.0
- **ORM:** Spring Data JPA / Hibernate
- **Validation:** Jakarta Validation
- **Documentation:** Swagger/OpenAPI 3.0
- **Build Tool:** Maven

## 🏗️ Architecture

### Entities (Updated)
- **User** - User accounts with learning progress tracking (XP, streak, level)
- **LevelAssessment** - Initial level assessment with 6 skills
- **Lesson** - Interactive lessons (Grammar, Vocabulary, Listening, Reading, Writing, Speaking)
- **LearningPath** - Personalized learning paths for each user
- **Game** - Language learning games
- **GameSession** - Game play sessions with scoring
- **Conversation** - AI conversation practice sessions
- **ConversationMessage** - Messages with AI feedback (pronunciation, grammar, spelling)
- **UserProgress** - Learning progress tracking
- **LearningStatistic** - Daily/weekly/monthly statistics
- **Exam** - Exam definitions (IELTS, TOEFL, etc.)
- **Section** - Exam sections (Reading, Listening, etc.)
- **Question** - Questions with types and scoring
- **Option** - Multiple choice options
- **Session** - User exam sessions with scoring
- **UserAnswer** - User answers with automatic scoring

### Layers
```
Controller → Service → Repository → Entity
     ↓          ↓          ↓
   DTO    Exception   Database
```

## 🚀 Quick Start

### Prerequisites
- Java 21+
- MySQL 8.0+ (hoặc XAMPP với MySQL)
- Maven 3.6+
- Node.js 18+ và npm (cho frontend)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd english
```

2. **Setup Database (XAMPP)**
   - Khởi động XAMPP (Apache + MySQL)
   - Mở phpMyAdmin: `http://localhost/phpmyadmin`
   - Import file `database/schema.sql` để tạo database và các bảng
   - (Optional) Import `database/sample-data.sql` để thêm dữ liệu mẫu

3. **Configure Backend**
   - Sửa file `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/english_db
   spring.datasource.username=root
   spring.datasource.password=
   ```

4. **Build và Run Backend**
```bash
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```
Backend sẽ chạy tại: `http://localhost:8080`

5. **Setup Frontend**
```bash
cd user-frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:3000`

### Xem hướng dẫn chi tiết tại [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 📚 API Documentation

### Swagger UI (Interactive)
```
http://localhost:8080/swagger-ui/index.html
```

### OpenAPI Specification
```
http://localhost:8080/v3/api-docs
```

## 🔐 Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "levelTarget": "IELTS 7.0"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Use Token
```http
GET /api/exams
Authorization: Bearer <your-jwt-token>
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/test` - Test endpoint

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/{id}` - Get exam by ID
- `POST /api/exams` - Create exam
- `PUT /api/exams/{id}` - Update exam
- `DELETE /api/exams/{id}` - Delete exam

### Sections
- `GET /api/exams/{examId}/sections` - Get exam sections
- `POST /api/exams/{examId}/sections` - Create section
- `GET /api/sections/{id}` - Get section by ID
- `PUT /api/sections/{id}` - Update section
- `DELETE /api/sections/{id}` - Delete section

### Questions
- `GET /api/sections/{sectionId}/questions` - Get section questions
- `POST /api/sections/{sectionId}/questions` - Create question
- `GET /api/questions/{id}` - Get question by ID
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question

### Sessions
- `POST /api/sessions?userId={userId}&examId={examId}` - Create session
- `GET /api/sessions/{id}` - Get session
- `GET /api/sessions/{id}/status` - Get session status
- `POST /api/sessions/{id}/finish` - Finish session (auto-score)
- `DELETE /api/sessions/{id}` - Delete session

### Answers
- `POST /api/sessions/{sessionId}/answers` - Submit answer (auto-score)
- `GET /api/sessions/{sessionId}/answers` - Get session answers
- `GET /api/answers/{id}` - Get answer by ID
- `DELETE /api/answers/{id}` - Delete answer

## 🎯 Key Features

### 1. Level Assessment
- Kiểm tra trình độ ban đầu với 6 kỹ năng
- Tự động xác định level và tạo lộ trình học phù hợp

### 2. Personalized Learning Path
- Lộ trình học được tạo tự động dựa trên trình độ
- Đề xuất bài học cho các kỹ năng yếu

### 3. Interactive Lessons
- Bài học đa dạng: Grammar, Vocabulary, Listening, Reading, Writing, Speaking
- Theo dõi tiến độ và tích lũy XP

### 4. Language Games
- Trò chơi ngôn ngữ: Word Match, Flashcard, Spelling, Quiz, Puzzle
- Vừa học vừa chơi, tích lũy XP

### 5. AI Conversation Practice
- Hội thoại với AI chatbot
- Nhận feedback về phát âm, ngữ pháp, chính tả
- Luyện nói mọi lúc mọi nơi

### 6. Learning Analytics
- Thống kê chi tiết: hôm nay, tuần này, tháng này
- Theo dõi learning streak và tổng XP
- Báo cáo tiến độ học tập

### 7. AI/NLP Features
- Pronunciation scoring
- Grammar checking
- Spell checking
- Text analysis

### 8. Automatic Scoring (Existing)
- Chấm điểm tự động cho exam questions
- Tính band score cho IELTS
- Thời gian quản lý session

## ⚙️ Configuration

### Profiles

#### Development
```bash
export SPRING_PROFILE=dev
mvn spring-boot:run
```

#### Production
```bash
export SPRING_PROFILE=prod
export DB_URL=jdbc:mysql://prod-server:3306/english_db
export DB_USERNAME=prod_user
export DB_PASSWORD=secure_password
export JWT_SECRET=your_production_secret
java -jar target/english-0.0.1-SNAPSHOT.jar
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILE` | Active profile | `dev` |
| `DB_URL` | Database URL | `jdbc:mysql://localhost:3306/english_db` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `` |
| `JWT_SECRET` | JWT secret key | (dev key) |
| `JWT_EXPIRATION` | Token expiration (ms) | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Allowed origins | `http://localhost:3000` |

## 📖 Documentation Files

- **README.md** - This file
- **SECURITY_SETUP.md** - Authentication & JWT guide
- **EXCEPTION_HANDLING.md** - Error handling guide
- **BUSINESS_LOGIC.md** - Scoring & workflow guide
- **CONFIGURATION.md** - Environment setup guide
- **API_DOCUMENTATION.md** - Swagger/API guide

## 🧪 Testing

### With Swagger UI
1. Open `http://localhost:8080/swagger-ui/index.html`
2. Click "Authorize" button
3. Login via `/api/auth/login`
4. Copy JWT token
5. Enter: `Bearer <token>`
6. Test any endpoint

### With cURL
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Test","email":"test@example.com","password":"123456","levelTarget":"IELTS 7.0"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Use token
curl -X GET http://localhost:8080/api/exams \
  -H "Authorization: Bearer <your-token>"
```

## 🔒 Security

- ✅ **Password Hashing** - BCrypt algorithm
- ✅ **JWT Tokens** - Stateless authentication
- ✅ **CORS** - Configurable origins
- ✅ **Input Validation** - Jakarta Validation
- ✅ **Exception Handling** - No sensitive data exposure
- ✅ **SQL Injection** - JPA/Hibernate protection

## 📦 Project Structure

```
english/
├── src/main/java/com/example/english/
│   ├── config/          # Configuration classes
│   │   ├── AppConfig.java
│   │   ├── CorsConfig.java
│   │   ├── OpenApiConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/      # REST controllers
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── ExamController.java
│   │   ├── SectionController.java
│   │   ├── QuestionController.java
│   │   ├── SessionController.java
│   │   ├── UserAnswerController.java
│   │   └── GlobalExceptionHandler.java
│   ├── dto/             # Data Transfer Objects
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── AuthResponse.java
│   │   ├── ExamDTO.java
│   │   ├── SectionDTO.java
│   │   ├── QuestionDTO.java
│   │   ├── OptionDTO.java
│   │   ├── UserAnswerDTO.java
│   │   └── ErrorResponse.java
│   ├── entity/          # JPA entities
│   │   ├── User.java
│   │   ├── Exam.java
│   │   ├── Section.java
│   │   ├── Question.java
│   │   ├── Option.java
│   │   ├── Session.java
│   │   └── UserAnswer.java
│   ├── exception/       # Custom exceptions
│   │   ├── ResourceNotFoundException.java
│   │   ├── DuplicateResourceException.java
│   │   ├── BadRequestException.java
│   │   └── UnauthorizedException.java
│   ├── repository/      # JPA repositories
│   │   ├── UserRepository.java
│   │   ├── ExamRepository.java
│   │   ├── SectionRepository.java
│   │   ├── QuestionRepository.java
│   │   ├── OptionRepository.java
│   │   ├── SessionRepository.java
│   │   └── UserAnswerRepository.java
│   ├── security/        # Security components
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   └── service/         # Business logic
│       ├── AuthService.java
│       ├── UserService.java
│       ├── ExamService.java
│       ├── SectionService.java
│       ├── QuestionService.java
│       ├── SessionService.java
│       └── UserAnswerService.java
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   ├── application-prod.properties
│   └── application-test.properties
├── .env.example
├── pom.xml
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the Apache License 2.0

## 👥 Contact

- **Email:** support@englishlearning.com
- **Documentation:** See `/docs` folder

## 🎉 Acknowledgments

- Spring Boot Team
- Spring Security Team
- Swagger/OpenAPI Team
- All contributors

---

**Made with ❤️ for English learners worldwide**
