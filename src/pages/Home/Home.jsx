import React from 'react';
import Header from '../../components/Header/Header';
import FeaturedJobs from '../../components/FeaturedJobs/FeaturedJobs';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './home.module.scss';

const Home = () => {
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
