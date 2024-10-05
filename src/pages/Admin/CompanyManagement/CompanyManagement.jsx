import React, { useCallback, useEffect, useState } from 'react';
import styles from '../CompanyManagement/companyManagement.module.scss';
import { getAPiNoneToken, getApiWithToken, postApiNoneToken, postApiWithToken, putApiWithToken } from '../../../api';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button, Form, Modal } from 'react-bootstrap';
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

const CompanyManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeTabSearch, setActiveTabSearch] = useState('all');

  const [companiesAll, setCompaniesAll] = useState([]);
  const [companiesAccepted, setCompaniesAccepted] = useState([]);
  const [companiesRejected, setCompaniesRejected] = useState([]);
  const [companiesPending, setCompaniesPending] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [addressInput, setAddressInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [results, setResults] = useState(null);
  const [buttonState, setButtonState] = useState('pending');

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  //disable
  const [isActive, setIsActive] = useState(null);

  //create company
  const [companyData, setCompanyData] = useState({
    role: 'company',
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    street: '',
    website: '',
    description: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchCompanies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/company/get-all?page=${page}&limit=${pagination.limit}`);

      console.log(result.data.companies);
      const companies = result.data.companies;
      console.log(companies);

    // Fetch the isActive status for each company (based on the company._id assuming it corresponds to the userId)
    const companiesWithIsActive = await Promise.all(
      companies.map(async (company) => {
        try {
          const userIsActiveResponse = await getApiWithToken(`/user/${company._id}`);  // Assuming company._id is the userId
          // console.log("userIsActiveResponse",userIsActiveResponse.data.user.isActive);
          // console.log(company._id);
          
          const isActive = userIsActiveResponse.data.user.isActive;
          setIsActive(isActive);
          // console.log("isActive", isActive);
          // console.log(company._id);
          
          return { ...company, isActive };  // Attach isActive status to each company object
        } catch (error) {
          console.error(`Failed to fetch isActive status for company ${company._id}`, error);
          return { ...company, isActive: false }; // Default to false if there's an error
        }
      })
    );
      
    // console.log(companiesWithIsActive);
    
    setCompaniesAll(companiesWithIsActive);
    setCompaniesAccepted(companiesWithIsActive.filter(company => company.status === true && company.pendingUpdates === null));
    setCompaniesRejected(companiesWithIsActive.filter(company => company.status === false && company.pendingUpdates === null));
    setCompaniesPending(companiesWithIsActive.filter(company => company.status === undefined || company.pendingUpdates !== null));

      // setCompaniesAll(result.data.companies);
      // setCompaniesAccepted(result.data.companies.filter(company => company.status === true && company.pendingUpdates === null));
      // setCompaniesRejected(result.data.companies.filter(company => company.status === false && company.pendingUpdates === null));
      // setCompaniesPending(result.data.companies.filter(company => company.status === undefined || company.pendingUpdates !== null));
      setPagination(prev => ({
        ...prev,
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
      }));
    } catch (err) {
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handlePageChange = (newPage) => {
    fetchCompanies(newPage);
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

      // setButtonState(status);
      setCompaniesPending(prev => prev.filter(company => company._id !== companyId));
      if (status === true) {
        setCompaniesAccepted(prev => [...prev, companiesPending.find(company => company._id === companyId)]);
      } else {
        setCompaniesRejected(prev => [...prev, companiesPending.find(company => company._id === companyId)]);
      }

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
        setCompaniesAll(prveCompanies =>
          prveCompanies.map(company=>
            company._id === companyId
            ? {...company, isActive: newIsActiveState}
            :company
          )
        )
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

  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: companyInput.trim(),
        city: addressInput.trim() || '',
      };
  
      const response = await postApiNoneToken('/company/search', searchParams);

      console.log("70", searchParams);
      
      console.log("72", response.data.companies);
  
      if (response.data.success) {
        setResults(response.data.companies);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };
  

  //
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

  //create company
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setCompanyData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };
  const handleChange = (e) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    try {
      console.log(1);
      console.log(companyData.role);
      console.log(companyData);
      
      const response = await postApiWithToken('/user/create-company', companyData);
      console.log(response);
      
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Company created successfully!`,
        });
      }
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while creating the company.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setCompanyData({
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      city: '',
      street: '',
      website: '',
      description: '',
    })
  };

  const generatePassword = () => {
    const length = 8;
    
    // Separate character sets for lowercase, uppercase, and numbers
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    
    // Combine all characters for general use
    const allChars = lowerCase + upperCase + numbers;
    
    let password = "";
  
    // Ensure at least one character from each set
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    
    // Generate remaining characters randomly from the combined set
    for (let i = 3; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
  
    // Shuffle the password to make the position of the required characters random
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setCompanyData({ ...companyData, password: newPassword });
  };
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(companyData.password);
    // Swal.fire({
    //   icon: 'success',
    //   title: 'Copied',
    //   text: 'Password copied to clipboard!',
    // });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  // name: '',
  //     password: '',
  // email
  //     phoneNumber: '',
  //     city: '',
  //     street: '',
  //     gender: 'male',
  //     dateOfBirth: '',
  //     skill: [],
  //     experience: '',
  //     education: '',
  //     moreInformation: ''

  return (
    <>
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Tạo tài khoản công ty</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Name</p>
        <input 
          type="text"
          id="name"
          name="name"
          value={companyData.name}
          onChange={handleChange} 
          />
        <p>Mail</p>
        <input 
          type="text" 
          id="email"
          name="email"
          value={companyData.email}
          onChange={handleChange} 
        />
        {/* <p>Password</p>
        <input 
          type="text"
          id="password"
          name="password" 
          value={companyData.password}
          onChange={handleChange}
        /> */}
        <div style={{ position: 'relative' }}>
  <input 
    type={showPassword ? 'text' : 'password'} 
    id="password"
    name="password"
    value={companyData.password}
    onChange={handleChange}
    placeholder="Enter password"
    style={{ paddingRight: '40px' }}
  />

  <span 
    onClick={togglePasswordVisibility} 
    style={{ position: 'absolute', right: '35px', top: '50%', cursor: 'pointer' }}
  >
    { showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i> }
  </span>

  <button 
    type="button" 
    onClick={handleGeneratePassword}
    style={{ marginLeft: '10px' }}
  >
    Generate Password
  </button>

  <button 
    type="button" 
    onClick={handleCopyPassword}
    style={{ marginLeft: '10px' }}
  >
    Copy Password
  </button>
</div>
        <p>Phone number</p>
        <input 
          type="text"
          id="phoneNumber"
          name="phoneNumber"  
          value={companyData.phoneNumber}
          onChange={handleChange}
        />
        {/* <p>City</p>
        <input 
          type="text" 
          id="city"
          name="city" 
          value={companyData.city}
          onChange={handleChange}
        /> */}
        <p>City</p>
<select 
  id="city" 
  name="city" 
  value={companyData.city} 
  onChange={handleChange} 
  style={{ maxHeight: '150px', overflowY: 'auto' }} // Scrollable dropdown
>
  {cities.map((city, index) => (
    <option key={index} value={city}>
      {city}
    </option>
  ))}
</select>

        <p>Street</p>
        <input 
          type="text" 
          id="street"
          name="street" 
          value={companyData.street}
          onChange={handleChange}
        />
        <p>Website</p>
        <input 
          type="text" 
          id="website"
          name="website" 
          value={companyData.website}
          onChange={handleChange}
        />
        <p>Description</p>
        <input 
          type="text" 
          id="description"
          name="description" 
          value={companyData.description}
          onChange={handleChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
        <Button variant="secondary" onClick={handleCreateCompany}>
          Tạo tài khoản công ty
        </Button>
      </Modal.Footer>
    </Modal>

    <div className={styles.jobManagement}>
      <h2>Quản lí công ty</h2> 
      
      {/* searchBar */}
    <div className={clsx(styles.searchBar)}>
      <div className={clsx(styles.form)}>
      {/* <select 
  id="city" 
  name="city" 
  value={addressInput || 'All cities'} 
  onChange={handleChange} 
  style={{ maxHeight: '150px', overflowY: 'auto' }} // Scrollable dropdown
>
  {cities.map((city, index) => (
    <option key={index} value={city}>
      {city}
    </option>
  ))}
</select> */}

        {/* <label>City:</label>
        <input 
          type="text" 
          name="city"
          value={addressInput || 'All cities'}
          onClick={handleCityInputClick}
          readOnly
        />
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
        )} */}

      <div className={clsx(styles.iconPlace)}>
        <i className="fa-solid fa-location-dot"></i>
      </div>
      
      <div className={clsx(styles.selectContainer)}>
        <select
              className={clsx(styles.select)}
              value={addressInput}
              // onChange={(e) => setAddressInput(e.target.value)}
              onChange={(e) => {
                const selectedCity = e.target.value;
                setAddressInput(selectedCity === "All cities" ? "" : selectedCity);
              }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
      </div>
        <input
          type="text"
          placeholder="Enter company"
          className={clsx(styles.jobInput)}
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
        />
        <button
          variant="primary" 
          className={clsx(styles.searchButton)}
          onClick={handleSearch}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          Search
        </button>
      </div>
    </div>
            {/* searchBar */}

      <div>
        <button onClick={handleOpenModal}>Thêm công ty</button>
      </div>
      
{/* results search */}
{results && (
  <div className={clsx(styles.results)}>
    <p>Kết quả</p>
    {/* <div className={clsx(styles.tabs)}>
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
      <button
        className={clsx(styles.tabButton, activeTabSearch === 'pending' && styles.active)}
        onClick={() => setActiveTabSearch('pending')}
      >
        Pending
      </button>
    </div> */}

    {/* Tab result content */}
    <div className={clsx(styles.tabContent)}>
      {/* All Companies */}
      {activeTabSearch === 'all' && (
        <div>
          {/* <h3>All Jobs</h3> */}
          <ul>
            {results.map((company) => (
              <Link key={company._id} to={`/detailCompanyAdmin/${company._id}`}>
                <li>{company.name}</li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      {/* {activeTabSearch === 'accepted' && (
        <div>
          <h3>Accepted</h3>
          <ul>
            {results
              .filter((company) => company.status === true)
              .map((company) => (
                <Link key={company._id} to={`/detailCompanyAdmin/${company._id}`}>
                  <li>{company.name}</li>
                </Link>
              ))}
          </ul>
        </div>
      )} */}

      {/* {activeTabSearch === 'rejected' && (
        <div>
          <h3>Rejected</h3>
          <ul>
            {results
              .filter((company) => company.status === false)
              .map((company) => (
                <Link key={company._id} to={`/detailCompanyAdmin/${company._id}`}>
                  <li>{company.name}</li>
                </Link>
              ))}
          </ul>
        </div>
      )} */}

      {/* {activeTabSearch === 'pending' && (
        <div>
          <h3>Pending</h3>
          <ul>
            {results
              .filter((company) => company.status === undefined)
              .map((company) => (
                <Link key={company._id} to={`/detailCompanyAdmin/${company._id}`}>
                  <li>{company.name}</li>
                </Link>
              ))}
          </ul>
        </div>
      )} */}
    </div>
  </div>
)}

      {/* tab content */}
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
            <p>Danh sách tất cả công ty:</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesAll.length > 0 ? (
                  companiesAll.map((company) => (
                    <div key={company._id}>
                      <Link to={`/detailCompanyAdmin/${company._id}`} className={clsx(styles.companycard)}>
                        <h3>{company.name}</h3>
                        <p>Status: {""+company.status}</p>
                      </Link>
                        <button onClick={() => handleDisableCompany(company._id, company.isActive)}>
                          {company.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
                        {/* <button>Xóa tài khoản</button> */}
                          <hr />
                    </div>
                      
                  ))
                ) : (
                  <div>No companies available</div>
                )}
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
          </div>
        )}
        {activeTab === 'accepted' && (
          <div>
            <p>Danh sách công ty đã chấp nhận: {companiesAccepted.length}</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesAccepted.length > 0 ? (
                  companiesAccepted.map((company) => (
                    <div key={company._id}>
                    <Link to={`/detailCompanyAdmin/${company._id}`} className={clsx(styles.companycard)}>
                      <h3>Company name: {company.name}</h3>
                      <p>Status: {""+company.status}</p>
                    </Link>
                      <button>Vô hiệu hóa</button>
                      {/* <button>Xóa tài khoản</button> */}
                    </div>
                  ))
                ) : (
                  <div>No companies available</div>
                )}
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
          </div>
        )}
        {activeTab === 'pending' && (
          <div>
            <p>Danh sách công ty chưa được phê duyệt: {companiesPending.length}</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesPending.length > 0 ? (
                  companiesPending.map((company) => (
                    <div key={company._id}>
                    <Link to={`/detailCompanyAdmin/${company._id}`} className={clsx(styles.companycard)}>
                      <h3>Company name: {company.name}</h3>
                      <p>Status: {""+company.status}</p>
                      </Link>
                      <button
                        className={clsx(styles.button, { [styles.accepted]: buttonState === 'accepted', [styles.disabled]: buttonState === 'rejected' })}
                        onClick={() => handleStatusUpdate(company._id, true)}
                        disabled={buttonState === 'accepted'}
                      >
                        Accept
                      </button>
                      <button
                        className={clsx(styles.button, { [styles.rejected]: buttonState === 'rejected', [styles.disabled]: buttonState === 'accepted' })}
                        onClick={() => handleStatusUpdate(company._id, false)}
                        disabled={buttonState === 'rejected'}
                      >
                        Reject
                      </button>
                      {/* <button>Bản cập nhật</button> */}
                      <button>Vô hiệu hóa</button>
                      {/* <button>Xóa Tài Khoản</button> */}
                    </div>
                  ))
                ) : (
                  <div>No companies available</div>
                )}
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
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CompanyManagement;
