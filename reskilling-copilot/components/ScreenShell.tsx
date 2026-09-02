import { IconBackArrow } from "./icons/LatticeIcons";

export default function ScreenShell({
  title,
  subtitle,
  eyebrow,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        {eyebrow && (
          <p className="mb-1 flex items-center justify-center gap-1.5 font-display text-xs font-bold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-primary-pale bg-surface p-6 shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="absolute left-0 top-0 z-10 flex h-12 w-12 items-start justify-start rounded-br-[1.5rem] bg-primary p-2.5 text-white transition hover:bg-primary-dark"
          >
            <IconBackArrow className="h-5 w-5" />
          </button>
        )}
        <div className={onBack ? "pt-7" : undefined}>{children}</div>
      </div>
    </div>
  );
}
