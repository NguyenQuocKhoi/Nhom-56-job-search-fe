import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAPiNoneToken, getApiWithToken, putApiWithToken } from '../../../api';
import styles from './detailCandidateAdmin.module.scss';
import clsx from 'clsx';
import Header from '../HeaderAdmin/HeaderAdmin';
import logo from '../../../images/logo.jpg';
import Swal from 'sweetalert2';

const DetailCandidateAdmin = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCandidate = async () => {
      try {
        console.log(candidateId);
        
        const result = await getApiWithToken(`/candidate/${candidateId}`);
        setCandidate(result.data.candidate);

        const candidateData = result.data.candidate;
        const skillPromises = candidateData.skill.map(skillId => 
          getAPiNoneToken(`/skill/${skillId}`)
        );
        
        const skillResponses = await Promise.all(skillPromises);
        const skillNames = skillResponses.map(res => res.data.skill.skillName);
        setSkills(skillNames);

        const userResult = await getApiWithToken(`/user/${candidateId}`);
        setUser(userResult.data.user); 

      } catch (err) {
        setError('Failed to fetch candidate details');
      }
    };

    fetchCandidate();
  }, [candidateId]);

  const handleDisableCandidate = async (userId, currentIsActive) => {
    try {
      const newIsActiveState = !currentIsActive;
      const response = await putApiWithToken(`/candidate/disable-candidate/${userId}`, { isActive: newIsActiveState });
  
      console.log(response);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `The user has been ${newIsActiveState ? 'activated' : 'disabled'} successfully!`,
        });

        setUser({ ...user, isActive: newIsActiveState });
        setCandidate({ ...candidate, status: newIsActiveState });

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

  if (error) return <div>{error}</div>;
  if (!candidate || !user) return <div>Job not found</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.jobDetail)}>
        <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} />
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone Number:</strong> {candidate.phoneNumber}</p>
        <p><strong>Address:</strong> {candidate.street}, {candidate.city}</p>
        <div className={clsx(styles.skillSection)}>
        <strong>Skill:</strong>
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <ul key={index}>
                <li>
                 <span className={clsx(styles.skillTag)}>{skill}</span>
                </li>
              </ul>
            ))
          ) : (
            <p>No skills added</p>
          )}
        </div>
        <p><strong>Experience:</strong> {candidate.experience}</p>
        <p><strong>Education:</strong> {candidate.education}</p>
        <p><strong>Date of Birth:</strong> {candidate.dateOfBirth}</p>
        <p><strong>More Information:</strong> {candidate.moreInformation}</p>
        <p><strong>Resume:</strong> <a href={candidate.resume} target="_blank" rel="noopener noreferrer">View CV</a></p>
      </div>
      <div className={clsx(styles.button)}>
      <button
        onClick={() => handleDisableCandidate(user._id, user.isActive)}
      >
        {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
      </button>
      </div>
    </>
  );
};

export default DetailCandidateAdmin;

