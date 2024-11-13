import React from 'react';
import Header from '../../components/Header/Header';
import FeaturedJobs from '../../components/FeaturedJobs/FeaturedJobs';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './home.module.scss';
import usePageTitle from '../../hooks/usePageTitle';

const Home = () => {
  usePageTitle('TopJob - Top việc làm - Tuyển dụng và tìm việc');
  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <main className={clsx(styles.mainContent)}>
        <FeaturedJobs />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
