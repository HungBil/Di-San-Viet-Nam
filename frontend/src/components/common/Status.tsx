export function LoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="mx-auto grid min-h-[320px] max-w-7xl place-items-center px-4">
      <div className="rounded border border-ink/10 bg-white px-5 py-4 text-sm text-ink/70 shadow-soft">{label}</div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto grid min-h-[320px] max-w-7xl place-items-center px-4">
      <div className="rounded border border-clay/20 bg-clay/10 px-5 py-4 text-sm text-clay">{message}</div>
    </div>
  );
}

