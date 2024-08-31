import React, { useState } from 'react';
import styles from './adminLayout.module.scss';
import JobManagement from '../JobManagement/JobManagement';
import CompanyManagement from '../CompanyManagement/CompanyManagement';
import CandidateManagement from '../CandidateManagement/CandidateManagement';
import Sidebar from '../SideBar/SideBar';
import Header from '../Header/Header';

const AdminLayout = () => {
  const [selectedTab, setSelectedTab] = useState('job');

  const renderContent = () => {
    switch (selectedTab) {
      case 'job':
        return <JobManagement />;
      case 'company':
        return <CompanyManagement />;
      case 'candidate':
        return <CandidateManagement />;
      default:
        return <JobManagement />;
    }
  };

  return (
    <div className={styles.adminLayout}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar setSelectedTab={setSelectedTab} selectedTab={selectedTab} />
        <div className={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
