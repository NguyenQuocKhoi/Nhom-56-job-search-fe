import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './postedJobs.module.scss';
import { getAPiNoneToken, getApiWithToken, postApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PostedJobs = () => {
  const { t, i18n } = useTranslation();

  // const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeTab, setActiveTab] = useState('All');

  // const [filteredJobs, setFilteredJobs] = useState([]);

  const [categories, setCategories] = useState({});

  const [pendingApplications, setPendingApplications] = useState({});

  //lọc theo ngày
  const [sortOrder, setSortOrder] = useState('new');

  const user = getUserStorage()?.user;
  const companyId = user._id;

  //mới
  // useEffect(() => {
  //   const fetchJobs = async () => {
  //     try {
  //       const response = await postApiWithToken(`/job/get-job/${companyId}`, {
  //         page: currentPage,
  //         limit: 6,
  //         sort: sortOrder === 'new' ? 'desc' : 'asc',
  //       });
  //       const { jobs, totalPages } = response.data;
  //       setJobs(jobs);
  //       setTotalPages(totalPages);
  
  //       const categoryIds = jobs.map((job) => job.category).filter(Boolean);
  //       const uniqueCategoryIds = [...new Set(categoryIds)];
  //       const categoryPromises = uniqueCategoryIds.map((categoryId) =>
  //         getAPiNoneToken(`/category/${categoryId}`)
  //       );
  //       const categoryResponses = await Promise.all(categoryPromises);
  //       const categoryMap = {};
  
  //       categoryResponses.forEach((response) => {
  //         const { _id, name } = response.data.category;
  //         categoryMap[_id] = name;
  //       });
  //       setCategories(categoryMap);
  
  //       const pendingPromises = jobs.map((job) =>
  //         postApiWithToken(`/application/countPending/${job._id}`, {})
  //       );
  //       const pendingResponses = await Promise.all(pendingPromises);
  //       const pendingMap = {};
  //       pendingResponses.forEach((response, index) => {
  //         pendingMap[jobs[index]._id] = response.data.totalPendingApplications;
  //       });
  //       setPendingApplications(pendingMap);
  //     } catch (error) {
  //       setError('Error fetching jobs');
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchJobs();
  // }, [companyId, currentPage, sortOrder]);
  
  // const All = async () => {
  //   const response = await postApiWithToken(`/job/get-job/${companyId}`, {
  //     page: currentPage,
  //     limit: 6,
  //     sort: sortOrder === 'new' ? 'desc' : 'asc',
  //   });
  //   const { jobs, totalPages } = response.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('All');
  // };
  
  // const Accept = async () => {
  //   const responseA = await postApiWithToken(`/job/get-jobs/${companyId}`, {
  //     page: currentPage,
  //     limit: 6,
  //     sort: sortOrder === 'new' ? 'desc' : 'asc',
  //   });
  //   const { jobs, totalPages } = responseA.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('Accept');
  // };
  
  // const Reject = async () => {
  //   const responseR = await postApiWithToken(`/job/get-jobs-rejected/${companyId}`, {
  //     page: currentPage,
  //     limit: 6,
  //     sort: sortOrder === 'new' ? 'desc' : 'asc',
  //   });
  //   console.log(responseR);
    
  //   const { jobs, totalPages } = responseR.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('Reject');
  // };
  
  // const Pending = async () => {
  //   const responseP = await postApiWithToken(`/job/get-jobs-pending/${companyId}`, {
  //     page: currentPage,
  //     limit: 6,
  //     sort: sortOrder === 'new' ? 'desc' : 'asc',
  //   });
  //   console.log(responseP);
    
  //   const { jobs, totalPages } = responseP.data.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('Pending');
  // };
  const fetchJobs = async () => {
    try {
      let response;
      switch (activeTab) {
        case 'All':
          response = await postApiWithToken(`/job/get-job/${companyId}`, {
            page: currentPage,
            limit: 6,
            sort: sortOrder === 'new' ? 'desc' : 'asc',
          });
          setAllJobs(response.data.jobs);
          setTotalPages(response.data.totalPages);
          break;
        case 'Accept':
          response = await postApiWithToken(`/job/get-jobs/${companyId}`, {
            page: currentPage,
            limit: 6,
            sort: sortOrder === 'new' ? 'desc' : 'asc',
          });
          setAcceptedJobs(response.data.jobs);
          setTotalPages(response.data.totalPages);
          break;
        case 'Reject':
          response = await postApiWithToken(`/job/get-jobs-rejected/${companyId}`, {
            page: currentPage,
            limit: 6,
            sort: sortOrder === 'new' ? 'desc' : 'asc',
          });
          setRejectedJobs(response.data.jobs);
          setTotalPages(response.data.totalPages);
          break;
        case 'Pending':
          response = await postApiWithToken(`/job/get-jobs-pending/${companyId}`, {
            page: currentPage,
            limit: 6,
            sort: sortOrder === 'new' ? 'desc' : 'asc',
          });
          setPendingJobs(response.data.data.jobs);
          setTotalPages(response.data.data.totalPages);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab, currentPage, sortOrder]); // Chỉ gọi fetchJobs khi activeTab, currentPage hoặc sortOrder thay đổi

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Đặt lại trang về 1 khi thay đổi tab
  };

  const jobsToDisplay = () => {
    switch (activeTab) {
      case 'All':
        return allJobs;
      case 'Accept':
        return acceptedJobs;
      case 'Reject':
        return rejectedJobs;
      case 'Pending':
        return pendingJobs;
      default:
        return [];
    }
  };

  //------1
  // useEffect(() => {
  //   const fetchJobs = async () => {
  //     try {
  //       const response = await getApiWithToken(`/job/get-job/${companyId}?page=${currentPage}&limit=6`);
  //       const { jobs, totalPages } = response.data;
  //       setJobs(jobs);
  //       setTotalPages(totalPages);

  //       const categoryIds = jobs.map((job) => job.category).filter(Boolean);
  //       // const categoryIds = jobs
  //       //   .map((job) => job.category)
  //       //   .filter((categoryId) => categoryId); 
  //       const uniqueCategoryIds = [...new Set(categoryIds)];
  //       const categoryPromises = uniqueCategoryIds.map((categoryId) => getAPiNoneToken(`/category/${categoryId}`));
  //       const categoryResponses = await Promise.all(categoryPromises);
  //       const categoryMap = {};

  //       categoryResponses.forEach((response) => {
  //         const { _id, name } = response.data.category;
  //         categoryMap[_id] = name;
  //       });
  //       setCategories(categoryMap);

  //       const pendingPromises = jobs.map((job) => 
  //         getApiWithToken(`/application/countPending/${job._id}`)
  //     );
  //     const pendingResponses = await Promise.all(pendingPromises);
  //     const pendingMap = {};
  //     pendingResponses.forEach((response, index) => {
  //       pendingMap[jobs[index]._id] = response.data.totalPendingApplications;
  //     });
  //     setPendingApplications(pendingMap);
  //     } catch (error) {
  //       setError('Error fetching jobs');
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchJobs();
  // }, [companyId, currentPage]);

  // const All = async () => {
  //   const response = await getApiWithToken(`/job/get-job/${companyId}?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = response.data;
  //   console.log(jobs);
    
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('All');
  // }

  // const Accept  = async () => {
  //   const responseA = await getApiWithToken(`/job/get-jobs/${companyId}?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = responseA.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('Accept');
  // }

  // const Reject = async () => {
  //   const responseR = await getApiWithToken(`/job/get-jobs-rejected/${companyId}?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = responseR.data;    
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('Reject');
  // }

  // const Pending = async () => {
  //   const responseP = await getApiWithToken(`/job/get-jobs-pending/${companyId}?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = responseP.data;
  //   console.log(jobs);

  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  //   setActiveTab('Pending');
  // }
  
  //
  // const sortedJobs = [...jobs].sort((a, b) => {
  //   if (sortOrder === 'new') {
  //     return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
  //   } else {
  //     return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
  //   }
  // });

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  // ------2
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
        <p className={clsx(styles.titleLon)}>{t('postCreated.postedList')}</p>

        <div className={clsx(styles.tabs)}>
          {/* <button
            className={clsx(styles.tabButton, activeTab === 'All' && styles.activeTab)}
            onClick={All}
          >
            {t('postCreated.all')}
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === "Accept" && styles.activeTab)}
            onClick={Accept}
          >
            {t('postCreated.accepted')}
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === "Pending" && styles.activeTab)}
            onClick={Pending}
          >
            {t('postCreated.pending')}
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === "Reject" && styles.activeTab)}
            onClick={Reject}
          >
            {t('postCreated.rejected')}
          </button> */}

<button
            className={clsx(styles.tabButton, activeTab === 'All' && styles.activeTab)}
            onClick={() => handleTabChange('All')}
          >
            {t('postCreated.all')}
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === "Accept" && styles.activeTab)}
            onClick={() => handleTabChange('Accept')}
          >
            {t('postCreated.accepted')}
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === "Pending" && styles.activeTab)}
            onClick={() => handleTabChange('Pending')}
          >
            {t('postCreated.pending')}
          </button>
          <button
            className={clsx(styles.tabButton, activeTab === "Reject" && styles.activeTab)}
            onClick={() => handleTabChange('Reject')}
          >
            {t('postCreated.rejected')}
          </button>
        </div>

        {
        // loading ? (
        //   <p>Loading...</p>
        // ) : error ? (
        //   <p>{error}</p>
        // ) : 
        // jobs === undefined ? (
          jobsToDisplay().length === 0 ? (
        // jobs.length === 0 ? (
          <div className={clsx(styles.joblist)}>
            <div className={clsx(styles.jobContainer)}>
              <div className={clsx(styles.khongCoTin)}>
                <p>{t('postCreated.noJob')}.</p>
              </div>
            </div>        
          </div>
        ) : (
          <>
            <div className={clsx(styles.filterContainer)}>
                <p className={clsx(styles.textFilter)}>{t('appliedJob.display')}: </p>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="new"
                      checked={sortOrder === 'new'}
                      onChange={() => handleSortChange('new')}
                    />
                    {t('appliedJob.lastest')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="filter"
                      value="old"
                      checked={sortOrder === 'old'}
                      onChange={() => handleSortChange('old')}
                    />
                    {t('appliedJob.oldest')}
                  </label>
                </div>

            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {/* {jobs.map((job) => ( */}
                {/* {sortedJobs.map((job) => ( */}
                {jobsToDisplay().map((job) => (
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
                          {/* <p className={clsx(styles.numberApplyPending)}>Số lượng chưa phê duyệt: {pendingApplications[job._id]}</p> */}
                          <strong>Số lượng chưa phê duyệt: {pendingApplications[job._id]}</strong>
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
