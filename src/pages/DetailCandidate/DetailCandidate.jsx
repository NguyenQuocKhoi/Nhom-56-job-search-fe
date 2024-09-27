import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './detailCandidate.module.scss';
import { getAPiNoneToken, getApiWithToken, putApiWithToken } from '../../api';
import logo from '../../images/logo.png';
import Swal from 'sweetalert2';
import { useParams, useSearchParams } from 'react-router-dom';

const DetailCandidate = () => {
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId'); // Get the application ID from query params
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState(null);
  const [buttonState, setButtonState] = useState('pending'); // Initial button state
  const [application, setApplication] = useState(null);

  const [skills, setSkills] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCandidateAndApplication = async () => {
      try {
        // Fetch candidate details
        const candidateResult = await getApiWithToken(`/candidate/${candidateId}`);
        setCandidate(candidateResult.data.candidate);

        const candidateData = candidateResult.data.candidate;
        const skillPromises = candidateData.skill.map(skillId => 
          getAPiNoneToken(`/skill/${skillId}`)
        );
        
        const skillResponses = await Promise.all(skillPromises);
        const skillNames = skillResponses.map(res => res.data.skill.skillName);
        setSkills(skillNames);

        // Fetch application details to get the status
        const applicationResult = await getApiWithToken(`/application/${applicationId}`);
        const applicationStatus = applicationResult.data.application.status;
        console.log(applicationResult.data.application.resume);
        
        setApplication(applicationResult.data.application.resume);

        // Set the button state based on the application status
        setButtonState(applicationStatus);

      } catch (err) {
        setError('Failed to fetch candidate or application details');
      }
    };

    fetchCandidateAndApplication();
  }, [candidateId, applicationId]);

  const handleStatusUpdate = async (status) => {
    // Display the loading status
    Swal.fire({
      title: `${status === 'accepted' ? 'Accepting' : 'Rejecting'}...`,
      text: `Please wait while we ${status} the candidate.`,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await putApiWithToken('/application/update-status', { applicationId, status });

      setButtonState(status); // Update the button state
      Swal.fire({
        icon: 'success',
        title: status === 'accepted' ? 'Accepted' : 'Rejected',
        text: `You have ${status} this candidate. A ${status} email has been sent.`,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${status} the candidate.`,
      });
    }
  };

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
        <p><strong>Experience:</strong> {candidate.experience}</p>
        <p><strong>Education:</strong> {candidate.education}</p>
        <p><strong>Date of Birth:</strong> {candidate.dateOfBirth}</p>
        <p><strong>More Information:</strong> {candidate.moreInformation}</p>
        <p><strong>Resume:</strong> <a href={application} target="_blank" rel="noopener noreferrer">View CV</a></p>
        <div className={clsx(styles.buttonContainer)}>
          <button
            className={clsx(styles.button, { [styles.accepted]: buttonState === 'accepted', [styles.disabled]: buttonState === 'rejected' })}
            onClick={() => handleStatusUpdate('accepted')}
            disabled={buttonState === 'accepted'}
          >
            Accept
          </button>
          <button
            className={clsx(styles.button, { [styles.rejected]: buttonState === 'rejected', [styles.disabled]: buttonState === 'accepted' })}
            onClick={() => handleStatusUpdate('rejected')}
            disabled={buttonState === 'rejected'} // Disable if already rejected
          >
            Reject
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailCandidate;
