import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAPiNoneToken } from '../../api';
import styles from './detailCompany.module.scss';
import clsx from 'clsx';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import logo from '../../images/logo.jpg';

const DetailCompany = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  // Job data for the company
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCompany = async () => {
      try {
        const result = await getAPiNoneToken(`/company/${id}`);
        setCompany(result.data.company);
      } catch (err) {
        setError('Failed to fetch company details');
      }
    };

    const fetchJobs = async () => {
      try {
        const response = await getAPiNoneToken(`/job/get-jobs/${id}?page=${currentPage}&limit=6`);
        if (response.data.jobs.length === 0) {
          setJobs([]);  // No jobs found
          setTotalPages(1); // Ensure pagination is reset
        } else {
          const { jobs, totalPages } = response.data;
          setJobs(jobs);
          setTotalPages(totalPages);
  
          // Fetch category names for jobs
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
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setJobs([]); // No jobs found for this company
        } else {
          setError('Error fetching jobs');
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
    fetchJobs();
  }, [id, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (error) return <div>{error}</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.companyDetail)}>
        <div className={clsx(styles.title)}>
          <img src={company.avatar || logo} alt="Logo" className={styles.avatar} />
          <h3><strong>Company name:</strong> {company.name}</h3>
        </div>
        <i className="fa-regular fa-building"></i>
        <p><strong>Address:</strong> {company.street}, {company.city}</p>
        <p><strong>Phone Number:</strong> {company.phoneNumber}</p>
        <p><strong>Website:</strong></p><a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a>
        <p><strong>Posted:</strong> {new Date(company.createdAt).toLocaleDateString()}</p>
        <p><strong>Expires:</strong> {new Date(company.expiredAt).toLocaleDateString()}</p>
        <p><strong>Email:</strong> {company.email}</p>
        <p><strong>Description:</strong> {company.description}</p>
      </div>
      <span>Tin tuyển dụng của công ty:</span>
      <div className={clsx(styles.mainContent)}>
        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <p>Chưa đăng công việc.</p>
        ) : (
          <>
            <div className={clsx(styles.joblist)}>
              <div className={clsx(styles.jobContainer)}>
                {jobs.map((job) => (
                  <Link key={job._id} to={`/detailJob/${job._id}`} className={clsx(styles.jobcard)}>
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
                          <p>Status: {job.status ? 'Approved' : job.status === false ? 'Rejected' : 'Pending'}</p>
                          <p>Category: {categories[job.category] || 'No Category'}</p>
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
      <Footer/>
    </>
  );
};

export default DetailCompany;
