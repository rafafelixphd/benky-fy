'use client';

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-left element */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-purple opacity-20 rounded-full blur-3xl" />

      {/* Top-right element */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-secondary-purple opacity-20 rounded-full blur-3xl" />

      {/* Bottom-left element */}
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary-purple opacity-20 rounded-full blur-3xl" />

      {/* Bottom-right element */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-purple opacity-20 rounded-full blur-3xl" />
    </div>
  );
}
