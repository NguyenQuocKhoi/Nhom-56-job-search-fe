import React, { useEffect, useState } from 'react';
import styles from '../SideBar/sideBar.module.scss';
import clsx from 'clsx';
import { getApiWithToken } from '../../../api';

const Sidebar = ({ setSelectedTab, selectedTab }) => {
  const [hasPendingJobs, setHasPendingJobs] = useState(false);
  const [hasPendingCompanies, setHasPendingCompanies] = useState(false);

  useEffect(() => {
    // const fetchPendingJobs = async () => {
    //   try {
    //     const response = await getApiWithToken('/job/get-all-pending');
    //     console.log("job",response);
        
    //     if (response.data.success && response.data.totalJobs > 0) {
    //       setHasPendingJobs(true);
    //     } else {
    //       setHasPendingJobs(false);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching pending jobs:', error);
    //   }
    // };

    const fetchPendingJobs = async () => {
      try {
        const response = await getApiWithToken('/job/get-all');
        // console.log("job", response);
    
        if (response.data.success && response.data.jobs.length > 0) {
          const pendingJobs = response.data.jobs.filter(job => 
            job.pendingUpdates !== null || job.status === undefined
          );          
          console.log("job pending", pendingJobs);          

          if (pendingJobs.length > 0) {
            setHasPendingJobs(true);
          } else {
            setHasPendingJobs(false);
          }
        } else {
          setHasPendingJobs(false);
        }
      } catch (error) {
        console.error('Error fetching pending jobs:', error);
      }
    };    

    // const fetchPendingCompanies = async () => {
    //   try {
    //     const responseC = await getApiWithToken('/company/get-all-companies-pending');
    //     console.log("company",responseC);
        
    //     if (responseC.data.success && responseC.data.totalCompanies > 0) {
    //       setHasPendingCompanies(true);
    //     } else {
    //       setHasPendingCompanies(false);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching pending companies:', error);
    //   }
    // };

    const fetchPendingCompanies = async () => {
      try {
        const responseC = await getApiWithToken('/company/get-all');
        // console.log("company", responseC);
    
        if (responseC.data.success && responseC.data.companies.length > 0) {

          const pendingCompanies = responseC.data.companies.filter(company => 
            company.status === undefined || company.pendingUpdates !== null
          );          
        console.log("pending company", pendingCompanies);

          if (pendingCompanies.length > 0) {
            setHasPendingCompanies(true);
          } else {
            setHasPendingCompanies(false);
          }
        } else {
          setHasPendingCompanies(false);
        }
      } catch (error) {
        console.error('Error fetching pending companies:', error);
      }
    };    

    fetchPendingJobs();
    fetchPendingCompanies();
  }, []);

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
        <p className={clsx(styles.text)}>
          Quản lí việc làm
          {hasPendingJobs && <span className={clsx(styles.notificationDot)}></span>}
        </p>
      </div>
      <div
        className={`${styles.tab} ${selectedTab === 'company' ? styles.active : ''}`}
        onClick={() => setSelectedTab('company')}
      >
        <i className="fa-solid fa-building"></i>
        <p className={clsx(styles.text)}>
          Quản lí công ty
          {hasPendingCompanies && <span className={clsx(styles.notificationDot)}></span>}
        </p>
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
        <p className={clsx(styles.text)}>Đổi mật khẩu</p>
      </div>
    </div>
  );
};

export default Sidebar;
