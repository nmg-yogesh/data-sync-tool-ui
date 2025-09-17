import React from 'react';

interface Props {
  active: string;
  setActive: (tab: string) => void;
  tabs?: string[];
}

const Tabs: React.FC<Props> = ({ active, setActive, tabs = ['connections', 'dashboard', 'sync-rules', 'tables', 'bulk-transfer'] }) => {
  return (
    <div className="mb-6">
      <nav className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              active === tab ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
