import React from 'react';
import styles from '../HeaderAdmin/headerAdmin.module.scss';
import logo from '../../../images/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.header}>
      <Link to="/admin">
        <img src={logo} alt="Logo" className={styles.logo} />
      </Link>
      <div className={styles.title}>Admin</div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
};

export default Header;
