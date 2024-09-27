import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAPiNoneToken, getApiWithToken, putApiWithToken } from '../../../api';
import styles from './detailCompanyAdmin.module.scss';
import clsx from 'clsx';
import Header from '../HeaderAdmin/HeaderAdmin';
import logo from '../../../images/logo.png';
import Swal from 'sweetalert2';

const DetailCompanyAdmin = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);
  
  // Job data for the company
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState({});

  const [buttonState, setButtonState] = useState('pending');
  const [user, setUser] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCompany = async () => {
      try {
        const result = await getAPiNoneToken(`/company/${id}`);
        setCompany(result.data.company);

        //
        const userResult = await getApiWithToken(`/user/${id}`);
        setUser(userResult.data.user); 
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

  const renderField = (label, originalValue, updatedValue) => {
    return (
      <p>
        <strong>{label}:</strong> {originalValue}
        {updatedValue !== undefined && updatedValue !== originalValue && (
          <span style={{ backgroundColor: 'yellow', paddingLeft: '10px' }}>
            (Cập nhật thành: {updatedValue})
          </span>
        )}
      </p>
    );
  };

  const handleStatusUpdate = async ( companyId, status ) => {
    // Hiển thị thông báo ngay lập tức khi người dùng nhấn nút
    Swal.fire({
      title: `${status === 'accepted' ? 'Accepting' : 'Rejecting'}...`,
      text: `Please wait while ${status} the company.`,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await putApiWithToken('/company/update-status', { companyId, status });

      setButtonState(status);
      Swal.fire({
        icon: 'success',
        title: status === true ? 'Accepted' : 'Rejected',
        text: `You have ${status} this company.`,
      });
      //refresh màn hình luôn
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${status} the company.`,
      });
    }
  };

  const handleDisableCompany = async (companyId, currentIsActive) => {
    try {
      const newIsActiveState = !currentIsActive;
      const response = await putApiWithToken(`/company/disable-company/${companyId}`, { isActive: newIsActiveState });
  
      console.log(response);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `The user has been ${newIsActiveState ? 'activated' : 'disabled'} successfully!`,
        });
        setUser({ ...user, isActive: newIsActiveState });
        setCompany({...company, status: newIsActiveState});
        // setCompaniesAll(prveCompanies =>
        //   prveCompanies.map(company=>
        //     company._id === companyId
        //     ? {...company, isActive: newIsActiveState}
        //     :company
        //   )
        // )
        // setIsActive(newIsActiveState); // Update local state to reflect change
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update the user status.',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the user status.',
      });
    }
  };

  if (error) return <div>{error}</div>;
  if (!company || !user) return <div>Company not found</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.jobDetail)}>
        <div className={clsx(styles.titleContainer)}>
          <div className={clsx(styles.title)}>
            <img src={company.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />
            <h1>{company.name}</h1>
            {
              company.pendingUpdates?.name && company.pendingUpdates.name !== company.name && (
                <h1 style={{backgroundColor: 'yellow'}}>Tên mới: {company.pendingUpdates.name}</h1>
              )
            }
          </div>
        </div>
        {renderField('Address', `${company.street}, ${company.city}`, `${company.pendingUpdates?.street}, ${company.pendingUpdates?.city}`)}
        {renderField('Phone number', company.phoneNumber, company.pendingUpdates?.phoneNumber)}
        {renderField('Website', company.website, company.pendingUpdates?.website)}
        {renderField('Email', company.email, company.pendingUpdates?.email)}
        {renderField('Description', company.description, company.pendingUpdates?.description)}
      </div>
      <div className={clsx(styles.button)}>
      <button
        className={clsx(styles.button, {
          [styles.accepted]: buttonState === 'accepted',
          [styles.disabled]: buttonState === 'rejected' || company.pendingUpdates === null, // Disable if rejected or pendingUpdates is null
        })}
        onClick={() => handleStatusUpdate(company._id, true)}
        disabled={buttonState === 'accepted' || company.pendingUpdates === null} // Disable if accepted or pendingUpdates is null
      >
        Accept
      </button>
      <button
        className={clsx(styles.button, {
          [styles.rejected]: buttonState === 'rejected',
          [styles.disabled]: buttonState === 'accepted' || company.pendingUpdates === null, // Disable if accepted or pendingUpdates is null
        })}
        onClick={() => handleStatusUpdate(company._id, false)}
        disabled={buttonState === 'rejected' || company.pendingUpdates === null} // Disable if rejected or pendingUpdates is null
      >
        Reject
      </button>

        <button
        onClick={() => handleDisableCompany(user._id, user.isActive)}
      >
        {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
      </button>

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
    </>
  );
};

export default DetailCompanyAdmin;

