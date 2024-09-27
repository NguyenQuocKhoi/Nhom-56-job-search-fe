import React, { useEffect, useState, useCallback } from 'react';
import { getAPiNoneToken, postApiWithToken } from '../../api';
import styles from './jobsRecommended.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.png';

const JobsRecommended = ({ candidateId }) => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [categories, setCategories] = useState({});
  const [index, setIndex] = useState(0); // Current index for sliding

  const fetchJobs = useCallback(async () => {
    window.scrollTo(0, 0);
    try {
      setLoading(true);

      console.log('candidateId recommend', candidateId);
      const result = await postApiWithToken(`/job/recommended-for-candidate`, {candidateId: candidateId});

      const fetchedJobs = result.data.matchingJobs || [];
      setJobs(fetchedJobs);
      console.log(fetchedJobs);

      //lấy chi tiết company theo job
      const jobsWithCompany = await Promise.all(
        fetchedJobs.map(async (job) => {
          if (job.companyId) {
            const companyResult = await getAPiNoneToken(`/company/${job.companyId}`);
            console.log(companyResult);
            
            const companyData = companyResult.data.company;
            return {
              ...job,
              companyName: companyData.name || 'Unknown Company',
              companyAvatar: companyData.avatar || logo, // Use default logo if no avatar
            };
          }
          return { ...job, companyName: 'Unknown Company', companyAvatar: logo };
        })
      );
      

      //requirements
      const jobsWithSkills = await Promise.all(
        jobsWithCompany.map(async (job) => {
        // fetchedJobs.map(async (job) => {
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
      // const categoryIds = fetchedJobs
      //   .map((job) => job.category)
      //   .filter((categoryId) => categoryId);

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
  }, [candidateId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Set an interval to rotate jobs every 3 seconds
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % jobs.length);
    }, 5000);

    return () => clearInterval(interval); // Clear interval on unmount
  }, [jobs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Rotate jobs based on the current index
  const displayedJobs = [...jobs.slice(index), ...jobs.slice(0, index)];

  return (
    <div className={clsx(styles.joblist)}>
      <div className={clsx(styles.jobContainer)}>
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <Link key={job.jobId} to={`/detailJob/${job.jobId}`} className={clsx(styles.jobcard)}>
              <div className={clsx(styles.content)}>
                <img src={job.companyAvatar} alt="Logo" className={clsx(styles.avatar)} />
                <div className={clsx(styles.text)}>
                  <div className={clsx(styles.title)}>
                    <p><strong>{job.title}</strong></p>
                    <i className="fa-regular fa-heart"></i>
                  </div>
                  <div className={clsx(styles.describe)}>
                    <p>Company: {job.companyName}</p>
                    <p>Address: {job.street}, {job.city}</p>
                    <p>Salary: {job.salary}</p>
                    {/* <p>Category: {categories[job.category] || 'No Category'}</p> */}
                    {job.skills && job.skills.length > 0 ? (
                        <div  className={clsx(styles.skills)}>
                          {job.skills.map((skill, index) => (
                            <p key={index} className={clsx(styles.skill)}>{skill}</p>
                          ))}
                        </div>
                      ) : (
                        <span>No skills</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div>No jobs available</div>
        )}
      </div>
    </div>
  );
};

export default JobsRecommended;
