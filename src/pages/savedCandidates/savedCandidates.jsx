import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './savedCandidates.module.scss';
import { getUserStorage } from '../../Utils/valid';
import { getApiWithToken } from '../../api';
import { Link } from 'react-router-dom';

const SavedCandidates = () => {
  const [savedCandidates, setSavedCandidates] = useState([]);
  const [candidateDetails, setCandidateDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const companyId = getUserStorage()?.user?._id;

  useEffect(() => {
    const fetchSavedCandidates = async () => {
      try {
        const result = await getApiWithToken(`/save-candidate/gets/${companyId}`);
        console.log(result);
        
        if (result.data.success) {
          setSavedCandidates(result.data.saveCandidate);
          console.log("25",result.data.saveCandidate);

          result.data.saveCandidate.forEach(async (candidate) => {
            try {
              const candidateResult = await getApiWithToken(`/candidate/${candidate.candidate}`);
              console.log('29',candidateResult);
              
              if (candidateResult.data.success) {
                setCandidateDetails((prevDetails) => ({
                  ...prevDetails,
                  [candidate.candidate]: candidateResult.data.candidate, // Update state with job details
                }));
                
              }
            } catch (err) {
              console.error(err);
            }
          });
        } else {
          setError(result.data.message);
        }
      } catch (err) {
        console.error(err);
        // Swal.fire({ icon: 'error', text: 'Failed to fetch saved jobs.' });
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchSavedCandidates();
    }
  }, [companyId]);

    return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <h2>Danh sách ứng viên đã lưu</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className={clsx(styles.jobList)}>
            {savedCandidates.length === 0 ? (
              <p>No saved candidates found.</p>
            ) : (
              savedCandidates.map((candidate) => (
                <Link key={candidate._id} to={`/detail-candidate/${candidate.candidate}`} target="_blank" rel="noopener noreferrer">
                  <div className={clsx(styles.jobItem)}>
                    <p>Name: {candidateDetails[candidate.candidate]?.name || 'Loading...'}</p>
                    <p>Address: {candidateDetails[candidate.candidate]?.street}, {candidateDetails[candidate.candidate]?.city}</p>
                    <p>Saved at: {new Date(candidate.createdAt).toLocaleDateString()}</p>
                    {/* <button>Bỏ lưu</button> */}
                    <hr />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SavedCandidates;
