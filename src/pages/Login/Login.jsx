import React, { useEffect, useRef, useState } from 'react';
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
import usePageTitle from '../../hooks/usePageTitle';

const Login = () => {
  usePageTitle('TopJob - Đăng nhập');

  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailForgotPassword, setEmailForgotPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  //captcha mới
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const canvasRef = useRef(null);

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
            Swal.fire({ icon: "error", text: "Tài khoản của bạn đã bị vô hiệu hóa." });
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
        Swal.fire({ icon: "error", text: "Email hoặc mật khẩu không đúng" });
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

//hàm mới
const generateCaptcha = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let captchaText = "";
  for (let i = 0; i < 6; i++) {
    captchaText += chars[Math.floor(Math.random() * chars.length)];
  }
  return captchaText;
};
const drawCaptcha = (captchaText) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  
  // Set canvas size
  canvas.width = 200;
  canvas.height = 50;

  // Background styling
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text styling
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2);

  // Optionally, add noise lines to make the CAPTCHA more secure
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
};
// useEffect(() => {
//   const newCaptcha = generateCaptcha();
//   setCaptcha(newCaptcha);
//   if (canvasRef.current) {
//     drawCaptcha(newCaptcha);
//   }
// }, []);
useEffect(() => {
  if (showModal) {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    drawCaptcha(newCaptcha);
  }
}, [showModal]);

// Handle CAPTCHA refresh
const handleRefreshCaptcha = () => {
  const newCaptcha = generateCaptcha();
  setCaptcha(newCaptcha);
  drawCaptcha(newCaptcha);
};

// Prevent copy/paste actions in the CAPTCHA input field
const handleKeyDown = (e) => {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
    e.preventDefault(); // Prevent copying
  }
};
//

const handleSubmitCaptcha = async () => {
  // Chuyển captcha và captchaInput thành chữ in hoa trước khi so sánh
  if (captchaInput.toUpperCase() !== captcha.toUpperCase()) {
    handleRefreshCaptcha();
    
    Swal.fire({
      icon: "error",
      text: "Captcha không chính xác. Vui lòng thử lại."
    });
    
    setCaptchaInput('');
    return;
  }

  try {
    setLoading(true);

    const result = await postApiNoneToken("/user/forgot-password", { email: emailForgotPassword });
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
    handleRefreshCaptcha();
    setCaptchaInput('');
  }
};

  
  //modal captcha
  const handleShowModal = () => {
    setEmailForgotPassword('');
    setCaptchaInput('');
    setShowModal(true);
  }
  const handleCloseModal = () => {
    setShowModal(false);
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
    <Modal 
      show={showModal} 
      onHide={handleCloseModal}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Quên mật khẩu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
                  <div className="form-group text-center mt-4">
                    <div 
                      className="mb-3"
                      onKeyDown={handleKeyDown} tabIndex="0"//ngăn phím tắt copy
                    >
                      <canvas ref={canvasRef}/>
                      <button
                        className='btn btn-link' onClick={handleRefreshCaptcha}
                      >
                        <i className="fa-solid fa-arrows-rotate"></i>
                      </button>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập captcha"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                    />
                    </div>
                    {/* <button className="btn btn-primary mt-3 w-100" onClick={handleSubmitCaptcha}>
                      Xác nhận
                    </button> */}
                  </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmitCaptcha}>
          Xác nhận
        </Button>
        <Button variant="danger" onClick={handleCloseModal}>
          Đóng
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
                  Đăng nhập vào TopJob
                </h2>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      value={email}
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Nhập email"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailErr('');
                      }}
                    />
                    {emailErr && <div style={{ color: "red", width: '100%', marginBottom: '2%' }}>{emailErr}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <div className={clsx(styles.passwordContainer)}>
                      <input
                        value={password}
                        type={showPassword ? 'text' : 'password'} 
                        className="form-control"
                        id="password"
                        placeholder="Nhập mật khẩu"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      
                      <span 
                        onClick={togglePasswordVisibility} 
                        className={clsx(styles.passwordToggleIcon)}
                        // style={{ marginTop: '8px', cursor: 'pointer' }}
                      >
                        { showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                      </span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-4">
                    Đăng nhập
                  </button>
                </form>

                <div className="text-center mt-3">
                  <p className={styles.forgotPassword} onClick={handleShowModal}>Quên mật khẩu?</p>
                </div>

                <div className="text-center mt-4">
                {/* <GoogleLogin
                  clientId="GOOGLE_CLIENT_ID" // Thay thế bằng client ID của bạn
                  buttonText="Đăng nhập với Google"
                  onSuccess={handleLoginWithGoogle}
                  onFailure={handleLoginWithGoogle} // Cũng có thể xử lý lỗi ở đây
                  cookiePolicy={'single_host_origin'}
                /> */}
                  {/* <button 
                    className="btn btn-outline-danger w-100" 
                    // onClick={handleLoginWithGoogle}
                  >
                    <i className="fab fa-google"></i> Log In with Google for candidate
                  </button> */}
                </div>
                <div className={clsx('text-center', 'mt-4', styles.signUpText)}>
                  <span>Không có tài khoản?</span>
                  <a href="/signup" className={styles.signUpLink}> Đăng ký</a>
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
