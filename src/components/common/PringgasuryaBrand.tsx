interface PringgasuryaBrandProps {
  compact?: boolean;
}

export function PringgasuryaBrand({ compact = false }: PringgasuryaBrandProps) {
  return (
    <>
      <svg className="pringgasurya-mark" viewBox="0 0 48 48" role="img" aria-label="Logo PRINGGASURYA">
        <g className="pringgasurya-mark__sun" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4">
          <circle cx="24" cy="11.5" r="5.25" />
          <path d="M24 2.25v2M14.8 5.2l1.5 1.5M33.2 5.2l-1.5 1.5M11 13h2.2M34.8 13H37" />
        </g>
        <g className="pringgasurya-mark__plant" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6">
          <path d="M24 34.5V17.75" />
          <path d="M23.8 27.5c-6.8.1-10.4-3.2-10.6-8.6 5.9-.1 10.1 2.9 10.6 8.6Z" />
          <path d="M24.2 23.7c6.4.1 9.6-3 9.8-8.1-5.6-.1-9.3 2.7-9.8 8.1Z" />
        </g>
        <g className="pringgasurya-mark__water" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6">
          <path d="M12.5 36.5h23" />
          <path d="M15.5 42h17" />
        </g>
      </svg>
      <span className="public-brand__lockup">
        <b>PRINGGASURYA</b>
        {!compact && <small>Smart Agrivoltaic Irrigation</small>}
      </span>
    </>
  );
}
