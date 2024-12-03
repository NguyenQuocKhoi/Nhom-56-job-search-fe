import React from 'react';
import clsx from 'clsx';
import styles from './footer.module.scss';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className={clsx(styles.footer)}>
        {/* <div className={clsx(styles.textTitle)}>NHÓM 56 - WEBSITE HỖ TRỢ TÌM KIẾM VIỆC LÀM</div> */}
      <div className={clsx(styles.footerContent)}>
        <div className={clsx(styles.info)}>
          <h3>{t('footer.contactUs')}</h3>
          <p>Email: kxword@gmail.com</p>
          <p>{t('footer.hotline')}: 033 2787 756</p>
          <p>{t('footer.address')}: Go Vap District, Ho Chi Minh City, Vietnam</p>
        </div>
        <div className={clsx(styles.info)}>
          <h3>{t('footer.introWebsite')}</h3>
          <p>{t('footer.intro')}</p>
          {/* <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquid eum quia illum quo inventore, nisi placeat, numquam nulla corporis rerum laudantium vero necessitatibus molestiae eligendi unde nemo ipsa? Ullam, eaque.</p> */}
        </div>
        <div className={clsx(styles.socialMedia)}>
          <h3>{t('footer.social')}</h3>
          <div className={clsx(styles.socialMediaIcon)}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-square-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          <p>{t('footer.follow')}!</p>
        </div>
      </div>
      <div className={clsx(styles.footfoot)}>
        <p>&copy; 2024 KXWork Job Search Website</p>
      </div>
    </footer>
  );
};

export default Footer;
