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
    limit: 16,
  });

  // Sử dụng useCallback để giữ hàm fetchJobs ổn định
  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/job/get-all?page=${page}&limit=${pagination.limit}`);
      setJobs(result.data.jobs);
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
  }, [pagination.limit]); // Thêm pagination.limit vào dependencies array

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]); // Thêm fetchJobs vào dependencies array

  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.joblist)}>
      {jobs.map((job) => (
        <Link key={job._id} to={`/detailJob/${job._id}`}>
          <div className={clsx(styles.jobcard)}>
            <h3>{job.title}</h3>
            <p><strong>Company:</strong> {job.company.name}</p>
            <p><strong>Address:</strong> {job.address}</p>
            <p><strong>Salary:</strong> ${job.salary}</p>
          </div>
        </Link>
      ))}
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
