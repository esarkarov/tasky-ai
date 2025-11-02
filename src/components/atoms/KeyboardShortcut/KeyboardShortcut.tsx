interface KeyboardShortcutProps {
  kbdList: string[];
}

export const KeyboardShortcut = ({ kbdList }: KeyboardShortcutProps) => {
  return (
    <div className="inline-flex items-center space-x-1 text-xs font-mono">
      <span className="sr-only">Keyboard shortcut: </span>

      {kbdList.map((item, index) => (
        <kbd
          key={index}
          className="rounded-md bg-background/10 px-1.5 py-0.5 text-foreground/90"
          aria-label={item}>
          {item}
        </kbd>
      ))}
    </div>
  );
};
