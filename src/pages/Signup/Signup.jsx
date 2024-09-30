import React, { useState } from 'react';
import { Button, Tab, Tabs, Form, Modal } from 'react-bootstrap';
import clsx from 'clsx';
import styles from './signup.module.scss';
import logo from '../../images/logo.png';
import { validateEmail, validatePassword } from '../../Utils/valid';
import { getAPiNoneToken, postApiNoneToken } from '../../api';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('candidate');
  const [name, setName] = useState("Pham Xuan");
  const [email, setEmail] = useState("phamchixuan1605@gmail.com");
  const [emailErr, setEmailErr] = useState("");
  const [password, setPassword] = useState("123456Aa");
  const [confirmPassword, setConfirmPassword] = useState("123456Aa");
  const [passwordErr, setPasswordErr] = useState("");
  const [verify, setVerify] = useState("");

  //
  const [showModal, setShowModal] = useState(false);

  // const [loading, setLoading] = useState(false);

  const handleCheckEmailExit = async (email) => {
    if(validateEmail(email)){
      getAPiNoneToken(`/user/check-email?email=${email}`)
            .then((result) =>{
              Swal.fire({
                icon: "error",
                text: "Email đã tồn tại"
              });
            })
            .catch((err)=>{
              console.log(err);
            })
    }
  };

  const handleCheckPassword = (password) => {
    const result = validatePassword(password);
    if (result.success) {
      setPassword(password);
      setPasswordErr('');
    } else {
      setPasswordErr(result.message);
    }
  };

  const handleSignup = async () => {
    try {
      const data = {
        email: email,
        verificationCode: verify,
      };
  
      const result = await postApiNoneToken("/user/verify", data);
      if (result.data.success) {
        // Đăng ký thành công, tự động đăng nhập
        const loginData = {
          email: email,
          password: password,
        };
  
        const loginResult = await postApiNoneToken("/user/login", loginData);
        if (loginResult.data.token) {
          // Lưu token và thông tin người dùng
          localStorage.setItem('token', loginResult.data.token);
          localStorage.setItem('user', JSON.stringify(loginResult.data.user));
  
          Swal.fire({
            icon: "success",
            text: "Xác minh và đăng nhập thành công!",
          });
  
          navigate("/login");
        } else {
          Swal.fire({
            icon: "error",
            text: "Đăng nhập thất bại!",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          text: result.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Đã có lỗi xảy ra. Vui lòng thử lại sau!",
      });
    }
  };

  const handleResentVerify = async () => {
    try {
      const data = { email: email };
  
      const result = await postApiNoneToken("/user/resend-verification", data);
      if (result.data.success) {
        Swal.fire({
          icon: "info",
          text: "Mã xác minh đã được gửi lại đến email của bạn.",
        });
      } else {
        Swal.fire({
          icon: "error",
          text: result.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Đã có lỗi xảy ra khi gửi lại mã. Vui lòng thử lại sau!",
      });
    }
  };
  

  const handleSentVerify = async () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
  
    if (emailValidation.success && passwordValidation.success) {
      try {
        if (password !== confirmPassword) {
          Swal.fire({
            icon: "warning",
            text: "Mật khẩu không khớp, vui lòng nhập lại",
          });
          return false;
        }
  
        const data = {
          name: name,
          email: email,
          password: password,
          role: key,  // Vai trò: candidate hoặc company
        };

        // setLoading(true);//
        // Gửi yêu cầu đăng ký và gửi mã xác minh qua email
        const result = await postApiNoneToken("/user/register", data);
        // setLoading(false);//
        if (result.data.success) {
          Swal.fire({
            icon: "info",
            text: "Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã để hoàn tất đăng ký.",
          });
          return true;
        } else {
          Swal.fire({
            icon: "error",
            text: result.data.message,
          });
          return false;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          text: "Đã có lỗi xảy ra. Vui lòng thử lại sau!",
        });
        return false;
      }
    } else {
      if (!emailValidation.success) {
        setEmailErr(emailValidation.message);
      }
      if (!passwordValidation.success) {
        setPasswordErr(passwordValidation.message);
      }
      if (password !== confirmPassword) {
        setPasswordErr("Mật khẩu không khớp");
      }
      return false;
    }
  };

  // modal captcha
  // const handleShowModal = () => {
  //   handleSentVerify();
  //   setShowModal(true);
  // }
  const handleShowModal = async () => {
    const isSent = await handleSentVerify(); // Gọi hàm và chờ kết quả
    if (isSent) { // Chỉ hiển thị modal nếu gửi thành công
        setShowModal(true);
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }
  
  return (
    <>
   <Modal 
      show={showModal} 
      onHide={handleCloseModal}
      centered
  >
      <Modal.Header closeButton>
        <Modal.Title>XÁC THỰC</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Nhập mã xác thực</p>
        <input 
          type="text"
          id="verify"
          placeholder='Nhập mã xác thực'
          className="form-control"
          value={verify}
          onChange={(e) => {
            setVerify(e.target.value);
          }}
          aria-invalid={!!emailErr}
          />
          <Button variant="secondary" onClick={handleResentVerify}>
            Gửi lại mã
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={()=>handleSignup()}>
          Xác thực
        </Button>
      </Modal.Footer>
    </Modal>

    <div className={clsx('container', styles.signupContainer)}>
      {/* logo */}
      <div className={styles.logoContainer}>
        <Link to="/">
          <img src={logo} alt="Logo" className={styles.logo} />
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className={clsx('card', styles.signupCard)}>
            <div className="card-body">
              <h2 className={clsx('card-title', 'text-center', styles.signupTitle)}>
                Sign Up
              </h2>

              <Tabs
                id="signup-tabs"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
              >
                <Tab eventKey="candidate" title="Candidate">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          handleCheckEmailExit(e.target.value);
                        }}
                        isInvalid={!!emailErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={!!passwordErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {/* {passwordErr} */}
                      </Form.Control.Feedback>
                    </Form.Group>
                    {/* Confirm */}
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isInvalid={!!passwordErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                  <Button variant="primary" className="w-100" onClick={handleShowModal}>
                      Sign Up
                    </Button>
                    {/* <Button variant="primary" className="w-100" onClick={handleShowModal} disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Sign Up'}
                    </Button>

                    {loading && <div className="loading-spinner">Đang gửi yêu cầu...</div>} */}
                </Form>
                    
                  <div className="text-center mt-3">
                <Button variant="outline-danger" className="w-100">
                  <i className="fab fa-google"></i> Sign Up with Google
                </Button>
              </div>
            </Tab>

                <Tab eventKey="company" title="Company">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your company name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        isInvalid={!!emailErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => handleCheckPassword(e.target.value)}
                        isInvalid={!!passwordErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    {/* confirm */}
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isInvalid={!!passwordErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button variant="primary" className="w-100" onClick={handleShowModal}>
                      Sign Up
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              {/* <div className="text-center mt-3">
                <Button variant="outline-danger" className="w-100">
                  <i className="fab fa-google"></i> Sign Up with Google
                </Button>
              </div> */}
              <div className="text-center mt-4">
                <span>Already have an account?</span>
                <a href="/login" className={styles.loginLink}> Log In</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Signup;
