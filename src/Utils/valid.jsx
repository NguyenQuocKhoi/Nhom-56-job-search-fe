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
        message: "Invalid email address",
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
          "Password must be at least 6 characters long, include both uppercase and lowercase letters, at least one number, and one special character.",
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
        message: "Name must be at least 3 characters long",
      };
    }
  };

  export const getUserStorage = () =>{
    return JSON.parse(localStorage.getItem('user'))
  }
  export const setUserStorage = (user) =>{
    localStorage.setItem("user", JSON.stringify(user))
  }