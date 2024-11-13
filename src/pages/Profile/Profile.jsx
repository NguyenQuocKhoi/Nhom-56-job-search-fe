import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './profile.module.scss';
import InfoCandidate from '../../components/InfoCandidate/InfoCandidate';
import InfoCompany from '../../components/InfoCompany/InfoCompany';
import { getUserStorage } from '../../Utils/valid';
import usePageTitle from '../../hooks/usePageTitle';

const Profile = () => {
  usePageTitle('Thông tin tài khoản');
  
  const user = getUserStorage()?.user;
  const role = user ? user.role : null;


  return (
    <div className={clsx(styles.profilePage)}>
      <Header />
      {role === 'candidate' && <InfoCandidate />}
      {role === 'company' && <InfoCompany />}
      <Footer />
    </div>
  );
};

export default Profile;
