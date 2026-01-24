# Hướng Dẫn Thiết Lập và Chạy Dự Án

## Yêu Cầu Hệ Thống

### Backend (Spring Boot)
- Java 21 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+ (hoặc XAMPP với MySQL)
- IDE: IntelliJ IDEA, Eclipse, hoặc VS Code

### Frontend (React)
- Node.js 18+ và npm/yarn
- Git

## Phần 1: Thiết Lập Database (XAMPP MySQL)

### Bước 1: Khởi động XAMPP
1. Mở XAMPP Control Panel
2. Khởi động **Apache** và **MySQL**
3. Kiểm tra MySQL đang chạy tại `http://localhost/phpmyadmin`

### Bước 2: Tạo Database
1. Mở phpMyAdmin (`http://localhost/phpmyadmin`)
2. Click vào tab **SQL**
3. Copy toàn bộ nội dung file `database/schema.sql` và paste vào
4. Click **Go** để thực thi
5. Database `english_db` sẽ được tạo với tất cả các bảng cần thiết

### Bước 3: Insert Dữ Liệu Mẫu (Optional)
1. Vẫn trong phpMyAdmin, chọn database `english_db`
2. Click tab **SQL**
3. Copy nội dung file `database/sample-data.sql` và paste vào
4. Click **Go** để insert dữ liệu mẫu

### Bước 4: Kiểm Tra Database
- Kiểm tra các bảng đã được tạo:
  - `users`
  - `exams`, `sections`, `questions`, `options`
  - `sessions`, `user_answers`
  - `level_assessments`
  - `lessons`, `learning_paths`
  - `games`, `game_sessions`
  - `conversations`, `conversation_messages`
  - `user_progress`
  - `learning_statistics`

## Phần 2: Thiết Lập Backend (Spring Boot)

### Bước 1: Cấu Hình Database Connection
1. Mở file `src/main/resources/application.properties`
2. Cập nhật thông tin kết nối:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/english_db
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
```

**Lưu ý:**
- Nếu MySQL có password, thêm password vào `spring.datasource.password`
- Port mặc định của MySQL là `3306`
- Nếu dùng port khác, thay đổi trong URL

### Bước 2: Build Project
Mở terminal trong thư mục project và chạy:
```bash
# Windows
mvnw.cmd clean install

# Linux/Mac
./mvnw clean install
```

### Bước 3: Chạy Backend
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### Bước 4: Kiểm Tra Backend
- Mở trình duyệt: `http://localhost:8080/swagger-ui/index.html`
- API Documentation sẽ hiển thị tất cả các endpoints

## Phần 3: Thiết Lập Frontend (React)

### Bước 1: Cài Đặt Dependencies
Mở terminal trong thư mục `user-frontend`:
```bash
npm install
```

### Bước 2: Cấu Hình API Endpoint
Kiểm tra file `user-frontend/src/api/axios.js` đã cấu hình đúng:
```javascript
baseURL: 'http://localhost:8080/api'
```

### Bước 3: Chạy Frontend
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000` (hoặc port khác nếu 3000 đã được sử dụng)

### Bước 4: Kiểm Tra Frontend
- Mở trình duyệt: `http://localhost:3000`
- Trang đăng nhập sẽ hiển thị

## Phần 4: Chạy Toàn Bộ Dự Án

### Quy Trình Chạy:

1. **Khởi động XAMPP**
   - Start Apache
   - Start MySQL

2. **Kiểm tra Database**
   - Vào phpMyAdmin: `http://localhost/phpmyadmin`
   - Kiểm tra database `english_db` đã tồn tại

3. **Chạy Backend**
   ```bash
   cd d:\english
   mvnw.cmd spring-boot:run
   ```
   - Đợi đến khi thấy: "Started EnglishApplication"

4. **Chạy Frontend** (Terminal mới)
   ```bash
   cd d:\english\user-frontend
   npm run dev
   ```
   - Đợi đến khi thấy: "Local: http://localhost:3000"

5. **Truy cập ứng dụng**
   - Mở trình duyệt: `http://localhost:3000`
   - Đăng ký tài khoản mới hoặc đăng nhập

## Phần 5: Test Các Tính Năng

### 1. Đăng Ký/Đăng Nhập
- Truy cập: `http://localhost:3000/register`
- Tạo tài khoản mới
- Đăng nhập: `http://localhost:3000/login`

### 2. Kiểm Tra Trình Độ (Assessment)
- Sau khi đăng nhập lần đầu, bạn sẽ được yêu cầu làm assessment
- Hoặc truy cập: `http://localhost:3000/assessment`

### 3. Học Bài (Lessons)
- Truy cập: `http://localhost:3000/lessons`
- Xem danh sách bài học
- Bắt đầu học bài

### 4. Chơi Game
- Truy cập: `http://localhost:3000/games`
- Chọn game và bắt đầu chơi

### 5. Hội Thoại AI
- Truy cập: `http://localhost:3000/conversations`
- Tạo cuộc hội thoại mới với AI
- Luyện nói và nhận feedback

### 6. Xem Thống Kê
- Truy cập: `http://localhost:3000/analytics`
- Xem tiến độ học tập
- Xem thống kê hàng ngày, tuần, tháng

## Phần 6: Troubleshooting

### Lỗi: Cannot connect to database
- Kiểm tra MySQL đã khởi động trong XAMPP
- Kiểm tra username/password trong `application.properties`
- Kiểm tra database `english_db` đã được tạo

### Lỗi: Port 8080 already in use
- Tắt các ứng dụng đang dùng port 8080
- Hoặc đổi port trong `application.properties`:
  ```properties
  server.port=8081
  ```

### Lỗi: CORS Error
- Kiểm tra `application.properties` đã cấu hình CORS:
  ```properties
  app.cors.allowed-origins=http://localhost:3000
  ```

### Lỗi: Frontend không kết nối được API
- Kiểm tra backend đã chạy
- Kiểm tra `user-frontend/src/api/axios.js` đã cấu hình đúng URL
- Kiểm tra JWT token đã được lưu trong localStorage

### Database không có dữ liệu
- Chạy lại script `database/sample-data.sql` trong phpMyAdmin
- Hoặc sử dụng API để tạo dữ liệu mẫu

## Phần 7: Tạo User Test

### Qua Frontend:
1. Đăng ký tại: `http://localhost:3000/register`
2. Điền thông tin:
   - Username: Test User
   - Email: test@example.com
   - Password: password123
   - Level Target: IELTS 7.0

### Qua Database (phpMyAdmin):
```sql
INSERT INTO users (user_id, username, email, hashed_password, level_target, learning_streak, total_xp, assessment_completed, created_at)
VALUES 
('test-user-001', 'Test User', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'IELTS 7.0', 0, 0, FALSE, NOW());
-- Password: password123
```

## Phần 8: Cấu Trúc Thư Mục

```
english/
├── database/
│   ├── schema.sql          # SQL script tạo database
│   └── sample-data.sql     # Dữ liệu mẫu
├── src/main/java/...       # Backend code
├── src/main/resources/     # Config files
├── user-frontend/          # React frontend
├── admin-frontend/         # Admin panel (optional)
├── pom.xml                 # Maven config
└── README.md              # Documentation
```

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log trong console của backend
2. Kiểm tra log trong browser console (F12)
3. Kiểm tra database connection trong phpMyAdmin
4. Xem documentation trong `README.md` và `IMPROVEMENTS.md`






