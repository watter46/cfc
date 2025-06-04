import React, { type ReactNode } from "react";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-space-900">
      <Header />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
