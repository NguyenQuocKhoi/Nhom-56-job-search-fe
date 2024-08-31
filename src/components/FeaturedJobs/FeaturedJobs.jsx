import React, { useState } from 'react';
import { postApiNoneToken } from '../../api';
import clsx from 'clsx';
import styles from '../FeaturedJobs/featuredJobs.module.scss';
import ListJobInfo from '../ListJobInfo/ListJobInfo';
import ListCompanyInfo from '../ListCompanyInfo/ListCompanyInfo';

const FeaturedJobs = () => {
  const [addressInput, setAddressInput] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (event) => {
    event.preventDefault();

    try {
      const searchParams = {
        search: jobInput,
        ...(addressInput && { address: addressInput })
      };

      const response = await postApiNoneToken('/user/search', searchParams);

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };

  return (
    <div className={clsx(styles.searchComponent)}>
      <form onSubmit={handleSearch} className={clsx(styles.searchBar)}>
        <div className={clsx(styles.form)}>
          <input
            className={clsx(styles.locationInput)}
            type="text"
            id="address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter address"
          />
          <input
            className={clsx(styles.jobInput)}
            type="text"
            id="search"
            value={jobInput}
            onChange={(e) => setJobInput(e.target.value)}
            placeholder="Enter job title, skill, etc."
          />
          <button type="submit" className={clsx(styles.searchButton)}>Search</button>
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
                    <li key={job._id}>{job.title}</li>
                  ))}
                </ul>
                <h3>Companies</h3>
                <ul>
                  {results.companies.map((company) => (
                    <li key={company._id}>{company.name}</li>
                  ))}
                </ul>
                <h3>Candidates</h3>
                <ul>
                  {results.candidates.map((candidate) => (
                    <li key={candidate._id}>{candidate.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'jobs' && (
              <div>
                <h3>Jobs</h3>
                <ul>
                  {results.jobs.map((job) => (
                    <li key={job._id}>{job.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'companies' && (
              <div>
                <h3>Companies</h3>
                <ul>
                  {results.companies.map((company) => (
                    <li key={company._id}>{company.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'candidates' && (
              <div>
                <h3>Candidates</h3>
                <ul>
                  {results.candidates.map((candidate) => (
                    <li key={candidate._id}>{candidate.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <ListJobInfo/>
      <ListCompanyInfo/>
    </div>
  );
};

export default FeaturedJobs;
