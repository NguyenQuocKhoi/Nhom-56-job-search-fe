import React, { useEffect, useState, useCallback } from 'react';
import { getAPiNoneToken } from '../../api';
import styles from './listCompanyInfo.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';


const ListCompanyInfo = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const { t, i18n } = useTranslation();

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

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.companylist)}>
      <p className={clsx(styles.textTitle)}>{t('listCompany.topCompany')}</p>
      <div className={clsx(styles.companyContainer)}>
        {companies.length > 0 ? (
          companies.map((company) => (
            <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)} 
              target="_blank" rel="noopener noreferrer"
            >
              <img src={company.avatar || logo} alt="Logo" className={clsx(styles.avatar)}/>
              <h3 className={clsx(styles.centeredText)}>{company.name}</h3>
            </Link>
          ))
        ) : (
          <div>Không có công ty để hiển thị</div>
        )}
      </div>
      <div className={clsx(styles.pagination)}>
        {pagination.currentPage > 1 && (
          <button onClick={() => handlePageChange(pagination.currentPage - 1)}>
            <i className="fa-solid fa-angle-left"></i>
          </button>
        )}
        <span>{pagination.currentPage} / {pagination.totalPages} trang </span>
        {pagination.currentPage < pagination.totalPages && (
          <button onClick={() => handlePageChange(pagination.currentPage + 1)}>
            <i className="fa-solid fa-angle-right"></i>            
          </button>
        )}
      </div>
    </div>
  );
};

export default ListCompanyInfo;
