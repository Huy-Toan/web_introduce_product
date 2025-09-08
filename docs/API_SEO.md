# Tài liệu API SEO

Tập trung mô tả các endpoint hỗ trợ tạo nội dung và phân tích SEO tự động.

## POST `/api/seo/generate-content`
Tạo bài viết Markdown dựa trên *keyword* đầu vào.

### Yêu cầu
- **URL**: `https://beta.itxeasy.com/api/seo/generate-content`
- **Phương thức**: `POST`
- **Body**: JSON dạng
  ```json
  {
    "keyword": "in tem nhãn"
  }
  ```

### Phản hồi mẫu
```json
{
  "success": true,
  "data": {
    "title": "Tiêu đề bài viết",
    "meta": "Mô tả meta ngắn gọn",
    "keywords": "kw1, kw2, kw3",
    "slug": "tieu-de-bai-viet",
    "content": "# Nội dung Markdown...",
    "outline": ["Mục 1", "Mục 2"]
  },
  "generated_at": "2024-05-01T10:00:00.000Z"
}
```

### Mã lỗi phổ biến
| HTTP | Mô tả |
| --- | ----- |
| 400 | Thiếu `keyword` hoặc không hợp lệ |
| 500 | Lỗi phát sinh trong quá trình tạo nội dung |

---

## POST `/api/seo/generate-seo`
Phân tích một đoạn nội dung và đề xuất tiêu đề, meta, từ khóa và điểm SEO.

### Yêu cầu
- **URL**: `https://beta.itxeasy.com/api/seo/generate-seo`
- **Phương thức**: `POST`
- **Body**: JSON dạng
  ```json
  {
    "content": "Nội dung bài viết cần phân tích"
  }
  ```

### Phản hồi mẫu
```json
{
  "success": true,
  "data": {
    "title": "Tiêu đề tối ưu",
    "meta": "Mô tả meta",
    "keywords": "kw1, kw2",
    "slug": "tieu-de-toi-uu",
    "focus_keyword": "kw1",
    "score": 8,
    "tips": ["Gợi ý 1", "Gợi ý 2"],
    "distribution": ["Facebook", "LinkedIn"]
  },
  "content_length": 1200,
  "generated_at": "2024-05-01T10:00:00.000Z"
}
```

### Mã lỗi phổ biến
| HTTP | Mô tả |
| --- | ----- |
| 400 | Thiếu `content` hoặc nội dung rỗng |
| 500 | Lỗi phân tích SEO |

Các API trên trả về dữ liệu JSON và không yêu cầu tham số xác thực trong môi trường thử nghiệm.
