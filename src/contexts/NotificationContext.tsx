import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCases, fetchDepartments, fetchSubDepartments } from '@/lib/api';
import { format, addDays, isBefore } from 'date-fns';
import { useApp } from './AppContext';

interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'hearing' | 'reminder' | 'info';
  date: Date;
  caseId: string;
  departmentName: string;
  subDepartmentName: string;
}

interface NotificationContextType {
  notifications: NotificationType[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { currentLang } = useApp();

  // Fetch all cases
  const { data: casesData } = useQuery({
    queryKey: ['cases'],
    queryFn: () => fetchCases(),
  });

  // Fetch departments and sub-departments for mapping
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  useEffect(() => {
    const generateNotifications = async () => {
      if (!casesData?.cases) return;

      const upcomingHearings = casesData.cases.filter((caseItem: any) => {
        if (!caseItem.hearingDate || caseItem.status !== 'Pending') return false;
        
        const hearingDate = new Date(caseItem.hearingDate);
        const fiveDaysFromNow = addDays(new Date(), 5);
        
        return isBefore(new Date(), hearingDate) && isBefore(hearingDate, fiveDaysFromNow);
      });

      const notificationsWithDeptInfo = await Promise.all(
        upcomingHearings.map(async (caseItem: any) => {
          // Get department name
          let departmentName = '';
          if (departmentsData) {
            const dept = departmentsData.find((d: any) => d.id === caseItem.department);
            departmentName = currentLang === 'hi' ? dept?.name_hi || dept?.name_en || '' : dept?.name_en || '';
          }

          // Get sub-department name
          let subDepartmentName = '';
          if (caseItem.subDepartment && caseItem.department) {
            try {
              const subDepts = await fetchSubDepartments(caseItem.department);
              const subDept = subDepts.find((sd: any) => sd.id === caseItem.subDepartment);
              subDepartmentName = currentLang === 'hi' ? subDept?.name_hi || subDept?.name_en || '' : subDept?.name_en || '';
            } catch (error) {
              console.error('Error fetching sub-departments:', error);
            }
          }

          return {
            id: `${caseItem._id}-hearing`,
            title: currentLang === 'hi' ? 'आगामी सुनवाई' : 'Upcoming Hearing',
            message: currentLang === 'hi'
              ? `मामला संख्या ${caseItem.caseNumber} की सुनवाई ${format(new Date(caseItem.hearingDate), 'dd/MM/yyyy')} को है`
              : `Case ${caseItem.caseNumber} has hearing scheduled on ${format(new Date(caseItem.hearingDate), 'dd/MM/yyyy')}`,
            type: 'hearing',
            date: new Date(caseItem.hearingDate),
            caseId: caseItem._id,
            departmentName: departmentName,
            subDepartmentName: subDepartmentName
          };
        })
      );

      setNotifications(notificationsWithDeptInfo);
    };

    generateNotifications();
  }, [casesData, departmentsData, currentLang]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}; 