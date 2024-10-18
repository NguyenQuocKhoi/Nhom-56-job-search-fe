import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './postedJobs.module.scss';
import { getAPiNoneToken, getApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';

const PostedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [activeTab, setActiveTab] = useState('all'); // 'all', 'approved', 'pending'

  // const [filteredJobs, setFilteredJobs] = useState([]);

  const [categories, setCategories] = useState({});

  const [pendingApplications, setPendingApplications] = useState({});

  const user = getUserStorage()?.user;
  const companyId = user._id;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getApiWithToken(`/job/get-job/${companyId}?page=${currentPage}&limit=6`);
        const { jobs, totalPages } = response.data;
        setJobs(jobs);
        setTotalPages(totalPages);

        // Fetch category names
        const categoryIds = jobs
          .map((job) => job.category)
          .filter((categoryId) => categoryId); // Filter out undefined or null categories

        const uniqueCategoryIds = [...new Set(categoryIds)];

        // Fetch all categories in parallel
        const categoryPromises = uniqueCategoryIds.map((categoryId) =>
          getAPiNoneToken(`/category/${categoryId}`)
        );

        const categoryResponses = await Promise.all(categoryPromises);
        const categoryMap = {};

        categoryResponses.forEach((response) => {
          const { _id, name } = response.data.category;
          categoryMap[_id] = name;
        });
        setCategories(categoryMap);

        const pendingPromises = jobs.map((job) => 
          getApiWithToken(`/application/countPending/${job._id}`)
      );
      const pendingResponses = await Promise.all(pendingPromises);
      const pendingMap = {};
      pendingResponses.forEach((response, index) => {
        pendingMap[jobs[index]._id] = response.data.totalPendingApplications;
      });
      setPendingApplications(pendingMap);
      } catch (error) {
        setError('Error fetching jobs');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [companyId, currentPage]);

  const All = async () => {
    const response = await getApiWithToken(`/job/get-job/${companyId}?page=${currentPage}&limit=6`);
    const { jobs, totalPages } = response.data;
    console.log(jobs);
    
    setJobs(jobs);
    setTotalPages(totalPages);
  }

  const Accept  = async () => {
    const responseA = await getApiWithToken(`/job/get-jobs/${companyId}?page=${currentPage}&limit=6`);
    const { jobs, totalPages } = responseA.data;
    setJobs(jobs);
    setTotalPages(totalPages);
  }

  const Reject = async () => {
    const responseR = await getApiWithToken(`/job/get-jobs-rejected/${companyId}?page=${currentPage}&limit=6`);
    const { jobs, totalPages } = responseR.data;    
    setJobs(jobs);
    setTotalPages(totalPages);
  }

  const Pending = async () => {
    const responseP = await getApiWithToken(`/job/get-jobs-pending/${companyId}?page=${currentPage}&limit=6`);
    const { jobs, totalPages } = responseP.data;
    console.log(jobs);

    setJobs(jobs);
    setTotalPages(totalPages);
  }

  // useEffect(() => {
  //   // Lọc công việc dựa trên tab hiện tại
  //   const filtered = jobs.filter((job) => {
  //     if (activeTab === 'approved') return job.status === true;
  //     if (activeTab === 'pending') return job.status === undefined; // Jobs with no 'status' field
  //     if (activeTab === 'rejected') return job.status === false;
  //     return true; // 'All' tab
  //   });
  //   setFilteredJobs(filtered);
  // }, [activeTab, jobs]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p className={clsx(styles.titleLon)}>Danh sách tin đã đăng</p>

        <div className={clsx(styles.tabs)}>
          <button
            className={clsx(styles.tabButton)}
            onClick={All}
          >
            Tất cả
          </button>
          <button
            className={clsx(styles.tabButton)}
            onClick={Accept}
          >
            Đã được đồng ý
          </button>
          <button
            className={clsx(styles.tabButton)}
            onClick={Pending}
          >
            Chưa được phê duyệt
          </button>
          <button
            className={clsx(styles.tabButton)}
            onClick={Reject}
          >
            Đã bị từ chối
          </button>
        </div>

        {
        // loading ? (
        //   <p>Loading...</p>
        // ) : error ? (
        //   <p>{error}</p>
        // ) : 
        jobs === undefined ? (
        // jobs.length === 0 ? (
          <div className={clsx(styles.joblist)}>
            <div className={clsx(styles.jobContainer)}>
              <div className={clsx(styles.khongCoTin)}>
                <p>Không có công việc nào nào.</p>
              </div>
            </div>        
          </div>
        ) : (
          <>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {jobs.map((job) => (
                  <Link key={job._id} to={`/postedDetail/${job._id}`} className={clsx(styles.jobcard)}>
                    <div className={clsx(styles.content)}>
                      <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
                      <div className={clsx(styles.text)}>
                        <div className={clsx(styles.title)}>
                          <p><strong>{job.title}</strong></p>
                        </div>
                        <div className={clsx(styles.describe)}>
                          <p>Company: {job.company.name}</p>
                          <p>Address: {job.street}, {job.city}</p>
                          <p>Salary: ${job.salary}</p>
                          <p>Status: {job.status ? 'Approved' : job.status === false ? 'Rejected' : 'Pending'}</p>
                          <p>Category: {categories[job.category] || 'No Category'}</p>
                          <p className={clsx(styles.numberApplyPending)}>Số lượng chưa phê duyệt: {pendingApplications[job._id]}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* <div className={clsx(styles.page)}> */}
                <div className={clsx(styles.pagination)}>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-angle-left"></i>
                    {/* Previous */}
                  </button>
                  <span> {currentPage} / {totalPages} trang </span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa-solid fa-angle-right"></i>
                    {/* Next */}
                  </button>
                {/* </div> */}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );

};

export default PostedJobs;
