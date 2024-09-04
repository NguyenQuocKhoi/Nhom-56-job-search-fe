import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAPiNoneToken } from '../../api';
import styles from './detailCompany.module.scss';
import clsx from 'clsx';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
// import ListCompanyInfo from '../../components/ListCompanyInfo/ListCompanyInfo';

const DetailCompany = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCompany = async () => {
      try {
        const result = await getAPiNoneToken(`/company/${id}`);
        setCompany(result.data.company);
      } catch (err) {
        setError('Failed to fetch company details');
      }
    };

    fetchCompany();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!company) return <div>Company not found</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.companyDetail)}>
        <div className={clsx(styles.title)}>
          <img src={company.avatar} alt="Logo" className={styles.avatar} />
          <h3><strong>Company name:</strong> {company.name}</h3>
        </div>
        <i class="fa-regular fa-building"></i>
        <p><strong>Address:</strong> {company.address}</p>
        <p><strong>Phone Number:</strong> {company.phoneNumber}</p>
        <p><strong>Website:</strong></p><a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a>
        <p><strong>Posted:</strong> {new Date(company.createdAt).toLocaleDateString()}</p>
        <p><strong>Expires:</strong> {new Date(company.expiredAt).toLocaleDateString()}</p>
        <p><strong>Email:</strong> {company.email}</p>
      </div>
      <span>Tin tuyển dụng của công ty:</span>
      {/* <span>Other Companies</span>
      <ListCompanyInfo/> */}
      <Footer/>
    </>
  );
};

export default DetailCompany;
