import React, { useEffect, useState, useCallback } from 'react';
import { getAPiNoneToken } from '../../api';
import styles from './listJobInfo.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const ListJobInfo = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 15, //16
  });

  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/job/get-all?page=${page}&limit=${pagination.limit}`);
      setJobs(result.data.jobs.filter(job => job.status === true));
      setPagination(prev => ({
        ...prev,
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
      }));
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.joblist)}>
      <div className={clsx(styles.jobContainer)}>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Link key={job._id} to={`/detailJob/${job._id}`} className={clsx(styles.jobcard)}>
              <div className={clsx(styles.content)}>
                <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                <div className={clsx(styles.text)}>
                  <div className={clsx(styles.title)}>
                    <p><strong>{job.title}</strong></p>
                    <i className="fa-regular fa-heart"></i>
                  </div>
                  <div className={clsx(styles.describe)}>
                    <p>Company: {job.company.name}</p>
                    <p>Address: {job.address}</p>
                    <p>Salary: ${job.salary}</p>
                    {/* để tạm */}
                    <p>Number of cruiment: {job.numberOfCruiment}</p>
                    <p>Category: {job.category}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div>No jobs available</div>
        )}
      </div>
      <div className={clsx(styles.pagination)}>
        {pagination.currentPage > 1 && (
          <button onClick={() => handlePageChange(pagination.currentPage - 1)}>Previous</button>
        )}
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        {pagination.currentPage < pagination.totalPages && (
          <button onClick={() => handlePageChange(pagination.currentPage + 1)}>Next</button>
        )}
      </div>
    </div>
  );
};

export default ListJobInfo;
