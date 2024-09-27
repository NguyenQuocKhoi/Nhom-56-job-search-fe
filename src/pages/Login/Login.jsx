import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import clsx from 'clsx';
import styles from './login.module.scss';
import logo from '../../images/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
import { setUserStorage, validateEmail } from '../../Utils/valid';
import { postApiNoneToken } from '../../api';
import Loading from "../../components/Loading/Loading";
import { Button, Modal } from 'react-bootstrap';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("phamchixuan1605@gmail.com");
  const [emailErr, setEmailErr] = useState("");
  const [password, setPassword] = useState("123456Aa");
  const [loading, setLoading] = useState(false);
  const [emailForgotPassword, setEmailForgotPassword] = useState("");

  const generateCaptcha = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  //
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailValidation = validateEmail(email);

    if (emailValidation.success) {
      let data = { email, password };

      try {
        setLoading(true);
        const result = await postApiNoneToken("/user/login", data);
        console.log(result.data);

        if (result.data.error) {
          Swal.fire({ icon: "error", text: result.data.error });
        } else {
          const { isActive, role } = result.data.user;
  
          if (!isActive) {
            Swal.fire({ icon: "error", text: "Your account has been disabled." });
          } else {
            setUserStorage(result.data);
  
            const userRole = role;
            if (userRole === 'admin') {
              navigate('/admin');
            } else {
              const redirectTo = location.state?.from || "/";
              navigate(redirectTo);
            }
          }
        }
      } catch (error) {
        console.log("123", error);
        Swal.fire({ icon: "error", text: "Email or password is wrong" });
      } finally {
        setLoading(false);
      }
    } else {
      if (!emailValidation.success) setEmailErr(emailValidation.message);
    }
  };

  // const handleLoginWithGoogle = async (response) => {
  //   try {
  //     setLoading(true);
      
  //     // Lấy thông tin từ response
  //     const { tokenId } = response;
  
  //     // Gửi token đến backend
  //     const result = await postApiNoneToken("/user/auth/google", { accessToken: tokenId });
      
  //     if (result.data.success) {
  //       setUserStorage(result.data);
  
  //       const userRole = result.data.user.role;
  //       // Chuyển hướng theo vai trò người dùng
  //       if (userRole === 'admin') {
  //         navigate('/admin');
  //       } else {
  //         const redirectTo = location.state?.from || "/";
  //         navigate(redirectTo);
  //       }
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         text: result.data.message || "Google login failed"
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Google login error: ", error);
  //     Swal.fire({
  //       icon: "error",
  //       text: "Google login failed"
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
    
//   const handleForgotPassword = async () => {
//     if (!validateEmail(email).success) {
//         Swal.fire({
//             icon: "warning",
//             text: "Vui lòng nhập địa chỉ email hợp lệ."
//         });
//         return;
//     }

//     try {
//         const response = await postApiNoneToken('/user/forgot-password', { email });
//         console.log(response);

//         if (response.status === 403) {
//             Swal.fire({
//                 icon: "error",
//                 text: "Tài khoản của bạn đã bị vô hiệu hóa."
//             });
//             return;
//         }

//         setShowCaptcha(true);
//     } catch (error) {
//         if (error.response && error.response.status === 404) {
//             Swal.fire({
//                 icon: "error",
//                 text: "Không tìm thấy tài khoản với địa chỉ email này."
//             });
//         } else {
//             Swal.fire({
//                 icon: "error",
//                 text: "Đã có lỗi xảy ra, vui lòng thử lại sau."
//             });
//         }
//     }
// };

  const handleSubmitCaptcha = async () => {
    if (captchaInput.toUpperCase() !== captcha) {
      setCaptcha(generateCaptcha());
      Swal.fire({
        icon: "error",
        text: "Captcha không chính xác. Vui lòng thử lại."
      });
      setCaptchaInput('')
      return;
    }
    try {
      setLoading(true);
      const result = await postApiNoneToken("/user/forgot-password", { email });
      setLoading(false);
      if (result.status === 200) {
        Swal.fire({
          icon: "success",
          text: "Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra và đăng nhập với mật khẩu mới."
        });
      }
      setEmailForgotPassword('');
      setCaptchaInput('');
      setShowModal(false);
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        text: "Người dùng không tồn tại. Vui lòng kiểm tra lại địa chỉ email của bạn."
      });
    }
  };
  
  //modal captcha
  const handleShowModal = () => {
    setCaptcha(generateCaptcha());
    setShowCaptcha(true);
    setShowModal(true);
  }
  const handleCloseModal = () => {
    setShowModal(false);
  }

  //chặn phím tắt copy
  const handleKeyDown = (event) => {
    if ((event.ctrlKey && event.key === 'c') || (event.metaKey && event.key === 'c')) {
      event.preventDefault();
    }
  };

  return (
    <>
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Quên mật khẩu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Nhập Email</p>
        <input 
          type="text"
          id="name"
          placeholder='Nhập email'
          className="form-control"
          value={emailForgotPassword}
          onChange={(e) => {
            setEmailForgotPassword(e.target.value);
            setEmailErr('');
          }}
          />
          {showCaptcha && (
                  <div className="form-group text-center mt-4">
                    <div 
                      className="mb-3"
                      onKeyDown={handleKeyDown} tabIndex="0"//ngăn phím tắt copy
                    >
                      <span className="captcha-text">{captcha}</span>
                      <button className="btn btn-link" onClick={() => setCaptcha(generateCaptcha())}>
                        Tạo mới
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập captcha"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                    />
                    <button className="btn btn-primary mt-3 w-100" onClick={handleSubmitCaptcha}>
                      Xác nhận Captcha
                    </button>
                  </div>
                )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

      {loading ? <Loading /> : null}
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
                  Log In to KXWork
                </h2>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      value={email}
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your email"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailErr('');
                      }}
                    />
                    {emailErr && <div style={{ color: "red", width: '100%', marginBottom: '2%' }}>{emailErr}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      value={password}
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-4">
                    Log In
                  </button>
                </form>

                <div className="text-center mt-3">
                  <p className={styles.forgotPassword} onClick={handleShowModal}>Forgot password?</p>
                </div>

                <div className="text-center mt-4">
                {/* <GoogleLogin
                  clientId="GOOGLE_CLIENT_ID" // Thay thế bằng client ID của bạn
                  buttonText="Đăng nhập với Google"
                  onSuccess={handleLoginWithGoogle}
                  onFailure={handleLoginWithGoogle} // Cũng có thể xử lý lỗi ở đây
                  cookiePolicy={'single_host_origin'}
                /> */}
                  <button 
                    className="btn btn-outline-danger w-100" 
                    // onClick={handleLoginWithGoogle}
                  >
                    <i className="fab fa-google"></i> Log In with Google for candidate
                  </button>
                </div>
                <div className={clsx('text-center', 'mt-4', styles.signUpText)}>
                  <span>Don't have an account?</span>
                  <a href="/signup" className={styles.signUpLink}>Sign Up</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
