import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './createPostJob.module.scss';
import { getAPiNoneToken, getApiWithToken, postApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ReatQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

const CreatePostJob = () => {
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    interest: '',
    numberOfCruiment: '',
    experienceLevel: '',
    position: '',
    city: '',
    street: '',
    type: 'fulltime', // default to 'fulltime'
    expiredAt: '',
    category: '', // add category field
    requirementSkills: []
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryDa, setCategoryDa] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  const [companyStatus, setCompanyStatus] = useState(null);

  useEffect(() => {
    const fetchCompanyStatus = async () => {
      const companyId = getUserStorage()?.user._id;
      const result = await getAPiNoneToken(`/company/${companyId}`);
      setCompanyStatus(result.data.company.status);
    };

    const fetchCategory = async () => {
      try {
        const categoryResponse = await getAPiNoneToken(`/category/get-all`);
        setCategoryDa(categoryResponse.data.categories);
      } catch (error) {
        setError('Failed to fetch categories');
      }
    };

    const fetchSkills = async () => {
      try {
        const skillResponse = await getApiWithToken(`/skill/get-all`);
        setSkillsData(skillResponse.data.skills);
      } catch (error) {
        setError('Failed to fetch skills');
      }
    };

    checkInfoCompany();
    fetchCompanyStatus();

    fetchCategory();
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };
  const handleChangeD = (value) => {
    setJobData({
      ...jobData,
      description: value
    });
  };
  const handleChangeI = (value) => {
    setJobData({
      ...jobData,
      interest: value
    });
  };
  const handleChangeR = (value) => {
    setJobData({
      ...jobData,
      requirements: value
    });
  };


  const handleSkillChange = (skillId) => {
    setJobData((prevState) => {
      const newRequirementSkills = prevState.requirementSkills.includes(skillId)
        ? prevState.requirementSkills.filter((id) => id !== skillId)
        : [...prevState.requirementSkills, skillId];
      return { ...prevState, requirementSkills: newRequirementSkills };
    });
  };

  //kiểm tra thông tin đầy đủ và status company là true mới cho tạo
  const handleCreatePostJob = async () => {
    const userData = getUserStorage()?.user;
  
    // Check if all required fields are filled
    const {
      title,
      description,
      requirements,
      salary,
      interest,
      numberOfCruiment,
      experienceLevel,
      position,
      city,
      street,
      type,
      expiredAt,
      category,
      requirementSkills
    } = jobData;
  
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !interest ||
      !numberOfCruiment ||
      !experienceLevel ||
      !position ||
      // !address ||
      !city ||
      !street ||
      !type ||
      !expiredAt ||
      !category ||
      !requirementSkills === 0
    ) {
      setError('Vui lòng nhập đủ thông tin');
      setSuccessMessage(''); // Reset success message
      return;
    }
  
    try {
      const result = await postApiWithToken('/job/create', {
        ...jobData,
        companyId: userData._id,
      });
  
      if (result.data.success) {
        setError('');
        setSuccessMessage('Bài đăng đã được tạo thành công và đang chờ admin phê duyệt.');
        Swal.fire({
          icon: 'success',
          title: 'Tạo bài đăng thành công',
          text: `Bài đăng đã được tạo thành công và đang chờ admin phê duyệt.`,
        });

        setJobData({
          title: '',
          description: '',
          requirements: '',
          salary: '',
          interest: '',
          numberOfCruiment: '',
          experienceLevel: '',
          position: '',
          city: '',
          street: '',
          type: 'fulltime', // default to 'fulltime'
          expiredAt: '',
          category: '',
          requirementSkills: []
        });
        setSearchQuery('');
        setFilteredCities(cities);
      } else {
        setError(result.data.message);
        setSuccessMessage('');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi tạo bài đăng');
      setSuccessMessage('');
    }
  };

  const checkInfoCompany = async () => {
    const companyId = getUserStorage()?.user._id;
  
    try {
      const result = await getAPiNoneToken(`/company/${companyId}`);
  
      if (result.data.company) {
        const {
          phoneNumber,
          website,
          avatar,
          name,
          city,
          street,
          description,
        } = result.data.company;
  
        // Check if any field is missing
        if (
          !phoneNumber ||
          !website ||
          !avatar ||
          !name ||
          !city ||
          !street ||
          !description
        ) {
          Swal.fire({
            icon: 'warning',
            title: 'Thông báo',
            html: `
            <p>Vui lòng hoàn thiện thông tin để được phê duyệt tài khoản.</p>
            <button id="updateProfileBtn" class="swal2-confirm swal2-styled" style="display: inline-block;">Cập nhật ngay</button>
          `,
          showConfirmButton: false, // Hide the default confirm button
          didRender: () => {
            // Attach the navigate action to the button inside Swal
            document.getElementById('updateProfileBtn').addEventListener('click', () => {
              Swal.close();
              navigate('/profile');
            });
          }
          });
        } else {
          // All information is complete
          console.log('Company information is complete.');
        }
      } else {
        console.error('Unable to fetch company information.');
      }
    } catch (error) {
      console.error('Error fetching company information:', error);
    }
  };  
  
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  //city
  const handleCityInputClick = () => {
    setShowCityModal(true);
  };

  const handleCitySelect = (city) => {
    setJobData({ ...jobData, city });
    setShowCityModal(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
  };

  return (
    <div className={clsx(styles.createPostJobPage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
      {/* {companyStatus !== true && (
        <p className={clsx(styles.topThongBaoChuaPheDuyet)}>Tài khoản chưa được phê duyệt! Sau khi được phê duyệt mới có thể đăng tin tuyển dụng.</p>
      )} */}
        <h2 className={clsx(styles.pageTitle)}>Tạo Tin Tuyển Dụng</h2>
        <form className={clsx(styles.form)}>
          <div className={clsx(styles.formGroupTT)}>
            <label htmlFor="title">Tiêu đề <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={jobData.title}
              onChange={handleChange}
            />
          </div>

          <div className={clsx(styles.formGroup)}>
            <label htmlFor="description">Mô tả <span style={{ color: 'red' }}>*</span></label>
            {/* <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
            ></textarea> */}
            <ReatQuill
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChangeD}
            />
          </div>

          <div className={clsx(styles.formGroup)}>
            <label htmlFor="requirements">Yêu cầu <span style={{ color: 'red' }}>*</span></label>
            {/* <textarea
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleChange}
            ></textarea> */}
            <ReatQuill
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleChangeR}
            />
          </div>
          
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="interest">Phúc lợi <span style={{ color: 'red' }}>*</span></label>
            {/* <textarea
              id="interest"
              name="interest"
              value={jobData.interest}
              onChange={handleChange}
            ></textarea> */}
            <ReatQuill
              id="interest"
              name="interest"
              value={jobData.interest}
              onChange={handleChangeI}
            />
          </div>

          <div className={clsx(styles.midAddress)}>
          <div className={clsx(styles.midAddressCity)}>
            <label>Tỉnh/Thành phố <span style={{ color: 'red' }}>*</span></label>
            {/* <input 
              type="text" 
              name="city"
              value={jobData.city || ""}
              onClick={handleCityInputClick}
              readOnly
            />
            {showCityModal && (
              <div className={clsx(styles.modal)}>
                <div className={clsx(styles.modalContent)}>
                  <input 
                    type="text"
                    placeholder="Search Cities..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <ul>
                    {filteredCities.map((city) => (
                      <li 
                        key={city}
                        onClick={() => handleCitySelect(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setShowCityModal(false)}>Close</button>
                </div>
              </div>
            )} */}

    <select 
      id="city" 
      name="city" 
      value={jobData.city || ""} 
      onChange={handleChange} 
      style={{ maxHeight: '150px', overflowY: 'auto' }} // Scrollable dropdown
    >
      {cities.map((city, index) => (
        <option key={index} value={city}>
          {city}
        </option>
      ))}
    </select>
          </div>

            <div className={clsx(styles.midAddressStreet)}>
              <label>Đường <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="street"
                name="street"
                value={jobData.street}
                onChange={handleChange}
                className={clsx(styles.street)}
              />
            </div>
        </div>

          <div className={clsx(styles.midLuong)}>
            <div className={clsx(styles.formGroupLuong)}>
              <label htmlFor="salary">Mức lương <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={jobData.salary}
                onChange={handleChange}
              />
            </div>

            <div className={clsx(styles.formGroupLuong)}>
              <label htmlFor="numberOfCruiment">Số lượng tuyển <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="numberOfCruiment"
                name="numberOfCruiment"
                value={jobData.numberOfCruiment}
                onInput={(e) => {
                  if (e.target.value < 0) {
                    e.target.value = 1;
                  }
                }}
                min="1"
                onChange={handleChange}
              />
            </div>
            <div className={clsx(styles.formGroupLuong)}>
              <label htmlFor="experienceLevel">Kinh nghiệm <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="experienceLevel"
                name="experienceLevel"
                value={jobData.experienceLevel}
                onChange={handleChange}
              />
            </div>
            <div className={clsx(styles.formGroupLuong)}>
            <label htmlFor="expiredAt">Ngày hết hạn <span style={{ color: 'red' }}>*</span></label>
            <input
                type="date"
                id="expiredAt"
                name="expiredAt"
                value={jobData.expiredAt}
                onChange={handleChange}
              />
            </div>
            
          </div>

          <div className={clsx(styles.midVitri)}>
            <div className={clsx(styles.formGroupLuong)}>
              <label>Kỹ năng (Yêu cầu) <span style={{ color: 'red' }}>*</span></label>
              <button type="button" onClick={openModal} className={styles.openModalButton}>
                Chọn kỹ năng
              </button>
              {/* <div className={styles.selectedSkills}>
                {skillsData
                  .filter(skill => jobData.requirementSkills.includes(skill._id))
                  .map(skill => (
                    <span key={skill._id} className={styles.selectedSkill}>
                      {skill.skillName}
                    </span>
                ))}
              </div> */}
            </div>

          <div className={clsx(styles.formGroupLuong)}>
            <label htmlFor="position">Vị trí <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="position"
              name="position"
              value={jobData.position}
              onChange={handleChange}
            />
            </div>
          
            <div className={clsx(styles.formGroupLuong)}>
              <label htmlFor="type">Loại công việc <span style={{ color: 'red' }}>*</span></label>
              <select
                id="type"
                name="type"
                value={jobData.type}
                onChange={handleChange}
              >
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className={clsx(styles.formGroupLuong)}>
              <label htmlFor="category">Danh mục <span style={{ color: 'red' }}>*</span></label>
              <select
                id="category"
                name="category"
                value={jobData.category}
                onChange={handleChange}
              >
                <option value="">Chọn danh mục</option>
                {categoryDa.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className={styles.selectedSkills}>
            {skillsData
              .filter(skill => jobData.requirementSkills.includes(skill._id))
              .map(skill => (
                <span key={skill._id} className={styles.selectedSkill}>
                  {skill.skillName}
                </span>
            ))}
          </div>

            {isModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <div className={styles.skillsContainer}>
                    {skillsData.map((skill) => (
                      <div key={skill._id} className={clsx(styles.skillCheckbox)}>
                        <input
                          type="checkbox"
                          id={`skill-${skill._id}`}
                          checked={jobData.requirementSkills.includes(skill._id)}
                          onChange={() => handleSkillChange(skill._id)}
                        />
                        <label htmlFor={`skill-${skill._id}`}>{skill.skillName}</label>
                      </div>
                    ))}
                  </div>
                  <button onClick={closeModal} className={styles.closeModalButton}>
                    Đóng
                  </button>
                </div>
              </div>
            )}                            
          
        </form>

        <div className={clsx(styles.actions)}>
          <button
            className={clsx(styles.createButton, { [styles.disabledButton]: companyStatus !== true })}
            onClick={handleCreatePostJob}
            disabled={companyStatus !== true}
          >
            Tạo bài đăng
          </button>        
                  
          <button
            className={clsx(styles.cancelButton)}
            onClick={() => navigate(-1)}
          >
            Thoát
          </button>
        </div>
        {error && <div className={clsx(styles.errorMessage)}>{error}</div>}
        {successMessage && <div className={clsx(styles.thongBaoTaoThanhCong)}>{successMessage}</div>} {/* Success message */}
        {companyStatus !== true && (
          <p className={clsx(styles.topThongBaoChuaPheDuyet)}>Tài khoản chưa được phê duyệt! Sau khi được phê duyệt mới có thể đăng tin tuyển dụng.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CreatePostJob;
