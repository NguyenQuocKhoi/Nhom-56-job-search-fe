import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './savedJobs.module.scss';
import { getAPiNoneToken, getApiWithToken } from '../../api';
// import Swal from 'sweetalert2';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';

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
          setSavedJobs(result.data.savedJobs);

          result.data.savedJobs.forEach(async (job) => {
            try {
              const jobResult = await getAPiNoneToken(`/job/${job.job}`);
              if (jobResult.data.success) {
                setJobDetails((prevDetails) => ({
                  ...prevDetails,
                  [job.job]: jobResult.data.job, // Update state with job details
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

    if (candidateId) {
      fetchSavedJobs();
    }
  }, [candidateId]);

  return (
    <div className={clsx(styles.savedJobsPage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <h1 className={clsx(styles.title)}>Danh sách công việc đã lưu</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className={clsx(styles.jobList)}>
            {savedJobs.length === 0 ? (
              <p>No saved jobs found.</p>
            ) : (
              savedJobs.map((job) => (
                <Link key={job._id} to={`/detailJob/${job.job}`}>
                  <div className={clsx(styles.jobItem)}>
                    <p>Job Title: {jobDetails[job.job]?.title || 'Loading...'}</p>
                    <p>Company: {jobDetails[job.job]?.company.name}</p>
                    <p>Address: {jobDetails[job.job]?.street}, {jobDetails[job.job]?.city}</p>
                    <p>Saved at: {new Date(job.createdAt).toLocaleDateString()}</p>
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

export default SavedJobs;
