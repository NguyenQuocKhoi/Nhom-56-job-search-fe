import React, { useEffect, useState, useCallback } from 'react';
import { getAPiNoneToken } from '../../api';
import styles from './listJobInfo.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.jpg';

const ListJobInfo = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 15, //16
  });

  // const [categories, setCategories] = useState({});
  // const [skills, setSkills] = useState([]);

  //lọc
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState('salary');
  const [filterValue, setFilterValue] = useState('All');

  const fetchJobs = useCallback(async (page = 1) => {
    window.scrollTo(0, 0);

    try {
      setLoading(true);
      const result = await getAPiNoneToken(`/job/get-all-job?page=${page}&limit=${pagination.limit}`);
      const fetchedJobs = result.data.jobs.filter(job => job.status === true);
      setJobs(fetchedJobs);
      
      console.log(fetchedJobs);
      
      setPagination(prev => ({
        ...prev,
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
      }));

      //requirements
      const jobsWithSkills = await Promise.all(
        fetchedJobs.map(async (job) => {
          const skillPromises = job.requirementSkills.map(async (skillId) => {
            const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
            return skillResult.data.skill.skillName;
          });
          
          const skills = await Promise.all(skillPromises);
          return { ...job, skills }; // Add fetched skills to each job object
        })
      );
      setJobs(jobsWithSkills);

    // // Fetch category names
    //   const categoryIds = fetchedJobs
    //   .map((job) => job.category)
    //   .filter((categoryId) => categoryId); // Filter out undefined or null categories

    // const uniqueCategoryIds = [...new Set(categoryIds)];

    // // Fetch all categories in parallel
    // const categoryPromises = uniqueCategoryIds.map((categoryId) =>
    //   getAPiNoneToken(`/category/${categoryId}`)
    // );

    // const categoryResponses = await Promise.all(categoryPromises);
    // const categoryMap = {};

    // categoryResponses.forEach((response) => {
    //   const { _id, name } = response.data.category;
    //   categoryMap[_id] = name;
    // });

    // setCategories(categoryMap);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
  };

  //lọc
  const handleFilterChange = (e) => {
    setFilterCriteria(e.target.value);
    setFilterValue('All'); // Reset value when changing criteria
  };

  const handleFilterValueChange = (value) => {
    setFilterValue(value);
  };

  const applyFilters = () => {
    let filtered = [...jobs];
    
    if (filterValue !== 'All') {
      filtered = filtered.filter(job => {
        if (filterCriteria === 'salary') {
          return job.salary.includes(filterValue);
        }
        if (filterCriteria === 'expiredAt') {
          const monthYear = new Date(job.expiredAt).toLocaleString('default', { month: 'long', year: 'numeric' });
          return monthYear === filterValue;
        }
        if (filterCriteria === 'type') {
          return job.type === filterValue;
        }
        if (filterCriteria === 'position') {
          return job.position === filterValue;
        }
        return true;
      });
    }
    
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterCriteria, filterValue, jobs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.joblist)}>
      <div className={clsx(styles.filter)}>
      <div>Lọc theo:</div>
        <select className={clsx(styles.locationInput)} value={filterCriteria} onChange={handleFilterChange}>
          <option value="salary">Lương</option>
          <option value="type">Loại công việc</option>
          <option value="expiredAt">Hạn nộp hồ sơ</option>
          <option value="position">Vị trí</option>
        </select>

        <div className={clsx(styles.filterOptions)}>
          <button onClick={() => handleFilterValueChange('All')} className={clsx(filterValue === 'All' && styles.active)}>Tất cả</button>
          {filterCriteria === 'salary' && (
            <>
              <button onClick={() => handleFilterValueChange('1000 - 2000$')} className={clsx(filterValue === '1000 - 2000$' && styles.active)}>1000 - 2000$</button>
              <button onClick={() => handleFilterValueChange('2000 - 3000$')} className={clsx(filterValue === '2000 - 3000$' && styles.active)}>2000 - 3000$</button>
              <button onClick={() => handleFilterValueChange('Thỏa thuận')} className={clsx(filterValue === 'Thỏa thuận' && styles.active)}>Thỏa thuận</button>
            </>
          )}
          {filterCriteria === 'expiredAt' && (
            <>
              <button onClick={() => handleFilterValueChange('9/2024')} className={clsx(filterValue === '9/2024' && styles.active)}>9/2024</button>
              <button onClick={() => handleFilterValueChange('10/2024')} className={clsx(filterValue === '10/2024' && styles.active)}>10/2024</button>
              <button onClick={() => handleFilterValueChange('11/2024')} className={clsx(filterValue === '11/2024' && styles.active)}>11/2024</button>
              <button onClick={() => handleFilterValueChange('12/2024')} className={clsx(filterValue === '12/2024' && styles.active)}>12/2024</button>
            </>
          )}
          {filterCriteria === 'type' && (
            <>
              <button onClick={() => handleFilterValueChange('fulltime')} className={clsx(filterValue === 'fulltime' && styles.active)}>Full time</button>
              <button onClick={() => handleFilterValueChange('parttime')} className={clsx(filterValue === 'parttime' && styles.active)}>Part time</button>
            </>
          )}
          {filterCriteria === 'position' && (
            <>
              <button onClick={() => handleFilterValueChange('Full Stack Developer')} className={clsx(filterValue === 'Full Stack Developer' && styles.active)}>Full Stack Developer</button>
              <button onClick={() => handleFilterValueChange('Senior Developer')} className={clsx(filterValue === 'Senior Developer' && styles.active)}>Senior Developer</button>
            </>
          )}
        </div>
      </div>

      <div className={clsx(styles.jobContainer)}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            job && job._id && job.company && job.company._id ? (
            <div key={job._id} className={clsx(styles.jobcard)}>
              <div className={clsx(styles.content)}>
                <Link to={`/detailCompany/${job.company._id}`} target="_blank" rel="noopener noreferrer">
                  <img src={job.company.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />
                </Link>
                <Link to={`/detailJob/${job._id}`} 
                  // target="_blank" rel="noopener noreferrer" 
                  className={clsx(styles.linkJob)}>
                  <div className={clsx(styles.text)}>
                    <div className={clsx(styles.title)}>
                      <p><strong>{job.title}</strong></p>
                      <i className="fa-regular fa-heart"></i>
                    </div>
                    <div className={clsx(styles.describe)}>
                      <p>Company: {job.company.name}</p>
                      <p>Address: {job.street}, {job.city}</p>
                      <p>Salary: {job.salary}</p>
                      {/* <p>Interest: {job.interest}</p> */}
                      {/* <p>Requirements: {job.requirements}</p> */}
                      {/* <p>Category: {categories[job.category] || 'No Category'}</p> */}
                      {/* <p>Skill:</p> */}
                      {job.skills && job.skills.length > 0 ? (
                        <div className={clsx(styles.skills)}>
                          {job.skills.map((skill, index) => (
                            <p key={index} className={clsx(styles.skill)}>{skill}</p>
                          ))}
                        </div>
                      ) : (
                        <span>No skills</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            ) : null
          ))
        ) : (
          <div>No jobs available</div>
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

export default ListJobInfo;
