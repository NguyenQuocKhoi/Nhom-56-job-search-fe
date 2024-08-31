import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './infoCompany.module.scss';

import { getApiWithToken, putApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';

import logo from '../../images/logo.jpg';
import Swal from 'sweetalert2';

const InfoCompany = () => {
  const [company, setCompany] = useState({
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

  console.log(company)

  const handleUploadAvatar = async () => {
    try {
      if (!avatarFile) return;

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const companyId = getUserStorage().user._id;
      const response = await putApiWithToken(`/company/upload-avatar/${companyId}`, formData);

      if (response.data.success) {
        setCompany(response.data.company);
        setAvatarPreview(response.data.company.avatarUrl); // Cập nhật ảnh đại diện
      } else {
        setError('Failed to upload avatar');
      }
    } catch (err) {
      setError('An error occurred during avatar upload');
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const companyId = getUserStorage().user._id;
      
      const response = await putApiWithToken(`/company/update/${companyId}`, company);
  
      if (response.data.success) {
        setCompany(response.data.company);
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
      {/* <h2>Thông tin công ty</h2>

      <p><strong>Name:</strong> {company.name}</p>
      <p><strong>Email:</strong> {company.email}</p>
      <p><strong>Phone Number:</strong> {company.phoneNumber}</p>
      <p><strong>Address:</strong> {company.address}</p>
      <p><strong>Website:</strong> {company.website}</p>

      <button className={clsx(styles.btnUpdate)}>Update Avatar</button>
      <button className={clsx(styles.btnUpdate)}>Update</button> */}
{/* ------ */}
    <div className={clsx(styles.avatarSection)}>
      <img src={company.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} />

      <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setAvatarFile(e.target.files[0])} 
          />
          <button className={clsx(styles.btnUpdate)} onClick={handleUploadAvatar}>
            Upload Avatar
          </button>
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
          {isEditing ? (
            <>
              <button className={clsx(styles.btnConfirm)} onClick={handleUpdateInfo}>
                Xác nhận cập nhật
              </button>
              <button className={clsx(styles.btnCancel)} onClick={() => setIsEditing(false)}>
                Hủy
              </button>
            </>
          ) : (
            <button className={clsx(styles.btnEdit)} onClick={() => setIsEditing(true)}>
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCompany;
