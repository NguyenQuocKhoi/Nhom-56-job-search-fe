import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAPiNoneToken, getApiWithToken } from '../../../api';
import styles from './detailCandidateAdmin.module.scss';
import clsx from 'clsx';
import Header from '../HeaderAdmin/HeaderAdmin';
import logo from '../../../images/logo.jpg';

const DetailCandidateAdmin = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
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

      } catch (err) {
        setError('Failed to fetch candidate details');
      }
    };

    fetchCandidate();
  }, [candidateId]);

  if (error) return <div>{error}</div>;
  if (!candidate) return <div>Job not found</div>;

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
        <button>Vô hiệu hóa</button>
      </div>
    </>
  );
};

export default DetailCandidateAdmin;

