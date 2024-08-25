import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './companies.module.scss';
import CardCompanyInfo from '../../components/ListCompanyInfo/ListCompanyInfo';

const Companies = () => {
  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <main className={clsx(styles.mainContent)}>
        <span>List Companies</span>
        <CardCompanyInfo />
      </main>
      <Footer />
    </div>
  );
};

export default Companies;
