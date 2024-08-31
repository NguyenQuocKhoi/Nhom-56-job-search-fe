import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './appliedJobs.module.scss';

const AppliedJobs = () => {



  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p>danh sách công việc đã ứng tuyển</p>
        <p>apply 1</p>
        <p>status: rejected</p>
        <p>apply 2</p>
        <p>status: pending</p>
        <p>apply 3</p>
        <p>status: accepted</p>
      </div>

      <Footer />
    </div>
  );
};

export default AppliedJobs;
