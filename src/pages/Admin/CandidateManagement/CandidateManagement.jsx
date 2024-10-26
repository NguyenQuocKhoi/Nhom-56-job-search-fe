import React, { useCallback, useEffect, useState } from 'react';
import { getApiWithToken, postApiNoneToken, postApiWithToken, putApiWithToken } from '../../../api';
import styles from '../CandidateManagement/candidateManagement.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import logo from '../../../images/logo.png';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const cities = [
  'All cities', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
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

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  //search
  const [addressInput, setAddressInput] = useState('');
  const [candidateInput, setCandidateInput] = useState('');
  const [results, setResults] = useState(null);

  //disable
  const [isActive, setIsActive] = useState(true);

  //create candidate
  const [candidateData, setCandidateData] = useState({
    role: 'candidate',
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    street: '',
    gender: 'male',
    dateOfBirth: '',
    skill: [],
    experience: '',
    education: '',
    moreInformation: ''
  })
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillsData, setSkillsData] = useState([]);


  const fetchCandidates = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getApiWithToken(`/candidate/get-all?page=${page}&limit=${pagination.limit}`);
      const candidates = result.data.candidates;
  
      // Lấy thông tin isActive cho từng ứng viên
      const updatedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            const userIsActiveResponse = await getApiWithToken(`/user/${candidate._id}`);  // Assuming candidate._id là userId
            const isActive = userIsActiveResponse.data.user.isActive;
            return { ...candidate, isActive };  // Gán isActive vào đối tượng candidate
          } catch (error) {
            console.error('Failed to fetch isActive status for candidate', error);
            return { ...candidate, isActive: null };  // Trả về null nếu không thể lấy isActive
          }
        })
      );
      //skill
      const fetchSkills = async () => {
        try {
          const skillResponse = await getApiWithToken(`/skill/get-all`);
          setSkillsData(skillResponse.data.skills);
        } catch (error) {
          setError('Failed to fetch skills');
        }
      };
  
      // Cập nhật danh sách ứng viên và thông tin phân trang
      setCandidates(updatedCandidates);
      setPagination(prev => ({
        ...prev,
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
      }));

    fetchSkills();
  
      console.log("Updated Candidates:", updatedCandidates);
  
    } catch (err) {
      setError('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);  

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handlePageChange = (newPage) => {
    fetchCandidates(newPage);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: candidateInput.trim(),
        city: addressInput.trim() || '',
      };
  
      const response = await postApiNoneToken('/candidate/search', searchParams);

      console.log("64", searchParams);
      
      console.log("66", response.data.candidates);
  
      if (response.data.success) {
        setResults(response.data.candidates);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };

  const handleDisableCandidate = async (candidateId, currentIsActive) => {
    try {
      const newIsActiveState = !currentIsActive;
      const response = await putApiWithToken(`/candidate/disable-candidate/${candidateId}`, { isActive: newIsActiveState });
  
      console.log(response);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `The user has been ${newIsActiveState ? 'activated' : 'disabled'} successfully!`,
        });

        setCandidates(prevCandidates =>
          prevCandidates.map(candidate =>
            candidate._id === candidateId
              ? { ...candidate, isActive: newIsActiveState }
              : candidate
          )
        );
        // setIsActive(newIsActiveState); // Update local state to reflect change
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update the user status.',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the user status.',
      });
    }
  };
  
  //city
  const handleCityInputClick = () => {
    setShowCityModal(true);
  };

  const handleCitySelect = (city) => {
    if(city === 'All cities'){
      setAddressInput(city);
    } else {
      setAddressInput(city);
    }
    setShowCityModal(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
  };

  //create candidate
  const handleOpenModal = (event) => {
    event.preventDefault();
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setCandidateData({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      city: '',
      street: '',
      gender: 'male',
      dateOfBirth: '',
      skill: [],
      experience: '',
      education: '',
      moreInformation: ''
    })
  };

  const generatePassword = () => {
    const length = 8;
    
    // Separate character sets for lowercase, uppercase, and numbers
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    
    // Combine all characters for general use
    const allChars = lowerCase + upperCase + numbers;
    
    let password = "";
  
    // Ensure at least one character from each set
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    
    // Generate remaining characters randomly from the combined set
    for (let i = 3; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
  
    // Shuffle the password to make the position of the required characters random
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setCandidateData({ ...candidateData, password: newPassword });
  };
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(candidateData.password);
    // Swal.fire({
    //   icon: 'success',
    //   title: 'Copied',
    //   text: 'Password copied to clipboard!',
    // });
  };

  const handleChange = (e) => {
    setCandidateData({
      ...candidateData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChangeD = (value) => {
    setCandidateData((prevState)=>({
      ...prevState,
      moreInformation: value,
    }));
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();

    try {
      console.log(1);
      console.log(candidateData.role);
      console.log(candidateData);
      
      const response = await postApiWithToken('/user/create-candidate', candidateData);
      console.log(response);
      
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Company created successfully!`,
        });
      }
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while creating the company.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  }

  //skill
  const handleSkillChange = (skillId) => {
    setCandidateData((prevState) => {
      const newRequirementSkills = prevState.skill.includes(skillId)
        ? prevState.skill.filter((id) => id !== skillId)
        : [...prevState.skill, skillId];
      return { ...prevState, skill: newRequirementSkills };
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <Modal show={showModal} onHide={handleCloseModal} className={clsx(styles.modal)} centered>
      <div className={clsx(styles.modalMainContent)}>
      <Modal.Header closeButton className={clsx(styles.modalHeader)}>
        <Modal.Title className={clsx(styles.modalTitle)}>Tạo tài khoản ứng viên</Modal.Title>
      </Modal.Header>
      <Modal.Body className={clsx(styles.modalBody)}>
        <div className={clsx(styles.modalName)}>
          <div className={clsx(styles.modalNameCard)}>
            <p className={clsx(styles.modalText)}>Họ tên</p>
            <input 
              type="text"
              id="name"
              name="name"
              placeholder='Nhập họ tên'
              value={candidateData.name}
              onChange={handleChange} 
              className={clsx(styles.modalNameCardInput)}
              />
            <p 
              // className={clsx(styles.modalText)}
            >Email</p>
            <input 
              type="text" 
              id="email"
              name="email"
              placeholder='Nhập email'
              value={candidateData.email}
              onChange={handleChange} 
              className={clsx(styles.modalNameCardInput)}
            />
            <p className={clsx(styles.modalText)}>Số điện thoại</p>
            <input 
              type="text"
              id="phoneNumber"
              name="phoneNumber"  
              placeholder='Nhập số điện thoại'  
              value={candidateData.phoneNumber}
              onChange={handleChange}
              className={clsx(styles.modalNameCardInput)}
            />
          </div>
        </div>
        <div className={clsx(styles.modalPassword)}>
          <div className={clsx(styles.modalPasswordInputIcon)}>
            <div className={clsx(styles.modalPasswordInput)}>            
              <p className={clsx(styles.modalText)}>Mật khẩu</p>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password"
                name="password"
                value={candidateData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                // style={{ paddingRight: '40px' }}
              />
            </div>

            <span 
              onClick={togglePasswordVisibility} 
              style={{ marginTop: '8px', cursor: 'pointer' }}
            >
              { showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
            </span>
          </div>

          <div>            
            <button 
              type="button" 
              onClick={handleGeneratePassword}
              className={clsx(styles.modalBtnPassword)}              
            >
              Generate Password
            </button>

            <button 
              type="button" 
              onClick={handleCopyPassword}
              className={clsx(styles.modalBtnPassword)}            
            >
              Copy Password
            </button>
          </div>

          <div className={clsx(styles.modalNS)}>
            <p className={clsx(styles.modalTextNS)}>Ngày sinh</p>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={candidateData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className={clsx(styles.modalGender)}>            
            <p>Giới tính</p>
            <div>
              <label>
                <input 
                  type="radio" 
                  id="male" 
                  name="gender" 
                  value="male" 
                  checked={candidateData.gender === "male"} 
                  onChange={handleChange} 
                />
                Male
              </label>

              <label style={{ marginLeft: '15px' }}>
                <input 
                  type="radio" 
                  id="female" 
                  name="gender" 
                  value="female" 
                  checked={candidateData.gender === "female"} 
                  onChange={handleChange} 
                />
                Female
              </label>
            </div>        
          </div>
        </div>
        <div className={clsx(styles.modalAddress)}>
        <div className={clsx(styles.modalAddressCard)}>
            <p className={clsx(styles.modalText)}>Địa chỉ:</p>
            <input 
              type="text" 
              id="street"
              name="street" 
              placeholder='Nhập địa chỉ' 
              value={candidateData.street}
              onChange={handleChange}
              className={clsx(styles.modalNameCardInput)}
            />
          </div>

          <div className={clsx(styles.modalAddressCardCity)}>
            <p>Tỉnh/TP</p>
            <select 
              id="city" 
              name="city" 
              value={candidateData.city} 
              onChange={handleChange} 
              style={{ maxHeight: '150px', overflowY: 'auto' }}
            >
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          
        </div>

        <div className={clsx(styles.nsgt)}>
          {/* <div className={clsx(styles.formGroup)}> */}
            {/* <label htmlFor="expiredAt">Ngày sinh</label> */}
            {/* <div className={clsx(styles.modalAddressCardCity)}>
              <p className={clsx(styles.modalText)}>Ngày sinh</p>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={candidateData.dateOfBirth}
                onChange={handleChange}
              />
            </div> */}
          {/* </div> */}

          {/* <div className={clsx(styles.modalGender)}>            
            <p>Giới tính</p>
            <div>
              <label>
                <input 
                  type="radio" 
                  id="male" 
                  name="gender" 
                  value="male" 
                  checked={candidateData.gender === "male"} 
                  onChange={handleChange} 
                />
                Male
              </label>

              <label style={{ marginLeft: '15px' }}>
                <input 
                  type="radio" 
                  id="female" 
                  name="gender" 
                  value="female" 
                  checked={candidateData.gender === "female"} 
                  onChange={handleChange} 
                />
                Female
              </label>
            </div>        
          </div> */}
          
          <div className={clsx(styles.knhv)}>
            <div className={clsx(styles.formGroup)}>
              <p className={clsx(styles.modalTextSkill)}>Kỹ năng</p>
              <button type="button" onClick={openModal} className={styles.openModalButton}>
                Chọn kỹ năng
              </button>
              {/* <div className={styles.selectedSkills}>
                {skillsData
                  .filter(skill => candidateData.skill.includes(skill._id))
                  .map(skill => (
                    <span key={skill._id} className={styles.selectedSkill}>
                      {skill.skillName}
                    </span>
                ))}
              </div> */}

              <div className={clsx(styles.modalHocvan)}>                
                <p 
                // className={clsx(styles.modalText)}
                >Học vấn</p>
                <input 
                  type="text" 
                  id="education"
                  name="education" 
                  value={candidateData.education}
                  onChange={handleChange}
                  className={clsx(styles.modalNameCardInput)}
                />
              </div>
            </div>


            {/* {isModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <div className={styles.skillsContainer}>
                    {skillsData.map((skill) => (
                      <div key={skill._id} className={clsx(styles.skillCheckbox)}>
                        <input
                          type="checkbox"
                          id={`skill-${skill._id}`}
                          checked={candidateData.skill.includes(skill._id)}
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
            )} */}
          </div>
        </div>

        <div className={styles.selectedSkills}>
          {skillsData
            .filter(skill => candidateData.skill.includes(skill._id))
            .map(skill => (
              <span key={skill._id} className={styles.selectedSkill}>
                {skill.skillName}
              </span>
          ))}
        </div>

        <div className={clsx(styles.modalSkill)}>
        {isModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                  <div className={styles.skillsContainer}>
                    {skillsData.map((skill) => (
                      <div key={skill._id} className={clsx(styles.skillCheckbox)}>
                        <input
                          type="checkbox"
                          id={`skill-${skill._id}`}
                          checked={candidateData.skill.includes(skill._id)}
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
        </div>

      <div className={clsx(styles.modalNameCard)}>
        {/* <div className={clsx(styles.modalEx)}> */}
          <p className={clsx(styles.modalText)}>Kinh nghiệm</p>
          <input 
            type="text" 
            id="experience"
            name="experience" 
            value={candidateData.experience}
            onChange={handleChange}
            className={clsx(styles.modalNameCardInput)}
          />
          
        {/* </div> */}
      </div>

        <p>Thông tin thêm</p>
        <ReactQuill
          id="moreInformation"
          name="moreInformation"
          value={candidateData.moreInformation}
          onChange={handleInputChangeD}
        />
        {/* <input 
          type="text" 
          id="moreInformation"
          name="moreInformation" 
          value={candidateData.moreInformation}
          onChange={handleChange}
        /> */}
      </Modal.Body>
      <Modal.Footer className={clsx(styles.modalFooter)}>
        <Button variant="danger" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCreateCandidate}>
          Tạo tài khoản ứng viên
        </Button>
      </Modal.Footer>
      </div>
    </Modal>

    <div className={clsx(styles.candidateManagement)}>
      <h2>Quản lí ứng viên</h2>
      
       {/* searchBar */}
       <form className={clsx(styles.searchBar)}>

        {/* <button onClick={handleOpenModal} className={clsx(styles.btnAddCandidate)}>Thêm ứng viên</button> */}

      <div className={clsx(styles.form)}>
      {/* <select 
  id="city" 
  name="city" 
  value={addressInput || 'All cities'} 
  onChange={handleChange} 
  style={{ maxHeight: '150px', overflowY: 'auto' }} // Scrollable dropdown
>
  {cities.map((city, index) => (
    <option key={index} value={city}>
      {city}
    </option>
  ))}
</select> */}

          {/* <label>City:</label>
        <input 
          type="text" 
          name="city"
          value={addressInput || 'All cities'}
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
                    onClick={() => handleCitySelect(city === 'All cities' ? '' : city)}
                  >
                    {city}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowCityModal(false)}>Close</button>
            </div>
          </div>
        )} */}
        <div className={clsx(styles.iconPlace)}>
        <i className="fa-solid fa-location-dot"></i>
      </div>
      
      <div className={clsx(styles.selectContainer)}>
        <select
              className={clsx(styles.select)}
              value={addressInput}
              // onChange={(e) => setAddressInput(e.target.value)}
              onChange={(e) => {
                const selectedCity = e.target.value;
                setAddressInput(selectedCity === "All cities" ? "" : selectedCity);
              }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
      </div>
        <input
          type="text"
          placeholder="Enter candidate"
          className={clsx(styles.jobInput)}
          value={candidateInput}
          onChange={(e) => setCandidateInput(e.target.value)}
        />
        <button
          variant="primary" 
          className={clsx(styles.searchButton)}
          onClick={handleSearch}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          <strong className={clsx(styles.s)}>Search</strong>          
        </button>
      </div>
    </form>
            {/* searchBar */}
      {/* <div>
        <button onClick={handleOpenModal} className={clsx(styles.btnAddCandidate)}>Thêm ứng viên</button>
      </div> */}
      
      {results && (
        <div className={clsx(styles.candidatelist)}>
          <div className={clsx(styles.candidateContainer)}>
          <strong>Kết quả phù hợp: {results.length}</strong>
          {results.length > 0 ? (
          results.map((candidate) => (
            <div key={candidate._id} className={clsx(styles.content)}>
                <Link to={`/detailCandidateAdmin/${candidate._id}`} className={clsx(styles.linkCandidate)}>
              <div className={clsx(styles.candidatecard)}>
                  <div className={clsx(styles.contentCandidatecard)}>
                    <img src={candidate.avatar || logo} alt="Logo" className={clsx(styles.avatar)}/>
                    <div className={clsx(styles.contentText)}>
                      <p><strong>{candidate.name}</strong></p>
                      <p>{candidate.email}</p>
                      <p>{candidate.phoneNumber}</p>
                    </div>
                  </div>
              </div>
                </Link>
            </div>
          ))
        ) : (
          <div className={clsx(styles.candidatecardK)}>
            <p className={clsx(styles.khongtimthay)}>Không tìm thấy kết quả phù hợp</p>
          </div>
        )}
        </div>
        </div>
      )}

      {/* content */}
    <div className={clsx(styles.createCandidate)}>
      <strong>Tổng số lượng ứng viên: {candidates.length}</strong>
      <button onClick={handleOpenModal} className={clsx(styles.btnAddCandidate2)}>Thêm ứng viên</button>
    </div>

      <div className={clsx(styles.candidatelist)}>
      <div className={clsx(styles.candidateContainer)}>
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <div key={candidate._id} className={clsx(styles.content)}>
                {/* <Link to={`/detailCandidateAdmin/${candidate._id}`} className={clsx(styles.linkCandidate)}> */}
              <div className={clsx(styles.candidatecard)}>
                <Link to={`/detailCandidateAdmin/${candidate._id}`} className={clsx(styles.linkCandidate)}>
                  <div className={clsx(styles.contentCandidatecard)}>
                    <img src={candidate.avatar || logo} alt="Logo" className={clsx(styles.avatar)}/>
                    <div className={clsx(styles.contentText)}>
                      <p><strong>{candidate.name}</strong></p>
                      <p>{candidate.email}</p>
                      <p>{candidate.phoneNumber}</p>
                      <p>
                        Trạng thái: 
                        {candidate.isActive === true 
                          ? " Đang hoạt động" 
                          : " Đã bị vô hiệu hóa"}
                      </p>
                      {/* <p>IsActive: {"" + candidate.isActive}</p> */}
                    </div>
                  </div>
                  </Link>
                <button
                  className={clsx(styles.btnVoHieuHoa)}
                  onClick={() => handleDisableCandidate(candidate._id, candidate.isActive)}
                  >
                  {candidate.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
              </div>
                    {/* </Link> */}
            </div>
          ))
        ) : (
          <div>No candidates available</div>
        )}
      </div>
      <div className={clsx(styles.pagination)}>
        {pagination.currentPage > 1 && (
          <button onClick={() => handlePageChange(pagination.currentPage - 1)}>Previous</button>
        )}
        <span>{pagination.currentPage} / {pagination.totalPages} trang</span>
        {pagination.currentPage < pagination.totalPages && (
          <button onClick={() => handlePageChange(pagination.currentPage + 1)}>Next</button>
        )}
      </div>
    </div>
    </div>
    </>
  );
};

export default CandidateManagement;
