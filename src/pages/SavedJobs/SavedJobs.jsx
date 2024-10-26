import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './savedJobs.module.scss';
import { getAPiNoneToken, getApiWithToken } from '../../api';
// import Swal from 'sweetalert2';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';

const SavedJobs = () => {
  const { t, i18n } = useTranslation();

  const [savedJobs, setSavedJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const candidateId = getUserStorage()?.user?._id;

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const result = await getApiWithToken(`/save-job/gets/${candidateId}`);
        if (result.data.success) {
          const fetchedSavedJobs = result.data.savedJobs || [];
          setSavedJobs(result.data.savedJobs);
          console.log(savedJobs);
          
          // console.log(result.data.savedJobs);
          // console.log(fetchedSavedJobs);          
          
          if (fetchedSavedJobs.length > 0) {
            const jobDetailPromises = fetchedSavedJobs.map(async (job) => {
              try {
                const jobResult = await getAPiNoneToken(`/job/${job.job._id}`);
                console.log(jobResult);
                
                if (jobResult.data.success) {
                  // console.log(job.job);                  
                  // console.log("job.job._id",job.job._id);
                  // console.log(jobResult.data.job);                  
                  
                  return { jobId: job.job._id, jobDetail: jobResult.data.job }; //Trả về ID công việc và chi tiết công việc
                }
                
              } catch (err) {
                console.error(err);
                return null; // Trong trường hợp có lỗi, trả về null
              }
            });

          const jobDetailsArray = await Promise.all(jobDetailPromises);
          const validJobDetails = jobDetailsArray.filter(Boolean); //Lọc ra bất kỳ giá trị null nào
          
          const updatedJobDetails = validJobDetails.reduce((acc, { jobId, jobDetail }) => {
            acc[jobId] = jobDetail; //gắn chi tiết công việc bằng cách sử dụng ID công việc làm key
            return acc;
          }, {});
          
          setJobDetails(updatedJobDetails);
        }
        } else {
          setError(result.data.message);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch saved jobs.')
        // Swal.fire({ icon: 'error', text: 'Failed to fetch saved jobs.' });
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchSavedJobs();
    }
  }, [candidateId]);

  return (
    <div className={clsx(styles.savedJobsPage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p className={clsx(styles.title)}>{t('savedJob.savedJob')}</p>
        {/* {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : ( */}
          <div className={clsx(styles.jobContainer)}>
            {savedJobs.length === 0 ? (
              <>              
                <p>
                  {t('savedJob.notSaved')}. <Link to="/jobs">{t('savedJob.clickHere')}.</Link>
                </p>
                
              </>
            ) : (
              savedJobs.map((job) => (
                <div key={job.job._id} className={clsx(styles.jobcard)}>
                    <Link to={`/detailCompany/${jobDetails[job.job._id]?.company?._id}`} target="_blank" rel="noopener noreferrer">
                      <img src={jobDetails[job.job._id]?.company?.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />
                    </Link>
                    <Link to={`/detailJob/${job.job._id}`} target="_blank" rel="noopener noreferrer" className={clsx(styles.linkJob)}>
                    <div className={clsx(styles.describe)}>
                      <p><strong>Job Title: {jobDetails[job.job._id]?.title || 'Loading...'}</strong></p>
                      <p>Company: {jobDetails[job.job._id]?.company.name}</p>
                      <p>Address: {jobDetails[job.job._id]?.street}, {jobDetails[job.job._id]?.city}</p>
                      <p>Saved at: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</p>
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

export default SavedJobs;
