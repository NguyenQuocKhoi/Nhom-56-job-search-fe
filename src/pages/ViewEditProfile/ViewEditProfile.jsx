import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './viewEditProfile.module.scss';

import { getApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';

import logo from '../../images/logo.jpg';
import { useNavigate } from 'react-router-dom';

const ViewEditProfile = () => {
  const navigate = useNavigate();

  const [company, setCompany] = useState({
    avatar: '',
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    street: '',
    website: '',
    discription: ''
  });
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const companyId = getUserStorage().user._id;

  useEffect(() => {
    const fetchCompany = async () => {
      try {
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
  }, [companyId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const getStyleForField = (fieldName) => {
    return company.pendingUpdates && company.pendingUpdates[fieldName] !== company[fieldName] ? styles.changed : '';
  };

  if (error) return <div className={clsx(styles.error)}>{error}</div>;

  if (!company) return <div className={clsx(styles.loading)}>Loading...</div>;

  return (
    <div className={clsx(styles.companyInfo)}>
      <div className={clsx(styles.avatarSection)}>
        <img 
          src={company.pendingUpdates?.avatar || avatarPreview || logo} 
          alt="Avatar" 
          className={clsx(styles.avatar)} 
        />
        <input 
          type="file" 
          accept="image/*" 
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
          value={company.pendingUpdates?.name || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('name'))}
        />

        <label>Email:</label>
        <input 
          type="email" 
          name="email"
          value={company.pendingUpdates?.email || ""}
          onChange={handleInputChange}
          disabled
          className={clsx(getStyleForField('email'))}
        />

        <label>Phone Number:</label>
        <input 
          type="text" 
          name="phoneNumber"
          value={company.pendingUpdates?.phoneNumber || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('phoneNumber'))}
        />

        <label>City:</label>
        <input 
          type="text" 
          name="city"
          value={company.pendingUpdates?.city || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('city'))}
        />
        <label>Street:</label>
        <input 
          type="text" 
          name="street"
          value={company.pendingUpdates?.street || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('street'))}
        />

        <label>Website:</label>
        <input 
          type="text" 
          name="website"
          value={company.pendingUpdates?.website || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('website'))}
        />
        <label>Description:</label>
        <input 
          type="text" 
          name="description"
          value={company.pendingUpdates?.description || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('description'))}
        />

        <div className={clsx(styles.btnContainer)}>
          <button
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEditProfile;
