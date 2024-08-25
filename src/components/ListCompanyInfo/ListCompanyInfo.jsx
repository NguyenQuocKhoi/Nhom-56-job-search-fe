import React, { useEffect, useState } from 'react';
import { getAPiNoneToken } from '../../api';
import styles from './listCompanyInfo.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const ListCompanyInfo = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const result = await getAPiNoneToken('/company/get-all');
        setJobs(result.data.companies);
      } catch (err) {
        setError('Failed to fetch companies');
      }
    };

    fetchCompany();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.companylist)}>
      {jobs.map((company) => (
        <Link  key={company._id} to={`/detailCompany/${company._id}`}>
          <div className={clsx(styles.companycard)}>
            <h3><strong>Company name:</strong> {company.name}</h3>
            <p><strong>Address:</strong> {company.address}</p>
            <p><strong>Website:</strong> {company.website}</p>
          </div>
        </Link>
      ))}
    </div>

  );
};

export default ListCompanyInfo;
