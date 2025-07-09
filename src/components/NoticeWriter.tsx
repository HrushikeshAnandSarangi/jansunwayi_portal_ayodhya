"use client"

import { useState, useEffect } from "react"

// Types
interface Department {
  id: number
  name_en: string
  name_hi: string
}

interface SubDepartment {
  _id: string
  departmentId: number
  name_en: string
  name_hi: string
}

interface Case {
  _id: string
  caseNumber: string
  name: string
  filingDate: string
  petitionNumber?: string
  noticeNumber?: string
  writType?: string
  department: number
  subDepartment?: SubDepartment
  status: string
  hearingDate?: string
}

interface NoticeData {
  noticeType: "regular" | "contempt" | "custom"
  language: "en" | "hi"
  department?: Department
  subDepartment?: SubDepartment
  caseData?: Case
  customContent?: string
  date: string
  letterNumber: string
  subject: string
  content: string
  signatory: string
  designation: string
}

const API_BASE = "http://localhost:5000"

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #printable-content, #printable-content * {
      visibility: visible;
    }
    #printable-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      display: block !important;
    }
    .no-print {
      display: none !important;
    }
  }
`

export default function CourtNoticeWriter() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<"en" | "hi">("hi")
  const [departments, setDepartments] = useState<Department[]>([])
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)
  const [noticeData, setNoticeData] = useState<NoticeData>({
    noticeType: "regular",
    language: "hi",
    date: new Date().toLocaleDateString("en-GB"),
    letterNumber: "",
    subject: "",
    content: "",
    signatory: "",
    designation: "",
  })

  const handlePrint = () => {
    window.print()
  }

  // Fetch departments
  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE}/departments`)
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchSubDepartments = async (departmentId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/sub-departments?departmentId=${departmentId}`)
      const data = await response.json()
      setSubDepartments(data)
    } catch (error) {
      console.error("Error fetching sub-departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCases = async (departmentId: number, subDepartmentId?: string) => {
    try {
      setLoading(true)
      let url = `${API_BASE}/cases?department=${departmentId}`
      if (subDepartmentId) {
        url += `&subDepartment=${subDepartmentId}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setCases(data.cases || [])
    } catch (error) {
      console.error("Error fetching cases:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateRegularNoticeContent = (caseData: Case, dept: Department, subDept?: SubDepartment) => {
    if (language === "hi") {
      return {
        subject: `रिट याचिका संख्या ${caseData.caseNumber} के संबंध में`,
        content: `
कृपया उपर्युक्त विषयक का संदर्भ लें। उपरोक्त रिट याचिका के संबंध में मा० उच्च न्यायालय द्वारा निर्देशित कार्यवाही हेतु निम्नलिखित जानकारी प्रेषित की जा रही है:

1. याचिकाकर्ता का नाम: ${caseData.name}
2. रिट याचिका संख्या: ${caseData.caseNumber}
3. दाखिल दिनांक: ${new Date(caseData.filingDate).toLocaleDateString("hi-IN")}
4. विभाग: ${dept.name_hi}
${subDept ? `5. उप-विभाग: ${subDept.name_hi}` : ""}

उपरोक्त मामले में आवश्यक कार्यवाही करने तथा प्रतिवेदन प्रेषित करने का कष्ट करें।

कृपया इस मामले में तत्परता से आवश्यक कार्यवाही सुनिश्चित करें तथा अनुपालना रिपोर्ट इस कार्यालय को प्रेषित करने का कष्ट करें।
        `,
      }
    } else {
      return {
        subject: `Regarding Writ Petition No. ${caseData.caseNumber}`,
        content: `
Please refer to the above subject. The following information is being sent for the action directed by the Hon'ble High Court regarding the above writ petition:

1. Petitioner's Name: ${caseData.name}
2. Writ Petition Number: ${caseData.caseNumber}
3. Filing Date: ${new Date(caseData.filingDate).toLocaleDateString("en-GB")}
4. Department: ${dept.name_en}
${subDept ? `5. Sub-Department: ${subDept.name_en}` : ""}

Please take necessary action in the above matter and send the report.

Please ensure prompt necessary action in this matter and send the compliance report to this office.
        `,
      }
    }
  }

  const generateContemptNoticeContent = (caseData: Case, dept: Department, subDept?: SubDepartment) => {
    if (language === "hi") {
      return {
        subject: `अवमानना आवेदन संख्या ${caseData.caseNumber} में वांछित आवश्यक कार्यवाही किये जाने के सम्बन्ध में`,
        content: `
कृपया उपर्युक्त विषयक का सन्दर्भ ग्रहण करने का कष्ट करें। जिसके द्वारा अवमानना आवेदन संख्या ${caseData.caseNumber}, ${caseData.name} से सम्बंधित है। 

प्रश्नगत अवमानना वाद में प्रभावी पैरवी/सम्पूर्ण विधिक कार्यवाही निर्धारित सीमा के भीतर पूर्ण कराने की अपेक्षा की गयी है।

अतः वाद सम्बंधित अवमानना वाद में तत्परता प्रभावी पैरवी / सम्पूर्ण विधिक कार्यवाही निर्धारित सीमा के भीतर सुनिश्चित करायें। प्रश्नगत अवमानना वाद में ${caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString("hi-IN") : "अगली तारीख"} की तिथि नियत है।

यदि कोई अनिश्चित स्थिति उत्पन्न होती है तो आप स्वयं जिम्मेदार होंगे, तथा कृत कार्यवाही से जिलाधिकारी महोदय को अवगत कराने का कष्ट करें।
        `,
      }
    } else {
      return {
        subject: `Regarding necessary action required in Contempt Application No. ${caseData.caseNumber}`,
        content: `
Please refer to the above subject matter relating to Contempt Application No. ${caseData.caseNumber}, ${caseData.name}.

Effective advocacy/complete legal proceedings are expected to be completed within the prescribed limit in the contempt case in question.

Therefore, ensure prompt effective advocacy/complete legal proceedings within the prescribed limit in the contempt case. The date ${caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString("en-GB") : "next hearing"} is fixed in the contempt case in question.

If any uncertain situation arises, you will be responsible yourself, and please inform the District Magistrate about the action taken.
        `,
      }
    }
  }

  const handleNoticeTypeSelect = (type: "regular" | "contempt" | "custom") => {
    setNoticeData((prev) => ({ ...prev, noticeType: type }))
    if (type === "custom") {
      setStep(6) // Skip to custom content step
    } else {
      setStep(2)
    }
  }

  const handleDepartmentSelect = (dept: Department) => {
    setNoticeData((prev) => ({ ...prev, department: dept }))
    fetchSubDepartments(dept.id)
    setStep(3)
  }

  const handleSubDepartmentSelect = (subDept: SubDepartment) => {
    setNoticeData((prev) => ({ ...prev, subDepartment: subDept }))
    fetchCases(noticeData.department!.id, subDept._id)
    setStep(4)
  }

  const handleCaseSelect = (caseData: Case) => {
    const generatedContent =
      noticeData.noticeType === "regular"
        ? generateRegularNoticeContent(caseData, noticeData.department!, noticeData.subDepartment)
        : generateContemptNoticeContent(caseData, noticeData.department!, noticeData.subDepartment)

    setNoticeData((prev) => ({
      ...prev,
      caseData,
      subject: generatedContent.subject,
      content: generatedContent.content,
      letterNumber: `${Math.floor(Math.random() * 9000) + 1000}/${noticeData.noticeType === "contempt" ? "अवमानना" : "रिट"}/${new Date().getFullYear()}`,
      signatory: language === "hi" ? "अपर जिलाधिकारी" : "Additional District Magistrate",
      designation: language === "hi" ? "(वि०/न्या०)/प्रभारी अधिकारी रिट" : "(Legal)/In-charge Officer Writ",
    }))
    setStep(5)
  }

  const resetForm = () => {
    setStep(1)
    setNoticeData({
      noticeType: "regular",
      language: "hi",
      date: new Date().toLocaleDateString("en-GB"),
      letterNumber: "",
      subject: "",
      content: "",
      signatory: "",
      designation: "",
    })
    setSubDepartments([])
    setCases([])
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
              {language === "hi" ? "न्यायालयीन नोटिस लेखक" : "Court Notice Writer"}
            </h2>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                {language === "hi" ? "भाषा चुनें:" : "Select Language:"}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
                style={{ padding: "8px", width: "200px", marginBottom: "20px" }}
              >
                <option value="hi">हिंदी</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <h3 style={{ marginBottom: "20px" }}>
                {language === "hi" ? "नोटिस का प्रकार चुनें:" : "Select Notice Type:"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <button
                  onClick={() => handleNoticeTypeSelect("regular")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {language === "hi" ? "नियमित नोटिस" : "Regular Notice"}
                </button>
                <button
                  onClick={() => handleNoticeTypeSelect("contempt")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {language === "hi" ? "अवमानना नोटिस" : "Contempt Notice"}
                </button>
                <button
                  onClick={() => handleNoticeTypeSelect("custom")}
                  style={{
                    padding: "15px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {language === "hi" ? "कस्टम नोटिस" : "Custom Notice"}
                </button>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h3>{language === "hi" ? "विभाग चुनें:" : "Select Department:"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept)}
                  style={{
                    padding: "12px",
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #2196F3",
                    borderRadius: "5px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {language === "hi" ? dept.name_hi : dept.name_en}
                </button>
              ))}
            </div>
            <button onClick={resetForm} style={{ marginTop: "20px", padding: "10px 20px" }}>
              {language === "hi" ? "वापस" : "Back"}
            </button>
          </div>
        )

      case 3:
        return (
          <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h3>{language === "hi" ? "उप-विभाग चुनें:" : "Select Sub-Department:"}</h3>
            {loading ? (
              <p>{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                {subDepartments.map((subDept) => (
                  <button
                    key={subDept._id}
                    onClick={() => handleSubDepartmentSelect(subDept)}
                    style={{
                      padding: "12px",
                      backgroundColor: "#e8f5e8",
                      border: "1px solid #4CAF50",
                      borderRadius: "5px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {language === "hi" ? subDept.name_hi : subDept.name_en}
                  </button>
                ))}
                <button
                  onClick={() => {
                    fetchCases(noticeData.department!.id)
                    setStep(4)
                  }}
                  style={{
                    padding: "12px",
                    backgroundColor: "#fff3e0",
                    border: "1px solid #ff9800",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {language === "hi" ? "सभी केसेस देखें (बिना उप-विभाग)" : "View All Cases (Without Sub-Department)"}
                </button>
              </div>
            )}
            <button onClick={() => setStep(2)} style={{ marginTop: "20px", padding: "10px 20px" }}>
              {language === "hi" ? "वापस" : "Back"}
            </button>
          </div>
        )

      case 4:
        return (
          <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h3>{language === "hi" ? "केस चुनें:" : "Select Case:"}</h3>
            {loading ? (
              <p>{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</p>
            ) : (
              <div style={{ marginTop: "20px" }}>
                {cases.length === 0 ? (
                  <p>{language === "hi" ? "कोई केस नहीं मिला" : "No cases found"}</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {cases.map((caseItem) => (
                      <div
                        key={caseItem._id}
                        onClick={() => handleCaseSelect(caseItem)}
                        style={{
                          padding: "15px",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          cursor: "pointer",
                          backgroundColor: "#f9f9f9",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                      >
                        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                          {language === "hi" ? "केस नंबर:" : "Case Number:"} {caseItem.caseNumber}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          {language === "hi" ? "नाम:" : "Name:"} {caseItem.name}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                          {language === "hi" ? "दाखिल दिनांक:" : "Filing Date:"}{" "}
                          {new Date(caseItem.filingDate).toLocaleDateString()}
                        </div>
                        <div style={{ color: caseItem.status === "Pending" ? "#f44336" : "#4CAF50" }}>
                          {language === "hi" ? "स्थिति:" : "Status:"} {caseItem.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setStep(3)} style={{ marginTop: "20px", padding: "10px 20px" }}>
              {language === "hi" ? "वापस" : "Back"}
            </button>
          </div>
        )

      case 5:
        return (
          <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h3>{language === "hi" ? "नोटिस संपादित करें:" : "Edit Notice:"}</h3>
            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "पत्र संख्या:" : "Letter Number:"}
                </label>
                <input
                  type="text"
                  value={noticeData.letterNumber}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, letterNumber: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "दिनांक:" : "Date:"}
                </label>
                <input
                  type="text"
                  value={noticeData.date}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, date: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "विषय:" : "Subject:"}
                </label>
                <input
                  type="text"
                  value={noticeData.subject}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, subject: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "सामग्री:" : "Content:"}
                </label>
                <textarea
                  value={noticeData.content}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "हस्ताक्षरकर्ता:" : "Signatory:"}
                </label>
                <input
                  type="text"
                  value={noticeData.signatory}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, signatory: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "पदनाम:" : "Designation:"}
                </label>
                <input
                  type="text"
                  value={noticeData.designation}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, designation: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {language === "hi" ? "प्रिंट करें" : "Print Notice"}
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {language === "hi" ? "वापस" : "Back"}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {language === "hi" ? "नया नोटिस" : "New Notice"}
                </button>
              </div>
            </div>
          </div>
        )

      case 6: // Custom notice
        return (
          <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h3>{language === "hi" ? "कस्टम नोटिस बनाएं:" : "Create Custom Notice:"}</h3>
            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "पत्र संख्या:" : "Letter Number:"}
                </label>
                <input
                  type="text"
                  value={noticeData.letterNumber}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, letterNumber: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  placeholder={language === "hi" ? "पत्र संख्या दर्ज करें" : "Enter letter number"}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "दिनांक:" : "Date:"}
                </label>
                <input
                  type="text"
                  value={noticeData.date}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, date: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "विषय:" : "Subject:"}
                </label>
                <input
                  type="text"
                  value={noticeData.subject}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, subject: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  placeholder={language === "hi" ? "विषय दर्ज करें" : "Enter subject"}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "नोटिस की सामग्री:" : "Notice Content:"}
                </label>
                <textarea
                  value={noticeData.content}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  placeholder={language === "hi" ? "अपना नोटिस यहाँ लिखें..." : "Write your notice here..."}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "हस्ताक्षरकर्ता:" : "Signatory:"}
                </label>
                <input
                  type="text"
                  value={noticeData.signatory}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, signatory: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  placeholder={language === "hi" ? "हस्ताक्षरकर्ता का नाम" : "Signatory name"}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  {language === "hi" ? "पदनाम:" : "Designation:"}
                </label>
                <input
                  type="text"
                  value={noticeData.designation}
                  onChange={(e) => setNoticeData((prev) => ({ ...prev, designation: e.target.value }))}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  placeholder={language === "hi" ? "पदनाम दर्ज करें" : "Enter designation"}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  {language === "hi" ? "प्रिंट करें" : "Print Notice"}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {language === "hi" ? "वापस" : "Back"}
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <div className="no-print">{renderStep()}</div>

        {/* Print Template */}
        <div id="printable-content" style={{ display: "none" }}>
          <div
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm",
              backgroundColor: "white",
              fontFamily: language === "hi" ? "Noto Sans Devanagari, Arial, sans-serif" : "Times New Roman, serif",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "black",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
                {language === "hi" ? "कार्यालय जिलाधिकारी, अयोध्या" : "Office of District Magistrate, Ayodhya"}
              </div>
              {noticeData.noticeType === "contempt" && (
                <div style={{ fontSize: "14px", color: "red", fontWeight: "bold" }}>
                  {language === "hi" ? "अति आवश्यक / सर्वोच्च प्राथमिकता" : "Most Urgent / Highest Priority"}
                </div>
              )}
            </div>

            {/* Date and Letter Number */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                {language === "hi" ? "दिनांक:" : "Date:"} {noticeData.date}
              </div>
              <div>
                {language === "hi" ? "पत्रांक:" : "Letter No:"} {noticeData.letterNumber}
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: "20px" }}>
              <strong>{language === "hi" ? "विषय-" : "Subject-"}</strong> {noticeData.subject}
            </div>

            {/* Addressee */}
            <div style={{ marginBottom: "20px" }}>
              {noticeData.department && (
                <div>
                  {language === "hi" ? noticeData.department.name_hi : noticeData.department.name_en}
                  {noticeData.subDepartment && (
                    <div>{language === "hi" ? noticeData.subDepartment.name_hi : noticeData.subDepartment.name_en}</div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ marginBottom: "40px", textAlign: "justify", whiteSpace: "pre-line" }}>
              {noticeData.content}
            </div>

            {/* Copy to */}
            <div style={{ marginBottom: "20px" }}>
              <div>{language === "hi" ? "संख्या व दिनांक उपरोक्त।" : "Number and date as above."}</div>
              <div>
                {language === "hi"
                  ? "प्रतिलिपि-जिलाधिकारी, महोदय को सादर अवलोकनार्थ।"
                  : "Copy to- District Magistrate, Sir for kind perusal."}
              </div>
            </div>

            {/* Signature */}
            <div style={{ textAlign: "right", marginTop: "60px" }}>
              <div style={{ marginBottom: "60px" }}>{language === "hi" ? "हस्ताक्षर" : "Signature"}</div>
              <div>({noticeData.signatory})</div>
              <div>{noticeData.designation}</div>
              <div>{language === "hi" ? "अयोध्या।" : "Ayodhya."}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
