import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './header.module.scss';
import logo from '../../images/logo.jpg';
import { getUserStorage } from '../../Utils/valid';
import { getApiWithToken, putApiWithToken } from '../../api';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleNotificationClick = (notificationId) => {
    const notification = notifications.find(n => n._id === notificationId);
    setSelectedNotification(notification);
    setShowModal(true);

    // Mark notification as read
    updateNotificationStatus(notificationId);
  };

  const updateNotificationStatus = async (notificationId) => {
    try {
      await putApiWithToken(`/notification/${notificationId}`, {}, {
        headers: { 'auth-token': localStorage.getItem('auth-token') }
      });
      setNotifications(notifications.map(notification =>
        notification._id === notificationId ? { ...notification, status: true } : notification
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Error updating notification status', error);
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const user = getUserStorage()?.user;
  const role = user ? user.role : null;

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const fetchNotifications = useCallback(async () => {
    if (user && user._id && role) {
      try {
        let response;
        if (role === 'candidate') {
          response = await getApiWithToken(`/notification/${user._id}`, {
            headers: { 'auth-token': localStorage.getItem('auth-token') }
          });
        } else if (role === 'company') {
          response = await getApiWithToken(`/notification/company/${user._id}`, {
            headers: { 'auth-token': localStorage.getItem('auth-token') }
          });
        }

        const data = response.data.data;
        setNotifications(data);
        setUnreadCount(data.filter(notification => !notification.status).length);
      } catch (error) {
        console.error('Error fetching notifications', error);
      }
    }
  }, [user, role]);

  useEffect(() => {
    fetchNotifications();
  // }, [fetchNotifications]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
  };

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
                
                {/* notify */}
<div className={clsx(styles.navLink, styles.notificationContainer)}>
  <Dropdown>
  <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
    <i className="fas fa-bell"></i>
    {unreadCount > 0 && <span className={clsx(styles.notificationBadge)}></span>}
  </Dropdown.Toggle>
  <Dropdown.Menu className={clsx(styles.scrollableDropdown)}>
    {notifications.length > 0 ? (
      notifications.map(notification => (
        <Dropdown.Item
          key={notification._id}
          onClick={() => handleNotificationClick(notification._id)}
          className={clsx({ [styles.unreadNotification]: !notification.status })}
        >
          {notification.message.length > 30 ? `${notification.message.substring(0, 30)}...` : notification.message}
          {!notification.status && <span className={clsx(styles.unreadDot)}></span>}
        </Dropdown.Item>
      ))
    ) : (
      <Dropdown.Item>{t('header.noNotifications')}</Dropdown.Item>
    )}
  </Dropdown.Menu>
</Dropdown>

  {selectedNotification && (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Notification Detail</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{selectedNotification.message}</p>
        <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        {role === 'candidate' && selectedNotification.job && (
          <Link to={`/detailJob/${selectedNotification.job}`} className={clsx(styles.jobcard)}>
            <Button variant="secondary">
              Xem chi tiết công việc
            </Button>
          </Link>
        )}
      </Modal.Footer>
    </Modal>
  )}
</div>

                {/* notify */}
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
                <div className={clsx(styles.navLink, styles.notificationContainer)}>
                  <Dropdown>
                    <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && <span className={clsx(styles.notificationBadge)}></span>}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={clsx(styles.scrollableDropdown)}>
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <Dropdown.Item
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification._id)}
                            className={clsx({ [styles.unreadNotification]: !notification.status })}
                          >
                            {notification.message.length > 30 ? `${notification.message.substring(0, 30)}...` : notification.message}
                            {!notification.status && <span className={clsx(styles.unreadDot)}></span>}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item>{t('header.noNotifications')}</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>

                  {selectedNotification && (
                    <Modal show={showModal} onHide={handleCloseModal}>
                      <Modal.Header closeButton>
                        <Modal.Title>Notification Detail</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <p>{selectedNotification.message}</p>
                        <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                          Close
                        </Button>
                        {role === 'company' && selectedNotification.job && (
                          <Link to={`/detailJob/${selectedNotification.job}`} className={clsx(styles.jobcard)}>
                            <Button variant="secondary">
                              Xem chi tiết công việc
                            </Button>
                          </Link>
                        )}
                      </Modal.Footer>
                    </Modal>
                  )}
                </div>
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
