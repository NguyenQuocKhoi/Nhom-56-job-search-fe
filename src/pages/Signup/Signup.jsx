import React, { useState } from 'react';
import { Button, Tab, Tabs, Form, Modal } from 'react-bootstrap';
import clsx from 'clsx';
import styles from './signup.module.scss';
import logo from '../../images/logo.png';
import { validateEmail, validateName, validatePassword } from '../../Utils/valid';
import { getAPiNoneToken, postApiNoneToken } from '../../api';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';
import usePageTitle from '../../hooks/usePageTitle';

const Signup = () => {
  usePageTitle('TopJob - Đăng kí tài khoản');

  const navigate = useNavigate();
  const [key, setKey] = useState('candidate');
  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [verify, setVerify] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //
  const [showModal, setShowModal] = useState(false);

  //loading spinner
  const [loading, setLoading] = useState(false);

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
            text: "Đã xác minh và tạo tài khoản thành công!",
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
        text: "Đã xảy ra lỗi. Vui lòng thử lại sau!",
      });
    }
  };

  const handeleCheckEmail = (e) => {
    if (validateEmail(e.target.value)) {
      setEmail(e.target.value);
      setEmailErr('')
    } else {
      setEmailErr(
        "Incorrect email format"
      );
    }
  };

  const handleResentVerify = async () => {
    try {
      const data = { email: email };
  
      const result = await postApiNoneToken("/user/resend-verification", data);
      if (result.data.success) {
        Swal.fire({
          icon: "info",
          text: "Mã xác minh đã được gửi lại vào email của bạn.",
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
        text: "Đã xảy ra lỗi khi gửi lại mã. Vui lòng thử lại sau!",
      });
    }
  };
  


  const handleSentVerify = async () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const nameValidation = validateName(name)
  
    if (emailValidation.success && passwordValidation.success && nameValidation.success) {
      try {
        if (password !== confirmPassword) {
          Swal.fire({
            icon: "warning",
            text: "Mật khẩu không khớp, vui lòng nhập lại!",
          });
          return false;
        }
  
        const data = {
          name: name,
          email: email,
          password: password,
          role: key,  // Vai trò: candidate hoặc company
        };

        setLoading(true);

        const result = await postApiNoneToken("/user/register", data);
        setLoading(false);//
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
        setLoading(false);
        Swal.fire({
          icon: "error",
          text: "Đã xảy ra lỗi hoặc email đã tồn tại. Vui lòng thử lại sau!",
        });
        return false;
      }
    } else {
      if(!nameValidation.success){
        // console.log(1);
        Swal.fire({
          icon: "error",
          text: nameValidation.message,
        });
        return false;
      }
      if (!emailValidation.success) {
        setEmailErr(emailValidation.message);
        return false;
      }
      if (!passwordValidation.success) {
        // console.log(passwordValidation.message);
        Swal.fire({
          icon: "error",
          text: passwordValidation.message,
        });
        return false;
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
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
          placeholder='Enter the authentication code'
          className="form-control"
          value={verify}
          onChange={(e) => {
            setVerify(e.target.value);
          }}
          aria-invalid={!!emailErr}
          />
          <Button variant="primary" onClick={handleResentVerify}>
          Gửi lại mã
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleCloseModal}>
          Đóng
        </Button>
        <Button variant="primary" onClick={()=>handleSignup()}>
        Xác thực
        </Button>
      </Modal.Footer>
    </Modal>

    {loading ? <Loading /> : null}
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
                Đăng ký
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
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {nameErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => {
                          handeleCheckEmail(e);
                          // handleCheckEmailExit(e.target.value);
                        }}
                        isInvalid={!!emailErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu</Form.Label>
                      <div className={clsx(styles.passwordContainer)}>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Nhập mật khẩu"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          // isInvalid={!!passwordErr}
                        />

                        <span 
                          onClick={togglePasswordVisibility} 
                          className={clsx(styles.passwordToggleIcon)}
                          // style={{ marginTop: '8px', cursor: 'pointer' }}
                        >
                          { showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                        </span>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    {/* Confirm */}
                    <Form.Group className="mb-3">
                      <Form.Label>Nhập lại mật khẩu</Form.Label>
                      <div className={clsx(styles.passwordContainer)}>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'} 
                          placeholder="Nhập lại mật khẩu"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          // isInvalid={!!passwordErr}
                        />

                        <span 
                          onClick={toggleConfirmPasswordVisibility} 
                          className={clsx(styles.passwordToggleIcon)}
                          // style={{ marginTop: '8px', cursor: 'pointer' }}
                        >
                          { showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                        </span>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                  <Button variant="primary" className="w-100" onClick={handleShowModal}>
                      Đăng ký
                    </Button>
                    {/* <Button variant="primary" className="w-100" onClick={handleShowModal} disabled={loading}>
                      {loading ? 'Đang xử lý...' : 'Sign Up'}
                    </Button>

                    {loading && <div className="loading-spinner">Đang gửi yêu cầu...</div>} */}
                </Form>
                    
                  <div className="text-center mt-3">
                {/* <Button variant="outline-danger" className="w-100">
                  <i className="fab fa-google"></i> Sign Up with Google
                </Button> */}
              </div>
            </Tab>

                <Tab eventKey="company" title="Company">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên công ty</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên công ty"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => {
                          handeleCheckEmail(e);
                          // handleCheckEmailExit(e.target.value);
                        }}
                        isInvalid={!!emailErr}
                        // isInvalid={!!emailErr}
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailErr}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu</Form.Label>
                      <div className={clsx(styles.passwordContainer)}>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Nhập mật khẩu"
                          value={password}
                          // onChange={(e) => handleCheckPassword(e.target.value)}
                          // isInvalid={!!passwordErr}
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
                      {/* <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback> */}
                    </Form.Group>
                    {/* confirm */}
                    <Form.Group className="mb-3">
                      <Form.Label>Nhập lại mật khẩu</Form.Label>
                      <div className={clsx(styles.passwordContainer)}>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'} 
                          placeholder="Nhập lại mật khẩu"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          // isInvalid={!!passwordErr}
                        />
                        <span 
                          onClick={toggleConfirmPasswordVisibility} 
                          className={clsx(styles.passwordToggleIcon)}
                          // style={{ marginTop: '8px', cursor: 'pointer' }}
                        >
                          { showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
                        </span>
                      </div>
                      {/* <Form.Control.Feedback type="invalid">
                        {passwordErr}
                      </Form.Control.Feedback> */}
                    </Form.Group>
                    
                    <Button variant="primary" className="w-100" onClick={handleShowModal}>
                      Đăng ký
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
                <span>Đã có tài khoản?</span>
                <a href="/login" className={styles.loginLink}> Đăng nhập</a>
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
