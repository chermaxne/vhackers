type IconProps = { className?: string };

// Bottom-nav glyph: rounded head + shoulders, matches the "heavily rounded,
// no sharp corners" shape language from the Lattice style doc.
export function IconProfile({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4.5 20c0-4.42 3.36-7 7.5-7s7.5 2.58 7.5 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Bottom-nav glyph: two offset rounded cards, echoing the swipe-deck peek.
export function IconStackedCards({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      <rect x="4" y="4" width="12" height="12" rx="3" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Bottom-nav glyph: roadmap/list view. Deliberately reuses the progress-row
// vocabulary (small circle marker + track) from the roadmap screens instead
// of a generic list icon.
export function IconList({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="5" cy="6" r="1.6" fill="currentColor" />
      <rect x="9" y="4.8" width="11" height="2.4" rx="1.2" fill="currentColor" />
      <circle cx="5" cy="12" r="1.6" fill="currentColor" />
      <rect x="9" y="10.8" width="8" height="2.4" rx="1.2" fill="currentColor" />
      <circle cx="5" cy="18" r="1.6" fill="currentColor" />
      <rect x="9" y="16.8" width="6" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}

// For the quarter-circle back-button chip. Single rounded chevron, thick
// stroke so it reads at small sizes against a solid accent fill.
export function IconBackArrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 6.5 9 12l6 5.5"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Replaces the placeholder document emoji on the resume-upload screen.
export function IconUploadDocument({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 11.5 12 8.5 15 11.5M12 8.5V15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
