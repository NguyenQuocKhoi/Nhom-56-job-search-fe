import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './header.module.scss';
import logo from '../../images/logo.png';
import logoUser from '../../images/logoUser.jpeg';
import { getUserStorage } from '../../Utils/valid';
import { getApiWithToken, putApiWithToken } from '../../api';
import Swal from 'sweetalert2';
// import jwtDecode from 'jsonwebtoken';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [numberNotifyNotRead, setNumberNotifyNotRead] = useState(0);

  //set user và role là null mỗi lần npm start lại
  // const [user, setUser] = useState(null);
  // const [role, setRole] = useState(null);

  // useEffect(() => {
    // localStorage.removeItem('user')//
    
    // const storedUser = getUserStorage()?.user;
    // setUser(storedUser);
    // setRole(storedUser ? storedUser.role : null);
  // }, []);

  //avatar mặc định
  const [avatarPreview, setAvatarPreview] = useState(logo);

  const user = getUserStorage()?.user;
  const role = user ? user.role : null;

  //lấy avatar
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (role === 'candidate') {
        const candidateId = user._id;
        try {
          const response = await getApiWithToken(`/candidate/${candidateId}`);
          if (response.data.success) {
            const candidateData = response.data.candidate;
            setAvatarPreview(candidateData.avatar || logoUser); // Set avatar or default
          }
        } catch (error) {
          console.error('Error fetching candidate avatar', error);
          setAvatarPreview(logoUser); // Fallback to default on error
        }
      } else if (role === 'company') {
        const companyId = user._id;
        try {
          const response = await getApiWithToken(`/company/${companyId}`);
          if (response.data.success) {
            const companyData = response.data.company;
            setAvatarPreview(companyData.avatar || logoUser); // Set avatar or default
          }
        } catch (error) {
          console.error('Error fetching company avatar', error);
          setAvatarPreview(logoUser); // Fallback to default on error
        }
      } else {
        setAvatarPreview(logoUser); // Set default avatar if no role
      }
    };

    fetchUserAvatar();
  }, [role, user]);

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
        //sắp xếp thông báo mới hiện trước
        const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // setNotifications(data);
        setNotifications(sortedNotifications);
        
        // const unreadNotificationsCount = data.filter(notification => !notification.status).length;
        const unreadNotificationsCount = sortedNotifications.filter(notification => !notification.status).length;
        setUnreadCount(data.filter(notification => !notification.status).length);
        setNumberNotifyNotRead(unreadNotificationsCount);
      } catch (error) {
        console.error('Error fetching notifications', error);
      }
    }
  }, [user, role]);

  //
  // const checkTokenExpiry = () => {
  //   const token = localStorage.getItem('auth-token');
  //   if (token) {
  //     try {
  //       const decodedToken = jwtDecode.decode(token);
  //       const currentTime = Date.now() / 1000; // Current time in seconds
  //       if (decodedToken.exp < currentTime) {
  //         // Token has expired
  //         Swal.fire({
  //           icon: 'warning',
  //           title: 'Phiên làm việc đã hết hạn',
  //           confirmButtonText: 'OK'
  //         }).then(() => {
  //           localStorage.removeItem('user'); // Clear the user data
  //           navigate('/login'); // Redirect to login
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error decoding token', error);
  //     }
  //   }
  // };

  const checkAndDeleteCV = useCallback(async () => {
    if (role === 'candidate') {
      try {
        const response = await getApiWithToken(`/check-and-delete-cv`, {
          headers: { 'auth-token': localStorage.getItem('auth-token') }
        });
        if (response.data.removedUsers > 0) {
          Swal.fire({
            icon: 'warning',
            title: `${response.data.removedUsers} CV(s) have been deleted due to inactivity.`,
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error checking and deleting CVs', error);
      }
    }
  }, [role]);

  useEffect(() => {
    // checkTokenExpiry();
    checkAndDeleteCV();
    fetchNotifications();
  // }, [fetchNotifications]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    //set user và role null sau khi logout
    // setUser(null);
    // setRole(null);
  };

  return (
    <>
      <header className={clsx(styles.header)}>
        <div className={clsx(styles.logoContainer)}>
          <div className={clsx(styles.iconListMobile)}>
            {/* <i class="fa-solid fa-list"></i> */}
            <Dropdown>
                <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                  <div className={clsx(styles.iconList)}>
                    <i className="fa-solid fa-list"></i>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className={clsx(styles.dropdownMobile)}>
                    {role === 'candidate' && (
                      <>
                      <div>
                        <div className={clsx(styles.dropdownProfileMobile)}>
                          <img src={avatarPreview} alt="Avatar" className={clsx(styles.avatar)} />
                          <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>                    
                        </div>
                          <Dropdown.Item as={Link} to="/savedJobs">{t('header.savedJobs')}</Dropdown.Item>
                          <Dropdown.Item as={Link} to="/appliedJobs">{t('header.appliedJobs')}</Dropdown.Item>

                          {/* <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                          <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item> */}
                      </div>
                      </>
                    )}
                    {role === 'company' && (
                      <>
                      <div>
                        <div className={clsx(styles.dropdownProfileMobile)}>
                          <img src={avatarPreview} alt="Avatar" className={clsx(styles.avatar)} />
                          <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>                    
                        </div>
                          <Dropdown.Item as={Link} to="/createPostJob">{t('header.postJob')}</Dropdown.Item>
                          <Dropdown.Item as={Link} to="/postedJobs">{t('header.postCreated')}</Dropdown.Item>
                          <Dropdown.Item as={Link} to="/savedCandidates">{t('header.savedCandidates')}</Dropdown.Item>

                          {/* <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                          <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item> */}
                      </div>
                      </>
                    )}
                    </div>
                    <Dropdown.Item as={Link} to="/jobs">{t('header.jobs')}</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/companies">{t('header.companies')}</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                    <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item>
                    
                    <div className={clsx(styles.groupBtnDNDK)}>
                      <button onClick={() => handleLanguageChange('en')} className={clsx(styles.btn, styles.btnL)}>EN</button>
                      <button onClick={() => handleLanguageChange('vi')} className={clsx(styles.btn)}>VI</button>
                    </div>
                </Dropdown.Menu>

              </Dropdown>
          </div>
          <Link to="/">
            <img src={logo} alt="Logo" className={clsx(styles.logo)} />
          </Link>
          <div className={clsx(styles.infoMobile)}>
            {/* <i class="fa-solid fa-list"></i> */}
            {role === null && (
            <>
              <Link to="/login" className={clsx(styles.navLinkLS)}>{t('header.login')}</Link>
              <Link to="/signup" className={clsx(styles.navLinkLS)}>{t('header.signup')}</Link>
            </>
          )}
            {role === 'candidate' && (
            <>
              {/* <Dropdown>
                <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                  <img src={avatarPreview} alt="Avatar" className={clsx(styles.avatar)} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                  <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown> */}

            <div className={clsx(styles.navLink, styles.notificationContainer)}>
              <Dropdown>
              <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                <div className={clsx(styles.iconList)}>
                  <i className="fas fa-bell"></i>
                </div>
                {unreadCount > 0 && <span className={clsx(styles.notificationBadge)}></span>}
              </Dropdown.Toggle>
              <Dropdown.Menu className={clsx(styles.scrollableDropdown)}>
                <div className={clsx(styles.tb)}>
                  {/* <p>{t('profile.notify')}</p> */}
                  <p>{numberNotifyNotRead} {t('profile.newNotify')}</p>
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <Dropdown.Item
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification._id)}
                      className={clsx({ [styles.unreadNotification]: !notification.status })}
                    >
                      <div className={clsx(styles.notificationRow)}>
                          <div className={clsx(styles.notificationContent)}>
                            <p>
                              {notification.message.length > 60 
                                ? `${notification.message.substring(0, 60)}...` 
                                : notification.message}
                            </p>
                            <span className={clsx(styles.notificationTime)}>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                          {!notification.status && <span className={clsx(styles.unreadDot)}></span>}
                        </div>
                      {/* {notification.message.length > 30 ? `${notification.message.substring(0, 30)}...` : notification.message} */}
                      {/* <hr /> */}
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
                    <Modal.Title>{t('profile.notifyDetail')}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>{selectedNotification.message}</p>
                    <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="danger" onClick={handleCloseModal}>
                      {t('profile.close')}
                    </Button>
                    {role === 'candidate' && selectedNotification.job && (
                      <Link to={`/detailJob/${selectedNotification.job}`} className={clsx(styles.jobcard)}>
                        <Button variant="primary">
                          {t('profile.viewDetailJob')}
                        </Button>
                      </Link>
                    )}
                  </Modal.Footer>
                </Modal>
              )}
            </div>

              
            </>
          )}
            {role === 'company' && (
            <>
              {/* <Dropdown>
                <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                  <img src={avatarPreview} alt="Avatar" className={clsx(styles.avatar)} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                  <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown> */}

                <div className={clsx(styles.navLink, styles.notificationContainer)}>
                  <Dropdown>
                    <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && <span className={clsx(styles.notificationBadge)}></span>}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={clsx(styles.scrollableDropdown)}>
                    <div className={clsx(styles.tb)}>
                      {/* <p>{t('profile.notify')}</p> */}
                      <p>{numberNotifyNotRead} {t('profile.newNotify')}</p>
                    </div>
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <Dropdown.Item
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification._id)}
                            className={clsx({ [styles.unreadNotification]: !notification.status })}
                          >
                            <div className={clsx(styles.notificationRow)}>
                              <div className={clsx(styles.notificationContent)}>
                                <p>
                                  {notification.message.length > 60 
                                    ? `${notification.message.substring(0, 60)}...` 
                                    : notification.message}
                                </p>
                                <span className={clsx(styles.notificationTime)}>{new Date(notification.createdAt).toLocaleString()}</span>
                              </div>
                              {!notification.status && <span className={clsx(styles.unreadDot)}></span>}
                            </div>
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
                        <Modal.Title>{t('profile.notifyDetail')}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <p>{selectedNotification.message}</p>
                        <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="danger" onClick={handleCloseModal}>
                          {t('profile.close')}
                        </Button>
                        {role === 'company' && selectedNotification.job && (
                          <Link to={`/detailJob/${selectedNotification.job}`} className={clsx(styles.jobcard)}>
                            <Button variant="primary">
                              {t('profile.viewDetailJob')}
                            </Button>
                          </Link>
                        )}
                      </Modal.Footer>
                    </Modal>
                  )}
                </div>
            </>
          )}

          </div>
        </div>
        {/* responsive mobile */}

        <nav className={clsx(styles.nav)}>
          <Link to="/jobs" className={clsx(styles.navLink)}>{t('header.jobs')}</Link>
          <Link to="/companies" className={clsx(styles.navLink)}>{t('header.companies')}</Link>

          {role === null && (
            <>
              <Link to="/login" className={clsx(styles.navLinkLS)}>{t('header.login')}</Link>
              <Link to="/signup" className={clsx(styles.navLinkLS)}>{t('header.signup')}</Link>
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
    <div className={clsx(styles.tb)}>
      <p>{t('profile.notify')}</p>
      <p>{numberNotifyNotRead} {t('profile.newNotify')}</p>
    </div>
    {notifications.length > 0 ? (
      notifications.map(notification => (
        <Dropdown.Item
          key={notification._id}
          onClick={() => handleNotificationClick(notification._id)}
          className={clsx({ [styles.unreadNotification]: !notification.status })}
        >
          <div className={clsx(styles.notificationRow)}>
              <div className={clsx(styles.notificationContent)}>
                <p>
                  {notification.message.length > 60 
                    ? `${notification.message.substring(0, 60)}...` 
                    : notification.message}
                </p>
                <span className={clsx(styles.notificationTime)}>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              {!notification.status && <span className={clsx(styles.unreadDot)}></span>}
            </div>
          {/* {notification.message.length > 30 ? `${notification.message.substring(0, 30)}...` : notification.message} */}
          {/* <hr /> */}
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
        <Modal.Title>{t('profile.notifyDetail')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{selectedNotification.message}</p>
        <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleCloseModal}>
          {t('profile.close')}
        </Button>
        {role === 'candidate' && selectedNotification.job && (
          <Link to={`/detailJob/${selectedNotification.job}`} className={clsx(styles.jobcard)}>
            <Button variant="primary">
              {t('profile.viewDetailJob')}
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
                  {/* <i className="fas fa-user"></i> */}
                  <img src={avatarPreview} alt="Avatar" className={clsx(styles.avatar)} />
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
              {/* <Link to="/postedJobs" className={clsx(styles.navLink)}>{t('header.postedJobs')}</Link> */}
              <Link to="/postedJobs" className={clsx(styles.navLink)}>{t('header.postCreated')}</Link>
              <Link to="/savedCandidates" className={clsx(styles.navLink)}>{t('header.savedCandidates')}</Link>
              <div className={clsx(styles.navLink)}>
                <div className={clsx(styles.navLink, styles.notificationContainer)}>
                  <Dropdown>
                    <Dropdown.Toggle variant="link" className={clsx(styles.navLink)}>
                      <i className="fas fa-bell"></i>
                      {unreadCount > 0 && <span className={clsx(styles.notificationBadge)}></span>}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className={clsx(styles.scrollableDropdown)}>
                    <div className={clsx(styles.tb)}>
                      <p>{t('profile.notify')}</p>
                      <p>{numberNotifyNotRead} {t('profile.newNotify')}</p>
                    </div>
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <Dropdown.Item
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification._id)}
                            className={clsx({ [styles.unreadNotification]: !notification.status })}
                          >
                            <div className={clsx(styles.notificationRow)}>
                              <div className={clsx(styles.notificationContent)}>
                                <p>
                                  {notification.message.length > 60 
                                    ? `${notification.message.substring(0, 60)}...` 
                                    : notification.message}
                                </p>
                                <span className={clsx(styles.notificationTime)}>{new Date(notification.createdAt).toLocaleString()}</span>
                              </div>
                              {!notification.status && <span className={clsx(styles.unreadDot)}></span>}
                            </div>
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
                        <Modal.Title>{t('profile.notifyDetail')}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <p>{selectedNotification.message}</p>
                        <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="danger" onClick={handleCloseModal}>
                          {t('profile.close')}
                        </Button>
                        {role === 'company' && selectedNotification.job && (
                          <Link to={`/detailJob/${selectedNotification.job}`} className={clsx(styles.jobcard)}>
                            <Button variant="primary">
                              {t('profile.viewDetailJob')}
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
                  {/* <i className="fas fa-user"></i> */}
                  <img src={avatarPreview} alt="Avatar" className={clsx(styles.avatar)} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">{t('header.profile')}</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/changepassword">{t('header.changepassword')}</Dropdown.Item>
                  <Dropdown.Item as={Link} onClick={handleLogout} to="/login">{t('header.logout')}</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}

          <div className={clsx(styles.groupBtnDNDK)}>
            <button onClick={() => handleLanguageChange('en')} className={clsx(styles.btn, styles.btnL)}>EN</button>
            <button onClick={() => handleLanguageChange('vi')} className={clsx(styles.btn)}>VI</button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
