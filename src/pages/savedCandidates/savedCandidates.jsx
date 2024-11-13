import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './savedCandidates.module.scss';
import { getUserStorage } from '../../Utils/valid';
import { getApiWithToken } from '../../api';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';

const SavedCandidates = () => {
  usePageTitle('Danh sách ứng viên đã lưu');

  const { t, i18n } = useTranslation();

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
              console.log('29',candidate.candidate._id);
              
              const candidateResult = await getApiWithToken(`/candidate/${candidate.candidate._id}`);
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
    <div className={clsx(styles.savedJobsPage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p className={clsx(styles.title)}>{t('savedCandidates.savedCandidateList')}</p>
        {/* {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : ( */}
          <div className={clsx(styles.jobContainer)}>
            {savedCandidates.length === 0 ? (
              <p>{t('savedCandidates.notSavedCandidate')}.</p>
            ) : (
              savedCandidates.map((candidate) => (
                <div key={candidate._id} className={clsx(styles.jobcard)}>
                  <Link 
                    to={`/detail-candidate/${candidate.candidate._id}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className={clsx(styles.linkJob)}
                  >
                    <img src={candidateDetails[candidate.candidate]?.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />                        
                    <div className={clsx(styles.describe)}>
                      <p><strong>{candidateDetails[candidate.candidate]?.name || 'Loading...'}</strong></p>
                      <p>{candidateDetails[candidate.candidate]?.email || 'Loading...'}</p>
                      <p>Phone: {candidateDetails[candidate.candidate]?.phone || 'Người dùng chưa cập nhật'}</p>
                      <p>Saved at: {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        {/* )} */}
      </div>
      <Footer />
    </div>
  );
};

export default SavedCandidates;
