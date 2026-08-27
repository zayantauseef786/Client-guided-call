import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface Props {
  children: ReactNode;
  topBar?: ReactNode;
  nav?: boolean;
}

/** Mobile-first shell: full-bleed on phones, centered phone-width column on wider screens. */
export default function AppShell({ children, topBar, nav = true }: Props) {
  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ background: "var(--bg-canvas)" }}
    >
      <div
        className="w-full max-w-[480px] min-h-screen flex flex-col relative"
        style={{ background: "var(--bg-page)" }}
      >
        {topBar}
        <div className="flex-1 flex flex-col">{children}</div>
        {nav && <BottomNav />}
      </div>
    </div>
  );
}
