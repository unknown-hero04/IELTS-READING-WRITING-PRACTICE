import React from 'react';

interface HeaderProps {
  section: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ section, children }) => {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">IELTS Academic Simulator</h1>
        <div className="flex items-center space-x-4">
            <span className="text-xl font-semibold text-blue-600">{section}</span>
            {children}
        </div>
      </div>
    </header>
  );
};

export default Header;
