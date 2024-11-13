import React from 'react';
import styles from '../HeaderAdmin/headerAdmin.module.scss';
import logo from '../../../images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.header}>
      <Link to="/admin">
      <div className={clsx(styles.logoIcon)}>
        <div className={clsx(styles.iconList)}>
          <i className="fa-solid fa-bars"></i>
        </div>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
      </Link>
      <div className={styles.title}>Admin</div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
};

export default Header;
