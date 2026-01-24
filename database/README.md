# Database Setup Files

## Files Overview

### 📄 `schema.sql` ⭐ **SỬ DỤNG FILE NÀY**
- ✅ Schema đầy đủ cho tất cả tính năng mới
- ✅ Khớp 100% với Java entities
- ✅ Tên database: `english_db` (đúng với config backend)
- ✅ Bao gồm 16 bảng cho tất cả tính năng

### 📄 `sample-data.sql` ⚠️ **ĐÃ ĐƯỢC GỘP**
- ⚠️ **Nội dung đã được gộp vào**: `src/main/resources/db/test-data.sql`
- File này được giữ lại để tham khảo
- Không cần import file này nữa - sử dụng `test-data.sql` thay thế

### 📄 `english_learning_db.sql` ⚠️ **KHÔNG SỬ DỤNG**
- ❌ Schema cũ, thiếu nhiều bảng
- ❌ Tên database sai
- ❌ Cấu trúc không khớp với entities mới
- ❌ Chỉ giữ lại để tham khảo

## Quick Start

### Bước 1: Setup Database
```sql
-- Trong phpMyAdmin, import file:
database/schema.sql
```

### Bước 2: Import Dữ Liệu Mẫu

**Cách 1: Auto-load (Khuyến nghị)**
- Chỉ cần chạy backend với dev profile
- Spring Boot tự động load `src/main/resources/db/test-data.sql`
- Database sẽ tự động được populate

**Cách 2: Manual Import**
```sql
-- Trong phpMyAdmin, import file:
src/main/resources/db/test-data.sql
```

### Bước 3: Kiểm Tra
- Backend sẽ tự động kết nối
- Xem log để đảm bảo không có lỗi

## Xem Chi Tiết

So sánh đầy đủ: `SCHEMA_COMPARISON.md`

