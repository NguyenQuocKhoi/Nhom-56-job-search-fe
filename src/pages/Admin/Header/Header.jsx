import React from 'react';
import styles from '../Header/header.module.scss';
import logo from '../../../images/logo.jpg';

const Header = () => {
  const handleLogout = () => {
    // Implement logout logic here
  };

  return (
    <div className={styles.header}>
      <img src={logo} alt="Logo" className={styles.logo} />
      <div className={styles.title}>Admin</div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
};

export default Header;
