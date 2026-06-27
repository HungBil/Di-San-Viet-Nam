# Requirements

## Mục Tiêu

MVP cần chứng minh một luồng khám phá di sản Việt Nam có thể đi từ bản đồ, địa danh/hiện vật, model 3D, AI story, timeline/graph, voice/chatbot đến chia sẻ.

## Functional Requirements

### FR-01: Khám Phá Bản Đồ

- Người dùng xem bản đồ Việt Nam.
- Người dùng chọn điểm di sản để mở trang chi tiết.
- Điểm di sản có tên, tỉnh/thành, mô tả ngắn, hình ảnh và thông tin liên quan.

### FR-02: Trang Địa Danh

- Hiển thị mô tả, lịch sử, điểm nhấn du lịch.
- Hiển thị timeline của địa danh.
- Hiển thị các hiện vật liên quan.
- Cho phép tạo story theo nhóm tuổi.

### FR-03: Trang Hiện Vật

- Hiển thị mô tả, thời kỳ, chất liệu, ý nghĩa văn hóa.
- Hiển thị timeline của hiện vật.
- Cho phép mở chatbot hướng dẫn viên theo context hiện vật.
- Cho phép tạo story theo nhóm tuổi.

### FR-04: 3D Model Viewer

- Tải model `.glb` từ thư mục public/API.
- Hỗ trợ GLB nén DRACO.
- Hỗ trợ xoay, zoom, reset camera và auto-rotate.
- Hỗ trợ chú thích theo điểm quan sát cho model có annotation.
- Hiển thị trạng thái loading/error.

### FR-05: AI Storytelling

- Người dùng chọn target type, target id và nhóm tuổi.
- Backend dựng context từ dữ liệu địa danh/hiện vật, timeline và graph.
- Agent trả về JSON gồm title, summary, content, timeline, graph, suggestedQuestions.
- Nếu LLM lỗi, agent trả về fallback demo-safe.

### FR-06: Chatbot Hướng Dẫn Viên

- Người dùng hỏi về một hiện vật.
- Backend gửi context hiện vật sang agent.
- Agent trả về answer và suggestions.
- Nếu LLM lỗi, agent trả về fallback.

### FR-07: Voice

- Người dùng nghe nội dung story hoặc annotation.
- Hệ thống hỗ trợ provider thật khi có cấu hình và fallback/mock khi không có.

### FR-08: Chia Sẻ

- Người dùng tạo link chia sẻ cho story.
- Link mở lại được nội dung story đã tạo.

## Non-Functional Requirements

- Demo không được gãy khi thiếu `OPENAI_API_KEY`.
- API trả lỗi rõ cho request thiếu field hoặc target không tồn tại.
- Frontend phải hiển thị loading/error state cho API và model 3D.
- 3D viewer phải dispose renderer/model khi unmount để tránh leak.
- Nội dung AI không được trình bày như tư liệu chính thống nếu chưa có nguồn kiểm duyệt.
- Luồng chính phải chạy được bằng Docker Compose.

## Data Requirements

- Landmark cần có id, slug, name, province, region, coordinates, mô tả, ảnh, tags và artifact ids.
- Artifact cần có id, name, mô tả, ý nghĩa văn hóa, ảnh, tags và optional landmark id.
- Timeline cần có target type, target id, year label, title, description và order.
- Story graph cần nodes và edges.
- Model 3D cần path `.glb`, name, URL và size.

## Acceptance Criteria

- Người dùng mở app, chọn địa danh, tạo story và xem story page thành công.
- Người dùng mở model 3D demo, xoay/zoom/reset camera được.
- Người dùng mở hiện vật và chat được với hướng dẫn viên.
- Người dùng tạo link chia sẻ story được.
- Khi agent không gọi được LLM, demo vẫn trả nội dung fallback.
