# Hướng Dẫn Setup Level Assessment Questions

## Tổng Quan

File này hướng dẫn cách import và sử dụng các câu hỏi đánh giá trình độ (Level Assessment) cho hệ thống.

## Files SQL

1. **assessment-questions-sample.sql** - File mẫu cơ bản (30 câu hỏi)
2. **assessment-questions-complete.sql** - File đầy đủ với nhiều câu hỏi hơn (37 câu hỏi)

## Cách Import

### Phương Pháp 1: Sử dụng phpMyAdmin

1. Mở XAMPP và khởi động MySQL
2. Truy cập phpMyAdmin: `http://localhost/phpmyadmin`
3. Chọn database `english_db`
4. Click vào tab **SQL**
5. Copy toàn bộ nội dung file `assessment-questions-complete.sql`
6. Paste vào ô SQL
7. Click **Go** để thực thi

### Phương Pháp 2: Sử dụng Command Line

```bash
# Windows (XAMPP)
cd C:\xampp\mysql\bin
mysql -u root -p english_db < D:\english\database\assessment-questions-complete.sql

# Linux/Mac
mysql -u root -p english_db < database/assessment-questions-complete.sql
```

### Phương Pháp 3: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối với database
3. File → Open SQL Script
4. Chọn file `assessment-questions-complete.sql`
5. Click Run (hoặc Ctrl+Shift+Enter)

## Cấu Trúc Câu Hỏi

### 6 Kỹ Năng (Skills)

1. **LISTENING** - Kỹ năng nghe
2. **READING** - Kỹ năng đọc
3. **WRITING** - Kỹ năng viết
4. **SPEAKING** - Kỹ năng nói
5. **GRAMMAR** - Ngữ pháp
6. **VOCABULARY** - Từ vựng

### Loại Câu Hỏi (Question Types)

1. **MULTIPLE_CHOICE** - Câu hỏi trắc nghiệm (có 4 lựa chọn)
2. **TEXT_INPUT** - Câu hỏi điền từ
3. **TRUE_FALSE** - Câu hỏi đúng/sai
4. **FILL_BLANK** - Điền vào chỗ trống

### Độ Khó (Difficulty Levels)

- **BEGINNER** - Người mới bắt đầu
- **ELEMENTARY** - Sơ cấp
- **INTERMEDIATE** - Trung cấp
- **UPPER_INTERMEDIATE** - Trung cấp nâng cao
- **ADVANCED** - Nâng cao

## Số Lượng Câu Hỏi

- **Mỗi kỹ năng**: 5 câu hỏi (mặc định)
- **Tổng số**: 30 câu hỏi (5 × 6 kỹ năng)
- **File complete**: 37 câu hỏi (có thêm câu hỏi dự phòng)

## Cách Hệ Thống Sử Dụng

1. Khi user tạo assessment mới, hệ thống sẽ:
   - Lấy 5 câu hỏi đầu tiên của mỗi kỹ năng (theo `order_index`)
   - Tổng cộng 30 câu hỏi

2. Câu hỏi được chọn dựa trên:
   - `skill_type`: Loại kỹ năng
   - `order_index`: Thứ tự (từ thấp đến cao)
   - `difficulty_level`: Độ khó

## Thêm Câu Hỏi Mới

### Thêm Câu Hỏi Multiple Choice

```sql
-- 1. Thêm câu hỏi
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index)
VALUES ('aq-l-008', 'LISTENING', 'MULTIPLE_CHOICE', 'Your question here?', 20.00, NULL, 'INTERMEDIATE', 8);

-- 2. Thêm các lựa chọn
INSERT INTO assessment_options (option_id, question_id, option_text, is_correct, order_index)
VALUES 
('ao-l-008-a', 'aq-l-008', 'Option A', FALSE, 1),
('ao-l-008-b', 'aq-l-008', 'Option B', TRUE, 2),
('ao-l-008-c', 'aq-l-008', 'Option C', FALSE, 3),
('ao-l-008-d', 'aq-l-008', 'Option D', FALSE, 4);
```

### Thêm Câu Hỏi Text Input

```sql
INSERT INTO assessment_questions (question_id, skill_type, question_type, text_content, score_points, correct_answer_text, difficulty_level, order_index)
VALUES ('aq-w-008', 'WRITING', 'TEXT_INPUT', 'Complete: "I _____ happy."', 20.00, 'am', 'BEGINNER', 8);
```

## Kiểm Tra Dữ Liệu

### Xem tất cả câu hỏi

```sql
SELECT * FROM assessment_questions ORDER BY skill_type, order_index;
```

### Xem câu hỏi theo kỹ năng

```sql
SELECT * FROM assessment_questions WHERE skill_type = 'LISTENING' ORDER BY order_index;
```

### Xem câu hỏi và options

```sql
SELECT 
    q.question_id,
    q.skill_type,
    q.text_content,
    o.option_text,
    o.is_correct
FROM assessment_questions q
LEFT JOIN assessment_options o ON q.question_id = o.question_id
WHERE q.skill_type = 'GRAMMAR'
ORDER BY q.order_index, o.order_index;
```

### Đếm số câu hỏi theo kỹ năng

```sql
SELECT skill_type, COUNT(*) as total_questions
FROM assessment_questions
GROUP BY skill_type;
```

## Troubleshooting

### Lỗi: Duplicate entry

Nếu gặp lỗi duplicate entry, có thể:
1. Xóa dữ liệu cũ trước:
```sql
DELETE FROM assessment_options;
DELETE FROM assessment_questions;
```

2. Hoặc sử dụng `INSERT IGNORE` thay vì `INSERT`

### Lỗi: Foreign key constraint

Đảm bảo:
- Xóa options trước khi xóa questions
- Hoặc sử dụng `ON DELETE CASCADE` (đã có trong schema)

### Câu hỏi không hiển thị

Kiểm tra:
1. `skill_type` phải đúng: LISTENING, READING, WRITING, SPEAKING, GRAMMAR, VOCABULARY
2. `order_index` phải có giá trị
3. Câu hỏi Multiple Choice phải có ít nhất 1 option

## Tạo Assessment Template Qua Admin Panel

Ngoài việc import SQL, bạn cũng có thể:

1. Đăng nhập Admin Panel
2. Vào **Assessment Management** → Tab **Templates**
3. Nhập tên template (ví dụ: "Standard Assessment")
4. Click **Create Template**
5. Hệ thống sẽ tự động tạo 30 câu hỏi mẫu (5 câu/kỹ năng)

## Lưu Ý

1. **Score Points**: Mỗi câu hỏi có 20 điểm (tổng 100 điểm/kỹ năng)
2. **Correct Answer**: 
   - Multiple Choice: Được lưu trong `assessment_options.is_correct`
   - Text Input: Được lưu trong `assessment_questions.correct_answer_text`
3. **Order Index**: Quan trọng để hệ thống chọn đúng câu hỏi
4. **Difficulty Level**: Giúp phân loại câu hỏi theo trình độ

## Best Practices

1. **Đa dạng loại câu hỏi**: Kết hợp Multiple Choice, Text Input, True/False
2. **Phân bổ độ khó**: Mỗi kỹ năng nên có câu hỏi từ BEGINNER đến ADVANCED
3. **Câu hỏi rõ ràng**: Đảm bảo câu hỏi dễ hiểu, không gây nhầm lẫn
4. **Đáp án chính xác**: Kiểm tra kỹ đáp án đúng cho mỗi câu hỏi
5. **Backup dữ liệu**: Luôn backup trước khi thay đổi

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log trong console
2. Kiểm tra database connection
3. Xem documentation trong `ASSESSMENT_SYSTEM.md`
4. Kiểm tra API endpoints trong Swagger UI

---

**Chúc bạn setup thành công! 🎉**




