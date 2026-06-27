import { MapPin, Quote } from "lucide-react";
import type { CSSProperties } from "react";

type CommunityExperience = {
  comment: string;
  image: string;
  location: string;
  name: string;
  place: string;
};

const experiences: CommunityExperience[] = [
  {
    comment: "Lần đầu đưa con đến đây, tôi bất ngờ vì những câu chuyện lịch sử trở nên gần gũi hơn khi cả nhà cùng nghe thuyết minh và nhìn lại từng góc sân bia.",
    image: "/images/van-mieu-quoc-tu-giam.webp",
    location: "Hà Nội",
    name: "Minh Anh",
    place: "Văn Miếu - Quốc Tử Giám"
  },
  {
    comment: "Không gian trưng bày giúp tôi hiểu rõ hơn về các giai đoạn lịch sử. Mỗi hiện vật đều có cảm giác như đang kể một phần ký ức của đất nước.",
    image: "/images/bao-tang-lich-su-quoc-gia.webp",
    location: "Hà Nội",
    name: "Quốc Bảo",
    place: "Bảo tàng Lịch sử Quốc gia"
  },
  {
    comment: "Đi trong địa đạo mới thấy sự bền bỉ của người xưa. Trải nghiệm rất mạnh, nhất là khi nghe lại những câu chuyện đời thường giữa thời chiến.",
    image: "/images/dia-dao-cu-chi.webp",
    location: "TP. Hồ Chí Minh",
    name: "Hoàng Nam",
    place: "Địa đạo Củ Chi"
  },
  {
    comment: "Tôi thích cảm giác đứng trước Ngọ Môn lúc chiều xuống. Kiến trúc, màu tường và câu chuyện triều Nguyễn làm chuyến đi chậm lại rất đáng nhớ.",
    image: "/images/thua-thien-hue.webp",
    location: "Huế",
    name: "Thu Hà",
    place: "Cố đô Huế"
  },
  {
    comment: "Bọn trẻ trong lớp rất thích phần mô phỏng đời sống các dân tộc. Đây là một điểm đến khiến các em hỏi thêm rất nhiều sau chuyến tham quan.",
    image: "/images/bao-tang-dan-toc-hoc.webp",
    location: "Hà Nội",
    name: "Cô Lan",
    place: "Bảo tàng Dân tộc học"
  },
  {
    comment: "Từng căn phòng đều gợi lại một lát cắt của Sài Gòn. Tôi đi cùng ba mẹ và nghe thêm nhiều ký ức gia đình mà trước đây chưa từng biết.",
    image: "/images/dinh-doc-lap.webp",
    location: "TP. Hồ Chí Minh",
    name: "Gia Huy",
    place: "Dinh Độc Lập"
  },
  {
    comment: "Các hiện vật khảo cổ làm tôi thấy lịch sử không xa xôi. Chỉ cần nhìn kỹ hoa văn, chất liệu, mình đã thấy được bàn tay và đời sống của người xưa.",
    image: "/images/bao-tang-lich-su.webp",
    location: "Hà Nội",
    name: "Bích Ngọc",
    place: "Bảo tàng Lịch sử"
  },
  {
    comment: "Tôi từng đi nhiều lần nhưng mỗi lần đọc thêm một lớp chú giải mới lại thấy di tích có thêm chiều sâu, nhất là những câu chuyện về người gìn giữ nơi này.",
    image: "/images/bao-tang-lich-su-quoc-gia.webp",
    location: "Hà Nội",
    name: "Đức Thắng",
    place: "Hoàng thành Thăng Long"
  },
  {
    comment: "Một buổi sáng ở Huế, nghe tiếng bước chân trên nền đá và nhìn mái ngói cũ, tôi hiểu vì sao di sản cần được lưu giữ bằng cả ký ức cộng đồng.",
    image: "/images/thua-thien-hue.webp",
    location: "Huế",
    name: "An Nhiên",
    place: "Đại Nội Huế"
  }
];

const columns = [
  experiences.slice(0, 3),
  experiences.slice(3, 6),
  experiences.slice(6, 9)
];

function ExperienceColumn({
  className = "",
  duration,
  items
}: {
  className?: string;
  duration: number;
  items: CommunityExperience[];
}) {
  return (
    <div className={`community-experience-column ${className}`} style={{ "--duration": `${duration}s` } as CSSProperties}>
      <ul className="community-experience-list m-0 flex list-none flex-col gap-4 p-0 pb-4">
        {[...items, ...items].map((item, index) => (
          <li
            key={`${item.place}-${index}`}
            aria-hidden={index >= items.length}
            className="group w-full max-w-sm rounded-lg border border-[rgba(184,170,141,0.72)] bg-[rgba(255,250,240,0.88)] p-5 shadow-[0_16px_32px_rgba(45,40,32,0.09)] backdrop-blur-[2px]"
          >
            <Quote className="text-[var(--heritage-bronze)]" size={16} strokeWidth={1.7} />
            <p className="mt-4 text-md font-medium leading-6 text-[var(--heritage-ink)]">{item.comment}</p>
            <div className="mt-5 flex items-center gap-3">
              <img className="heritage-image h-12 w-12 rounded-full object-cover" src={item.image} alt="" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--heritage-brown)]">{item.name}</p>
                <p className="mt-0.5 truncate text-sm text-[var(--heritage-muted)]">{item.place}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[var(--heritage-muted)]">
                  <MapPin size={12} />
                  {item.location}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommunityExperiences() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8" aria-labelledby="community-experiences-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto w-full max-w-[1184px] border-b border-[var(--heritage-line)] pb-5">
          <p className="text-xs uppercase tracking-normal text-[var(--heritage-muted)]">Góc cộng đồng</p>
          <h2 id="community-experiences-heading" className="mt-2 font-serif text-3xl text-[var(--heritage-brown)]">
            Chia sẻ từ những chuyến đi
          </h2>
        </div>

        <div className="mx-auto mt-8 flex max-h-[620px] max-w-[1184px] justify-center gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_9%,black_91%,transparent)]">
          <ExperienceColumn items={columns[0]} duration={24} />
          <ExperienceColumn items={columns[1]} className="hidden md:block" duration={28} />
          <ExperienceColumn items={columns[2]} className="hidden lg:block" duration={26} />
        </div>
      </div>
    </section>
  );
}
