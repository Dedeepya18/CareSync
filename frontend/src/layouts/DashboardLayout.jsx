import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DisclaimerNotice from '../components/common/DisclaimerNotice';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
          <div className="mt-12 mb-4">
            <DisclaimerNotice />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

