import React, { useState } from 'react';
import { Button, Tab, Tabs, Form } from 'react-bootstrap';
import clsx from 'clsx';
import styles from './signup.module.scss';
import logo from '../../images/logo.jpg';
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

  const handleSignup = async (e) => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (emailValidation.success && passwordValidation.success) {
      try {
          if (password !== confirmPassword) {
            Swal.fire({
                 icon: "warning",
                 text: "mật khẩu không khớp, vui lòng nhập lại",
               });
            return;
          }
          const data = {
            name: name,
            email: email,
            password: password,
            role: key,  // Vai trò: candidate hoặc company
          };
          const result = await postApiNoneToken("/user/register", data);
          if(result.data.message){
            console.log(result.data);
            
            Swal.fire({
              icon: "warning",
              text:result.data.message,
            });
          }
          if (result.data) {
            Swal.fire({
              icon: "success",
              text: "Registration successful!",
            });
            navigate("/login");
          } else {
            Swal.fire({
              icon: "error",
              text: result.data.message,
            });
          }
      } catch (error) {
        console.log("1",error);
        Swal.fire({
          icon: "error",
          text: "This email has already been created",
        });
      }
    } else {
      if (!emailValidation.success) {
        setEmailErr(emailValidation.message);
      }
      if (!passwordValidation.success) {
        setPasswordErr(passwordValidation.message);
      }
      if (password !== confirmPassword) {
        setPasswordErr("Passwords do not match");
      }
    }
  };

  return (
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
                    
                  </Form>
                  <Button variant="primary" className="w-100" onClick={()=>handleSignup()}>
                      Sign Up
                    </Button>
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
                    <Button variant="primary" className="w-100" onClick={()=>handleSignup()}>
                      Sign Up
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              <div className="text-center mt-3">
                <Button variant="outline-danger" className="w-100">
                  <i className="fab fa-google"></i> Sign Up with Google
                </Button>
              </div>
              <div className="text-center mt-4">
                <span>Already have an account?</span>
                <a href="/login" className={styles.loginLink}> Log In</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
