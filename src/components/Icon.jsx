const PATHS = {
  home: <><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5h5v5"/></>,
  map: <><path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z"/><path d="M9 4v14"/><path d="M15 6v14"/></>,
  review: <><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v3.5h-3.5"/></>,
  mistake: <><path d="M6 3h9l5 5v13H6z"/><path d="M14.5 3v5H20"/><path d="M10 12l4 4"/><path d="M14 12l-4 4"/></>,
  analysis: <><path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 17v-5"/><path d="M13 17V9"/><path d="M18 17v-8"/></>,
  book: <><path d="M5 4.5A2 2 0 0 1 7 3h12v15H7a2 2 0 0 0-2 2z"/><path d="M5 4.5V20a2 2 0 0 0 2 1.5h12"/><path d="M9 7h6"/><path d="M9 10.5h6"/></>,
  library: <><path d="M4 5h4v15H4z"/><path d="M10 5h4v15h-4z"/><path d="M16.5 5.5l3.5.9-3 14.6-3.5-.9"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.5 12a7.5 7.5 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.2-1.3L14.5 2h-5l-.4 2.5a7.6 7.6 0 0 0-2.2 1.3l-2.3-1-2 3.4 2 1.5a7.5 7.5 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 2.2 1.3L9.5 22h5l.4-2.5a7.6 7.6 0 0 0 2.2-1.3l2.3 1 2-3.4-2-1.5c.06-.43.1-.86.1-1.3z"/></>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
  flag: <><path d="M6 21V4"/><path d="M6 4.5h11l-1.8 3.5L17 11.5H6"/></>,
  check: <><path d="M4 12.5l5 5L20 6.5"/></>,
  chevron: <><path d="M9 5l7 7-7 7"/></>,
  pencil: <><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/></>,
  target: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>,
  note: <><path d="M5 3.5h14v17l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M8.5 8h7"/><path d="M8.5 11.5h7"/><path d="M8.5 15h4"/></>,
  log: <><path d="M5 4.5h10l4 4V20H5z"/><path d="M14 4.5v4.5h4.5"/><path d="M8 13h7"/><path d="M8 16.5h5"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  arrowRight: <><path d="M5 12h13"/><path d="M13 6l6 6-6 6"/></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
  sun: <><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></>,
  spark: <><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M12 9l1.5 1.5L12 12l-1.5-1.5z" fill="currentColor" stroke="none"/></>,
  help:  <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2.5-2.5 4"/><circle cx="12" cy="17.5" r=".75" fill="currentColor" stroke="none"/></>,
  trash: <><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 7l1 12h12l1-12"/><path d="M9 7V4h6v3"/></>,
};

export default function Icon({ name, size = 20, stroke = 1.7, style = {} }) {
  const paths = PATHS[name] || PATHS.home;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}
