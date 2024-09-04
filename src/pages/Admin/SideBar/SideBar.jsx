import React from 'react';
import styles from '../SideBar/sideBar.module.scss';

const Sidebar = ({ setSelectedTab, selectedTab }) => {
  return (
    <div className={styles.sidebar}>
      <div
        className={`${styles.tab} ${selectedTab === 'overview' ? styles.active : ''}`}
        onClick={() => setSelectedTab('overview')}
      >
        Tổng quan
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'job' ? styles.active : ''}`}
        onClick={() => setSelectedTab('job')}
      >
        Quản lí việc làm
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'company' ? styles.active : ''}`}
        onClick={() => setSelectedTab('company')}
      >
        Quản lí công ty
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'candidate' ? styles.active : ''}`}
        onClick={() => setSelectedTab('candidate')}
      >
        Quản lí ứng viên
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'category' ? styles.active : ''}`}
        onClick={() => setSelectedTab('category')}
      >
        Danh mục công việc
      </div>
    </div>
  );
};

export default Sidebar;
