import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Edit, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useQueryClient } from '@tanstack/react-query';
import {  deleteCase, updateCase, fetchCaseById } from '@/lib/api';

// Mock data for demonstration
const getMockCase = (id: string) => {
  const today = new Date();
  const hearingDate = new Date(today);
  hearingDate.setDate(today.getDate() + 5); // Within 7 days

  const filingDate = new Date(today);
  filingDate.setDate(today.getDate() - 30);

  const affidavitDueDate = new Date(today);
  affidavitDueDate.setDate(today.getDate() + 15);

  return {
    id,
    caseNumber: '00125',
    name: 'Sample Case',
    filingDate,
    petitionNumber: 'WP/12345/2025',
    noticeNumber: 'NT/789/2025',
    writType: 'Regular',
    department: '1',
    subDepartment: '',
    status: 'Pending',
    hearingDate,
    reminderSent: false,
    affidavitDueDate,
    affidavitSubmissionDate: null,
    counterAffidavitRequired: false,
    reminderSentCount: 0,
  };
};

const departments = [
  {
    id: 1,
    name_en: "Administration Department",
    name_hi: "प्रशासन विभाग",
    subDepartments: [
      { id: '1a', name_en: "Admin Sub 1", name_hi: "प्रशासन उप 1" },
      { id: '1b', name_en: "Admin Sub 2", name_hi: "प्रशासन उप 2" }
    ]
  },
  {
    id: 2,
    name_en: "Development department",
    name_hi: "विकास विभाग",
    subDepartments: [
      { id: '2a', name_en: "Dev Sub 1", name_hi: "विकास उप 1" }
    ]
  },
  // ...baaki departments bina subDepartments ke...
  { id: 3, name_en: "District Panchayat Department", name_hi: "जिला पंचायत विभाग" },
  { id: 4, name_en: "District Social Welfare Department", name_hi: "जिला समाज कल्याण विभाग" },
  // ...yahan se aage subDepartments nahi diye...
];

const writTypes = [
  { value: 'Regular', name_en: 'Regular', name_hi: 'नियमित' },
  { value: 'Contempt', name_en: 'Contempt', name_hi: 'अवमानना' }
];

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLang } = useApp();
  const queryClient = useQueryClient();

  const [caseData, setCaseData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [sending, setSending] = useState(false);

useEffect(() => {
  const loadCase = async () => {
    if (id) {
      try {
        const data = await fetchCaseById(id); // ✅ await the result
        setCaseData(data);
        setEditedData(data);
      } catch (err) {
        toast.error("Failed to fetch case");
        navigate('/dashboard');
      }
    }
  };

  loadCase(); // Call the async function
}, [id]);


  // SubDepartment state
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('');

  // Update subDepartment on department change
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditedData((prev: any) => ({
      ...prev,
      department: value,
      subDepartment: ''
    }));
    setSelectedSubDepartment('');
  };

  // Update subDepartment value
  const handleSubDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditedData((prev: any) => ({
      ...prev,
      subDepartment: value
    }));
    setSelectedSubDepartment(value);
  };

  const translations = {
    en: {
      title: "Case Details",
      caseNumber: "Case Number",
      name: "Name",
      filingDate: "Filing Date",
      petitionNumber: "Petition Number",
      noticeNumber: "Notice Number",
      writType: "Writ Type",
      department: "Department",
      subDepartment: "Sub Department",
      status: "Status",
      hearingDate: "Hearing Date",
      reminderSent: "Reminder Sent 1 Week Prior",
      affidavitDueDate: "Due Date to Submit Affidavit",
      affidavitSubmissionDate: "Affidavit Submission Date",
      isthecounteraffidavittobefiledornot: " Is The Counter-Affidavit to be filed or not?",
      edit: "Edit",
      delete: "Delete",
      save: "Save Changes",
      cancel: "Cancel",
      pending: "Pending",
      resolved: "Resolved",
      yes: "Yes",
      no: "No",
      selectDate: "Select date",
      deleteTitle: "Delete Case",
      deleteDescription: "Are you sure you want to delete this case? This action cannot be undone.",
      deleteConfirm: "Yes, delete case",
      deleteCancel: "Cancel",
      sendReminder: "Send Reminder",
      hearingPending: "Hearing Pending",
      upcomingHearing: "Upcoming Hearing",
      counterAffidavitinstruction: "Counter Affidavit (instruction)",
      saved: "Changes saved successfully",
      deleted: "Case deleted successfully",
      reminderSentSuccess: "Reminder sent successfully"
    },
    hi: {
      title: "मामले का विवरण",
      caseNumber: "क्रमांक संख्या",
      name: "नाम",
      filingDate: "डायरा दिनांक",
      petitionNumber: "रीट संख्या",
      noticeNumber: "नोटिस संख्या",
      writType: "रीट प्रकार",
      department: "विभाग",
      subDepartment: "उप विभाग",
      status: "मामले की स्थिति",
      hearingDate: "सुनवाई दिनांक",
      reminderSent: "एक सप्ताह पूर्व स्मारक भेजा गया?",
      affidavitDueDate: "प्रतिसपथ पत्र दाखिल करने हेतु निर्धारित तिथि",
      affidavitSubmissionDate: "प्रतिसपथ पत्र दाखिल होने की तिथि",
      isthecounteraffidavittobefiledornot:"प्रतिशपथ पत्र पत्र दाखिल होना है या नहीं ?",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "सहेजें परिवर्तन",
      cancel: "रद्द करें",
      pending: "लंबित",
      resolved: "निराकृत",
      yes: "हां",
      no: "नहीं",
      selectDate: "तिथि चुनें",
      deleteTitle: "मामला हटाएं",
      deleteDescription: "क्या आप वाकई इस मामले को हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता है।",
      deleteConfirm: "हां, मामला हटाएं",
      deleteCancel: "रद्द करें",
      sendReminder: "भेजें अनुस्मारक",
      hearingPending: "सुनवाई लंबित",
      upcomingHearing: "आगामी सुनवाई",
      counterAffidavitinstruction: "प्रतिसपथ पत्र (आदेश)",
      saved: "परिवर्तन सफलतापूर्वक सहेजे गए",
      deleted: "मामला सफलतापूर्वक हटा दिया गया है",
      reminderSentSuccess: "अनुस्मारक सफलतापूर्वक भेजा गया"
    }
  };

  const t = translations[currentLang];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = () => {
    setEditedData((prev: any) => ({
      ...prev,
      status: prev.status === 'Pending' ? 'Resolved' : 'Pending'
    }));
  };

  const handleReminderToggle = () => {
    setEditedData((prev: any) => ({
      ...prev,
      reminderSent: !prev.reminderSent
    }));
  };

  const handleCounterAffidavitToggle = () => {
    setEditedData((prev: any) => ({
      ...prev,
      counterAffidavitRequired: !prev.counterAffidavitRequired
    }));
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateCase(id, editedData);
      setCaseData(editedData);
      setIsEditing(false);
      toast.success(t.saved);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    } catch (error) {
      toast.error(currentLang === 'hi' ? 'मामला अपडेट करने में त्रुटि हुई।' : 'Failed to update case.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCase(id);
      toast.success(t.deleted);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      navigate('/dashboard');
    } catch (error) {
      toast.error(currentLang === 'hi' ? 'मामला हटाने में त्रुटि हुई।' : 'Failed to delete case.');
    }
  };

  const sendReminder = async () => {
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setShowEmailDialog(false);
    setReminderEmail('');
    toast.success(`${t.reminderSentSuccess} (${reminderEmail})`);
    queryClient.invalidateQueries({ queryKey: ['cases'] });
  };

  const isWithin7Days = (date: Date) => {
    if (!date) return false;
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const needsReminder = caseData?.status === 'Pending' &&
    caseData?.hearingDate &&
    isWithin7Days(caseData.hearingDate) &&
    !caseData?.reminderSent;

  if (!caseData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jansunwayi-blue"></div>
          <span className="ml-3 text-jansunwayi-darkgray">
            {currentLang === 'hi' ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
          </span>
        </div>
      </div>
    );
  }

  const getDepartmentName = (id: string) => {
    const dept = departments.find(d => String(d.id) === String(id));
    return dept ? (currentLang === 'hi' ? dept.name_hi : dept.name_en) : '';
  };

  const getSubDepartmentName = (deptId: string, subId: string) => {
    const dept = departments.find(d => String(d.id) === String(deptId));
    if (!dept || !dept.subDepartments) return '';
    const sub = dept.subDepartments.find((s: any) => String(s.id) === String(subId));
    return sub ? (currentLang === 'hi' ? sub.name_hi : sub.name_en) : '';
  };

  const getWritTypeName = (value: string) => {
    const writType = writTypes.find(w => w.value === value);
    return currentLang === 'hi' ? writType?.name_hi : writType?.name_en;
  };

  const isContempt = caseData.writType === 'Contempt';

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
            {caseData.writType === 'Contempt' && (
              <span className="mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                {currentLang === 'en' ? 'Contempt Case' : 'अवमानना मामला'}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  {t.edit}
                </Button>
                <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.delete}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave} variant="default" className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  {t.save}
                </Button>
                <Button onClick={() => {
                  setIsEditing(false);
                  setEditedData(caseData);
                }} variant="outline" className="flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {t.cancel}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Case Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.caseNumber}
            </label>
            {isEditing ? (
              <Input
                type="text"
                name="caseNumber"
                value={editedData.caseNumber}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <div className="text-gray-900">{caseData.caseNumber}</div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.name}
            </label>
            {isEditing ? (
              <Input
                type="text"
                name="name"
                value={editedData.name}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <div className="text-gray-900">{caseData.name}</div>
            )}
          </div>

          {/* Filing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.filingDate}
            </label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedData.filingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedData.filingDate && !isNaN(new Date(editedData.filingDate).getTime()) 
                      ? format(new Date(editedData.filingDate), "PPP") 
                      : <span>{t.selectDate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editedData.filingDate}
                    onSelect={(date) => setEditedData((prev: any) => ({ ...prev, filingDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="text-gray-900">
                {caseData.filingDate && !isNaN(new Date(caseData.filingDate).getTime())
                  ? format(new Date(caseData.filingDate), "PPP")
                  : '-'}

              </div>
            )}
          </div>

          {/* Petition Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.petitionNumber}
            </label>
            {isEditing ? (
              <input
                type="text"
                name="petitionNumber"
                value={editedData.petitionNumber}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {caseData.petitionNumber}
              </div>
            )}
          </div>

          {/* Notice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.noticeNumber}
            </label>
            {isEditing ? (
              <input
                type="text"
                name="noticeNumber"
                value={editedData.noticeNumber}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {caseData.noticeNumber}
              </div>
            )}
          </div>

          {/* Writ Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.writType}
            </label>
            {isEditing ? (
              <select
                name="writType"
                value={editedData.writType}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {writTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {currentLang === 'hi' ? type.name_hi : type.name_en}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-gray-900">
                {getWritTypeName(caseData.writType)}
              </div>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.department}
            </label>
            {isEditing ? (
              <select
                name="department"
                value={editedData.department}
                onChange={handleDepartmentChange}
                className="input-field"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {currentLang === 'hi' ? dept.name_hi : dept.name_en}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {getDepartmentName(caseData.department)}
              </div>
            )}
          </div>

          {/* SubDepartment */}
          {isEditing && (() => {
            const dept = departments.find(d => String(d.id) === String(editedData.department));
            if (dept && dept.subDepartments && dept.subDepartments.length > 0) {
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.subDepartment}
                  </label>
                  <select
                    name="subDepartment"
                    value={editedData.subDepartment || ''}
                    onChange={handleSubDepartmentChange}
                    className="input-field"
                  >
                    <option value="">{currentLang === 'hi' ? 'चुनें' : 'Select'}</option>
                    {dept.subDepartments.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {currentLang === 'hi' ? sub.name_hi : sub.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })()}

          {!isEditing && caseData.subDepartment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.subDepartment}
              </label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {getSubDepartmentName(caseData.department, caseData.subDepartment)}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.status}
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={editedData.status === 'Pending' ? 'default' : 'outline'}
                  onClick={handleStatusToggle}
                >
                  {t.pending}
                </Button>
                <Button
                  type="button"
                  variant={editedData.status === 'Resolved' ? 'default' : 'outline'}
                  onClick={handleStatusToggle}
                >
                  {t.resolved}
                </Button>
              </div>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {caseData.status === 'Pending' ? t.pending : t.resolved}
              </div>
            )}
          </div>

          {/* Hearing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.hearingDate}
            </label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedData.hearingDate && !isNaN(new Date(editedData.hearingDate).getTime()) ? (
                      format(new Date(editedData.hearingDate), "PPP")
                    ) : (
                      <span>{t.selectDate}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editedData.hearingDate}
                    onSelect={(date) => setEditedData((prev: any) => ({ ...prev, hearingDate: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {caseData.hearingDate ? format(caseData.hearingDate, 'yyyy-MM-dd') : '-'}
              </div>
            )}
          </div>

          {/* Reminder Sent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.reminderSent}
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={editedData.reminderSent ? 'default' : 'outline'}
                  onClick={handleReminderToggle}
                >
                  {t.yes}
                </Button>
                <Button
                  type="button"
                  variant={!editedData.reminderSent ? 'default' : 'outline'}
                  onClick={handleReminderToggle}
                >
                  {t.no}
                </Button>
                <span className="ml-4 text-xs text-gray-500">
                  {currentLang === 'hi' ? `भेजा गया: ${editedData.reminderSentCount || 0} बार` : `Sent: ${editedData.reminderSentCount || 0} times`}
                </span>
              </div>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
                <span>{caseData.reminderSent ? t.yes : t.no}</span>
                <span className="ml-4 text-xs text-gray-500">
                  {currentLang === 'hi' ? `भेजा गया: ${caseData.reminderSentCount || 0} बार` : `Sent: ${caseData.reminderSentCount || 0} times`}
                </span>
              </div>
            )}
          </div>

          {/* Affidavit Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.affidavitDueDate}
            </label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedData.affidavitDueDate && !isNaN(new Date(editedData.affidavitDueDate).getTime()) ? (
                        format(new Date(editedData.affidavitDueDate), "PPP")
                      ) : (
                        <span>{t.selectDate}</span>
                      )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editedData.affidavitDueDate}
                    onSelect={(date) => setEditedData((prev: any) => ({ ...prev, affidavitDueDate: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            ) : (
            <div className="text-gray-900">
              {caseData.filingDate && !isNaN(new Date(caseData.filingDate).getTime())
                ? format(new Date(caseData.filingDate), "PPP")
                : '-'}
            </div>
            )}
          </div>

          {/* Affidavit Submission Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.affidavitSubmissionDate}
            </label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedData.affidavitSubmissionDate && !isNaN(new Date(editedData.affidavitSubmissionDate).getTime()) ? (
                        format(new Date(editedData.affidavitSubmissionDate), "PPP")
                      ) : (
                        <span>{t.selectDate}</span>
                      )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editedData.affidavitSubmissionDate}
                    onSelect={(date) => setEditedData((prev: any) => ({ ...prev, affidavitSubmissionDate: date }))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                {caseData.affidavitSubmissionDate && !isNaN(new Date(caseData.affidavitSubmissionDate).getTime()) 
                  ? format(new Date(caseData.affidavitSubmissionDate), 'yyyy-MM-dd') 
                  : '-'}
              </div>
            )}
          </div>

          {/* Counter Affidavit Section */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.counterAffidavitinstruction}
            </label>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">
                {t.isthecounteraffidavittobefiledornot}
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleCounterAffidavitToggle}
                  className={`px-4 py-2 rounded-md ${
                    editedData.counterAffidavitRequired
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {t.yes}
                </button>
                <button
                  type="button"
                  onClick={handleCounterAffidavitToggle}
                  className={`px-4 py-2 rounded-md ${
                    !editedData.counterAffidavitRequired
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {t.no}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-jansunwayi-red hover:bg-red-600">
              {t.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog for Reminder */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentLang === 'hi' ? 'ईमेल पता दर्ज करें' : 'Enter Email Address'}</DialogTitle>
            <DialogDescription>
              {currentLang === 'hi'
                ? 'कृपया वह ईमेल पता दर्ज करें जिस पर आप रिमाइंडर भेजना चाहते हैं।'
                : 'Please enter the email address where you want to send the reminder.'}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            placeholder={currentLang === 'hi' ? 'ईमेल पता' : 'Email address'}
            value={reminderEmail}
            onChange={e => setReminderEmail(e.target.value)}
            disabled={sending}
          />
          <DialogFooter>
            <Button onClick={handleSendEmail} disabled={sending || !reminderEmail}>
              {sending ? (currentLang === 'hi' ? 'भेजा जा रहा है...' : 'Sending...') : (currentLang === 'hi' ? 'भेजें' : 'Send')}
            </Button>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={sending}>
              {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseDetailPage;
