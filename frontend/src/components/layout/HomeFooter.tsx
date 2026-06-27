import { ArrowUpRight, Camera, Landmark, Mail, MapPin, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "Khám phá bản đồ", to: "/map" },
  { label: "Bảo tàng 3D", to: "/map" },
  { label: "Câu chuyện lịch sử", to: "/map" },
  { label: "Điểm đến nổi bật", to: "/map" }
];

const informationLinks = ["Về Di Sản Việt", "Đóng góp tư liệu", "Điều khoản sử dụng", "Chính sách bảo mật"];

export function HomeFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--heritage-brown)] text-[var(--heritage-paper-light)]">
      <div className="heritage-grain pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
      <img
        className="pointer-events-none absolute -bottom-16 -right-20 w-72 opacity-[0.08] sm:w-96"
        src="/images/trong-dong.webp"
        alt=""
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 sm:pt-14 lg:px-8">
        <div className="grid gap-10 border-b border-[rgba(248,241,227,0.24)] pb-10 md:grid-cols-2 lg:grid-cols-[1.45fr_0.8fr_0.9fr_1.15fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Di Sản Việt - Trang chủ">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-[rgba(248,241,227,0.42)] bg-[rgba(248,241,227,0.08)]">
                <Landmark size={26} strokeWidth={1.6} />
              </span>
              <span>
                <span className="block font-serif text-2xl">Di Sản Việt</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-[rgba(248,241,227,0.66)]">
                  Khám phá · Kết nối · Gìn giữ
                </span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-[rgba(248,241,227,0.76)]">
              Hành trình số hóa di tích, bảo tàng và ký ức văn hóa, đưa di sản Việt Nam đến gần hơn với mọi thế hệ.
            </p>
          </div>

          <nav aria-label="Khám phá">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[var(--heritage-white)]">Khám phá</h2>
            <ul className="mt-4 space-y-3 text-sm text-[rgba(248,241,227,0.72)]">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <Link className="transition hover:text-[var(--heritage-white)]" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Thông tin">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[var(--heritage-white)]">Thông tin</h2>
            <ul className="mt-4 space-y-3 text-sm text-[rgba(248,241,227,0.72)]">
              {informationLinks.map((item) => (
                <li key={item}>
                  <span className="cursor-default transition hover:text-[var(--heritage-white)]">{item}</span>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[var(--heritage-white)]">Kết nối với chúng tôi</h2>
            <div className="mt-4 space-y-3 text-sm text-[rgba(248,241,227,0.72)]">
              <a className="flex items-start gap-2.5 transition hover:text-[var(--heritage-white)]" href="mailto:hello@disanviet.vn">
                <Mail className="mt-0.5 flex-none" size={16} />
                hello@disanviet.vn
              </a>
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 flex-none" size={16} />
                Hà Nội, Việt Nam
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <a className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(248,241,227,0.3)] transition hover:bg-[rgba(248,241,227,0.12)]" href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Share2 size={17} />
              </a>
              <a className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(248,241,227,0.3)] transition hover:bg-[rgba(248,241,227,0.12)]" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Camera size={17} />
              </a>
              <Link className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(248,241,227,0.3)] px-3 text-xs font-semibold transition hover:bg-[rgba(248,241,227,0.12)]" to="/map">
                Khám phá ngay
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-xs text-[rgba(248,241,227,0.58)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Di Sản Việt. Gìn giữ ký ức, lan tỏa tự hào.</p>
          <p>Được xây dựng với tình yêu dành cho văn hóa Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
}
