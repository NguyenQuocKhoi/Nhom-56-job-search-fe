import React from 'react';
import clsx from 'clsx';
import styles from './featuredJobs.module.scss';
import ListJobInfo from '../ListJobInfo/ListJobInfo';
import ListCompanyInfo from '../ListCompanyInfo/ListCompanyInfo';

const FeaturedJobs = () => {

  


  return (
    <div className={clsx(styles.featuredJobs)}>
      <span>List Jobs</span>
        <ListJobInfo/>
      <span>List Companies</span>
        <ListCompanyInfo/>
    </div>
  );
};

export default FeaturedJobs;
