import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './detailCandidateSearch.module.scss';
import { getApiWithToken } from '../../api';
import logo from '../../images/logo.jpg';
import { useParams } from 'react-router-dom';

const DetailCandidateSearch = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCandidate = async () => {
      try {
        const result = await getApiWithToken(`/candidate/${candidateId}`);
        setCandidate(result.data.candidate);
      } catch (err) {
        setError('Failed to fetch candidate details');
      }
    };

    fetchCandidate();
  }, [candidateId]);

  if (error) return <div>{error}</div>;
  if (!candidate) return <div>Candidate not found</div>;

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatar)} />
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone Number:</strong> {candidate.phoneNumber}</p>
        <p><strong>Address:</strong> {candidate.address}</p>
        <ul><strong>Skill:</strong>
            {candidate.skill.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
        </ul>
        <p><strong>Experience:</strong> {candidate.experience}</p>
        <p><strong>Education:</strong> {candidate.education}</p>
        <p><strong>Date of Birth:</strong> {candidate.dateOfBirth}</p>
        <p><strong>More Information:</strong> {candidate.moreInformation}</p>
        <p><strong>Resume:</strong> <a href={candidate.resume} target="_blank" rel="noopener noreferrer">View CV</a></p>
      </div>
      <Footer />
    </div>
  );
};

export default DetailCandidateSearch;
