# Software Requirements Specification

## 1. Purpose

Tài liệu này mô tả yêu cầu phần mềm cho MVP Di Sản Việt Nam: một nền tảng khám phá di sản Việt Nam bằng bản đồ, model 3D, AI story, voice và chatbot hướng dẫn viên.

## 2. Scope

MVP tập trung vào trải nghiệm người dùng cuối:

- Khám phá địa danh/hiện vật.
- Xem model 3D.
- Sinh story theo độ tuổi.
- Xem timeline/story graph.
- Hỏi chatbot theo context hiện vật.
- Nghe voice và chia sẻ story.

MVP không bao gồm admin CMS, phân quyền người dùng, payment, analytics production, RAG có nguồn chính thống hoặc cộng đồng đóng góp hoàn chỉnh.

## 3. Actors

| Actor | Mô tả |
| --- | --- |
| Visitor | Người dùng khám phá di sản, tạo story, xem 3D, chat và chia sẻ |
| Teacher | Dùng story/timeline như tài liệu trước hoặc sau ngoại khóa |
| Family User | Dùng nội dung theo độ tuổi trong chuyến tham quan gia đình |
| Content Partner | Bảo tàng/địa phương tương lai cung cấp dữ liệu có kiểm duyệt |
| AI Agent | Dịch vụ sinh story/chat/voice dựa trên context |

## 4. Use Cases

### UC-01: Explore Landmark

1. Visitor mở bản đồ.
2. Visitor chọn địa danh.
3. Hệ thống hiển thị chi tiết, timeline và hiện vật liên quan.

### UC-02: View 3D Model

1. Visitor mở bảo tàng 3D hoặc model gắn với nội dung.
2. Hệ thống tải model GLB.
3. Visitor xoay, zoom, reset camera hoặc mở annotation.

### UC-03: Generate Age-Based Story

1. Visitor chọn địa danh hoặc hiện vật.
2. Visitor chọn nhóm tuổi.
3. Backend dựng context và gọi AI agent.
4. Hệ thống hiển thị story, timeline, graph và suggested questions.

### UC-04: Ask Guide Chatbot

1. Visitor mở trang hiện vật.
2. Visitor nhập câu hỏi hoặc chọn suggested question.
3. Backend gửi context hiện vật sang AI agent.
4. Hệ thống hiển thị câu trả lời và câu hỏi gợi ý tiếp theo.

### UC-05: Share Story

1. Visitor tạo story.
2. Visitor bấm chia sẻ.
3. Backend tạo share id/link.
4. Người khác mở link để xem lại story.

## 5. System Interfaces

### Frontend

- React routes cho home, map, landmark detail, artifact detail, story, share và model viewer.
- Gọi backend qua `VITE_API_BASE_URL`.
- Render Three.js model viewer trong browser.

### Backend API

- `/api/health`: health check.
- `/api/landmarks`: danh sách địa danh.
- `/api/landmarks/:id`: chi tiết địa danh.
- `/api/artifacts`: danh sách hiện vật.
- `/api/artifacts/:id`: chi tiết hiện vật.
- `/api/models`: danh sách model GLB.
- `/api/models/:file`: phục vụ file GLB.
- `/api/stories`: tạo/lấy story.
- `/api/chat`: chat theo context hiện vật.
- `/api/share`: tạo/lấy share link.
- `/api/voice`: voice route.

### AI Agent

- `/health`: health check.
- `/story`: tạo story JSON.
- `/chat`: trả lời chatbot JSON.
- `/voice`: voice route.
- Fallback khi LLM không khả dụng.

## 6. Constraints

- Dữ liệu MVP là file JSON runtime, chưa phải nguồn chính thống toàn quốc.
- Nội dung AI phải được xem là demo nếu chưa có nguồn và kiểm duyệt.
- Model 3D cần tối ưu kích thước để tải được trên web.
- Docker Compose là môi trường dev chính.

## 7. Quality Attributes

- Reliability: demo vẫn chạy với fallback khi thiếu API key.
- Usability: luồng chính phải ngắn, dễ hiểu với người dùng không kỹ thuật.
- Maintainability: frontend, backend và agent tách service rõ.
- Explainability: story nên dựa trên context đã chọn, không trả lời quá rộng.
- Performance: model 3D cần loading state và không chặn toàn bộ app.
