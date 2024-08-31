import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './candidateApply.module.scss';

const CandidateApply = () => {



  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p>------thông tin ứng viên đã ứng tuyển</p>
        <p>Avatar</p>
        <p>tên</p>
        <p>email</p>
        <p>giới tính</p>
        <p>ngày sinh</p>
        <p>skill</p>
        <p>phone number</p>
        <p>address</p>
        <p>experience</p>
        <p>education</p>
        <p>more information</p>
        <button>Xem CV</button>
        <p></p>
        <button>Agree</button>
        <button>Reject</button>
      </div>
      <Footer />
    </div>
  );
};

export default CandidateApply;
