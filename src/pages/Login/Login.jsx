import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import clsx from 'clsx';
import styles from './login.module.scss';
import logo from '../../images/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { setUserStorage, validateEmail } from '../../Utils/valid';
import { postApiNoneToken } from '../../api';
import Loading from "../../components/Loading/Loading";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("phamchixuan1605@gmail.com");
  const [emailErr, setEmailErr] = useState("");
  const [password, setPassword] = useState("D5CPxL");
  const [loading, setLoading] = useState(false);

  
  
  const handleLogin = async (e) => {
    e.preventDefault();
  
    const emailValidation = validateEmail(email);
  
    if (emailValidation.success) {
      let data = { email, password };
      console.log(data);
  
      try {
        setLoading(true);
        const result = await postApiNoneToken("/user/login", data);
        console.log(result.data);
  
        if (result.data.error) {
          Swal.fire({ icon: "error", text: result.data.error });
        } else {
          // Lưu userId vào localStorage
          localStorage.setItem('_id', result.data.user._id);//
          console.log(1, result.data.user._id);//
          console.log(1, result.data.user.email);//
  
          setUserStorage(result.data);
          navigate("/");
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
  
  const handleForgotPassword = async () => {
    if (!validateEmail(email).success) {
      Swal.fire({
        icon: "warning",
        text: "Vui lòng nhập địa chỉ email hợp lệ."
      });
      return;
    }
    try {
      setLoading(true);
      const result = await postApiNoneToken("/user/forgot-password", { email });
      setLoading(false);
      if (result.status === 200) {
        console.log(123)
        Swal.fire({
          icon: "success",
          text: "Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra và đăng nhập với mật khẩu mới."
        });
      }
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        text: "Người dùng không tồn tại. Vui lòng kiểm tra lại địa chỉ email của bạn."
      });
    }
  };


  return (
    <>
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
                  <p className={styles.forgotPassword} onClick={handleForgotPassword}>Forgot password?</p>
                </div>
                <div className="text-center mt-4">
                  <button className="btn btn-outline-danger w-100">
                    <i className="fab fa-google"></i> Log In with Google
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
