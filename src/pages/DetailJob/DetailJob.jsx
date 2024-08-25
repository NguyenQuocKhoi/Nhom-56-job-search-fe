import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAPiNoneToken } from '../../api';
import styles from './detailJob.module.scss';
import clsx from 'clsx';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ListJobInfo from '../../components/ListJobInfo/ListJobInfo';

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);//cuộn về đầu trang

    const fetchJob = async () => {
      try {
        const result = await getAPiNoneToken(`/job/${jobId}`);
        setJob(result.data.job);
      } catch (err) {
        setError('Failed to fetch job details');
      }
    };

    fetchJob();
  }, [jobId]); // Thêm `jobId` vào dependency array

  if (error) return <div>{error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.jobDetail)}>
        <h1>{job.title}</h1>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Address:</strong> {job.address}</p>
        <p><strong>Company:</strong> {job.company.name}</p>
        <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
        <p><strong>Expires:</strong> {new Date(job.expiredAt).toLocaleDateString()}</p>
        <p><strong>Salary:</strong> ${job.salary}</p>
        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Position:</strong> {job.position}</p>
        <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
        <div>
          <strong>Requirements:</strong>
          <ul>
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
      <span>Other Jobs</span>
      <ListJobInfo/>
      <Footer/>
    </>
  );
};

export default JobDetail;
