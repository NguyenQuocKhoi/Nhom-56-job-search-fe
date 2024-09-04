import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './detailCandidate.module.scss';
import { getApiWithToken, putApiWithToken } from '../../api';
import logo from '../../images/logo.jpg';
import Swal from 'sweetalert2';
import { useParams, useSearchParams } from 'react-router-dom';

const DetailCandidate = () => {
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState(null);
  const [buttonState, setButtonState] = useState('pending');

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

  const handleStatusUpdate = async (status) => {
    // Hiển thị thông báo ngay lập tức khi người dùng nhấn nút
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

      setButtonState(status);
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
              disabled={buttonState === 'rejected'}
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
