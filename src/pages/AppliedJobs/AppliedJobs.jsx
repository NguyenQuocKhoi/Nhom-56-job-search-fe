import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './appliedJobs.module.scss';
import { getApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = getUserStorage()?.user;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const result = await getApiWithToken(`/application/get-applications/${user._id}`);
        if (result.data.success) {
          const applications = result.data.applications;
          setApplications(applications);

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
      } catch (error) {
        setError("Error fetching applications");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user._id]);

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <h2>Danh sách công việc đã ứng tuyển</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : applications.length > 0 ? (
          <ul>
            {applications.map((application) => {
              const job = jobDetails[application.job];
              return (
                <Link key={application._id} to={`/detailJob/${application.job}`}>
                  <p>Công việc: {job ? job.title : "Loading..."}</p>
                  <p>Công ty: {job ? job.company.name : "Loading..."}</p>
                  <p>Địa chỉ: {job ? job.street : "Loading..."}, {job ? job.city : "Loading..."}</p>
                  <p>Ngày nộp: {new Date(application.submittedAt).toLocaleDateString()}</p>
                  <p>Trạng thái: {application.status}</p>
                  <hr />
                </Link>
              );
            })}
          </ul>
        ) : (
          <p>Không có công việc nào đã ứng tuyển.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AppliedJobs;
