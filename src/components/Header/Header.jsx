import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './header.module.scss';
import logo from '../../images/logo.jpg';
import { getUserStorage } from '../../Utils/valid';

const Header = () => {
  const { t, i18n } = useTranslation();

  const user = getUserStorage()?.user;
  const role = user ? user.role : null;

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
  }

  return (
    <>
    <header className={clsx(styles.header)}>
      <div className={clsx(styles.logoContainer)}>
        <Link to="/">
          <img src={logo} alt="Logo" className={clsx(styles.logo)} />
        </Link>
      </div>
      <nav className={clsx(styles.nav)}>
        <Link to="/jobs" className={clsx(styles.navLink)}>{t('header.jobs')}</Link>
        <Link to="/companies" className={clsx(styles.navLink)}>{t('header.companies')}</Link>

        {role === null && (
          <>
            <Link to="/login" className={clsx(styles.navLink)}>{t('header.login')}</Link>
            <Link to="/signup" className={clsx(styles.navLink)}>{t('header.signup')}</Link>
          </>
        )}

        {role === 'candidate' && (
          <>
            <Link to="/savedJobs" className={clsx(styles.navLink)}>{t('header.savedJobs')}</Link>
            <Link to="/appliedJobs" className={clsx(styles.navLink)}>{t('header.appliedJobs')}</Link>
            <div className={clsx(styles.navLink)}>
              <i className="fas fa-bell"></i>
            </div>
              <Dropdown>
                <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                  <i className="fas fa-user"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                  <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
          </>
        )}

        {role === 'company' && (
          <>
            <Link to="/createPostJob" className={clsx(styles.navLink)}>{t('header.postJob')}</Link>
            <Link to="/postedJobs" className={clsx(styles.navLink)}>{t('header.postedJobs')}</Link>
            <div className={clsx(styles.navLink)}>
              <i className="fas fa-bell"></i>
            </div>
            <Dropdown>
              <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                <i className="fas fa-user"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}

        <button onClick={() => handleLanguageChange('en')} className={clsx(styles.btn, styles.btnL)}>EN</button>
        <button onClick={() => handleLanguageChange('vi')} className={clsx(styles.btn)}>VI</button>
      </nav>
    </header>
    </>
  );
};

export default Header;
