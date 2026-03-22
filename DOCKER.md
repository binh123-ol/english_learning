# Hướng Dẫn Sử Dụng Docker Cho Dự Án

## 1. Yêu cầu hệ thống
- Máy tính đã cài đặt và đang chạy **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.

## 2. Các thành phần (Services)
Khi chạy, Docker sẽ khởi tạo 4 container:
- `mysql-db`: Cơ sở dữ liệu MySQL 8.0, tự động load các file script trong thư mục `database/` lúc khởi tạo.
- `backend`: REST API viết bằng Spring Boot (Java 21).
- `admin-frontend`: Giao diện quản trị viên (React/Vite).
- `user-frontend`: Giao diện học viên (React/Vite).

## 3. Khởi chạy toàn bộ hệ thống
Mở terminal/command prompt tại thư mục gốc của dự án (`d:\english`), chạy lệnh:

```bash
docker-compose up --build -d
```

- Tham số `--build` sẽ ép Docker build lại image mới nhất từ mã nguồn.
- Tham số `-d` giúp chạy ngầm (detached mode) để không chiếm dụng terminal.

**Lưu ý trong lần chạy đầu tiên**: Quá trình này sẽ tải các base image (Java, Node.js, MySQL...) và tự động build các thư mục frontend, có thể mất vài phút tùy tốc độ mạng.

## 4. Truy cập các ứng dụng
Sau khi lệnh trên hoàn tất, bạn có thể mở trình duyệt và truy cập:

- **Admin Frontend**: [http://localhost:3000](http://localhost:3000)
- **User Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:8080](http://localhost:8080) (và Swagger UI tại `/swagger-ui/index.html`)
- **Database MySQL**: Kết nối qua localhost:3306 với user `root` và password là pass trong `.env` (hoặc mặc định `root`).

## 5. Các lệnh thường dùng

**Xem log của toàn bộ hệ thống:**
```bash
docker-compose logs -f
```

**Xem log của riêng một service (ví dụ backend):**
```bash
docker-compose logs -f backend
```

**Dừng toàn bộ hệ thống:**
```bash
docker-compose down
```

**Dừng hệ thống và XÓA TOÀN BỘ DỮ LIỆU database:**
(Lưu ý: lệnh này sẽ xoá volume chứa data MySQL, cân nhắc trước khi chạy)
```bash
docker-compose down -v
```

## 6. Xử lý lỗi thường gặp
- Tắt các dịch vụ khác đang chạy trên cổng 3306, 8080, 3000, 3001 ở máy tính để tránh xung đột cổng.
- Nếu bạn cập nhật file `.env` hoặc mã nguồn, hãy chạy lại lệnh `docker-compose up --build -d` để update code mới nhất.
