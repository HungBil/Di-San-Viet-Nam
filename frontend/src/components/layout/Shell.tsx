import { Globe2, Landmark, Search, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#1f1b16]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#102832]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-[#d9b46f]/45 bg-[#d9b46f]/18 text-[#f6d99b]">
              <Landmark size={24} strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-xl font-semibold leading-5 text-[#f6d99b]">Di Sản Việt</span>
              <span className="hidden truncate text-xs text-white/72 sm:block">Khám phá lịch sử, kết nối tự hào</span>
            </span>
          </Link>

          <nav className="hidden flex-1 justify-center gap-7 text-sm font-medium text-white/78 lg:flex">
            <NavLink className={({ isActive }) => navClass(isActive)} to="/">
              Trang chủ
            </NavLink>
            <NavLink className={({ isActive }) => navClass(isActive)} to="/map">
              Khám phá
            </NavLink>
            <span className="py-2">Tỉnh thành</span>
            <span className="py-2">Bảo tàng 3D</span>
            <span className="py-2">Câu chuyện lịch sử</span>
            <span className="py-2">Sự kiện</span>
          </nav>

          <div className="flex flex-none items-center gap-3">
            <button className="hidden h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10 sm:grid" aria-label="Tìm kiếm">
              <Search size={19} />
            </button>
            <button className="hidden items-center gap-1 rounded-full px-2 py-1 text-sm text-white/85 transition hover:bg-white/10 sm:flex">
              <Globe2 size={17} />
              VI
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#102832]" aria-label="Tài khoản">
              <UserRound size={18} />
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function navClass(isActive: boolean) {
  return [
    "relative py-2 transition",
    isActive ? "text-[#f6d99b] after:absolute after:inset-x-0 after:-bottom-3 after:h-px after:bg-[#f6d99b]" : "hover:text-white"
  ].join(" ");
}

