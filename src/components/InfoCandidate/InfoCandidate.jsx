import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './infoCandidate.module.scss';

import { getApiWithToken, putApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
//
import logo from '../../images/logo.jpg';
import Swal from 'sweetalert2';

const InfoCandidate = () => {
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
    education: '',
    skill: '',
    moreInformation: ''
  });
  const [error, setError] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const candidateId = getUserStorage().user._id;
        const response = await getApiWithToken(`/candidate/${candidateId}`);
        
        if (response.data.success) {
          setCandidate(response.data.candidate);
          setAvatarPreview(response.data.candidate.avatarUrl); // Hiển thị ảnh đại diện
        } else {
          setError('Failed to fetch candidate data');
        }
      } catch (err) {
        setError('An error occurred');
      }
    };

    fetchCandidate();
  }, []);

  const handleUploadAvatar = async () => {
    try {
      if (!avatarFile) return;

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const candidateId = getUserStorage().user._id;
      const response = await putApiWithToken(`/candidate/upload-avatar/${candidateId}`, formData);

      if (response.data.success) {
        setCandidate(response.data.candidate);
        setAvatarPreview(response.data.candidate.avatarUrl); // Cập nhật ảnh đại diện
      } else {
        setError('Failed to upload avatar');
      }
    } catch (err) {
      setError('An error occurred during avatar upload');
    }
  };

  const handleUploadCV = async () => {
    try {
      if (!cvFile) return;

      const formData = new FormData();
      formData.append('resume', cvFile);

      const candidateId = getUserStorage().user._id;
      const response = await putApiWithToken(`/candidate/upload-cv/${candidateId}`, formData);

      if (response.data.success) {
        setCandidate(response.data.candidate);
      } else {
        setError('Failed to upload CV');
      }
    } catch (err) {
      setError('An error occurred during CV upload');
    }
  };

  const handleUpdateInfo = async () => {
    try {
      const candidateId = getUserStorage().user._id;
      
      const response = await putApiWithToken(`/candidate/update/${candidateId}`, candidate);
  
      if (response.data.success) {
        setCandidate(response.data.candidate);
        setIsEditing(false);
        Swal.fire({ icon: 'success', text: 'Candidate information updated successfully!' });
      } else {
        setError('Failed to update candidate information');
        Swal.fire({ icon: 'error', text: 'Failed to update candidate information' });
      }
    } catch (err) {
      setError('An error occurred during information update');
      Swal.fire({ icon: 'error', text: 'An error occurred during information update' });
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidate({ ...candidate, [name]: value });
  };

  if (error) return <div className={clsx(styles.error)}>{error}</div>;

  if (!candidate) return <div className={clsx(styles.loading)}>Loading...</div>;

  return (
    <div className={clsx(styles.candidateInfo)}>
      <div className={clsx(styles.avatarSection)}>
        {/* <img src={avatarPreview || null} alt="Avatar" className={clsx(styles.avatar)} /> */}
        <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} />
        
        <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setAvatarFile(e.target.files[0])}
            value=''// 
          />
          <button className={clsx(styles.btnUpdate)} onClick={handleUploadAvatar}>
            Upload Avatar
          </button>
      </div>

      <div className={clsx(styles.infoSection)}>
        <h2>Thông tin cá nhân</h2>

        <label>Name:</label>
        <input 
          type="text" 
          name="name"
          value={candidate.name}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Email:</label>
        <input 
          type="email" 
          name="email"
          value={candidate.email}
          onChange={handleInputChange}
          disabled
        />

        <label>Phone Number:</label>
        <input 
          type="text" 
          name="phoneNumber"
          value={candidate.phoneNumber}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Address:</label>
        <input 
          type="text" 
          name="address"
          value={candidate.address}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Date of Birth:</label>
        <input 
          type="date" 
          name="dateOfBirth"
          value={candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().substr(0, 10) : ''}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Gender:</label>
        <select 
          name="gender" 
          value={candidate.gender}
          onChange={handleInputChange}
          disabled={!isEditing}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <label>Experience:</label>
        <input 
          type="text" 
          name="experience"
          value={candidate.experience}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Education:</label>
        <input 
          type="text" 
          name="education"
          value={candidate.education}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>Skills:</label>
        <input 
          type="text" 
          name="skill"
          value={candidate.skill}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label>More Information:</label>
        <textarea 
          name="moreInformation"
          value={candidate.moreInformation}
          onChange={handleInputChange}
          disabled={!isEditing}
        ></textarea>

        <div>
          <button>Public Account</button>
        </div>

        <div className={clsx(styles.uploadSection)}>
          <p>CV:</p><a href={candidate.resume} target="_blank" rel="noopener noreferrer">{candidate.resumeOriginalName}</a>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setCvFile(e.target.files[0])}
            value=''
          />
          <button className={clsx(styles.btnUpdate)} onClick={handleUploadCV}>
            Upload CV
          </button>
        </div>

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

export default InfoCandidate;
