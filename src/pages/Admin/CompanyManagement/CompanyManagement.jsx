import React, { useCallback, useEffect, useState } from 'react';
import styles from '../CompanyManagement/companyManagement.module.scss';
import { getAPiNoneToken, postApiNoneToken, putApiWithToken } from '../../../api';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

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

  const fetchCompanies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/company/get-all?page=${page}&limit=${pagination.limit}`);

      console.log(result.data.companies);

      setCompaniesAll(result.data.companies);
      setCompaniesAccepted(result.data.companies.filter(company => company.status === true));
      setCompaniesRejected(result.data.companies.filter(company => company.status === false));
      setCompaniesPending(result.data.companies.filter(company => company.status === undefined));
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

      setButtonState(status);
      Swal.fire({
        icon: 'success',
        title: status === 'accepted' ? 'Accepted' : 'Rejected',
        text: `You have ${status} this company.`,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${status} the company.`,
      });
    }
  };

  // const handleDisable = async () => {
  //   //putApiWithToken(`/user/update-status/companyId`)
  // }

  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: companyInput.trim(),
        address: addressInput.trim() || '',
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.jobManagement}>
      <h2>Quản lí công ty</h2> 
      {/* searchBar */}
    <div className={clsx(styles.searchBar)}>
      <Form className={clsx(styles.form)}>
        {/* <Form.Control
          type="text"
          placeholder="Address"
          className={clsx(styles.jobInput)}
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
        /> */}
        <select
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
          </select>
        <Form.Control
          type="text"
          placeholder="Enter company"
          className={clsx(styles.jobInput)}
          value={companyInput}
          onChange={(e) => setCompanyInput(e.target.value)}
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
            {/* searchBar */}
      
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
      <button
        className={clsx(styles.tabButton, activeTabSearch === 'pending' && styles.active)}
        onClick={() => setActiveTabSearch('pending')}
      >
        Pending
      </button>
    </div>

    {/* Tab result content */}
    <div className={clsx(styles.tabContent)}>
      {/* All Companies */}
      {activeTabSearch === 'all' && (
        <div>
          <h3>All Jobs</h3>
          <ul>
            {results.map((company) => (
              <Link key={company._id} to={`/detailCompany/${company._id}`}>
                <li>{company.name}</li>
              </Link>
            ))}
          </ul>
        </div>
      )}

      {/* Accepted Companies */}
      {activeTabSearch === 'accepted' && (
        <div>
          <h3>Accepted</h3>
          <ul>
            {results
              .filter((company) => company.status === true)
              .map((company) => (
                <Link key={company._id} to={`/detailJob/${company._id}`}>
                  <li>{company.name}</li>
                </Link>
              ))}
          </ul>
        </div>
      )}

      {/* Rejected Companies */}
      {activeTabSearch === 'rejected' && (
        <div>
          <h3>Rejected</h3>
          <ul>
            {results
              .filter((company) => company.status === false)
              .map((company) => (
                <Link key={company._id} to={`/detailJob/${company._id}`}>
                  <li>{company.name}</li>
                </Link>
              ))}
          </ul>
        </div>
      )}

      {/* Pending Companies */}
      {activeTabSearch === 'pending' && (
        <div>
          <h3>Pending</h3>
          <ul>
            {results
              .filter((company) => company.status === undefined)
              .map((company) => (
                <Link key={company._id} to={`/detailJob/${company._id}`}>
                  <li>{company.name}</li>
                </Link>
              ))}
          </ul>
        </div>
      )}
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
                    <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
                      <h3>Company name: {company.name}</h3>
                      <p>Status: {""+company.status}</p>
                      {/* <button>Vô hiệu hóa</button> */}
                      {/* <button>Xóa tài khoản</button> */}
                    </Link>
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
                    <Link to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
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
        {activeTab === 'rejected' && (
          <div>
            <p>Danh sách công ty đã từ chối: {companiesRejected.length}</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesRejected.length > 0 ? (
                  companiesRejected.map((company) => (
                    <div key={company._id}>
                    <Link to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
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
                    <Link to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
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
                      <button>Bản cập nhật</button>
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
  );
};

export default CompanyManagement;
