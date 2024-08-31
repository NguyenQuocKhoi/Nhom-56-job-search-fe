import axios from "axios"
import { getUserStorage } from "../Utils/valid";

var api = axios.create({
    baseURL: "http://localhost:8080/api/v1"
})

export const postApiNoneToken = (url, data) => {
    return api.post(url, data);
};
export const getAPiNoneToken = (url, data) => {
    return api.get(url, data);
};

export const getApiWithToken = (url) => {
    const token = getUserStorage().token;
      return api.get(url, {
        headers: {
          "auth-token": `${token}`,
        },
      })
  };
  
  export const postApiWithToken = (url, data) => {
    const token = getUserStorage().token;
    return api.post(url, data, {
      headers: {
        "auth-token": `${token}`,
      },
    });
  };
  
  export const postApiFileWithToken = (url, form, data) => {
    const token = getUserStorage().token;
    return api.post(url, form, data, {
      headers: {
        "auth-token": `${token}`,
      },
    });
  };
  
  export const putApiWithToken = (url, data) => {
    const token = getUserStorage().token;
    return api.put(url, data, {
      headers: {
        "auth-token": `${token}`,
  
      },
    });
  };
  export const deleteApiWithToken = (url) => {
    const token = getUserStorage().token;
    return api.delete(url, {
      headers: {
        "auth-token": `${token}`,
      },
    });
  };