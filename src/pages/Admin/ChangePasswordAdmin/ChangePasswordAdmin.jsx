import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import clsx from 'clsx';
import styles from '../ChangePasswordAdmin/changePasswordAdmin.module.scss';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUserStorage, validatePassword } from '../../../Utils/valid';
import { putApiWithToken } from '../../../api';

const ChangePasswordAdmin = () => {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  
    const user = getUserStorage().user;
    // console.log(user);
    
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
  return (
    <div className="row justify-content-center">
          <div className="col-md-6">
            <div className={clsx('card', styles.loginCard)}>
              <div className="card-body">
                <h2 className={clsx('card-title', 'text-center', styles.loginTitle)}>
                  Đổi mật khẩu
                </h2>

                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label htmlFor="oldpassword">Mật khẩu cũ</label>
                    <input
                      value={oldPassword}
                      type="password"
                      className="form-control"
                      id="oldpassword"
                      placeholder="Nhập mật khẩu cũ"
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newpassword">Mật khẩu mới</label>
                    <input
                      value={newPassword}
                      type="password"
                      className="form-control"
                      id="newpassword"
                      placeholder="Nhập mật khẩu mới"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <input
                      value={confirmPassword}
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-4">
                    Đổi mật khẩu
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
  );
};

export default ChangePasswordAdmin;
