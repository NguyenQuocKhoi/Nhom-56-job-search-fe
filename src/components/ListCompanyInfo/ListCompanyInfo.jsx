import React, { useEffect, useState, useCallback } from 'react';
import { getAPiNoneToken } from '../../api';
import styles from './listCompanyInfo.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const ListCompanyInfo = () => {
  const [companies, setCompanies] = useState([]);
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
      const result = await getAPiNoneToken(`/company/get-all-companies?page=${page}&limit=${pagination.limit}`);
      setCompanies(result.data.companies);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.companylist)}>
      <div className={clsx(styles.companyContainer)}>
        {companies.length > 0 ? (
          companies.map((company) => (
            <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}>
              <h3><strong>Company name:</strong> {company.name}</h3>
              <p><strong>Address:</strong> {company.address}</p>
              <p><strong>Website:</strong> {company.website}</p>
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
  );
};

export default ListCompanyInfo;
