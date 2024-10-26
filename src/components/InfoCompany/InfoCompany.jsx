import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './infoCompany.module.scss';
import { getApiWithToken, putApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import logo from '../../images/logo.png';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';

const cities = [
  'TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên - Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
  'Vĩnh Phúc', 'Yên Bái'
];

const InfoCompany = () => {
  const { t, i18n } = useTranslation();

  const [company, setCompany] = useState({
    avatar: '',
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    street: '',
    website: '',
    description: '',
    pendingUpdates: null
  });
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');
  
  const companyId = getUserStorage().user._id;

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await getApiWithToken(`/company/${companyId}`);
        
        if (response.data.success) {
          setCompany(response.data.company);
          // setAvatarPreview(response.data.company.avatarUrl);
          setAvatarPreview(response.data.company.avatar);
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

  const handleUpdateInfo = async () => {
    try {
      const companyId = getUserStorage().user._id;
      const formData = new FormData();
      
      // Append form data for the company fields
      formData.append('name', company.name);
      formData.append('phoneNumber', company.phoneNumber);
      formData.append('city', company.city);
      formData.append('street', company.street);
      formData.append('website', company.website);
      formData.append('description', company.description);
      
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
  
  const handleInputChangeD = (value) => {
    setCompany((prevState)=>({
      ...prevState,
      description: value,
    }));
  };

  //city
  // mới
  // const handleCitySelect = (selectedCity) => {
  //   setCompany((prev) => ({
  //     ...prev,
  //     pendingUpdates: {
  //       ...prev.pendingUpdates,
  //       city: selectedCity,
  //     },
  //   }));
  // };
  
  // cũ
  const handleCityInputClick = () => {
    setShowCityModal(true);
  };

  const handleCitySelect = (city) => {
    setCompany({ ...company, city });
    setShowCityModal(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
  };

  const getStyleForField = (fieldName) => {
    return company.pendingUpdates && company.pendingUpdates[fieldName] !== company[fieldName] ? styles.changed : '';
  };

  if (error) return <div className={clsx(styles.error)}>{error}</div>;
  if (!company) return <div className={clsx(styles.loading)}>Loading...</div>;

  return (
    <div className={clsx(styles.companyInfo)}>
      <h2 style={{display: 'flex', justifyContent: 'center', margin: '-20px 0 20px 0'}}>{t('profileCompany.infoCompany')}</h2>
      
      <div className={clsx(styles.top)}>
        <div className={clsx(styles.avatarSection)}>
          {/* <img src={company.avatar || avatarPreview || logo} alt="Avatar" className={clsx(styles.avatar)} /> */}
          <img src={avatarPreview || logo} alt="Avatar" className={clsx(styles.avatar)} />

          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange}
            disabled={!isEditing}
          />
        </div>

        <div className={clsx(styles.topInfo)}>
          <label>{t('profileCompany.name')}:</label>
          <input 
            type="text" 
            name="name"
            value={company.pendingUpdates?.name || company.name || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={clsx(getStyleForField('name'))}
          />

          <label>Email:</label>
          <input 
            type="email" 
            name="email"
            value={company.email || ""}
            onChange={handleInputChange}
            disabled
            className={clsx(getStyleForField('email'))}
          />

          <label>{t('profileCompany.phone')}:</label>
          <input 
            type="text" 
            name="phoneNumber"
            value={company.pendingUpdates?.phoneNumber || company.phoneNumber || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={clsx(getStyleForField('phoneNumber'))}
          />
        </div>
      </div>

      <div className={clsx(styles.mid)}>
        <div className={clsx(styles.midAddress)}>

        <div className={clsx(styles.midAddressStreet)}>
            <p className={clsx(styles.textStreet)}>{t('profileCompany.address')}:</p>
            <input 
              type="text" 
              name="street"
              value={company.pendingUpdates?.street || company.street || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={clsx(styles.street, getStyleForField('street'))}
            />
          </div>
          
          {/* mới */}
          {/* <p className={clsx(styles.textStreet)}>City:</p> */}
          {/* <div className={clsx(styles.selectContainer)}>
            <select
              name='city'
              className={clsx(styles.select, getStyleForField('city'))}
              value={company.pendingUpdates?.city || company.city || ""}
              onChange={handleCitySelect}
              disabled={!isEditing}
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div> */}



          {/* cũ */}
          <div className={clsx(styles.midAddressCity)}>
            <div className={clsx(styles.midCityContainer)}>
              <p className={clsx(styles.textStreet)}>{t('profileCompany.city')}:</p>
              <input 
                type="text" 
                name="city"
                value={company.pendingUpdates?.city || company.city || ""}
                onClick={handleCityInputClick}
                readOnly
                disabled={!isEditing}
                className={clsx(getStyleForField('city'))}
              />
            </div>

            <div className={clsx(styles.modalChooseCity)}>            
              {showCityModal && !company.pendingUpdates && (
                // <div className={clsx(styles.modal)}>
                  <div className={clsx(styles.modalContent)}>
                    <div className={clsx(styles.searchCityContainer)}>
                      <input 
                        type="text"
                        placeholder="Search Cities..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      <button onClick={() => setShowCityModal(false)} className={clsx(styles.btnCloseModalCity)}>X</button>
                    </div>

                      {filteredCities.map((city) => (
                        <li 
                          key={city}
                          onClick={() => handleCitySelect(city)}
                        >
                          {city}
                        </li>
                      ))}
                    {/* <button onClick={() => setShowCityModal(false)}>Close</button> */}
                  </div>
                // </div>
              )}
            </div>
          </div>

          {/* <div className={clsx(styles.midAddressStreet)}>
            <p className={clsx(styles.textStreet)}>Street:</p>
            <input 
              type="text" 
              name="street"
              value={company.pendingUpdates?.street || company.street || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={clsx(styles.street, getStyleForField('street'))}
            />
          </div> */}
        </div>
      </div>

      <div className={clsx(styles.infoSection)}>
          <label>Website:</label>
          <input 
            type="text" 
            name="website"
            value={company.pendingUpdates?.website || company.website || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={clsx(getStyleForField('website'))}
          />

        <label>{t('profileCompany.description')}:</label>
        {/* <textarea
          type="text" 
          name="description"
          value={company.pendingUpdates?.description || company.description || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={clsx(getStyleForField('description'))}
        /> */}
        <ReactQuill
          id="description"
          name="description"
          value={company.pendingUpdates?.description || company.description || ""}
          onChange={handleInputChangeD}
          disabled={!isEditing}
        />

        <div className={clsx(styles.btnContainer)}>
          {isEditing ? (
            <>
              <button className={clsx(styles.btnConfirm)} onClick={handleUpdateInfo}>
                {t('profileCompany.update')}
              </button>
              <button className={clsx(styles.btnCancel)} onClick={() => setIsEditing(false)}>
                {t('profileCompany.cancel')}
              </button>
            </>
          ) : (
            <button className={clsx(styles.btnEdit)} onClick={() => setIsEditing(true)}>
              {t('profileCompany.updateInfo')}
            </button>
          )}
        </div>
      </div>

      {company.pendingUpdates && (
      <div className={clsx(styles.dangchopheduyet)}>
        <h3>{t('profileCompany.wait')}</h3>
      </div>)}
    </div>
  );
};

export default InfoCompany;
