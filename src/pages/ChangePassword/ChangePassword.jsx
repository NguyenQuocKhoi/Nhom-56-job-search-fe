import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import clsx from 'clsx';
import styles from './changePassword.module.scss';
import logo from '../../images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { putApiWithToken } from '../../api';
import { getUserStorage, validatePassword } from '../../Utils/valid';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const user = getUserStorage().user;
  console.log(user);
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirm password do not match',
      });
      return;
    }
  
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.success) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Old Password',
        // text: passwordValidation.message,
      });
      return;
    }
  
    const data = {
      oldPassword,
      newPassword,
    };
  
    try {
      await putApiWithToken(`/user/change-password/${user._id}`, data);
  
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your password has been successfully changed',
      }).then(() => {
        navigate('/login');
      });
  
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again later.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };
  
  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  return (
    <>
      <div className={clsx('container', styles.loginContainer)}>
        <div className={styles.logoContainer}>
          <Link to="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </Link>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className={clsx('card', styles.loginCard)}>
              <div className="card-body">
                <h2 className={clsx('card-title', 'text-center', styles.loginTitle)}>
                  Change Password
                </h2>

                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label htmlFor="oldpassword">Old password</label>
                    <div className={clsx(styles.passwordContainer)}>
                      <input
                        value={oldPassword}
                        type={showOldPassword ? 'text' : 'password'} 
                        className="form-control"
                        id="oldpassword"
                        placeholder="Enter your old password"
                        onChange={(e) => setOldPassword(e.target.value)}
                      />

                      <span 
                        onClick={toggleOldPasswordVisibility} 
                        style={{ marginTop: '8px', cursor: 'pointer' }}
                      >
                        { showOldPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newpassword">New password</label>
                    <div className={clsx(styles.passwordContainer)}>
                      <input
                        value={newPassword}
                        type={showNewPassword ? 'text' : 'password'} 
                        className="form-control"
                        id="newpassword"
                        placeholder="Enter your new password"
                        onChange={(e) => setNewPassword(e.target.value)}
                      />

                      <span 
                        onClick={toggleNewPasswordVisibility} 
                        style={{ marginTop: '8px', cursor: 'pointer' }}
                      >
                        { showNewPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className={clsx(styles.passwordContainer)}>
                      <input
                        value={confirmPassword}
                        type={showNewPassword ? 'text' : 'password'} 
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      
                      />

                      <span 
                        onClick={toggleNewPasswordVisibility} 
                        style={{ marginTop: '8px', cursor: 'pointer' }}
                      >
                        { showNewPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                      </span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-4">
                    Change password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
