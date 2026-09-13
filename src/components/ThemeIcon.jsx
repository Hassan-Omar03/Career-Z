export default function ThemeIcon({ theme }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      {theme === 'dark' ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : <path d="M20.5 15.3A9 9 0 0 1 8.7 3.5a9 9 0 1 0 11.8 11.8Z" />}
    </svg>
  );
}
