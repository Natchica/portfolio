interface TransitionSectionProps {
  readonly id?: string;
}

export function TransitionSection({ id }: TransitionSectionProps) {
  return (
    <section
      id={id}
      className="transition-section relative"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-0">
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-cyber-400/20 to-transparent opacity-0" />
      </div>
    </section>
  );
}
