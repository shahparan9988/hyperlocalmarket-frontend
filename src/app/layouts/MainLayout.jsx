import { Outlet } from "react-router-dom";
import TopHeader from "./components/TopHeader";
import BottomNav from "./components/BottomNav";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <div className="app-frame">
        <TopHeader />
        <main className="min-w-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     <TopHeader />

  //     <main className="mx-auto max-w-7xl px-4 py-6">
  //       <Outlet />
  //     </main>

  //     <BottomNav />
  //   </div>
  // );
}