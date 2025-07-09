import React from 'react';
import { useApp } from '@/contexts/AppContext';
import DashboardChart from '@/components/department/DashboardChart';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { currentLang } = useApp();
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          onClick={() => navigate('/all-cases')}
        >
          {currentLang === 'hi' ? 'सभी मामले' : 'All Cases'}
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {currentLang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
      </h1>
      <DashboardChart currentLang={currentLang} />
    </div>
  );
};

export default HomePage; 