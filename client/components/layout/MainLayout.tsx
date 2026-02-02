import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto pt-20 pb-8">
          <div className="px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
