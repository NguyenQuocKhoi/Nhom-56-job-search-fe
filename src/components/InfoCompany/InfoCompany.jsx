import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './infoCompany.module.scss';

import { getApiWithToken, putApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';

import logo from '../../images/logo.jpg';
import Swal from 'sweetalert2';

const InfoCompany = () => {
  const [company, setCompany] = useState({
    avatar: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    website: ''
  });
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companyId = getUserStorage().user._id;
        const response = await getApiWithToken(`/company/${companyId}`);
        
        if (response.data.success) {
          setCompany(response.data.company);
          setAvatarPreview(response.data.company.avatarUrl);
        } else {
          setError('Failed to fetch company data');
        }
      } catch (err) {
        setError('An error occurred');
      }
    };

    fetchCompany();
  }, []);

  // console.log(company);
  // const handleUploadAvatar = async () => {
  //   try {
  //     if (!avatarFile) return;

  //     const formData = new FormData();
  //     formData.append('avatar', avatarFile);

  //     const companyId = getUserStorage().user._id;
  //     const response = await putApiWithToken(`/company/upload-avatar/${companyId}`, formData);

  //     if (response.data.success) {
  //       setCompany(response.data.company);
  //       setAvatarPreview(response.data.company.avatarUrl); // Cập nhật ảnh đại diện
  //     } else {
  //       setError('Failed to upload avatar');
  //     }
  //   } catch (err) {
  //     setError('An error occurred during avatar upload');
  //   }
  // };

  // const handleUpdateInfo = async () => {
  //   try {
  //     const companyId = getUserStorage().user._id;
      
  //     const response = await putApiWithToken(`/company/update/${companyId}`, company);
  
  //     if (response.data.success) {
  //       setCompany(response.data.company);
  //       setIsEditing(false);
  //       Swal.fire({ icon: 'success', text: 'Company information updated successfully!' });
  //     } else {
  //       setError('Failed to update company information');
  //       Swal.fire({ icon: 'error', text: 'Failed to update company information' });
  //     }
  //   } catch (err) {
  //     setError('An error occurred during information update');
  //     Swal.fire({ icon: 'error', text: 'An error occurred during information update' });
  //   }
  // };
//

  // const handleUpdateInfo = async () => {
  //   try {
  //     const companyId = getUserStorage().user._id;

  //     // Handle avatar upload if file is selected
  //     // if (avatarFile) {
  //     //   const formData = new FormData();
  //     //   formData.append('avatar', avatarFile);

  //     //   const avatarResponse = await putApiWithToken(`/company/upload-avatar/${companyId}`, formData);
  //     //   if (avatarResponse.data.success) {
  //     //     setAvatarPreview(avatarResponse.data.company.avatarUrl);
  //     //   } else {
  //     //     setError('Failed to upload avatar');
  //     //   }
  //     // }


  //     const companyResponse = await putApiWithToken(`/company/update/${companyId}`, company);
  //     if (companyResponse.data.success) {
  //       setCompany(companyResponse.data.company);
  //       setIsEditing(false);
  //       Swal.fire({ icon: 'success', text: 'Company information updated successfully!' });
  //     } else {
  //       setError('Failed to update company information');
  //       Swal.fire({ icon: 'error', text: 'Failed to update company information' });
  //     }
  //   } catch (err) {
  //     setError('An error occurred during information update');
  //     Swal.fire({ icon: 'error', text: 'An error occurred during information update' });
  //   }
  // };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const companyId = getUserStorage().user._id;
      const formData = new FormData();
      
      // Append form data for the company fields
      formData.append('name', company.name);
      formData.append('phoneNumber', company.phoneNumber);
      formData.append('address', company.address);
      formData.append('website', company.website);
      
      // Append avatar file if it exists
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const companyResponse = await putApiWithToken(`/company/update/${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (companyResponse.data.success) {
        setCompany(companyResponse.data.company);
        setIsEditing(false);
        Swal.fire({ icon: 'success', text: 'Company information updated successfully!' });
      } else {
        setError('Failed to update company information');
        Swal.fire({ icon: 'error', text: 'Failed to update company information' });
      }
    } catch (err) {
      setError('An error occurred during information update');
      Swal.fire({ icon: 'error', text: 'An error occurred during information update' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  if (error) return <div className={clsx(styles.error)}>{error}</div>;

  if (!company) return <div className={clsx(styles.loading)}>Loading...</div>;

  return (
    <div className={clsx(styles.companyInfo)}>
      <div className={clsx(styles.avatarSection)}>
        <img src={company.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} />
        {/* <img src={avatarPreview || logo} alt="Avatar" className={clsx(styles.avatar)} /> */}

        <input 
          type="file" 
          accept="image/*" 
          // onChange={(e) => handleAvatarChange(e)} 
          onChange={handleAvatarChange}
          disabled={!isEditing}
        />
      </div>

      <div className={clsx(styles.infoSection)}>
        <h2>Thông tin công ty</h2>

        <label>Name:</label>
        <input 
          type="text" 
          name="name"
          value={company.name}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Email:</label>
        <input 
          type="email" 
          name="email"
          value={company.email}
          onChange={handleInputChange}
          disabled
        />

        <label>Phone Number:</label>
        <input 
          type="text" 
          name="phoneNumber"
          value={company.phoneNumber}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Address:</label>
        <input 
          type="text" 
          name="address"
          value={company.address}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Website:</label>
        <input 
          type="text" 
          name="website"
          value={company.website}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <div className={clsx(styles.btnContainer)}>
          <button 
            className={clsx(styles.btnUpdate)} 
            onClick={() => {
              if (isEditing) {
                handleUpdateInfo();
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? 'Xác nhận cập nhật' : 'Cập nhật thông tin'}
          </button>
          <button
            // className={clsx(styles.btnUpdate)}
          >
            Profile đang chờ duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoCompany;
