export function TicketCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 border border-line-paper rounded-xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function TicketCardTop({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function Perforation() {
  return <div className="perforation" />;
}

export function TicketCardStub({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-ink text-paper p-5 ${className}`}>{children}</div>
  );
}
