import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './profile.module.scss';

const Profile = () => {
  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <main className={clsx(styles.mainContent)}>
        <span>Profile</span>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
