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
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const candidateId = getUserStorage().user._id;
        const response = await getApiWithToken(`/candidate/${candidateId}`);
        
        if (response.data.success) {
          setCandidate(response.data.candidate);
          setAvatarPreview(response.data.candidate.avatarUrl); // Display avatar
        } else {
          setError('Failed to fetch candidate data');
        }
      } catch (err) {
        setError('An error occurred');
      }
    };

    fetchCandidate();
  }, []);
  
  const handlePublicAccount = () => {

  }

  const handleUpdateAll = async () => {
    try {
      const candidateId = getUserStorage().user._id;
      let success = true;

      // Update candidate info if changes were made
      const responseInfo = await putApiWithToken(`/candidate/update/${candidateId}`, candidate);
      if (!responseInfo.data.success) {
        setError('Failed to update candidate information');
        success = false;
      }

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatarFile);
        const responseAvatar = await putApiWithToken(`/candidate/upload-avatar/${candidateId}`, formDataAvatar);
        if (!responseAvatar.data.success) {
          setError('Failed to upload avatar');
          success = false;
        } else {
          setAvatarPreview(responseAvatar.data.candidate.avatarUrl);
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
        Swal.fire({ icon: 'success', text: 'All updates were successful!' });
      } else {
        Swal.fire({ icon: 'error', text: 'Some updates failed. Please try again.' });
      }
      
      setIsEditing(false);
    } catch (err) {
      setError('An error occurred during the update');
      Swal.fire({ icon: 'error', text: 'An error occurred during the update' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCandidate({ ...candidate, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      setFileName(file.name); // Store file name in state
    }
  };

  if (error) return <div className={clsx(styles.error)}>{error}</div>;
  if (!candidate) return <div className={clsx(styles.loading)}>Loading...</div>;

  return (
    <div className={clsx(styles.candidateInfo)}>
      <div className={clsx(styles.avatarSection)}>
        {/* <img src={avatarPreview || logo} alt="Avatar" className={clsx(styles.avatar)} /> */}
        <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} />
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setAvatarFile(e.target.files[0])}
          value='' // Clear file input value after selection
        />
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

        <div className={clsx(styles.uploadSection)}>
          <p>CV:</p>
          <a href={candidate.resume} target="_blank" rel="noopener noreferrer">{candidate.resumeOriginalName}</a>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
          />
        </div>

        <div className={clsx(styles.btnContainer)}>
<button onClick={handlePublicAccount}>
  Public account
</button>
          {isEditing ? (
            <>
              <button className={clsx(styles.btnConfirm)} onClick={handleUpdateAll}>
                Cập nhật
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
