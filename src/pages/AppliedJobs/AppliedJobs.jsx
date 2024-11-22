import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './appliedJobs.module.scss';
import { getApiWithToken, postApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';

const AppliedJobs = () => {
  usePageTitle('Danh sách công việc đã ứng tuyển');
  const { t, i18n } = useTranslation();

  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState('new');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const user = getUserStorage()?.user;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const result = await getApiWithToken(`/application/get-applications/${user._id}?page=${currentPage}&limit=10`);
        if (result.data.success) {
          const applications = result.data.applications;
          console.log(applications);
          
          // setApplications(applications);

          // const jobIds = applications.map(app => app.job);
          // const jobDetailsPromises = jobIds.map(id => getApiWithToken(`/job/${id}`));
          // const jobDetailsResults = await Promise.all(jobDetailsPromises);

          // const jobs = {};
          // jobDetailsResults.forEach((result, index) => {
          //   if (result.data.success) {
          //     jobs[jobIds[index]] = result.data.job;
          //   }
          // });

          const sortedApplications = applications.sort((a, b) => {
            if (sortOrder === 'new') {
              return new Date(b.submittedAt) - new Date(a.submittedAt); // Newest first
            } else {
              return new Date(a.submittedAt) - new Date(b.submittedAt); // Oldest first
            }
          });
  
          setApplications(sortedApplications);
          setTotalPages(result.data.totalPages);
          setCurrentPage(result.data.currentPage);
  
          // const jobIds = applications.map(app => app.job);
          const jobIds = sortedApplications.map(app => app.job);
          const jobDetailsPromises = jobIds.map(id => getApiWithToken(`/job/${id}`));/////////////////////////////////////////
          const jobDetailsResults = await Promise.all(jobDetailsPromises);

          console.log(jobDetailsResults);
          
  
          const jobs = {};
          jobDetailsResults.forEach((result, index) => {
            if (result.data.success) {
              jobs[jobIds[index]] = result.data.job;
            }
          });

          setJobDetails(jobs);
          console.log("jobs",jobs);
          
        } else {
          setError(result.data.message);
        }

        //auto apply
        const response = await getApiWithToken(`/candidate/${user._id}`);
        if(response.data.success){
          const candidateData = response.data.candidate;
          if(candidateData.autoSearchJobs){
            // const autoApplyResponse = await getApiWithToken(`/candidate/check-and-auto-apply-jobs`, { candidateId: candidateId });
            const autoApplyResponse = await postApiWithToken(`/candidate/check-and-auto-apply-jobs`, { candidateId: user._id });
  
            if (autoApplyResponse.data.success) {
              console.log(autoApplyResponse.data.message);
            } else {
              console.error(autoApplyResponse.data.message);
            }
          }
        }
      } catch (error) {
        setError("Error fetching applications");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user._id, sortOrder, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };  

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p className={clsx(styles.title)}>{t('appliedJob.appliedJob')}</p>
        
        {/* lọc */}
         <div className={clsx(styles.filterContainer)}>
          <p className={clsx(styles.textFilter)}>{t('appliedJob.display')}: </p>
            <div className={clsx(styles.optionFilter)}>
              <label>
                <input
                  type="radio"
                  name="filter"
                  value="new"
                  checked={sortOrder === 'new'}
                  onChange={() => setSortOrder('new')}
                />
                {t('appliedJob.lastest')}
              </label>
              <label>
                <input
                  type="radio"
                  name="filter"
                  value="old"
                  checked={sortOrder === 'old'}
                  onChange={() => setSortOrder('old')}
                />
                {t('appliedJob.oldest')}
              </label>
            </div>
          </div>

        {
        loading ? (
          <p>Loading...</p>
        ) : error ? (
          // <p>{error}</p>
          <div style={{marginLeft: '140px'}}>
            <p>{t('appliedJob.notApplied')}.<Link to="/jobs">{t('savedJob.clickHere')}.</Link></p>
          </div>
        ) : applications.length > 0 ? (
          <div className={clsx(styles.jobContainer)}>
            {applications.map((application) => {
              const job = jobDetails[application.job];
              return (
                <div className={clsx(styles.jobcard)}>
                  <Link to={`/detailCompany/${job.company._id}`} target="_blank" rel="noopener noreferrer">
                    <img src={job.company?.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />
                  </Link>
                  <Link key={application._id} to={`/detailJob/${application.job}`} className={clsx(styles.linkJob)} target="_blank" rel="noopener noreferrer">
                  <div className={clsx(styles.textInfoJob)}>
                    <p><strong>{job ? job.title : "Loading..."}</strong></p>
                    <p>{job ? job.company.name : "Loading..."}</p>
                    <p>{job ? job.street : "Loading..."}, {job ? job.city : "Loading..."}</p>
                    <p>{t('appliedJob.dateOfApply')}: {new Date(application.submittedAt).toLocaleDateString('vi-VN')}</p>                    
                    <p 
                      style={{ 
                        backgroundColor: 
                          application.status === 'accepted' ? 'lightgreen' : 
                          application.status === 'rejected' ? 'lightcoral' : 
                          'lightgray'
                      }}
                    >
                      {t('appliedJob.status')}: 
                      {/* {application.status} */}
                      
                      {application.status === 'accepted' 
                        // && <i className="fa-solid fa-check"></i>
                        && <span> {t('appliedJob.statusAccept')}</span>
                      }
                      {application.status === 'rejected' 
                        // && <i className="fa-solid fa-x"></i>
                        && <span> {t('appliedJob.statusReject')}</span>
                      }
                      {application.status === 'pending' 
                        // && <i className="fa-regular fa-clock"></i>
                        && <span> {t('appliedJob.statusPending')}</span>
                      }
                    </p>
                  </div>

                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p>{t('appliedJob.notApplied')}.</p>
        )}

        <div className={clsx(styles.pagination)}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-angle-left"></i>
          </button>
          <span> {currentPage} / {totalPages} trang</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <i className="fa-solid fa-angle-right"></i> 
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default AppliedJobs;
