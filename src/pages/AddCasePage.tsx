import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { fetchSubDepartments, fetchDepartments, createCase } from '@/lib/api';

const subDepartments = [
  { id: 1, name_en: "Tehsildar Rudauli", name_hi: "तहसीलदार रुदौली" },
  { id: 2, name_en: "Tehsildar Milkipur", name_hi: "तहसीलदार मिल्कीपुर" },
  { id: 3, name_en: "Tehsildar Sohawal", name_hi: "तहसीलदार सोहावल" },
  { id: 4, name_en: "Shri Raj Bahadur Verma, Nayab Tehsildar (Survey)", name_hi: "श्री राज बहादुर वर्मा, नायब तहसीलदार (सर्वे)" },
  { id: 5, name_en: "Shri Ravindra Nath Upadhyay, Nayab Tehsildar (Nazul)", name_hi: "श्री रविन्द्र नाथ उपाध्याय, नायब तहसीलदार (नजूल)" },
  { id: 6, name_en: "Sub-District Magistrate, Rudauli", name_hi: "उप-जिलाधिकारी, रुदौली" },
  { id: 7, name_en: "Sub-District Magistrate, Milkipur", name_hi: "उप-जिलाधिकारी, मिल्कीपुर" },
  { id: 8, name_en: "Sub-District Magistrate, Sohawal", name_hi: "उप-जिलाधिकारी, सोहावल" },
  { id: 9, name_en: "Assistant Record Officer", name_hi: "सहायक अभिलेख अधिकारी" },
  { id: 10, name_en: "Tehsildar Sadar", name_hi: "तहसीलदार सदर" },
  { id: 11, name_en: "Tehsildar Bikapur", name_hi: "तहसीलदार बीकापुर" },
  { id: 12, name_en: "Addl. District Magistrate (Land Acquisition)", name_hi: "अपर जिलाधिकारी (भूमि अधिग्रहण)" },
  { id: 13, name_en: "City Magistrate", name_hi: "नगर मजिस्ट्रेट" },
  { id: 14, name_en: "Resident Magistrate", name_hi: "रेजिडेंट मजिस्ट्रेट" },
  { id: 15, name_en: "Deputy Divisional Consolidation", name_hi: "उप मंडलीय समेकन" },
  { id: 16, name_en: "Sub Divisional Magistrate Sadar", name_hi: "उप मंडलीय मजिस्ट्रेट सदर" },
  { id: 17, name_en: "Sub-District Magistrate, Bikapur", name_hi: "उप-जिलाधिकारी, बीकापुर" },
  { id: 18, name_en: "Chief Development Officer", name_hi: "मुख्य विकास अधिकारी" },
  { id: 19, name_en: "Addl. District Magistrate (Finance / Revenue) Ayodhya", name_hi: "अपर जिलाधिकारी (वित्त/राजस्व) अयोध्या" },
  { id: 20, name_en: "Addl. District Magistrate (City), Ayodhya", name_hi: "अपर जिलाधिकारी (नगर), अयोध्या" },
  { id: 21, name_en: "Addl. District Magistrate (Administration)", name_hi: "अपर जिलाधिकारी (प्रशासन)" },
  { id: 22, name_en: "Chief Revenue Officer", name_hi: "मुख्य राजस्व अधिकारी" },
  { id: 23, name_en: "Addl. District Magistrate (Law & Order)", name_hi: "अपर जिलाधिकारी (कानून एवं व्यवस्था)" },
];

const AddCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentLang } = useApp();
  const queryClient = useQueryClient();
  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    caseNumber: string;
    name: string;
    filingDate: Date | null;
    petitionNumber: string;
    noticeNumber: string;
    writType: 'Regular' | 'Contempt' | 'Custom' | '';
    customWritType: string;
    department: string;
    subDepartment: string;
    affidavitDueDate: Date | null;
    affidavitSubmissionDate: Date | null;
    counterAffidavitRequired: boolean;
  }>({
    caseNumber: '',
    name: '',
    filingDate: null,
    petitionNumber: '',
    noticeNumber: '',
    writType: '',
    customWritType: '',
    department: '',
    subDepartment: '',
    affidavitDueDate: null,
    affidavitSubmissionDate: null,
    counterAffidavitRequired: false,
  });

  const translations = {
    en: {
      title: "Add New Case",
      caseNumber: "Case Number",
      name: "Name",
      filingDate: "Filing Date",
      petitionNumber: "Petition Number",
      noticeNumber: "Notice Number",
      writType: "Writ Type",
      department: "Department",
      subDepartment: "Sub-Department",
      affidavitDueDate: "Due Date to Submit Affidavit",
      affidavitSubmissionDate: "Affidavit Submission Date",
      save: "Save Case",
      cancel: "Cancel",
      selectDate: "Select date",
      selectDepartment: "Select department",
      selectSubDepartment: "Select sub-department",
      selectWritType: "Select writ type",
      saved: "Case has been saved successfully",
      validation: "Please fill in all required fields",
      isthecounteraffidavittobefiledornot: " Is The Counter-Affidavit to be filed or not?",
      counterAffidavitinstruction: "Counter Affidavit (instruction)",
      yes: "Yes",
      no: "No",
      viewAllCases: "View All Cases",
      backToCases: "Back to Cases",
      customWritType: "Custom Writ Type",
      customWritTypePlaceholder: "Enter custom writ type",
      regular: "Regular",
      contempt: "Contempt",
      custom: "Custom"
    },
    hi: {
      title: "नया मामला जोड़ें",
      caseNumber: "क्रमांक संख्या",
      name: "नाम",
      filingDate: "डायरा दिनांक",
      petitionNumber: "रीट संख्या",
      noticeNumber: "नोटिस संख्या",
      writType: "रीट प्रकार",
      department: "विभाग",
      subDepartment: "उप-विभाग",
      affidavitDueDate: "प्रतिसपथ पत्र दाखिल करने हेतु निर्धारित तिथि",
      affidavitSubmissionDate: "प्रतिसपथ पत्र दाखिल होने की तिथि",
      save: "मामला सहेजें",
      cancel: "रद्द करें",
      selectDate: "तिथि चुनें",
      selectDepartment: "विभाग चुनें",
      selectSubDepartment: "उप-विभाग चुनें",
      selectWritType: "रीट प्रकार चुनें",
      saved: "मामला सफलतापूर्वक सहेज दिया गया है",
      validation: "कृपया सभी आवश्यक फ़ील्ड भरें",
      isthecounteraffidavittobefiledornot: "प्रतिसपथ पत्र पत्र दाखिल होना है या नहीं ?",
      counterAffidavitinstruction: "प्रतिसपथ पत्र (आदेश)",
      yes: "हां",
      no: "नहीं",
      viewAllCases: "सभी मामले देखें",
      backToCases: "मामलों पर वापस जाएं",
      customWritType: "कस्टम रीट प्रकार",
      customWritTypePlaceholder: "कस्टम रीट प्रकार दर्ज करें",
      regular: "नियमित",
      contempt: "अवमानना",
      custom: "कस्टम"
    }
  };

  const t = translations[currentLang];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Handle URL parameter for pre-selecting sub-department
    const subDeptParam = searchParams.get('subDepartment');
    if (subDeptParam && subDepartments.length > 0) {
      const subDept = subDepartments.find(sub => 
        sub._id === subDeptParam || sub.id === parseInt(subDeptParam)
      );
      if (subDept) {
        setFormData(prev => ({
          ...prev,
          department: subDept.departmentId.toString(),
          subDepartment: subDept._id || subDept.id.toString()
        }));
      }
    }
  }, [searchParams, subDepartments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsData, subDeptsData] = await Promise.all([
        fetchDepartments(),
        fetchSubDepartments()
      ]);
      
      setDepartments(deptsData);
      setSubDepartments(subDeptsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to static data
      setDepartments([
        { id: 1, name_en: "Administration Department", name_hi: "प्रशासन विभाग" },
        { id: 2, name_en: "Development department", name_hi: "विकास विभाग" },
      ]);
      setSubDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'department' ? { subDepartment: '' } : {}),
      ...(name === 'writType' && value !== 'Custom' ? { customWritType: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if custom writ type is required but not provided
    if (formData.writType === 'Custom' && !formData.customWritType.trim()) {
      toast.error(currentLang === 'hi' ? 'कृपया कस्टम रीट प्रकार दर्ज करें' : 'Please enter custom writ type');
      return;
    }

    if (
      !formData.caseNumber ||
      !formData.name ||
      !formData.filingDate ||
      !formData.petitionNumber ||
      !formData.writType ||
      !formData.department
    ) {
      toast.error(t.validation);
      return;
    }

    try {
      setSubmitting(true);
      
      // Find the selected sub-department to get the correct ID
      const selectedSubDept = subDepartments.find(sub => 
        sub._id === formData.subDepartment || sub.id === parseInt(formData.subDepartment)
      );
      
      // Determine the final writ type value
      const finalWritType = formData.writType === 'Custom' ? formData.customWritType : formData.writType;
      
      const caseData = {
        caseNumber: formData.caseNumber,
        name: formData.name,
        filingDate: formData.filingDate,
        petitionNumber: formData.petitionNumber,
        noticeNumber: formData.noticeNumber,
        writType: finalWritType,
        department: parseInt(formData.department),
        subDepartment: selectedSubDept ? selectedSubDept._id || selectedSubDept.id : undefined,
        affidavitDueDate: formData.affidavitDueDate,
        affidavitSubmissionDate: formData.affidavitSubmissionDate,
        counterAffidavitRequired: formData.counterAffidavitRequired,
        status: 'Pending' as const
      };

      console.log('Submitting case data:', caseData);
      const result = await createCase(caseData);
      console.log('Case created successfully:', result);
      
      toast.success(t.saved);
      
      // Navigate to all cases page for the sub-department if available
      if (formData.subDepartment) {
        navigate(`/all-cases/${formData.subDepartment}`);
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error(currentLang === 'hi' ? 'मामला बनाने में त्रुटि' : 'Error creating case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubDepartmentClick = (subDeptId: string) => {
    navigate(`/all-cases/${subDeptId}`);
  };

  const handleBackToCases = () => {
    if (formData.subDepartment) {
      navigate(`/all-cases/${formData.subDepartment}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Get available sub-departments for selected department
  const availableSubDepartments = formData.department 
    ? subDepartments.filter(sub => sub.departmentId === parseInt(formData.department))
    : [];

  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBackToCases}
            className="flex items-center gap-2"
          >
            {t.backToCases}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.caseNumber}
              </label>
              <Input
                type="text"
                name="caseNumber"
                value={formData.caseNumber}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.name}
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Filing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.filingDate}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.filingDate ? (
                      format(formData.filingDate, "PPP")
                    ) : (
                      <span>{t.selectDate}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.filingDate || undefined}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, filingDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Petition Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.petitionNumber}
              </label>
              <Input
                type="text"
                name="petitionNumber"
                value={formData.petitionNumber}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Notice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.noticeNumber}
              </label>
              <Input
                type="text"
                name="noticeNumber"
                value={formData.noticeNumber}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Writ Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.writType}
              </label>
              <select
                name="writType"
                value={formData.writType}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">{t.selectWritType}</option>
                <option value="Regular">{t.regular}</option>
                <option value="Contempt">{t.contempt}</option>
                <option value="Custom">{t.custom}</option>
              </select>
              
              {/* Custom Writ Type Input - Only show when Custom is selected */}
              {formData.writType === 'Custom' && (
                <div className="mt-2">
                  <Input
                    type="text"
                    name="customWritType"
                    placeholder={t.customWritTypePlaceholder}
                    value={formData.customWritType}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.department}
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">{t.selectDepartment}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {currentLang === 'hi' ? dept.name_hi : dept.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.subDepartment}
              </label>
              <select
                name="subDepartment"
                value={formData.subDepartment}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={!formData.department}
              >
                <option value="">{t.selectSubDepartment}</option>
                {availableSubDepartments.map((sub) => (
                  <option key={sub._id || sub.id} value={sub._id || sub.id}>
                    {currentLang === 'hi' ? sub.name_hi : sub.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Affidavit Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.affidavitDueDate}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.affidavitDueDate ? (
                      format(formData.affidavitDueDate, "PPP")
                    ) : (
                      <span>{t.selectDate}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.affidavitDueDate || undefined}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, affidavitDueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Affidavit Submission Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.affidavitSubmissionDate}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.affidavitSubmissionDate ? (
                      format(formData.affidavitSubmissionDate, "PPP")
                    ) : (
                      <span>{t.selectDate}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.affidavitSubmissionDate || undefined}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, affidavitSubmissionDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Counter Affidavit Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.isthecounteraffidavittobefiledornot}
              </label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={formData.counterAffidavitRequired ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, counterAffidavitRequired: true }))}
                >
                  {t.yes}
                </Button>
                <Button
                  type="button"
                  variant={!formData.counterAffidavitRequired ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, counterAffidavitRequired: false }))}
                >
                  {t.no}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToCases}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {currentLang === 'hi' ? 'सहेज रहा है...' : 'Saving...'}
                </div>
              ) : (
                t.save
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddCasePage;
