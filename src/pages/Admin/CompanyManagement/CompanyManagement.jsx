import React, { useCallback, useEffect, useState } from 'react';
import styles from '../CompanyManagement/companyManagement.module.scss';
import { getAPiNoneToken } from '../../../api';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const CompanyManagement = () => {
  const [activeTab, setActiveTab] = useState('accepted');
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
  const fetchCompanies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/company/get-all?page=${page}&limit=${pagination.limit}`);

      console.log(result.data.companies);


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

  //
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.jobManagement}>
      <h2>Quản lí việc làm</h2>
      
      <div className={styles.tabs}>
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
        {activeTab === 'accepted' && (
          <div>
            <p>Danh sách công ty đã chấp nhận: {companiesAccepted.length}</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesAccepted.length > 0 ? (
                  companiesAccepted.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
                      <h3>Company name: {company.name}</h3>
                      <p>Status: {company.status}</p>
                      <button>Vô hiệu hóa</button>
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
        {activeTab === 'rejected' && (
          <div>
            <p>Danh sách công ty đã từ chối: {companiesRejected.length}</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesRejected.length > 0 ? (
                  companiesRejected.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
                      <h3>Company name: {company.name}</h3>
                      <p>Status: {company.status}</p>
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
        {activeTab === 'pending' && (
          <div>
            <p>Danh sách công ty chưa được phê duyệt: {companiesPending.length}</p>
            <div className={clsx(styles.companylist)}>
              <div className={clsx(styles.companyContainer)}>
                {companiesPending.length > 0 ? (
                  companiesPending.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
                      <h3>Company name: {company.name}</h3>
                      <p>Status: {company.status}</p>
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
      </div>
    </div>
  );
};

export default CompanyManagement;
