import { Globe2, Landmark, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import GlassSurface from "../common/GlassSurface";

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#1f1b16]">
      <header className="sticky top-0 z-30 px-3 py-3 text-white sm:px-4" style={isHomePage ? { marginBottom: "-88px" } : undefined}>
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={34}
          backgroundOpacity={0.12}
          saturation={1.55}
          displace={0.45}
          distortionScale={-150}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          brightness={54}
          opacity={0.88}
          mixBlendMode="screen"
          className="glass-navbar mx-auto w-full max-w-7xl"
        >
          <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-3 px-3 py-3 sm:px-5 lg:flex-nowrap lg:gap-4 lg:px-7">
            <Link to="/" className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-[#f6d99b]/35 bg-white/10 text-[#f6d99b] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                <Landmark size={24} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-xl font-semibold leading-5 text-[#f6d99b]">Di Sản Việt</span>
                <span className="hidden truncate text-xs text-white/72 sm:block">Khám phá lịch sử, kết nối tự hào</span>
              </span>
            </Link>

            <nav className="hidden flex-1 justify-center gap-2 text-sm font-medium text-white/78 lg:flex">
              <NavLink className={({ isActive }) => navClass(isActive)} to="/">
                Trang chủ
              </NavLink>
              <NavLink className={({ isActive }) => navClass(isActive)} to="/map">
                Khám phá
              </NavLink>
              <span className="glass-navbar-link px-3 py-2">Tỉnh thành</span>
              <NavLink className={({ isActive }) => navClass(isActive)} to="/3d">
                Bảo tàng 3D
              </NavLink>
              <span className="glass-navbar-link px-3 py-2">Câu chuyện lịch sử</span>
              <span className="glass-navbar-link px-3 py-2">Sự kiện</span>
            </nav>

            <div className="flex flex-none items-center gap-3">
              <button className="glass-navbar-button hidden h-9 w-9 place-items-center rounded-full text-white/85 sm:grid" aria-label="Tìm kiếm">
                <Search size={19} />
              </button>
              <button className="glass-navbar-button hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm text-white/85 sm:flex">
                <Globe2 size={17} />
                VI
              </button>
              <button
                className="glass-navbar-button grid h-9 w-9 place-items-center rounded-full text-white/85 lg:hidden"
                type="button"
                aria-label={isMobileNavOpen ? "Đóng menu" : "Mở menu"}
                aria-controls="site-navigation"
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
              >
                {isMobileNavOpen ? <X size={18} /> : <Menu size={19} />}
              </button>
              <button className="glass-navbar-button glass-navbar-account grid h-9 w-9 place-items-center rounded-full" aria-label="Tài khoản">
                <UserRound size={18} />
              </button>
            </div>
          </div>
        </GlassSurface>
        <nav
          id="site-navigation"
          aria-hidden={!isMobileNavOpen}
          className={[
            "glass-navbar glass-navbar-mobile-menu absolute left-3 right-3 top-full z-40 flex-col gap-2 overflow-hidden rounded-[28px] px-3 py-3 text-sm font-medium text-white/86 backdrop-blur-xl sm:left-4 sm:right-4 lg:hidden",
            isMobileNavOpen ? "flex" : "hidden"
          ].join(" ")}
        >
          <NavLink className={({ isActive }) => navClass(isActive)} to="/">
            Trang chủ
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/map">
            Khám phá
          </NavLink>
          <span className="glass-navbar-link px-3 py-2">Tỉnh thành</span>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/3d">
            Bảo tàng 3D
          </NavLink>
          <span className="glass-navbar-link px-3 py-2">Câu chuyện lịch sử</span>
          <span className="glass-navbar-link px-3 py-2">Sự kiện</span>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

function navClass(isActive: boolean) {
  return [
    "glass-navbar-link px-3 py-2 transition",
    isActive ? "glass-navbar-link--active text-[#f6d99b]" : "hover:text-white"
  ].join(" ");
}
