import React, { useEffect, useState, useCallback } from 'react';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiWithToken } from '../../api';
import styles from './jobsRecommended.module.scss';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';
import Swal from 'sweetalert2';
import { getUserStorage } from '../../Utils/valid';
import { useTranslation } from 'react-i18next';

const JobsRecommended = ({ candidateId }) => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [categories, setCategories] = useState({});
  const [index, setIndex] = useState(0); // Current index for sliding

  const [savedJobs, setSavedJobs] = useState({});
  const [userRole, setUserRole] = useState(null);

  const fetchJobs = useCallback(async () => {
    window.scrollTo(0, 0);
    try {
      setLoading(true);

      // console.log('candidateId recommend', candidateId);
      const result = await postApiWithToken(`/job/recommended-for-candidate`, {candidateId: candidateId});

      const fetchedJobs = result.data.matchingJobs || [];
      setJobs(fetchedJobs);
      // console.log(fetchedJobs);

      const filteredJobs = fetchedJobs.filter((job) => job.pendingUpdates === null);

      //lấy chi tiết company theo job
      const jobsWithCompany = await Promise.all(
        // fetchedJobs.map(async (job) => {
          filteredJobs.map(async (job) => {
          if (job.companyId) {
            const companyResult = await getAPiNoneToken(`/company/${job.companyId}`);
            // console.log(companyResult);
            
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
      
      const userData = getUserStorage()?.user;
      setUserRole(userData?.role || null);

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
      
      if (userData?.role === 'candidate') {
        const savedJobsResponse = await getApiWithToken(`/save-job/gets/${userData._id}`);
        const savedJobs = savedJobsResponse?.data?.savedJobs || [];
        const savedJobMap = savedJobs.reduce((acc, savedJob) => {
          acc[savedJob.job._id] = {
            savedJobId: savedJob._id,
            isSaved: true,
          };
          return acc;
        }, {});
        setSavedJobs(savedJobMap);
      }
    } catch (err) {
      // setError('Failed to fetch jobs');
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

  const handleSaveJob = async (jobId) => {
    const userData = getUserStorage()?.user;
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      // console.log('savedJobs[jobId] là boolean',savedJobs[jobId]);
      
      if (savedJobs[jobId]) {
        // console.log(1); 
        const savedJobEntry = savedJobs[jobId];
        const savedJobId = savedJobEntry.savedJobId;
        // const savedJodId = Object.keys(savedJobs).find(savedId => savedId === jobId);

        // console.log('savedJobs',savedJobs);
        // console.log('savedJobId là id job',savedJobId);
        
        if(savedJobId) {
          // console.log(3);
          
          await deleteApiWithToken(`/save-job/delete/${savedJobId}`);//savedJobId chứ không phải jobId
          setSavedJobs(prev => ({ ...prev, [jobId]: false }));
          Swal.fire('Đã bỏ lưu tin!', '', 'success');
        }
      } else {
        await postApiWithToken(`/save-job/create`, { candidateId: userData._id, jobId });
        setSavedJobs(prev => ({ ...prev, [jobId]: true }));
        Swal.fire('Lưu tin thành công!', '', 'success');
      }
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể lưu tin hoặc bỏ lưu tin', 'error');
    }
  };

  useEffect(()=>{
    fetchJobs();
  }, [fetchJobs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Rotate jobs based on the current index
  const displayedJobs = [...jobs.slice(index), ...jobs.slice(0, index)];

  return (
    <div className={clsx(styles.joblist)}>
      {
        displayedJobs.length > 0 &&
        <p className={clsx(styles.textTitle)}>{t('recommendJob.recommendJob')}</p>
      }
      <div className={clsx(styles.jobContainer)}>
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <div key={job.jobId} className={clsx(styles.jobcard)}>
              <div className={clsx(styles.content)}>
            <Link to={`/detailJob/${job.jobId}`} className={clsx(styles.linkJob)} target="_blank" rel="noopener noreferrer">
                <img src={job.companyAvatar} alt="Logo" className={clsx(styles.avatar)} />
                </Link>
                <div className={clsx(styles.text)}>
                  <div className={clsx(styles.title)}>
                    <Link to={`/detailJob/${job.jobId}`} className={clsx(styles.linkJob)} target="_blank" rel="noopener noreferrer">
                    <p><strong>{job.title}</strong></p>
                    </Link>
                    {(userRole === 'candidate' || !userRole) && (
                      <div onClick={() => handleSaveJob(job.jobId)}>
                        <i 
                          className={clsx(savedJobs[job.jobId] ? 'fa-solid fa-heart' : 'fa-regular fa-heart')}
                          style={{color: savedJobs[job.jobId]?'red':'gray'}}                      
                          ></i>
                      </div>
                    )}
                  </div>
                  <Link to={`/detailJob/${job.jobId}`} className={clsx(styles.linkJob)} target="_blank" rel="noopener noreferrer">
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
            </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          null
          // <div>Vui lòng cập nhật kỹ năng của bạn ở profile để được gợi ý việc làm phù hợp</div>
        )}
      </div>
    </div>
  );
};

export default JobsRecommended;
