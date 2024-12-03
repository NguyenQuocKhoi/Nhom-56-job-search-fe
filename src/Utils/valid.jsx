const validator = require('validator')

export const validateEmail = (email) => {
    // const emailCriteria =
    //   /([a-z0-9_]+|[a-z0-9_]+\.[a-z0-9_]+)@(([a-z0-9]|[a-z0-9]+\.[a-z0-9]+)+\.([a-z]{2,4}))/i;
    if (validator.isEmail(email)) {
      return {
        success: true,
        message: "Valid email",
      };
    } else {
      return {
        success: false,
        message: "Địa chỉ email không hợp lệ",
      };
    }
  };
  
export const validatePassword = (password) => {
    const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{6,}$/;
  
    if (passwordCriteria.test(password)) {
      return {
        success: true,
        message: "Valid password",
      };
    } else {
      return {
        success: false,
        message:
          "Mật khẩu phải dài ít nhất 6 ký tự, bao gồm cả chữ hoa và chữ thường, ít nhất một số",
      };
    }
  };
  
export  const validateName = (name) => {
    if (name.length >= 3) {
      return {
        success: true,
        message: "Valid name",
      };
    } else {
      return {
        success: false,
        message: "Họ và tên ứng viên hoặc tên công ty phải dài ít nhất 3 ký tự",
      };
    }
  };

  export const getUserStorage = () =>{
    return JSON.parse(localStorage.getItem('user'))
  }
  export const setUserStorage = (user) =>{
    localStorage.setItem("user", JSON.stringify(user))
  }

//   export const getUserStorage = () => {
//     const user = sessionStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   };
  
//  export const setUserStorage = (user) => {
//     sessionStorage.setItem('user', JSON.stringify(user));
//   };
  