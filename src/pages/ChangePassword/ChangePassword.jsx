// ChangePassword.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import clsx from 'clsx';
import styles from './changePassword.module.scss';
import logo from '../../images/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { putApiWithToken } from '../../api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
  
    const userId = localStorage.getItem('_id');
    
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'No User Found',
        text: 'User ID is not available. Please log in again.',
      });
      return;
    }
  
    const data = {
      oldPassword,
      newPassword,
    };
  
    try {
      await putApiWithToken(`/change-password/${userId}`, data);
  
      Swal.fire({
        icon: 'success',
        title: 'Password Changed',
        text: 'Your password has been successfully changed',
      }).then(() => {
        navigate('/');
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
                    <input
                      value={oldPassword}
                      type="password"
                      className="form-control"
                      id="oldpassword"
                      placeholder="Enter your old password"
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newpassword">New password</label>
                    <input
                      value={newPassword}
                      type="password"
                      className="form-control"
                      id="newpassword"
                      placeholder="Enter your new password"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      value={confirmPassword}
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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
