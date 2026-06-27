import {
  Bot,
  ChevronRight,
  Compass,
  Cuboid,
  HandHeart,
  Headset,
  MapPin,
  Play,
  Search,
  Send,
  Share2,
  Telescope,
  UsersRound,
  ZoomIn
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProvinceGeoJsonMap } from "../components/map/ProvinceGeoJsonMap";

const heroImage = "/images/van-mieu-quoc-tu-giam.webp";
const heroVideo = "/videos/hero-background.webm";

const featuredPlaces = [
  {
    name: "Hoàng thành Thăng Long",
    province: "Hà Nội",
    href: "/landmarks/thang-long-citadel",
    image: "/images/bao-tang-lich-su-quoc-gia.webp"
  },
  {
    name: "Địa đạo Củ Chi",
    province: "TP. Hồ Chí Minh",
    href: "/map",
    image: "/images/dia-dao-cu-chi.webp"
  },
  {
    name: "Văn Miếu - Quốc Tử Giám",
    province: "Hà Nội",
    href: "/map",
    image: "/images/van-mieu-quoc-tu-giam.webp"
  },
  {
    name: "Cố đô Huế",
    province: "Huế",
    href: "/map",
    image: "/images/thua-thien-hue.webp"
  },
  {
    name: "Dinh Độc Lập",
    province: "TP. Hồ Chí Minh",
    href: "/map",
    image: "/images/dinh-doc-lap.webp"
  },
  {
    name: "Bảo tàng Dân tộc học",
    province: "Hà Nội",
    href: "/map",
    image: "/images/bao-tang-dan-toc-hoc.webp"
  }
];

const featureStrip = [
  { icon: Cuboid, title: "Tham quan 3D", text: "Không gian di tích được tái hiện có chiều sâu" },
  { icon: Bot, title: "Thuyết minh AI", text: "Trò chuyện và tra cứu theo từng câu chuyện lịch sử" },
  { icon: ZoomIn, title: "Dấu tích lịch sử", text: "Theo mạch sự kiện, nhân vật và địa danh" },
  { icon: UsersRound, title: "Cộng đồng", text: "Lưu giữ ký ức, hình ảnh và tư liệu địa phương" }
];

const benefits = [
  { icon: Compass, title: "Khám phá di sản mọi lúc, mọi nơi" },
  { icon: Cuboid, title: "Quan sát không gian 3D trực quan" },
  { icon: Telescope, title: "Nội dung lịch sử được trình bày có ngữ cảnh" },
  { icon: HandHeart, title: "Góp phần bảo tồn và lan tỏa ký ức Việt" }
];

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/map");
  }

  return (
    <div className="heritage-surface min-h-screen overflow-hidden">
      <section
        className="relative min-h-[680px] overflow-hidden border-b border-[var(--heritage-line)] bg-[var(--heritage-paper-light)] 2xl:min-h-0"
        style={{ aspectRatio: "1920 / 816" }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          poster={heroImage}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[rgba(45,40,32,0.08)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[rgba(248,241,227,0.94)] via-[rgba(248,241,227,0.72)] to-transparent md:w-[76%] lg:w-[62%]" />
        <div className="heritage-grain pointer-events-none absolute inset-y-0 left-0 w-full opacity-45 md:w-[76%] lg:w-[62%]" />

        <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-2xl flex-col justify-center py-6 lg:max-w-[590px]">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-normal text-[var(--heritage-muted)]">
              <span className="grid h-11 w-11 place-items-center rounded border border-[var(--heritage-bronze)] text-lg text-[var(--heritage-bronze)]">
                D
              </span>
              <span>
                <span className="block font-semibold text-[var(--heritage-ink)]">Di Sản Việt</span>
                <span className="block">Khám phá lịch sử, kết nối tự hào</span>
              </span>
            </div>

            <p className="mt-10 w-fit border-b border-dotted border-[var(--heritage-brown)] pb-1 font-serif text-2xl text-[var(--heritage-brown)] sm:text-3xl xl:mt-14">
              Văn minh
            </p>
            <h1 className="mt-4 max-w-full font-serif text-5xl leading-[1.08] text-[var(--heritage-brown)] sm:text-6xl xl:text-7xl">
              Di Sản
              <br />
              Việt Nam
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--heritage-ink)]">
              Hành trình số hóa bảo tàng, di tích và ký ức văn hóa Việt Nam qua bản đồ, không gian 3D và thuyết minh AI.
            </p>

            <form
              onSubmit={onSearch}
              className="mt-7 flex max-w-lg overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[rgba(255,250,240,0.88)] text-[var(--heritage-ink)] shadow-[0_14px_32px_rgba(45,40,32,0.12)] backdrop-blur-[2px]"
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-5 py-4 text-base outline-none placeholder:text-[var(--heritage-muted)]"
                placeholder="Tìm di tích, bảo tàng, địa danh..."
              />
              <button className="grid w-14 place-items-center border-l border-[var(--heritage-line)] text-[var(--heritage-brown)]" aria-label="Tìm kiếm">
                <Search size={22} />
              </button>
            </form>

            <div className="mt-7 grid gap-4 border-t border-[var(--heritage-line)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
              {featureStrip.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-lg border border-[var(--heritage-line)] bg-[rgba(248,241,227,0.78)] text-[var(--heritage-bronze)] backdrop-blur-[1px]">
                    <item.icon size={23} strokeWidth={1.7} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[var(--heritage-ink)]">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--heritage-muted)]">{item.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <img
          className="pointer-events-none absolute bottom-0 left-0 z-10 h-[30%] w-auto object-contain opacity-70 sm:h-[36%] lg:h-[40%]"
          src="/images/chim-lac.webp"
          alt=""
          aria-hidden="true"
        />
      </section>

      <div className="relative">
        <img
          className="pointer-events-none absolute left-0 top-1/2 z-0 h-[85%] w-auto -translate-y-1/2 scale-400 object-contain opacity-30"
          src="/images/trong-dong-half.webp"
          alt=""
          aria-hidden="true"
        />
        <section className="overflow-hidden">
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--heritage-line)] pb-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs uppercase tracking-normal text-[var(--heritage-muted)]">Dấu tích và địa danh</p>
                <h2 className="mt-2 font-serif text-3xl text-[var(--heritage-brown)]">Điểm đến nổi bật</h2>
              </div>
              <Link to="/map" className="inline-flex items-center gap-1 text-sm text-[var(--heritage-muted)] transition hover:text-[var(--heritage-bronze)]">
                Xem tất cả
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {featuredPlaces.map((place) => (
                <Link
                  key={place.name}
                  to={place.href}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-lg shadow-[0_12px_24px_rgba(45,40,32,0.12)] transition hover:-translate-y-0.5"
                >
                  <img className="heritage-image absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" src={place.image} alt={place.name} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.45)] to-transparent px-4 pb-2 pt-12 text-white">
                    <p className="text-sm font-medium leading-5">{place.name}</p>
                    <p className="flex items-center gap-1 text-xs text-white/78">
                      <MapPin size={10} />
                      {place.province}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 sm:px-6 lg:h-[410px] lg:flex-row lg:items-start lg:px-8">
          <div className="relative min-h-[380px] overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-ink)] text-[var(--heritage-white)] shadow-[0_18px_36px_rgba(45,40,32,0.16)] lg:h-full lg:min-h-0 lg:w-[580px] lg:flex-none xl:w-[600px]">
            <img className="heritage-image absolute inset-0 h-full w-full object-cover opacity-75" src={heroImage} alt="Tham quan 3D Văn Miếu" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d2820] via-[#2d2820]/28 to-transparent" />
            <div className="relative p-6">
              <p className="text-xs uppercase tracking-normal text-[var(--heritage-paper-deep)]">Không gian số</p>
              <h2 className="mt-2 font-serif text-4xl text-[var(--heritage-paper-light)]">Tham quan 3D</h2>
              <p className="mt-2 text-base text-[rgba(248,241,227,0.82)]">Văn Miếu - Quốc Tử Giám, Hà Nội</p>
            </div>
            <button className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[rgba(248,241,227,0.86)] text-[var(--heritage-brown)] ring-1 ring-[var(--heritage-line)]">
              <Play className="ml-1" fill="currentColor" size={34} />
            </button>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div className="flex gap-2">
                {[heroImage, ...featuredPlaces.slice(0, 4).map((place) => place.image)].map((image, index) => (
                  <img key={`${image}-${index}`} className="heritage-image h-14 w-20 rounded border border-[var(--heritage-line)] object-cover" src={image} alt="" />
                ))}
              </div>
              <span className="hidden rounded-md border border-[var(--heritage-line)] bg-[rgba(248,241,227,0.86)] px-4 py-2 text-sm font-semibold text-[var(--heritage-brown)] sm:inline-flex">
                Bắt đầu tham quan
              </span>
            </div>
            <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg bg-[var(--heritage-paper-light)] text-[var(--heritage-brown)]">
              <Headset size={23} />
            </div>
          </div>

          <ProvinceGeoJsonMap className="w-full flex-1 lg:min-w-0" />
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-normal text-[var(--heritage-muted)]">Lý do bắt đầu</p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--heritage-brown)]">Vì sao nên khám phá di sản Việt online?</h2>
            <div className="mt-5 border-t border-[var(--heritage-line)] pt-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <span className="grid h-12 w-12 flex-none place-items-center rounded-full border border-[var(--heritage-bronze)] text-[var(--heritage-bronze)]">
                      <item.icon size={22} strokeWidth={1.7} />
                    </span>
                    <p className="text-sm leading-5 text-[var(--heritage-ink)]">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-[var(--heritage-line)] bg-[var(--heritage-paper-deep)] shadow-[0_18px_36px_rgba(45,40,32,0.12)]">
            <div className="grid grid-cols-[1fr_150px]">
              <div className="p-5">
                <h3 className="font-serif text-2xl text-[var(--heritage-brown)]">Bạn có câu chuyện về di sản?</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--heritage-muted)]">Chia sẻ hình ảnh, câu chuyện và ký ức địa phương để cùng gìn giữ di sản Việt Nam.</p>
                <Link to="/map" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--heritage-brown)] px-4 py-2 text-sm font-semibold text-[var(--heritage-white)]">
                  <Share2 size={16} />
                  Đóng góp ngay
                </Link>
              </div>
              <img className="heritage-image h-full min-h-44 object-cover" src="/images/bao-tang-lich-su.webp" alt="Chia sẻ di sản" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
