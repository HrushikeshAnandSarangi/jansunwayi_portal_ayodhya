import React from 'react';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/Header';
import CourtNoticeWriter from '@/components/NoticeWriter'

const PrintCasePage:React.FC=() =>{
  const {currentLang,isLoggedIn,toggleLanguage}=useApp()
  return (
    <>
        <Header isLoggedIn={isLoggedIn} currentLang={currentLang} toggleLanguage={toggleLanguage}/>
        <CourtNoticeWriter/>
    </>
  )
}
export default PrintCasePage;

