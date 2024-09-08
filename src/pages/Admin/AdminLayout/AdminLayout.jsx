import React, { useState } from 'react';
import styles from './adminLayout.module.scss';
import JobManagement from '../JobManagement/JobManagement';
import CompanyManagement from '../CompanyManagement/CompanyManagement';
import CandidateManagement from '../CandidateManagement/CandidateManagement';
import CategoryManagement from '../CategoryManagement/CategoryManagement.jsx';
import Sidebar from '../SideBar/SideBar';
import Header from '../Header/Header';
import Overview from '../Overview/Overview';

const AdminLayout = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <Overview />;
      case 'job':
        return <JobManagement />;
      case 'company':
        return <CompanyManagement />;
      case 'candidate':
        return <CandidateManagement />;
      case 'category':
        return <CategoryManagement />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className={styles.adminLayout}>
      <div className={styles.margin}>

      <Header />
      </div>
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
