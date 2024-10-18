import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './infoCandidate.module.scss';

import { getAPiNoneToken, getApiWithToken, postApiWithToken, putApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
//
import logo from '../../images/logo.png';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill';
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

const InfoCandidate = () => {
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    // address: '',
    city: '',
    street: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
    education: '',
    // skill: '',
    skill: [],
    moreInformation: ''
  });
  //skill
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [error, setError] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  // const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(logo);
  const [initialAvatar, setInitialAvatar] = useState(logo); // Lưu trữ avatar ban đầu
  const avatarInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState('');

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  //public account
  const [buttonState, setButtonState] = useState(null);
  //auto search job
  const [autoSearchJobs, setAutoSearchJobs] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const candidateId = getUserStorage().user._id;
        const response = await getApiWithToken(`/candidate/${candidateId}`);
        
        if (response.data.success) {
          const candidateData = response.data.candidate;
          setCandidate(response.data.candidate);
          // setAvatarPreview(response.data.candidate.avatarUrl); // Hiện avatar
          setAvatarPreview(response.data.candidate.avatar); 
          console.log(response.data.candidate.avatar);
          

          setButtonState(response.data.candidate.status);// Lấy status của candidate
          setAutoSearchJobs(response.data.candidate.autoSearchJobs); // Lấy giá trị của auto search job

          //skill
          const skillPromises = candidateData.skill.map(skillId => 
            getAPiNoneToken(`/skill/${skillId}`)
          );
          
          const skillResponses = await Promise.all(skillPromises);
          const skillNames = skillResponses.map(res => res.data.skill.skillName);
          setSkills(skillNames);
          setSelectedSkills(candidateData.skill);

          // console.log("90",candidateData.autoSearchJobs);
          // console.log("91", candidateId);
           
          //auto apply
          // if(candidateData.autoSearchJobs){
          //   // const autoApplyResponse = await getApiWithToken(`/candidate/check-and-auto-apply-jobs`, { candidateId: candidateId });
          //   const autoApplyResponse = await postApiWithToken(`/candidate/check-and-auto-apply-jobs`, { candidateId: candidateId });
  
          //   if (autoApplyResponse.data.success) {
          //     console.log(autoApplyResponse.data.message);
          //   } else {
          //     console.error(autoApplyResponse.data.message);
          //   }
          // }
        } else {
          setError('Failed to fetch candidate data');
        }
      } catch (err) {
        setError('An error occurred');
      }
    };

    fetchCandidate();
  }, []);
  
  const handlePublicAccount = async () => {
    const newStatus = !buttonState; // Đảo ngược trạng thái
    const statusText = newStatus ? 'Public' : 'Private';

    try {
      await putApiWithToken('/candidate/update-status', {
        candidateId: candidate._id,
        status: newStatus,
      });

      setButtonState(newStatus); // Cập nhật trạng thái nút
      Swal.fire({
        icon: 'success',
        title: statusText,
        text: `You have set your account to ${statusText.toLowerCase()}.`,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${statusText.toLowerCase()} the account.`,
      });
    }
  };  

const handleAutoApply = async () => {
  const newAutoSearchJobs = !autoSearchJobs;
  console.log('autoSearchJobs',autoSearchJobs);
  console.log('newAutoSearchJobs',newAutoSearchJobs);
  
  try {
    const response = await putApiWithToken(`/candidate/auto-apply`, {
      candidateId: candidate._id,
      autoSearchJobs: newAutoSearchJobs,
    });

    setAutoSearchJobs(newAutoSearchJobs);
    // console.log('134',response.data.success);

    // if (response.data.success) {
    if (newAutoSearchJobs) {
      if (response.matchingJobs && response.matchingJobs.length > 0) {
        console.log("Applications automatically created for matching jobs:", response.matchingJobs);
      } else {
        console.log("No jobs with matching skills and city found.");
      }
    } else {
      console.error("Error:", response.data.message);
    }
  } catch (error) {
    console.error("An error occurred during auto-apply:", error);
  }
};

  const fetchAllSkills = async () => {
    try {
      const response = await getApiWithToken(`/skill/get-all`);
      if (response.data.success) {
        setAllSkills(response.data.skills);
      } else {
        setError('Failed to fetch skills');
      }
    } catch (err) {
      setError('Error fetching skills');
    }
  };

  const handleOpenSkillModal = () => {
    fetchAllSkills();
    setShowSkillModal(true);
  };

  // Close skill modal
  const handleCloseSkillModal = () => {
    setShowSkillModal(false);
  };

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      // If skill is already selected, remove it from the list
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      // If skill is not selected, add it to the list
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleUpdateAll = async () => {
    try {
      const candidateId = getUserStorage().user._id;
      let success = true;

      const updatedCandidate = { ...candidate, skill: selectedSkills };//
      const responseInfo = await putApiWithToken(`/candidate/update/${candidateId}`, updatedCandidate);
      if (!responseInfo.data.success) {
        setError('Failed to update candidate information');
        success = false;
      }

      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatarFile);
        const responseAvatar = await putApiWithToken(`/candidate/upload-avatar/${candidateId}`, formDataAvatar);
        if (!responseAvatar.data.success) {
          setError('Failed to upload avatar');
          success = false;          
        } else {
          // setAvatarPreview(responseAvatar.data.candidate.avatarUrl);
          setAvatarPreview(responseAvatar.data.candidate.avatar);
        }
      }

      // Upload CV if a new file was selected
      if (cvFile) {
        const formDataCV = new FormData();
        formDataCV.append('resume', cvFile);
        const responseCV = await putApiWithToken(`/candidate/upload-cv/${candidateId}`, formDataCV);
        if (!responseCV.data.success) {
          setError('Failed to upload CV');
          success = false;
        }
      }

      if (success) {
        // Fetch updated candidate data to refresh skill list
        const updatedResponse = await getApiWithToken(`/candidate/${candidateId}`);
        if (updatedResponse.data.success) {
          const updatedCandidateData = updatedResponse.data.candidate;
          const skillPromises = updatedCandidateData.skill.map(skillId => 
            getAPiNoneToken(`/skill/${skillId}`)
          );
  
          const skillResponses = await Promise.all(skillPromises);
          const skillNames = skillResponses.map(res => res.data.skill.skillName);
  
          setSkills(skillNames); // Update skills state
          setCandidate(updatedCandidateData); // Update candidate state
  
          Swal.fire({ icon: 'success', text: 'All updates were successful!' });
        } else {
          Swal.fire({ icon: 'error', text: 'Failed to refresh skills after update.' });
        }
      } else {
        Swal.fire({ icon: 'error', text: 'Some updates failed. Please try again.' });
      }
      
      setIsEditing(false);
      setShowSkillModal(false);
    } catch (err) {
      setError('An error occurred during the update');
      Swal.fire({ icon: 'error', text: 'An error occurred during the update' });
    }
  };

  //đổi ảnh đại diện thấy ngay
  const handleEdit = () => {
    setIsEditing(true);
    setInitialAvatar(avatarPreview); // Lưu lại avatar hiện tại trước khi chỉnh sửa
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    
    if (file) {
      reader.readAsDataURL(file);
    }
  };  
  const handleCancel = () => {
    setIsEditing(false);
    setShowSkillModal(false);
    setAvatarPreview(initialAvatar); // Khôi phục lại avatar ban đầu
    setAvatarFile(null); // Hủy bỏ file đã chọn

    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''; // Đặt lại giá trị input file
    }
  };
  //  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidate({ ...candidate, [name]: value });
  };

  const handleInputChangeD = (value) => {
    setCandidate((prevState)=>({
      ...prevState,
      moreInformation: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setFileName(file.name); // Store file name in state
    }
  };

  //city
  const handleCitySelect = (city) => {
    setCandidate(prevState => ({
      ...prevState,
      city,
    }));
  };

  // const handleCityInputClick = () => {
  //   setShowCityModal(true);
  // };

  // const handleCitySelect = (city) => {
  //   setCandidate({ ...candidate, city });
  //   setShowCityModal(false);
  // };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
  };

  if (error) return <div className={clsx(styles.error)}>{error}</div>;
  if (!candidate) return <div className={clsx(styles.loading)}>Loading...</div>;

  return (
    <div className={clsx(styles.candidateInfo)}>
      <h2 style={{display: 'flex', justifyContent: 'center', margin: '-20px 0 20px 0'}}>Thông tin cá nhân</h2>

      <div className={clsx(styles.top)}>
        <div className={clsx(styles.avatarSection)}>
          {/* <img src={avatarPreview || logo} alt="Avatar" className={clsx(styles.avatar)} /> */}
          {/* <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} /> */}
          
          {/* <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setAvatarFile(e.target.files[0])}
            value='' // Clear file input value after selection
            disabled={!isEditing}
          /> */}

          {/* đổi ảnh đại diện thấy ngay */}
          <img 
            src={avatarPreview || logo} 
            alt="Avatar" 
            className={clsx(styles.avatar)} 
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange}
            ref={avatarInputRef}
            disabled={!isEditing}
            // style={{width: '240px'}}            
          />
        </div>

        <div className={clsx(styles.topInfo)}>
          <label>Họ và tên:</label>
          <input 
            type="text" 
            name="name"
            value={candidate.name || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />

          <label>Email:</label>
          <input 
            type="email" 
            name="email"
            value={candidate.email || ""}
            onChange={handleInputChange}
            disabled
          />

          <label>Số điện thoại:</label>
          <input 
            type="text" 
            name="phoneNumber"
            value={candidate.phoneNumber || ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className={clsx(styles.mid)}>
        <div className={clsx(styles.midAddress)}>
        <div className={clsx(styles.midAddressStreet)}>            
            <p className={clsx(styles.textStreet)}>Địa chỉ:</p>
            <input 
              type="text" 
              name="street"
              value={candidate.street || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={clsx(styles.street)}
            />
          </div>

          <p className={clsx(styles.textStreet)}>Tỉnh/Thành phố:</p>
          
          {/* mới */}
          <div className={clsx(styles.selectContainer)}>
            <select
              className={clsx(styles.select)}
              value={candidate.city || ""}
              onChange={(e) => handleCitySelect(e.target.value)}
              disabled={!isEditing}
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* cũ */}
          {/* <input 
            type="text" 
            name="city"
            value={candidate.city || ""}
            onClick={handleCityInputClick}
            readOnly
            disabled={!isEditing}
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

          
        </div>

        <div className={clsx(styles.midInfo)}>          
          <div className={clsx(styles.midInfoSkill)}>
            <div className={clsx(styles.midBtnSkill)}>
              <label>Kỹ năng:</label>
              <button 
                className={clsx(styles.btnChooseSkill)}
                onClick={handleOpenSkillModal} 
                disabled={!isEditing}
              >
                Chọn kỹ năng
              </button>
            </div>

            <div className={clsx(styles.modalSkill)}>
              {showSkillModal && (
                <div className={clsx(styles.modalOverlay)}>
                  {/* <div className={clsx(styles.modalContent)}> */}
                      {allSkills.map((skill) => (
                        <div key={skill._id} className={clsx(styles.skillcard)}>
                            <input 
                              type="checkbox" 
                              checked={selectedSkills.includes(skill._id)}//skill có sẵn 
                              onChange={() => handleSkillToggle(skill._id)}
                              className={clsx(styles.skillCheckbox)}
                            />
                            <div className={clsx(styles.skillname)}>
                              {skill.skillName}
                            </div>
                        </div>
                      ))}
                  {/* </div> */}
                  <button onClick={handleCloseSkillModal} className={styles.closeModalButton}>Close</button>
                </div>
              )}
            </div>
            
            <div className={clsx(styles.skillSection)}>
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div key={index} className={clsx(styles.skillContainer)}>
                    <span className={clsx(styles.skillTag)}>{skill}</span>
                  </div>
                ))
              ) : (
                <p>Chưa cập nhật</p>
              )}
            </div>
            
            
          </div>

          <div className={clsx(styles.midInfoDGC)}> 
            <div className={clsx(styles.textNSGT)}>            
              <p>Ngày sinh:</p>
              <input 
                type="date" 
                name="dateOfBirth"
                value={candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().substr(0, 10) : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>           

            <div className={clsx(styles.textNSGT)}>
              <p>Giới tính:</p>
              <select 
                name="gender" 
                value={candidate.gender || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className={clsx(styles.uploadSection)}>
              <div className={clsx(styles.textCV)}>
                <p>CV:</p>
                <a href={candidate.resume} target="_blank" rel="noopener noreferrer">{candidate.resumeOriginalName}</a>
              </div>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

      </div>

      <div className={clsx(styles.infoSection)}>                        
        <label>Kinh nghiệm:</label>
        <input 
          type="text" 
          name="experience"
          value={candidate.experience || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Học vấn:</label>
        <input 
          type="text" 
          name="education"
          value={candidate.education || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

                
        <label>Thông tin thêm:</label>
        {/* <textarea 
          name="moreInformation"
          value={candidate.moreInformation || ""}
          onChange={handleInputChange}
          disabled={!isEditing}
        ></textarea> */}
        <ReactQuill
          id="moreInformation"
          name="moreInformation"
          value={candidate.moreInformation || ""}
          onChange={handleInputChangeD}
          disabled={!isEditing}
        />        

        <div className={clsx(styles.btnContainer)}>

        <button onClick={handlePublicAccount} 
          // style={{
          //   borderRadius: '5px',
          //   border: '1px solid white',
          // }}
          className={clsx(styles.btnPublicAccount, {[styles.active]: buttonState})}
        >
          {buttonState ? 'Private Account' : 'Public Account'}
        </button>

        <button
          onClick={handleAutoApply}
          className={clsx(styles.btnAutoApply, { [styles.active]: autoSearchJobs })}
        >
          {autoSearchJobs ? 'Stop Auto Apply' : 'Auto Apply'}
        </button>
        {/* <button onClick={handleAutoApply}>
          Auto Apply
        </button> */}
          {isEditing ? (
            <>
              <button className={clsx(styles.btnConfirm)} onClick={handleUpdateAll}>
                Cập nhật
              </button>
              <button className={clsx(styles.btnCancel)} 
                onClick={() => 
                {
                  handleCancel()
                  // setIsEditing(false)
                  // setShowSkillModal(false)
                 }}>
                Hủy
              </button>
            </>
          ) : (
            <button className={clsx(styles.btnEdit)} onClick={() => {
              setIsEditing(true) 
              handleEdit()
              }}>
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCandidate;
