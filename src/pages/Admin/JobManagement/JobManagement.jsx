import React, { useCallback, useEffect, useState } from 'react';
import styles from '../JobManagement/jobManagement.module.scss';
import { getAPiNoneToken } from '../../../api';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('all');

  const [jobsAll, setJobsAll] = useState([]);
  const [jobsAccepted, setJobsAccepted] = useState([]);
  const [jobsRejected, setJobsRejected] = useState([]);
  const [jobsPending, setJobsPending] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 15,
  });

  const [countAll, setCountAll] = useState(0);

  //
  // const [buttonState, setButtonState] = useState('pending');

  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/job/get-all?page=${page}&limit=${pagination.limit}`);

      console.log(result.data.jobs);
      console.log(result.data.totalJobs);
      setCountAll(result.data.totalJobs);

      setJobsAll(result.data.jobs);//
      setJobsAccepted(result.data.jobs.filter(job => job.status === true));
      setJobsRejected(result.data.jobs.filter(job => job.status === false));
      setJobsPending(result.data.jobs.filter(job => job.status === undefined));
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

  //
  const handleStatusUpdate = async (status) => {
    
  };

  //
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.jobManagement}>
      <h2>Quản lí việc làm</h2>

        {/* searchBar */}
        <div className={clsx(styles.searchBar)}>
      <Form className={clsx(styles.form)}>
        <Form.Control
          type="text"
          placeholder="Enter job title"
          className={clsx(styles.jobInput)}
        />
        <Button variant="primary" className={clsx(styles.searchButton)}>
          Search
        </Button>
      </Form>
    </div>
            {/* searchBar */}
      
      <div className={styles.tabs}>
        <button 
          className={activeTab === 'all' ? styles.active : ''} 
          onClick={() => handleTabClick('all')}
        >
          Tất cả
        </button>
        <button 
          className={activeTab === 'accepted' ? styles.active : ''} 
          onClick={() => handleTabClick('accepted')}
        >
          Đã chấp nhận
        </button>
        <button 
          className={activeTab === 'rejected' ? styles.active : ''} 
          onClick={() => handleTabClick('rejected')}
        >
          Đã từ chối
        </button>
        <button 
          className={activeTab === 'pending' ? styles.active : ''} 
          onClick={() => handleTabClick('pending')}
        >
          Chưa phê duyệt
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'all' && (
          <div>
            <p>Danh sách tất cả việc làm: {countAll}</p>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {jobsAll.length > 0 ? (
                  jobsAll.map((job) => (
                    <Link key={job._id} to={`/detailJob/${job._id}`} className={clsx(styles.jobcard)}>
                      <div className={clsx(styles.content)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div>
                            <p>Company: {job.company.name}</p>
                          </div>
                          <button>Xóa</button>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div>No jobs available</div>
                )}
              </div>
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
        )}
        {activeTab === 'accepted' && (
          <div>
            {/* hiện tại số lượng chỉ lấy của 1 trang */}
            <p>Danh sách công việc đã chấp nhận: {jobsAccepted.length}</p>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {jobsAccepted.length > 0 ? (
                  jobsAccepted.map((job) => (
                    <Link key={job._id} to={`/detailJob/${job._id}`} className={clsx(styles.jobcard)}>
                      <div className={clsx(styles.content)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div>
                            <p>Company: {job.company.name}</p>
                          </div>
                          <button>Xóa</button>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div>No jobs available</div>
                )}
              </div>
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
        )}
        {activeTab === 'rejected' && (
          <div>
            <p>Danh sách công việc đã từ chối: {jobsRejected.length}</p>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {jobsRejected.length > 0 ? (
                  jobsRejected.map((job) => (
                    <Link key={job._id} to={`/detailJob/${job._id}`} className={clsx(styles.jobcard)}>
                      <div className={clsx(styles.content)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div className={clsx(styles.title)}>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div className={clsx(styles.describe)}>
                            <p>Company: {job.company.name}</p>
                        </div>
                        <button>Xóa</button>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div>No jobs available</div>
                )}
              </div>
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
        )}
        {activeTab === 'pending' && (
          <div>
            <p>Danh sách công việc chưa được phê duyệt: {jobsPending.length}</p>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {jobsPending.length > 0 ? (
                  jobsPending.map((job) => (
                    <Link key={job._id} to={`/detailJob/${job._id}`} className={clsx(styles.jobcard)}>
                      <div className={clsx(styles.content)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div className={clsx(styles.title)}>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div className={clsx(styles.describe)}>
                            <p>Company: {job.company.name}</p>
                            {/* button */}
                              <div className={clsx(styles.buttonContainer)}>
                                <button
                                  // className={clsx(styles.button, { [styles.accepted]: buttonState === 'accepted', [styles.disabled]: buttonState === 'rejected' })}
                                  onClick={() => handleStatusUpdate('accepted')}
                                  // disabled={buttonState === 'accepted'}
                                >
                                  Accept
                                </button>
                                <button
                                  // className={clsx(styles.button, { [styles.rejected]: buttonState === 'rejected', [styles.disabled]: buttonState === 'accepted' })}
                                  onClick={() => handleStatusUpdate('rejected')}
                                  // disabled={buttonState === 'rejected'}
                                >
                                  Reject
                                </button>
                                <button>Xóa</button>
                              </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div>No jobs available</div>
                )}
              </div>
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
        )}
      </div>
    </div>
  );
};

export default JobManagement;
