import {
  Bot,
  ChevronRight,
  Compass,
  Cuboid,
  HandHeart,
  MapPin,
  Play,
  Search,
  Send,
  Share2,
  Telescope,
  UsersRound,
  Headset,
  ZoomIn
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heritageHero from "../assets/heritage-hero.png";

const heroImage = heritageHero;

const featuredPlaces = [
  {
    name: "Hoàng thành Thăng Long",
    province: "Hà Nội",
    href: "/landmarks/thang-long-citadel",
    image: heritageHero
  },
  {
    name: "Địa đạo Củ Chi",
    province: "TP. Hồ Chí Minh",
    href: "/map",
    image: heritageHero
  },
  {
    name: "Nhà tù Hỏa Lò",
    province: "Hà Nội",
    href: "/map",
    image: heritageHero
  },
  {
    name: "Thánh địa Mỹ Sơn",
    province: "Quảng Nam",
    href: "/landmarks/hoi-an-ancient-town",
    image: heritageHero
  },
  {
    name: "Khu di tích Xô viết Nghệ Tĩnh",
    province: "Nghệ An",
    href: "/map",
    image: heritageHero
  },
  {
    name: "Dinh Độc Lập",
    province: "TP. Hồ Chí Minh",
    href: "/map",
    image: heritageHero
  }
];

const featureStrip = [
  { icon: Cuboid, title: "Tham quan 3D", text: "Trải nghiệm không gian chân thực như thật" },
  { icon: Bot, title: "Thuyết minh AI", text: "Hiểu sâu hơn với trợ lý AI thông minh" },
  { icon: ZoomIn, title: "Câu chuyện lịch sử", text: "Những câu chuyện hấp dẫn đằng sau di tích" },
  { icon: UsersRound, title: "Kết nối cộng đồng", text: "Chia sẻ, đóng góp và giữ gìn di sản" }
];

const benefits = [
  { icon: Compass, title: "Tiết kiệm thời gian, chi phí di chuyển" },
  { icon: Cuboid, title: "Trải nghiệm mọi lúc, mọi nơi" },
  { icon: Telescope, title: "Nội dung chuẩn xác, được kiểm chứng" },
  { icon: HandHeart, title: "Góp phần bảo tồn và lan tỏa di sản Việt" }
];

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/map");
  }

  return (
    <div className="bg-[#f7f3eb]">
      <section className="relative overflow-hidden bg-[#102832] text-white">
        <img className="absolute inset-0 h-full w-full object-cover opacity-70" src={heroImage} alt="Di sản Việt Nam" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/42 to-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#10100f] to-transparent" />

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_260px] lg:px-8">
          <div className="flex max-w-3xl flex-col justify-center">
            <h1 className="max-w-full font-serif text-4xl font-semibold leading-[1.08] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Trải nghiệm
              <br />
              Di sản Việt Nam
              <br />
              mọi lúc, mọi nơi
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/88">
              Khám phá các bảo tàng, di tích lịch sử, văn hóa đặc sắc của 63 tỉnh thành thông qua công nghệ số.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex max-w-md overflow-hidden rounded-lg bg-white text-[#1f1b16] shadow-[0_18px_55px_rgba(0,0,0,0.32)]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm outline-none"
                placeholder="Tìm di tích, bảo tàng, địa danh..."
              />
              <button className="grid w-14 place-items-center text-[#1f1b16]" aria-label="Tìm kiếm">
                <Search size={24} />
              </button>
            </form>

            <div className="mt-9 grid gap-5 border-t border-white/18 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {featureStrip.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="grid h-14 w-14 flex-none place-items-center rounded-xl border border-[#d9b46f]/55 bg-black/22 text-[#f6d99b]">
                    <item.icon size={26} strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/68">{item.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden self-center rounded-2xl border border-white/18 bg-[#263031]/78 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur lg:block">
            <h2 className="font-serif text-xl font-semibold text-white">Điểm đến nổi bật</h2>
            <div className="mt-4 overflow-hidden rounded-xl bg-black/30">
              <img
                className="h-56 w-full object-cover"
                src={heritageHero}
                alt="Cột cờ Lũng Cú"
              />
              <div className="p-4">
                <p className="font-semibold text-white">Cột cờ Lũng Cú</p>
                <p className="mt-1 text-sm text-white/70">Hà Giang</p>
                <Link to="/map" className="mt-4 inline-flex rounded-lg border border-[#d9b46f]/60 px-4 py-2 text-sm font-semibold text-[#f6d99b]">
                  Khám phá ngay
                </Link>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2, 3].map((item) => (
                <span key={item} className={item === 0 ? "h-2 w-2 rounded-full bg-[#f6d99b]" : "h-2 w-2 rounded-full bg-white/35"} />
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold">Điểm đến nổi bật</h2>
          <Link to="/map" className="hidden items-center gap-1 text-sm text-[#6f665a] hover:text-[#9b6a2d] sm:inline-flex">
            Xem tất cả
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {featuredPlaces.map((place) => (
            <Link key={place.name} to={place.href} className="group relative h-40 overflow-hidden rounded-xl shadow-[0_12px_30px_rgba(35,28,18,0.16)]">
              <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={place.image} alt={place.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-sm font-semibold">{place.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/78">
                  <MapPin size={13} />
                  {place.province}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-9 sm:px-6 lg:grid-cols-[1.4fr_0.75fr_0.7fr] lg:px-8">
        <div className="relative min-h-[410px] overflow-hidden rounded-2xl bg-[#111] text-white shadow-[0_20px_45px_rgba(35,28,18,0.18)]">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-78"
            src={heritageHero}
            alt="Tham quan 3D Văn Miếu"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/15 to-black/12" />
          <div className="relative p-6">
            <h2 className="font-serif text-3xl font-semibold">Tham quan 3D</h2>
            <p className="mt-2 text-sm text-white/82">Văn Miếu - Quốc Tử Giám, Hà Nội</p>
          </div>
          <button className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/62 text-white ring-1 ring-white/30">
            <Play className="ml-1" fill="currentColor" size={34} />
          </button>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div className="flex gap-2">
              {[heroImage, ...featuredPlaces.slice(0, 4).map((place) => place.image)].map((image) => (
                <img key={image} className="h-14 w-20 rounded-lg border border-white/35 object-cover" src={image} alt="" />
              ))}
            </div>
            <span className="hidden rounded bg-black/56 px-4 py-2 text-sm font-semibold sm:inline-flex">Bắt đầu tham quan</span>
          </div>
          <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg bg-white text-[#111]">
            <Headset size={23} />
          </div>
        </div>

        <div className="rounded-2xl bg-[#151715] p-6 text-white shadow-[0_20px_45px_rgba(35,28,18,0.18)]">
          <h2 className="font-serif text-2xl font-semibold text-[#f6d99b]">Trợ lý AI - Hỏi về di tích</h2>
          <div className="mt-5 rounded-xl bg-[#f4dfbc] p-4 text-sm leading-6 text-[#2d2418]">
            Văn Miếu - Quốc Tử Giám được xây dựng vào thời gian nào và có ý nghĩa gì?
          </div>
          <div className="mt-5 flex gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full border border-white/18 bg-white/8">
              <Bot size={22} />
            </span>
            <p className="rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/78">
              Văn Miếu - Quốc Tử Giám được xây dựng vào năm 1070 dưới triều vua Lý Thánh Tông. Đây là trường đại học đầu tiên của Việt Nam, nơi đào tạo nhân tài cho đất nước và cũng là biểu tượng của truyền thống hiếu học.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/8 p-3">
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/45" placeholder="Bạn muốn hỏi gì về di tích?" />
            <button className="grid h-9 w-9 place-items-center rounded-full bg-[#f6d99b] text-[#151715]">
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#5c7d86] p-5 text-white shadow-[0_20px_45px_rgba(35,28,18,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">Khám phá theo bản đồ</h2>
            <select className="rounded-lg bg-white px-3 py-2 text-xs text-[#1f1b16]">
              <option>Tất cả loại hình</option>
            </select>
          </div>
          <div className="relative mt-6 h-72">
            <div className="home-map-shape absolute left-1/2 top-0 h-full w-44 -translate-x-1/2 bg-[#f1d08b]" />
            {["18%:57%", "27%:44%", "48%:55%", "61%:57%", "75%:50%", "84%:59%"].map((pos, index) => {
              const [top, left] = pos.split(":");
              return <span key={pos} className="absolute h-4 w-4 rounded-full border-2 border-white bg-[#d6a34a]" style={{ top, left }} title={`Điểm ${index + 1}`} />;
            })}
          </div>
          <div className="grid gap-2 text-xs text-white/82">
            {["Di tích lịch sử", "Bảo tàng", "Danh lam thắng cảnh", "Di tích cách mạng"].map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                <span className={["bg-[#d6a34a]", "bg-[#8fb071]", "bg-[#e6c36d]", "bg-[#c85445]"][index] + " h-3 w-3 rounded-full"} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Vì sao nên khám phá di sản Việt online?</h2>
          <div className="mt-5 border-t border-[#d7cdbc] pt-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-full border border-[#b78b45] text-[#9b6a2d]">
                    <item.icon size={22} strokeWidth={1.8} />
                  </span>
                  <p className="text-sm leading-5 text-[#3e352b]">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl bg-[#ead4a9] shadow-[0_18px_38px_rgba(35,28,18,0.14)]">
          <div className="grid grid-cols-[1fr_150px]">
            <div className="p-5">
              <h3 className="font-serif text-xl font-semibold">Bạn có câu chuyện về di sản?</h3>
              <p className="mt-3 text-sm leading-6 text-[#4a3d2e]">Chia sẻ hình ảnh, câu chuyện của bạn để cùng gìn giữ di sản Việt Nam.</p>
              <Link to="/map" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#5b3f24] px-4 py-2 text-sm font-semibold text-white">
                <Share2 size={16} />
                Đóng góp ngay
              </Link>
            </div>
            <img className="h-full min-h-44 object-cover" src={heritageHero} alt="Chia sẻ di sản" />
          </div>
        </div>
      </section>
    </div>
  );
}
