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
          const fetchedSavedCandidates = result.data.saveCandidate || [];
          setSavedCandidates(fetchedSavedCandidates);
          // setSavedCandidates(result.data.saveCandidate);
          // console.log("34", savedCandidates.length);          
          // console.log("35", fetchedSavedCandidates.length);

          //v2
        //   if (fetchedSavedCandidates.length > 0) {
        //     const candidateDetailPromises = fetchedSavedCandidates.map(async (candidate) => {
        //       try {
        //         const candidateResult = await getApiWithToken(`/candidate/${candidate.candidate._id}`);
        //         console.log(candidateResult);
                
        //         if (candidateResult.data.success) {
        //           // console.log(candidate.candidate);                  
        //           // console.log("candidate.candidate._id",candidate.candidate._id);
        //           // console.log(candidateResult.data.candidate);                  
                  
        //           return { candiateId: candidate.candidate._id, candidateDetail: candidateResult.data.candidate }; //Trả về ID công việc và chi tiết công việc
        //         }
                
        //       } catch (err) {
        //         console.error(err);
        //         return null; // Trong trường hợp có lỗi, trả về null
        //       }
        //     });

        //   const candidateDetailsArray = await Promise.all(candidateDetailPromises);
        //   const validCandidateDetails = candidateDetailsArray.filter(Boolean); //Lọc ra bất kỳ giá trị null nào
          
        //   const updatedCandidateDetails = validCandidateDetails.reduce((acc, { candidateId, candidateDetail }) => {
        //     acc[candidateId] = candidateDetail; //gắn chi tiết ứng viên bằng cách sử dụng ID công việc làm key
        //     return acc;
        //   }, {});
          
        //   setCandidateDetails(updatedCandidateDetails);
        // }

        //v3
        if (fetchedSavedCandidates.length > 0) {
          const candidateDetailPromises = fetchedSavedCandidates.map(async (savedCandidate) => {
            try {
              const response = await getApiWithToken(`/candidate/${savedCandidate.candidate._id}`);
              
              if (response.data.success) {
                return { 
                  candidateId: savedCandidate.candidate._id, 
                  candidateDetail: response.data.candidate 
                };
              } else {
                console.error(`Failed to fetch details for candidate ${savedCandidate.candidate._id}`);
                return null;
              }
            } catch (error) {
              console.error(`Error fetching candidate ${savedCandidate.candidate._id}:`, error);
              return null;
            }
          });
        
          const candidateDetailsArray = await Promise.all(candidateDetailPromises);
          const validCandidateDetails = candidateDetailsArray.filter(Boolean); // Loại bỏ các giá trị null
          
          const updatedCandidateDetails = validCandidateDetails.reduce((acc, { candidateId, candidateDetail }) => {
            acc[candidateId] = candidateDetail; // Dùng ID ứng viên làm key
            return acc;
          }, {});
        
          setCandidateDetails(updatedCandidateDetails);
        }        

        //v1
          // setSavedCandidates(result.data.saveCandidate);
          // console.log("32",result.data.saveCandidate);

          // result.data.saveCandidate.forEach(async (candidate) => {
          //   try {
          //     console.log('36',candidate.candidate._id);
              
          //     const candidateResult = await getApiWithToken(`/candidate/${candidate.candidate._id}`);
          //     console.log('39',candidateResult);
              
          //     if (candidateResult.data.success) {
          //       setCandidateDetails((prevDetails) => ({
          //         ...prevDetails,
          //         [candidate.candidate]: candidateResult.data.candidate, // Update state with job details
          //       }));
                
          //     }
          //   } catch (err) {
          //     console.error(err);
          //   }
          // });
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
            {/* {savedCandidates.length === 0 ? (
              <p>{t('savedCandidates.notSavedCandidate')}.</p>
            ) : (
              savedCandidates.map((candidate) => (
                <div key={candidate.candidate._id} className={clsx(styles.jobcard)}>
                  <Link 
                    to={`/detail-candidate/${candidate.candidate._id}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className={clsx(styles.linkJob)}
                  >
                    <img src={candidateDetails[candidate.candidate._id]?.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />                        
                    <div className={clsx(styles.describe)}>
                      <p><strong>{candidateDetails[candidate.candidate._id]?.name || 'Loading...'}</strong></p>
                      <p>{candidateDetails[candidate.candidate._id]?.email || 'Loading...'}</p>
                      <p>{t('profile.phone')}: {candidateDetails[candidate.candidate._id]?.phoneNumber || 'Người dùng chưa cập nhật'}</p>
                      <p>{t('savedJob.saveAt')}: {new Date(candidate.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </Link>
                </div>
              ))
            )} */}

            {savedCandidates.length === 0 ? (
              <p>{t('savedCandidates.notSavedCandidate')}.</p>
            ) : (
              savedCandidates.map((savedCandidate) => {
                const candidateId = savedCandidate.candidate._id;
                const candidateDetail = candidateDetails[candidateId];
                
                return (
                  <div key={candidateId} className={clsx(styles.jobcard)}>
                    <Link 
                      to={`/detail-candidate/${candidateId}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={clsx(styles.linkJob)}
                    >
                      <img 
                        src={candidateDetail?.avatar || logo} 
                        alt="Avatar" 
                        className={clsx(styles.avatar)} 
                      />
                      <div className={clsx(styles.describe)}>
                        <p><strong>{candidateDetail?.name || 'Loading...'}</strong></p>
                        <p>{candidateDetail?.email || 'Loading...'}</p>
                        <p>{t('profile.phone')}: {candidateDetail?.phoneNumber || 'Người dùng chưa cập nhật'}</p>
                        <p>{t('savedJob.saveAt')}: {new Date(savedCandidate.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </Link>
                  </div>
                );
              })
            )}

          </div>
        {/* )} */}
      </div>
      <Footer />
    </div>
  );
};

export default SavedCandidates;
