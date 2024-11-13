import React, { useState } from 'react';
import styles from './adminLayout.module.scss';
import JobManagement from '../JobManagement/JobManagement';
import CompanyManagement from '../CompanyManagement/CompanyManagement';
import CandidateManagement from '../CandidateManagement/CandidateManagement';
import CategoryManagement from '../CategoryManagement/CategoryManagement.jsx';
import Sidebar from '../SideBar/SideBar';
import Header from '../HeaderAdmin/HeaderAdmin';
import Overview from '../Overview/Overview';
import SkillManagement from '../SkillManagement/SkillManagement.jsx';
import ChangePasswordAdmin from '../ChangePasswordAdmin/ChangePasswordAdmin.jsx';

import logo from '../../../images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import usePageTitle from '../../../hooks/usePageTitle.jsx';

const AdminLayout = () => {
  usePageTitle('Admin');

  const [selectedTab, setSelectedTab] = useState('overview');

  const [isSidebarVisible, setIsSidebarVisible] = useState(true); 
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

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
      case 'skill':
        return <SkillManagement />;
      case 'changePasswordAdmin':
        return <ChangePasswordAdmin />;
      default:
        return <Overview />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    // <div className={styles.adminLayout}>
    //   <div className={styles.margin}>

    //   <Header />
    //   </div>
    //   <div className={styles.mainContent}>
    //     <Sidebar 
    //       setSelectedTab={setSelectedTab} 
    //       selectedTab={selectedTab} 
    //     />
    //     <div className={styles.content}>
    //       {renderContent()}
    //     </div>
    //   </div>
    // </div>
    <div className={styles.adminLayout}>
       <div className={styles.margin}>
          <div className={styles.header}>
                <div className={clsx(styles.iconList)} onClick={toggleSidebar}>
                  <i className="fa-solid fa-bars"></i>
                </div>
            <Link to="/admin">
              <div className={clsx(styles.logoIcon)}>
                <img src={logo} alt="Logo" className={styles.logo} />
              </div>
            </Link>
            <div className={styles.title}>Admin</div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>

      <div className={styles.mainContent}>
        {/* {(isSidebarVisible || window.innerWidth <= 768) && ( */}
        {(isSidebarVisible || window.innerWidth > 768) && (
          <Sidebar 
            setSelectedTab={setSelectedTab} 
            selectedTab={selectedTab} 
          />
        )}
        <div className={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
