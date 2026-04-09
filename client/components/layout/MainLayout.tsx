import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col">
        <Sidebar onClose={closeMobileMenu} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleMobileMenu} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 md:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar - Only visible on mobile when menu is open */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileMenu}
          />
          {/* Sidebar Overlay */}
          <div className="absolute inset-y-0 left-0 w-64 bg-background">
            <Sidebar onClose={closeMobileMenu} />
          </div>
        </div>
      )}
    </div>
  );
}
