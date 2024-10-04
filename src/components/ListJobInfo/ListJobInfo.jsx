import React, { useEffect, useState, useCallback } from 'react';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiWithToken } from '../../api';
import styles from './listJobInfo.module.scss';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';
import { getUserStorage } from '../../Utils/valid';
import Swal from 'sweetalert2';

const ListJobInfo = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 15, //16
  });

  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  // const [job, setJob] = useState(null);
  // const [isSaved, setIsSaved] = useState(false);
  const [savedJobs, setSavedJobs] = useState({});

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
      // setJobs(fetchedJobs);
      
      // console.log(fetchedJobs);
      
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
      setFilteredJobs(jobsWithSkills);//

      const userData = getUserStorage()?.user;
      // const userRole = userData?.role;
      // setUserRole(userRole);
      setUserRole(userData?.role || null);

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
    
    if (userData && userData.role === 'candidate') {
      try{
      const savedJobsResponse = await getApiWithToken(`/save-job/gets/${userData._id}`);
      const savedJobs = savedJobsResponse?.data?.savedJobs || [];
      // console.log('savedJobs',savedJobs);
      
      if(savedJobs.length > 0){
        const savedJobMap = savedJobs.reduce((acc, savedJob) => {
          acc[savedJob.job._id] = {
            savedJobId: savedJob._id,
            isSaved: true
          };
          return acc;
        }, {});
        // console.log('savedJobmap',savedJobMap);
        
        setSavedJobs(savedJobMap);
      }else{
        setSavedJobs({});
      }
    }catch(error){
      console.log(error);
    }
    }
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
  };

  //lọc
  const handleFilterChange = (e) => {
    setFilterCriteria(e.target.value);
    setFilterValue('All');
  };

  const handleFilterValueChange = (value) => {
    setFilterValue(value);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...jobs];

    if (filterValue !== 'All') {
      filtered = filtered.filter(job => {
        if (filterCriteria === 'salary') return job.salary.includes(filterValue);
        if (filterCriteria === 'expiredAt') {
          const monthYear = new Date(job.expiredAt).toLocaleString('default', { month: 'long', year: 'numeric' });
          return monthYear === filterValue;
        }
        if (filterCriteria === 'type') return job.type === filterValue;
        if (filterCriteria === 'position') return job.position === filterValue;
        return true;
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, filterCriteria, filterValue]);

  useEffect(() => {
    applyFilters();
  }, [filterCriteria, filterValue, jobs]);

  const handleSaveJob = async (jobId) => {
    const userData = getUserStorage()?.user;
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      console.log('savedJobs[jobId] là boolean',savedJobs[jobId]);
      
      if (savedJobs[jobId]) {
        console.log(1); 
        const savedJobEntry = savedJobs[jobId];
        const savedJobId = savedJobEntry.savedJobId;
        // const savedJodId = Object.keys(savedJobs).find(savedId => savedId === jobId);

        console.log('savedJobs',savedJobs);
        console.log('savedJobId là id job',savedJobId);
        
        if(savedJobId) {
          console.log(3);
          
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

  return (
    <div className={clsx(styles.joblist)}>
      <p className={clsx(styles.textTitle)}>Việc làm tốt nhất</p>
      <div className={clsx(styles.filter)}>
      <div className={clsx(styles.loc)}>Lọc theo:</div>
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
                {/* <Link to={`/detailJob/${job._id}`}  */}
                  {/* target="_blank" rel="noopener noreferrer"  */}
                  {/* className={clsx(styles.linkJob)}> */}
                  <div className={clsx(styles.text)}>
                    <div className={clsx(styles.title)}>
                    <Link to={`/detailJob/${job._id}`} className={clsx(styles.linkJob)} target="_blank" rel="noopener noreferrer">
                      <p><strong>{job.title}</strong></p>
                    </Link>
                    {(userRole === 'candidate' || !userRole) && (
                  <div onClick={() => handleSaveJob(job._id)}>
                    <i className={clsx(savedJobs[job._id] ? 'fa-solid fa-heart' : 'fa-regular fa-heart')}></i>
                  </div>
                )}
                    </div>
                    <Link to={`/detailJob/${job._id}`} className={clsx(styles.linkJob)} 
                      target="_blank" rel="noopener noreferrer"
                    >
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
                    </Link>
                  </div>
                {/* </Link> */}

                {/* {(userRole === 'candidate' || !userRole) && (
                  <div onClick={() => handleSaveJob(job._id)}>
                    <i className={clsx(savedJobs[job._id] ? 'fa-solid fa-heart' : 'fa-regular fa-heart')}></i>
                  </div>
                )} */}
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
          <button onClick={() => handlePageChange(pagination.currentPage - 1)}>
            <i className="fa-solid fa-angle-left"></i>
            {/* Previous */}
          </button>
        )}
        <span>{pagination.currentPage} / {pagination.totalPages} trang </span>
        {pagination.currentPage < pagination.totalPages && (
          <button onClick={() => handlePageChange(pagination.currentPage + 1)}>
            <i className="fa-solid fa-angle-right"></i>
            {/* Next */}
          </button>
        )}
      </div>
    </div>
  );
};

export default ListJobInfo;
