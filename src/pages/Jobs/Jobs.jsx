import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './jobs.module.scss';
import ListJobInfo from '../../components/ListJobInfo/ListJobInfo';

const Jobs = () => {
  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <main className={clsx(styles.mainContent)}>
          <span>List Jobs</span>
          <ListJobInfo />
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;
