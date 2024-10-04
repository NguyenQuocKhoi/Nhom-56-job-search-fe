import React, { useCallback, useEffect, useState } from 'react';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiNoneToken, postApiWithToken } from '../../api';
import clsx from 'clsx';
import styles from '../SearchCompanyResult/searchCompanyResult.module.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserStorage } from '../../Utils/valid';
import Swal from 'sweetalert2';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import JobsRecommended from '../../components/JobsRecommended/JobsRecommended';
import logo from '../../images/logo.png';

const cities = [
  'All cities','TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
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

const SearchCompanyResult = () => {
  const location = useLocation();
  const initialSearchParams = location.state?.searchParams || {};
  
  const [addressInput, setAddressInput] = useState(initialSearchParams.city || '');
  const [companyInput, setCompanyInput] = useState(initialSearchParams.search || '');
  const [results, setResults] = useState(null);
//   const [jobInput, setJobInput] = useState('');
//   const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [error, setError] = useState(null);

//   const [categoryName, setCategoryName] = useState('');
//   const [savedJobs, setSavedJobs] = useState({});

  //role
  const user = getUserStorage()?.user;
  const role = user ? user.role : null;

  const handleSearch = async (event) => {
    if(event){
        event.preventDefault();//tránh tải lại trang làm mất dữ liệu đang hiển thị
    }

    const searchParams = {
        search: companyInput.trim(),
        city: addressInput.trim() || '',
    };
    
    try {
      const response = await postApiNoneToken('/user/search', searchParams);

      if (response.data.success) {
        console.log(response.data.data);
        setResults(response.data.data);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };

  useEffect(()=>{
    if(Object.keys(initialSearchParams).length){
        handleSearch();
    }
  }, []);

  //kiểm tra đăng nhập mới cho xem thông tin ứng viên
//   const handleViewCandidate = (candidateId) => {
//     const user = getUserStorage()?.user;

//     if (!user) {
//       Swal.fire({
//         title: 'Vui lòng đăng nhập để xem thông tin ứng viên!',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Đăng nhập',
//         cancelButtonText: 'Hủy bỏ',
//       }).then((result) => {
//         if (result.isConfirmed) {
//           navigate('/login', { state: { from: `/detail-candidate/${candidateId}` } });
//         }
//       });
//     } else {
//       window.open(`/detail-candidate/${candidateId}`, { target: '_blank', rel: 'noopener noreferrer' });
//     }
//   };

//   const handleSaveJob = async (jobId) => {
//     const userData = getUserStorage()?.user;
//     if (!userData) {
//       navigate('/login');
//       return;
//     }

//     try {
//       console.log('savedJobs[jobId] là boolean',savedJobs[jobId]);
      
//       if (savedJobs[jobId]) {
//         console.log(1); 
//         const savedJobEntry = savedJobs[jobId];
//         const savedJobId = savedJobEntry.savedJobId;
//         // const savedJodId = Object.keys(savedJobs).find(savedId => savedId === jobId);

//         console.log('savedJobs',savedJobs);
//         console.log('savedJobId là id job',savedJobId);
        
//         if(savedJobId) {
//           console.log(3);
          
//           await deleteApiWithToken(`/save-job/delete/${savedJobId}`);//savedJobId chứ không phải jobId
//           setSavedJobs(prev => ({ ...prev, [jobId]: false }));
//           Swal.fire('Đã bỏ lưu tin!', '', 'success');
//         }
//       } else {
//         await postApiWithToken(`/save-job/create`, { candidateId: userData._id, jobId });
//         setSavedJobs(prev => ({ ...prev, [jobId]: true }));
//         Swal.fire('Lưu tin thành công!', '', 'success');
//       }
//     } catch (error) {
//       Swal.fire('Lỗi', 'Không thể lưu tin hoặc bỏ lưu tin', 'error');
//     }
//   };
  
//   useEffect(()=>{
//     fetchJobs();
//   }, [fetchJobs]);

  // if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
      <div className={clsx(styles.searchComponent)}>
        <Header />
      <div className={clsx(styles.searchContainer)}>

      
      <form className={clsx(styles.searchBar)}>
        <div className={clsx(styles.form)}>

      <div className={clsx(styles.iconPlace)}>
        <i className="fa-solid fa-location-dot"></i>
      </div>
      
      <div className={clsx(styles.selectContainer)}>
        <select
              className={clsx(styles.select)}
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
      </div>
      
          <input
            className={clsx(styles.jobInput)}
            type="text"
            id="search"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            placeholder="Enter company name, etc."
          />
          <button className={clsx(styles.searchButton)} onClick={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
            Search
          </button>
        </div>
      </form>

      {/* <div className={clsx(styles.suggestBar)}>
        <span className={clsx(styles.suggestTitle)}>Suggested keyword: </span>
        <button className={clsx(styles.suggest)}>React JS</button>
        <button className={clsx(styles.suggest)}>Node JS</button>
        <button className={clsx(styles.suggest)}>React Native</button>
        <button className={clsx(styles.suggest)}>Spring Boot</button>
      </div> */}
    </div>

      {results && (
        <div className={clsx(styles.results)}>
          {/* <div className={clsx(styles.tabs)}>
            <button
              className={clsx(styles.tabButton, activeTab === 'all' && styles.active)}
              onClick={() => setActiveTab('all')}
            >
              <p className={clsx(styles.textTitleTab)}>Tất cả</p>
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'jobs' && styles.active)}
              onClick={() => setActiveTab('jobs')}
            >
              <p className={clsx(styles.textTitleTab)}>Việc làm</p>
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'companies' && styles.active)}
              onClick={() => setActiveTab('companies')}
            >
              <p className={clsx(styles.textTitleTab)}>Công ty</p>
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'candidates' && styles.active)}
              onClick={() => setActiveTab('candidates')}
            >
              <p className={clsx(styles.textTitleTab)}>Ứng viên</p>
            </button>
          </div> */}

          <div className={clsx(styles.tabContent)}>
            {/* {activeTab === 'all' && (
              <div className={clsx(styles.jobContainer)}>
                <p className={clsx(styles.textTitle)}>Việc làm</p>
                {results.jobs.length > 0 ? (
                  results.jobs.map((job) => (
                      <div key={job._id} className={clsx(styles.jobcard)}>
              <div className={clsx(styles.content)}>
                <Link to={`/detailCompany/${job.company}`} 
                  target="_blank" rel="noopener noreferrer"
                >
                  <img src={job.companyAvatar || logo} alt="Logo" className={clsx(styles.avatar)} />
                </Link>
                <Link to={`/detailJob/${job._id}`} 
                  target="_blank" rel="noopener noreferrer" 
                  className={clsx(styles.linkJob)}>
                  <div className={clsx(styles.text)}>
                    <div className={clsx(styles.title)}>
                      <p><strong>{job.title}</strong></p>
                    </div>
                    <div className={clsx(styles.describe)}>
                      <p>Company: {job.companyName}</p>
                      <p>Address: {job.street}, {job.city}</p>
                      <p>Salary: {job.salary}</p>
                      {job.requirementSkillsNames && job.requirementSkillsNames.length > 0 ? (
                        <div className={clsx(styles.skills)}>
                          {job.requirementSkillsNames.map((skill, index) => (
                            <p key={index} className={clsx(styles.skill)}>{skill}</p>
                          ))}
                        </div>
                      ) : (
                        <span>No skills</span>
                      )}
                    </div>
                  </div>
                </Link>
                {(role === 'candidate' || !role) && (
                  <div onClick={() => handleSaveJob(job._id)}>
                    <i className={clsx(savedJobs[job._id] ? 'fa-solid fa-heart' : 'fa-regular fa-heart')}></i>
                  </div>
                )}
              </div>
            </div>
                  ))
                ):(
                  <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>Không tìm thấy kết quả phù hợp</p></div>
                  )}

                <p className={clsx(styles.textTitle)}>Công ty</p>
                {results.companies.length > 0 ? (
                  results.companies.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} target="_blank" rel="noopener noreferrer" className={clsx(styles.linkCompany)}>
                      <div className={clsx(styles.companycard)}>
                        <img src={company.avatar || logo} alt="Logo" className={clsx(styles.avatarCompany)}/>
                        <h3>{company.name}</h3>
                      </div>
                    </Link>
                  ))
                  ):(
                    <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>Không tìm thấy kết quả phù hợp</p></div>
                )}

                <p className={clsx(styles.textTitle)}>Ứng viên</p>
                {results.candidates.length > 0 ? (
                  results.candidates.map((candidate) => (
                    <div key={candidate._id} onClick={() => handleViewCandidate(candidate._id)} className={clsx(styles.cardCandidate)}>
                        <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatarCandidate)} />
                        <div className={clsx(styles.textCandidate)}>
                        <p className={clsx(styles.nameCandidate)}>{candidate.name}</p>
                          <p>Email: {candidate.email}</p>
                          <p>Gender: {candidate.gender}</p>
                        </div>
                    </div>
                  ))
                ):(
                  <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>Không tìm thấy kết quả phù hợp</p></div>
                )}
              </div>
            )} */}

            {/* {activeTab === 'jobs' && ( */}
              {/* <div>
                <p className={clsx(styles.textTitle)}>Việc làm</p>

                {results.jobs.length > 0 && (
                <div className={clsx(styles.filterContainer)}>
                  <p className={clsx(styles.textFilter)}>Ưu tiên hiển thị theo: </p>
                  <label>
                    <input type="radio" name="filter" value="all" />
                    Tất cả
                  </label>
                  <label>
                    <input type="radio" name="filter" value="expirationDate" />
                    Ngày hết hạn
                  </label>
                  <label>
                    <input type="radio" name="filter" value="postingDate" />
                    Ngày đăng
                  </label>
                  <label>
                    <input type="radio" name="filter" value="salaryAsc" />
                    Lương thấp đến cao
                  </label>
                </div>
              )}

                {results.jobs.length > 0 ? (
                  results.jobs.map((job) => (
                      <div key={job._id} className={clsx(styles.jobcard)}>
              <div className={clsx(styles.content)}>
                <Link to={`/detailCompany/${job.company}`} 
                  target="_blank" rel="noopener noreferrer"
                >
                  <img src={job.companyAvatar || logo} alt="Logo" className={clsx(styles.avatar)} />
                </Link>
                <Link to={`/detailJob/${job._id}`} 
                  target="_blank" rel="noopener noreferrer" 
                  className={clsx(styles.linkJob)}>
                  <div className={clsx(styles.text)}>
                    <div className={clsx(styles.title)}>
                      <p><strong>{job.title}</strong></p>
                    </div>
                    <div className={clsx(styles.describe)}>
                      <p>Company: {job.companyName}</p>
                      <p>Address: {job.street}, {job.city}</p>
                      <p>Salary: {job.salary}</p>
                      {job.requirementSkillsNames && job.requirementSkillsNames.length > 0 ? (
                        <div className={clsx(styles.skills)}>
                          {job.requirementSkillsNames.map((skill, index) => (
                            <p key={index} className={clsx(styles.skill)}>{skill}</p>
                          ))}
                        </div>
                      ) : (
                        <span>No skills</span>
                      )}
                    </div>
                  </div>
                </Link>
                {(role === 'candidate' || !role) && (
                  <div onClick={() => handleSaveJob(job._id)}>
                    <i className={clsx(savedJobs[job._id] ? 'fa-solid fa-heart' : 'fa-regular fa-heart')}></i>
                  </div>
                )}
              </div>
            </div>
                  ))
                ):(
                  <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>Không tìm thấy kết quả phù hợp</p></div>
                  )}
              </div> */}
            {/* )} */}

            {/* {activeTab === 'companies' && ( */}
              <div>
                <p className={clsx(styles.textTitle)}>Công ty</p>
                {results.companies.length > 0 ? (
                  results.companies.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} target="_blank" rel="noopener noreferrer" className={clsx(styles.linkCompany)}>
                      <div className={clsx(styles.companycard)}>
                        <img src={company.avatar || logo} alt="Logo" className={clsx(styles.avatarCompany)}/>
                        <h3>{company.name}</h3>
                      </div>
                    </Link>
                  ))
                  ):(
                    <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>Không tìm thấy kết quả phù hợp</p></div>
                )}
              </div>
            {/* )} */}

            {/* {activeTab === 'candidates' && (
              <div>
                <p className={clsx(styles.textTitle)}>Ứng viên</p>
                  {results.candidates.length > 0 ? (
                  results.candidates.map((candidate) => (
                    <div key={candidate._id} onClick={() => handleViewCandidate(candidate._id)} className={clsx(styles.cardCandidate)}>
                        <img src={candidate.avatar || logo} alt="Avatar" className={clsx(styles.avatarCandidate)} />
                        <div className={clsx(styles.textCandidate)}>
                        <p className={clsx(styles.nameCandidate)}>{candidate.name}</p>
                          <p>Email: {candidate.email}</p>
                          <p>Gender: {candidate.gender}</p>
                        </div>
                    </div>
                  ))
                ):(
                  <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>Không tìm thấy kết quả phù hợp</p></div>
                )}
              </div>
            )} */}
          </div>
        </div>
      )}

      {/* {role === 'candidate' && candidateId && (
        <div>
          <JobsRecommended candidateId={candidateId} />
        </div>
      )} */}
      <Footer/>
    </div>
  );
};

export default SearchCompanyResult;
