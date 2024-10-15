import React from 'react';
import styles from '../SideBar/sideBar.module.scss';
import clsx from 'clsx';

const Sidebar = ({ setSelectedTab, selectedTab }) => {
  return (
    <div className={styles.sidebar}>
      <div
        className={`${styles.tab} ${selectedTab === 'overview' ? styles.active : ''}`}
        onClick={() => setSelectedTab('overview')}
      >
        <i className="fa-solid fa-chart-simple"></i>
        <p className={clsx(styles.text)}>Thống kê</p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'job' ? styles.active : ''}`}
        onClick={() => setSelectedTab('job')}
      >
        <i className="fa-solid fa-briefcase"></i>
        <p className={clsx(styles.text)}>Quản lí việc làm</p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'company' ? styles.active : ''}`}
        onClick={() => setSelectedTab('company')}
      >
        <i className="fa-solid fa-building"></i>
        <p className={clsx(styles.text)}>Quản lí công ty</p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'candidate' ? styles.active : ''}`}
        onClick={() => setSelectedTab('candidate')}
      >
        <i className="fa-solid fa-user"></i>
        <p className={clsx(styles.text)}>Quản lí ứng viên</p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'category' ? styles.active : ''}`}
        onClick={() => setSelectedTab('category')}
      >
        <i className="fa-solid fa-list"></i>
        <p className={clsx(styles.text)}>Danh mục công việc</p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'skill' ? styles.active : ''}`}
        onClick={() => setSelectedTab('skill')}
      >
        <i className="fa-solid fa-bars"></i>
        <p className={clsx(styles.text)}>Danh mục kỹ năng</p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'changePasswordAdmin' ? styles.active : ''}`}
        onClick={() => setSelectedTab('changePasswordAdmin')}
      >
        <i className="fa-solid fa-unlock"></i>
        <p className={clsx(styles.text)}>Đổi mật khẩu admin</p>
      </div>
    </div>
  );
};

export default Sidebar;
