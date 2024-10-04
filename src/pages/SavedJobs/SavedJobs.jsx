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

const SavedJobs = () => {
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
          console.log(result.data.savedJobs);
          
          if (fetchedSavedJobs.length > 0) {
            const jobDetailPromises = fetchedSavedJobs.map(async (job) => {
              try {
                const jobResult = await getAPiNoneToken(`/job/${job.job._id}`);
                if (jobResult.data.success) {
                  return { jobId: job.job._id, jobDetail: jobResult.data.job }; // Return job ID and job details
                }
              } catch (err) {
                console.error(err);
                return null; // In case of error, return null
              }
            });

          const jobDetailsArray = await Promise.all(jobDetailPromises);
          const validJobDetails = jobDetailsArray.filter(Boolean); // Filter out any null values
          
          const updatedJobDetails = validJobDetails.reduce((acc, { jobId, jobDetail }) => {
            acc[jobId] = jobDetail; // Build a map of job details using job ID as key
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
        <p className={clsx(styles.title)}>Danh sách công việc đã lưu</p>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className={clsx(styles.jobContainer)}>
            {savedJobs.length === 0 ? (
              <p>No saved jobs found.</p>
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
                      <p>Saved at: {new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                </Link>
                  </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SavedJobs;
