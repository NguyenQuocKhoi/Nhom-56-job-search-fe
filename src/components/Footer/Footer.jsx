import React from 'react';
import clsx from 'clsx';
import styles from './footer.module.scss';

const Footer = () => {
  return (
    <footer className={clsx(styles.footer)}>
        {/* <div className={clsx(styles.textTitle)}>NHÓM 56 - WEBSITE HỖ TRỢ TÌM KIẾM VIỆC LÀM</div> */}
      <div className={clsx(styles.footerContent)}>
        <div className={clsx(styles.info)}>
          <h3>Liên hệ với chúng tôi</h3>
          <p>Email: kxword@gmail.com</p>
          <p>Hotline: 099 9999 9999</p>
          <p>Address: Go Vap District, Ho Chi Minh City, Vietnam</p>
        </div>
        <div className={clsx(styles.info)}>
          <h3>Giới thiệu website</h3>
          <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquid eum quia illum quo inventore, nisi placeat, numquam nulla corporis rerum laudantium vero necessitatibus molestiae eligendi unde nemo ipsa? Ullam, eaque.</p>
        </div>
        <div className={clsx(styles.socialMedia)}>
          <h3>Mạng xã hội</h3>
          <div className={clsx(styles.socialMediaIcon)}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          <p>Follow ngay!</p>
        </div>
      </div>
      <div className={clsx(styles.footfoot)}>
        <p>&copy; 2024 KXWork Job Search Website</p>
      </div>
    </footer>
  );
};

export default Footer;
