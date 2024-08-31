import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './savedJobs.module.scss';

const SavedJobs = () => {



  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p>danh sách công việc đã lưu</p>
        <p>công việc 1</p>
        <p>công việc 2</p>
        <p>công việc 3</p>
      </div>

      <Footer />
    </div>
  );
};

export default SavedJobs;
