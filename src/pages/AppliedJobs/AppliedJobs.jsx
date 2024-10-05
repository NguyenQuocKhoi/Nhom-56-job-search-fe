import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './appliedJobs.module.scss';
import { getApiWithToken, postApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState('new');

  const user = getUserStorage()?.user;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const result = await getApiWithToken(`/application/get-applications/${user._id}`);
        if (result.data.success) {
          const applications = result.data.applications;
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
  
          const jobIds = applications.map(app => app.job);
          const jobDetailsPromises = jobIds.map(id => getApiWithToken(`/job/${id}`));
          const jobDetailsResults = await Promise.all(jobDetailsPromises);
  
          const jobs = {};
          jobDetailsResults.forEach((result, index) => {
            if (result.data.success) {
              jobs[jobIds[index]] = result.data.job;
            }
          });

          setJobDetails(jobs);
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
  }, [user._id, sortOrder]);

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p className={clsx(styles.title)}>Danh sách công việc đã ứng tuyển</p>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : applications.length > 0 ? (
          <div className={clsx(styles.jobContainer)}>

          {/* lọc */}
                <div className={clsx(styles.filterContainer)}>
                <p className={clsx(styles.textFilter)}>Ưu tiên hiển thị theo: </p>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="new"
                      checked={sortOrder === 'new'}
                      onChange={() => setSortOrder('new')}
                    />
                    Mới nhất
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="old"
                      checked={sortOrder === 'old'}
                      onChange={() => setSortOrder('old')}
                    />
                    Cũ nhất
                  </label>
                </div>

            {applications.map((application) => {
              const job = jobDetails[application.job];
              return (
                <div className={clsx(styles.jobcard)}>
                  <Link to={`/detailCompany/${job.company._id}`} target="_blank" rel="noopener noreferrer">
                    <img src={job.company?.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />
                  </Link>
                  <Link key={application._id} to={`/detailJob/${application.job}`} className={clsx(styles.linkJob)} target="_blank" rel="noopener noreferrer">
                    <p>Công việc: {job ? job.title : "Loading..."}</p>
                    <p>Công ty: {job ? job.company.name : "Loading..."}</p>
                    <p>Địa chỉ: {job ? job.street : "Loading..."}, {job ? job.city : "Loading..."}</p>
                    <p>Ngày nộp: {new Date(application.submittedAt).toLocaleDateString()}</p>
                    {/* <p>Trạng thái: {application.status}</p>

                    <i className="fa-regular fa-clock"></i>
                    <i className="fa-solid fa-check"></i>
                    <i className="fa-solid fa-x"></i> */}
                    <p 
                      style={{ 
                        backgroundColor: 
                          application.status === 'accepted' ? 'lightgreen' : 
                          application.status === 'rejected' ? 'lightcoral' : 
                          'lightgray'
                      }}
                    >
                      Trạng thái: {application.status}
                      
                      {application.status === 'accepted' && <i className="fa-solid fa-check"></i>}
                      {application.status === 'rejected' && <i className="fa-solid fa-x"></i>}
                      {application.status === 'pending' && <i className="fa-regular fa-clock"></i>}
                    </p>

                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Không có công việc nào đã ứng tuyển.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AppliedJobs;
