import React, { useCallback, useEffect, useState } from 'react';
import styles from '../JobManagement/jobManagement.module.scss';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiNoneToken, putApiWithToken } from '../../../api';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const cities = [
  'All cities', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên - Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
  'Vĩnh Phúc', 'Yên Bái'
];

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeTabSearch, setActiveTabSearch] = useState('all');

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

  // const [jobs, setJobs] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  const [countAll, setCountAll] = useState(0);

  const [addressInput, setAddressInput] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [results, setResults] = useState(null);

  const [buttonState, setButtonState] = useState('pending');

  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/job/get-all?page=${page}&limit=${pagination.limit}`);

      // console.log(result.data.jobs);
      // console.log(result.data.totalJobs);
      setCountAll(result.data.totalJobs);

      setJobsAll(result.data.jobs);
      setJobsAccepted(result.data.jobs.filter(job => job.status === true && job.pendingUpdates === null));
      setJobsRejected(result.data.jobs.filter(job => job.status === false && job.pendingUpdates === null));
      setJobsPending(result.data.jobs.filter(job => job.pendingUpdates !== null || job.status === undefined));//pendingUpdates khác null thì là pending
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

  //lấy công việc theo status
  // const All = async () => {
  //   const response = await getAPiNoneToken(`/job/get-all?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = response.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  // }

  // const Accept  = async () => {
  //   const responseA = await getAPiNoneToken(`/job/get-all-job?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = responseA.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  // }

  // const Reject = async () => {
  //   const responseR = await getApiWithToken(`/job/get-all-rejected?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = responseR.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  // }

  // const Pending = async () => {
  //   const responseP = await getApiWithToken(`/job/get-all-pending?page=${currentPage}&limit=6`);
  //   const { jobs, totalPages } = responseP.data;
  //   setJobs(jobs);
  //   setTotalPages(totalPages);
  // }

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
  };

  
  //accept, reject job
  const handleStatusUpdate = async ( jobId, status ) => {
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
      await putApiWithToken('/job/update-status', { jobId, status });

      setButtonState(status);
      Swal.fire({
        icon: 'success',
        title: status === true ? 'Accepted' : 'Rejected',//true
        text: `You have ${status} this job.`,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${status} the job.`,
      });
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa công việc này?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });
  
      if (result.isConfirmed) {
        const response = await deleteApiWithToken(`/job/delete/${jobId}`);
        
        if (response.data.success) {
          Swal.fire(
            'Đã xóa!',
            'Bài đăng đã được xóa thành công.',
            'success'
          );
          // Re-fetch the jobs or update the state to remove the deleted job
          fetchJobs(pagination.currentPage);
        } else {
          Swal.fire(
            'Lỗi!',
            response.data.message,
            'error'
          );
        }
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      Swal.fire(
        'Lỗi!',
        'Đã xảy ra lỗi khi xóa bài đăng.',
        'error'
      );
    }
  };
  
  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: jobInput.trim(),
        city: addressInput.trim() || '',
      };
  
      const response = await postApiNoneToken('/job/search', searchParams);

      console.log("82", searchParams);
      
      console.log("82", response.data.jobs);
  
      if (response.data.success) {
        setResults(response.data.jobs);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };
  

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  //city
  const handleCityInputClick = () => {
    setShowCityModal(true);
  };

  const handleCitySelect = (city) => {
    if(city === 'All cities'){
      setAddressInput(city);
    } else {
      setAddressInput(city);
    }
    setShowCityModal(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.jobManagement}>
      <h2>Quản lí việc làm</h2>
        {/* searchBar */}
        <div className={clsx(styles.searchBar)}>
          <Form className={clsx(styles.form)}>
            {/* <Form.Control
              type="text"
              placeholder="Address"
              className={clsx(styles.jobInput)}
              id="address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            /> */}
            {/* <select
            className={clsx(styles.locationInput)}
            id="address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          >
            <option value="">All cities</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Ho Chi Minh">TP.HCM</option>
            <option value="Others">Others</option>
          </select> */}
            <label>City:</label>
        <input 
          type="text" 
          name="city"
          value={addressInput || cities}
          onClick={handleCityInputClick}
        />
        {/* City Modal */}
        {showCityModal && (
          <div className={clsx(styles.modal)}>
            <div className={clsx(styles.modalContent)}>
              <input 
                type="text"
                placeholder="Search Cities..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <ul>
                {filteredCities.map((city) => (
                  <li 
                    key={city}
                    onClick={() => handleCitySelect(city === 'All cities' ? '' : city)}
                  >
                    {city}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowCityModal(false)}>Close</button>
            </div>
          </div>
        )}
            <Form.Control
              type="text"
              placeholder="Enter job title"
              className={clsx(styles.jobInput)}
              id="search"
              value={jobInput}
              onChange={(e) => setJobInput(e.target.value)}
            />
            <Button 
              variant="primary" 
              className={clsx(styles.searchButton)} 
              onClick={handleSearch}
            >
              Search
            </Button>
          </Form>
        </div>
      
      {/* results search */}
      {results && (
  <div className={clsx(styles.results)}>
    <p>Kết quả</p>
    <div className={clsx(styles.tabs)}>
      <button
        className={clsx(styles.tabButton, activeTabSearch === 'all' && styles.active)}
        onClick={() => setActiveTabSearch('all')}
      >
        All
      </button>
      <button
        className={clsx(styles.tabButton, activeTabSearch === 'accepted' && styles.active)}
        onClick={() => setActiveTabSearch('accepted')}
      >
        Accepted
      </button>
      <button
        className={clsx(styles.tabButton, activeTabSearch === 'rejected' && styles.active)}
        onClick={() => setActiveTabSearch('rejected')}
      >
        Rejected
      </button>
      {/* nếu job có pending update thì là pending */}
      <button
        className={clsx(styles.tabButton, activeTabSearch === 'pending' && styles.active)}
        onClick={() => setActiveTabSearch('pending')}
      >
        Pending
      </button>
    </div>

    {/* Tab result content */}
    <div className={clsx(styles.tabContent)}>
      {/* All Jobs */}
      {activeTabSearch === 'all' && (
        <div>
          <h3>All Jobs</h3>
          <ul>
            {results.map((job) => (
              <Link key={job._id} to={`/detailJob/${job._id}`}>
                <li>{job.title}</li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      {/* Accepted Jobs */}
      {activeTabSearch === 'accepted' && (
        <div>
          <h3>Accepted</h3>
          <ul>
            {results
              .filter((job) => job.status === true)
              .map((job) => (
                <Link key={job._id} to={`/detailJob/${job._id}`}>
                  <li>{job.title}</li>
                </Link>
              ))}
          </ul>
        </div>
      )}

      {/* Rejected Jobs */}
      {activeTabSearch === 'rejected' && (
        <div>
          <h3>Rejected</h3>
          <ul>
            {results
              .filter((job) => job.status === false)
              .map((job) => (
                <Link key={job._id} to={`/detailJob/${job._id}`}>
                  <li>{job.title}</li>
                </Link>
              ))}
          </ul>
        </div>
      )}

      {/* Pending Jobs */}
      {activeTabSearch === 'pending' && (
        <div>
          <h3>Pending</h3>
          <ul>
            {results
              .filter((job) => job.status === undefined)
              .map((job) => (
                <Link key={job._id} to={`/detailJob/${job._id}`}>
                  <li>{job.title}</li>
                </Link>
              ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}

      {/* tab content*/}
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
                    <div className={clsx(styles.content)}  key={job._id}>
                      <Link to={`/detailJobAdmin/${job._id}`} className={clsx(styles.jobcard)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div>
                            <p>Company: {job.company.name}</p>
                            <p>Status: {job.status}</p>
                          </div>
                      </Link>
                          <button onClick={() => handleDeleteJob(job._id)}>Xóa</button>
                    </div>
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
                      <div  key={job._id} className={clsx(styles.content)}>
                    <Link to={`/detailJobAdmin/${job._id}`} className={clsx(styles.jobcard)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div>
                            <p>Company: {job.company.name}</p>
                          </div>
                    </Link>
                          <button onClick={() => handleDeleteJob(job._id)}>Xóa</button>
                      </div>
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
                    <div key={job._id} className={clsx(styles.content)}>
                        <Link to={`/detailJobAdmin/${job._id}`} className={clsx(styles.jobcard)}>
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div className={clsx(styles.title)}>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div className={clsx(styles.describe)}>
                            <p>Company: {job.company.name}</p>
                        </div>
                    </Link>
                        <button onClick={() => handleDeleteJob(job._id)}>Xóa</button>
                      </div>
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
                    <div key={job._id} className={clsx(styles.content)}>
                        <Link to={`/detailJobAdmin/${job._id}`} className={clsx(styles.jobcard)} target="_blank" rel="noopener noreferrer">
                        <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>
                          <div className={clsx(styles.title)}>
                            <p><strong>{job.title}</strong></p>
                          </div>
                          <div className={clsx(styles.describe)}>
                            <p>Company: {job.company.name}</p>
                            {/* button */}
                        </div>
                    </Link>
                              <div className={clsx(styles.buttonContainer)}>
                                <button
                                  className={clsx(styles.button, { [styles.accepted]: buttonState === 'accepted', [styles.disabled]: buttonState === 'rejected' })}
                                  onClick={() => handleStatusUpdate(job._id, true)}
                                  disabled={buttonState === 'accepted'}
                                >
                                  Accept
                                </button>
                                <button
                                  className={clsx(styles.button, { [styles.rejected]: buttonState === 'rejected', [styles.disabled]: buttonState === 'accepted' })}
                                  onClick={() => handleStatusUpdate(job._id, false)}
                                  disabled={buttonState === 'rejected'}
                                >
                                  Reject
                                </button>
                                {/* <button>Bản chưa sửa</button> */}
                                <button onClick={() => handleDeleteJob(job._id)}>Xóa</button>
                              </div>
                      </div>
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
