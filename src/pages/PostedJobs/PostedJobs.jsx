import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './postedJobs.module.scss';
import { getApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';

const PostedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'approved', 'pending'

  const user = getUserStorage()?.user;
  const companyId = user._id;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getApiWithToken(`/job/get-job/${companyId}?page=${currentPage}&limit=6`);
        const { jobs, totalPages } = response.data;
        setJobs(jobs);
        setTotalPages(totalPages);
      } catch (error) {
        setError('Error fetching jobs');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [companyId, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'approved') return job.status === true;
    if (activeTab === 'pending') return job.status === false;
    return true; // for 'all' tab
  });

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <h2>Danh sách tin đã đăng</h2>

        {/* Tabs for filtering jobs */}
        <div className={clsx(styles.tabs)}>
          <button
            className={clsx(styles.tabButton, { [styles.activeTab]: activeTab === 'all' })}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button
            className={clsx(styles.tabButton, { [styles.activeTab]: activeTab === 'approved' })}
            onClick={() => setActiveTab('approved')}
          >
            Đã được phê duyệt
          </button>
          <button
            className={clsx(styles.tabButton, { [styles.activeTab]: activeTab === 'pending' })}
            onClick={() => setActiveTab('pending')}
          >
            Chưa được phê duyệt
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredJobs.length === 0 ? (
          <p>Không có tin đăng nào.</p>
        ) : (
          <>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {filteredJobs.map((job) => (
                  <Link key={job._id} to={`/postedDetail/${job._id}`} className={clsx(styles.jobcard)}>
                    <div className={clsx(styles.content)}>
                      <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
                      <div className={clsx(styles.text)}>
                        <div className={clsx(styles.title)}>
                          <p><strong>{job.title}</strong></p>
                        </div>
                        <div className={clsx(styles.describe)}>
                          <p>Company: {job.company.name}</p>
                          <p>Address: {job.address}</p>
                          <p>Salary: ${job.salary}</p>
                          <p>Status: {job.status ? 'Approved' : 'Pending'}</p>
                          <p>Category: {job.category}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className={clsx(styles.pagination)}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PostedJobs;
