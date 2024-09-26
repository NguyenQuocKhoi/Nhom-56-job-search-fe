import React, { useState } from 'react';
import { postApiNoneToken } from '../../api';
import clsx from 'clsx';
import styles from '../FeaturedJobs/featuredJobs.module.scss';
import ListJobInfo from '../ListJobInfo/ListJobInfo';
import ListCompanyInfo from '../ListCompanyInfo/ListCompanyInfo';
import { Link, useNavigate } from 'react-router-dom';
import JobsRecommended from '../JobsRecommended/JobsRecommended';
import { getUserStorage } from '../../Utils/valid';
import Swal from 'sweetalert2';

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

const FeaturedJobs = () => {
  const [addressInput, setAddressInput] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');

  //role
  const user = getUserStorage()?.user;
  const role = user ? user.role : null;

   //city
   const [showCityModal, setShowCityModal] = useState(false);
   const [filteredCities, setFilteredCities] = useState(cities);
   const [searchQuery, setSearchQuery] = useState('');

  //candidateId để recommend job
  const candidateId = user && role === 'candidate' ? user._id : null;

  // console.log('candidateId', candidateId);
  
  const handleSearch = async (event) => {
    event.preventDefault();//tránh tải lại trang làm mất dữ liệu đang hiển thị

    try {
      const searchParams = {
        search: jobInput,
        categoryName: categoryName,
        ...(addressInput && { city: addressInput })
      };

      const response = await postApiNoneToken('/user/search', searchParams);

      if (response.data.success) {
        setResults(response.data.data);
        console.log(response.data.data.candidates);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
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

  //kiểm tra đăng nhập mới cho xem thông tin ứng viên
  const handleViewCandidate = (candidateId) => {
    const user = getUserStorage()?.user;

    if (!user) {
      Swal.fire({
        title: 'Vui lòng đăng nhập để xem thông tin ứng viên!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Hủy bỏ',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: `/detail-candidate/${candidateId}` } });
        }
      });
    } else {
      window.open(`/detail-candidate/${candidateId}`, { target: '_blank', rel: 'noopener noreferrer' });
    }
  };

  return (
    <div className={clsx(styles.searchComponent)}>
      <form className={clsx(styles.searchBar)}>
        <div className={clsx(styles.form)}>

      <label>City:</label>
        <input 
          type="text" 
          name="city"
          value={addressInput || 'All cities'}
          onClick={handleCityInputClick}
          readOnly
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
        
          <input
            className={clsx(styles.jobInput)}
            type="text"
            id="search"
            value={jobInput}
            onChange={(e) => setJobInput(e.target.value)}
            placeholder="Enter job title, skill, etc."
          />
          <button className={clsx(styles.searchButton)} onClick={handleSearch}>Search</button>
        </div>
      </form>

      <div className={clsx(styles.suggestBar)}>
        <span>Suggested keyword: </span>
        <button className={clsx(styles.suggest)}>Project Manager</button>
        <button className={clsx(styles.suggest)}>Back end</button>
        <button className={clsx(styles.suggest)}>Front end</button>
        <button className={clsx(styles.suggest)}>Mobile</button>
        <button className={clsx(styles.suggest)}>Business Analyst</button>
        <button className={clsx(styles.suggest)}>UX/UI</button>
        <button className={clsx(styles.suggest)}>Tester</button>
      </div>

      {results && (
        <div className={clsx(styles.results)}>
          <div className={clsx(styles.tabs)}>
            <button
              className={clsx(styles.tabButton, activeTab === 'all' && styles.active)}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'jobs' && styles.active)}
              onClick={() => setActiveTab('jobs')}
            >
              Jobs
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'companies' && styles.active)}
              onClick={() => setActiveTab('companies')}
            >
              Companies
            </button>
            <button
              className={clsx(styles.tabButton, activeTab === 'candidates' && styles.active)}
              onClick={() => setActiveTab('candidates')}
            >
              Candidates
            </button>
          </div>

          <div className={clsx(styles.tabContent)}>
            {activeTab === 'all' && (
              <div>
                <h3>Jobs</h3>
                <ul>
                  {results.jobs.map((job) => (
                    <Link key={job._id} to={`/detailJob/${job._id}`} target="_blank" rel="noopener noreferrer">
                      <li>{job.title}</li>
                    </Link>
                  ))}
                </ul>
                <h3>Companies</h3>
                <ul>
                  {results.companies.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} target="_blank" rel="noopener noreferrer">
                      <li>{company.name}</li>
                    </Link>
                  ))}
                </ul>
                <h3>Candidates</h3>
                {/* <ul>
                  {results.candidates.map((candidate) => (
                    <Link key={candidate._id} to={`/detail-candidate/${candidate._id}`} target="_blank" rel="noopener noreferrer">
                      <li>{candidate.name}</li>
                    </Link>
                  ))}
                </ul> */}
                <ul>
      {results.candidates.map((candidate) => (
        <li key={candidate._id} onClick={() => handleViewCandidate(candidate._id)}>
          {candidate.name}
        </li>
      ))}
    </ul>
              </div>
            )}
            {activeTab === 'jobs' && (
              <div>
                <h3>Jobs</h3>
                <ul>
                  {results.jobs.map((job) => (
                    <Link key={job._id} to={`/detailJob/${job._id}`} target="_blank" rel="noopener noreferrer">
                      <li>{job.title}</li>
                    </Link>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'companies' && (
              <div>
                <h3>Companies</h3>
                <ul>
                  {results.companies.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} target="_blank" rel="noopener noreferrer">
                      <li>{company.name}</li>
                    </Link>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'candidates' && (
              <div>
                <h3>Candidates</h3>
                {/* <ul>
                  {results.candidates.map((candidate) => (
                    <Link key={candidate._id} to={`/detail-candidate/${candidate._id}`} target="_blank" rel="noopener noreferrer">
                      <li>{candidate.name}</li>
                    </Link>
                  ))}
                </ul> */}
                <ul>
      {results.candidates.map((candidate) => (
        <li key={candidate._id} onClick={() => handleViewCandidate(candidate._id)}>
          {candidate.name}
        </li>
      ))}
    </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {role === 'candidate' && candidateId && (
        <div>
          <p>Jobs for you</p>
          <JobsRecommended candidateId={candidateId} />
        </div>
      )}
      <p>List jobs</p>
      <ListJobInfo/>
      <p>List companies</p>
      <ListCompanyInfo/>
    </div>
  );
};

export default FeaturedJobs;
