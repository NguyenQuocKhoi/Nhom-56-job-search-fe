import React from 'react';
import clsx from 'clsx';
import styles from './footer.module.scss';

const Footer = () => {
  return (
    <footer className={clsx(styles.footer)}>
      <div className={clsx(styles.footerContent)}>
        <div className={clsx(styles.info)}>
          <h3>Giới thiệu website</h3>
          <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquid eum quia illum quo inventore, nisi placeat, numquam nulla corporis rerum laudantium vero necessitatibus molestiae eligendi unde nemo ipsa? Ullam, eaque.</p>
        </div>
        <div className={clsx(styles.info)}>
          <p>&copy; 2024 KXWork Job Search Website</p>
          <p>Contact: kxwordjobsearch@gmail.com</p>
          <p>Address: Go Vap District, Ho Chi Minh City, Vietnam</p>
        </div>
        <div className={clsx(styles.socialMedia)}>
          <h3>Mạng xã hội</h3>
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
      </div>
    </footer>
  );
};

export default Footer;
