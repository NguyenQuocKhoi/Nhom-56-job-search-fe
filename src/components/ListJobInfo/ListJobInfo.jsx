import React, { useEffect, useState, useCallback } from 'react';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiNoneToken, postApiWithToken } from '../../api';
import styles from './listJobInfo.module.scss';
import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';
import { getUserStorage } from '../../Utils/valid';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const ListJobInfo = () => {
  const { t, i18n } = useTranslation();

  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 12, //15,16
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

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAPiNoneToken('/category/get-all');
        setCategories(response.data.categories); // Lưu danh sách category vào state
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchCategories();
  }, []);

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
      setUserRole(userData?.role || null);
      // const userRole = userData?.role;
      // setUserRole(userRole);

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
      
      // console.log("savedJobs.length",savedJobs.length);    
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
      // console.log(error);
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

  // const handleFilterValueChange = (value) => {
  //   setFilterValue(value.toLowerCase()); // Lưu giá trị ở dạng chữ thường
  //   applyFilters(); // Gọi applyFilters để làm mới danh sách công việc đã lọc
  // };  

  const applyFilters = useCallback(async () => {
    let filtered = [...jobs];

    const parseSalary = (salary) => {
      if (salary.toLowerCase().includes('thỏa thuận')) {
        return null;       }
  
      const cleanSalary = salary.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
      const salaryValue = parseInt(cleanSalary, 10);
  
      return salaryValue || 0; // Return 0 if parsing fails
    };

    if (filterCriteria === 'category') {
      try {
        if (filterValue.toLowerCase() === 'all') {          
          filtered = jobs.filter(job => job.status === true);
        } else {
          const response = await postApiNoneToken('/category/get-job', { categoryName: filterValue });
          const fetchedJobs = response.data.jobs.filter(job => job.status === true);
          // console.log("filtered category",filtered.map(job => job.requirementSkills));//////////
          const jobsWithSkills = await Promise.all(
            fetchedJobs.map(async (job) => {
              const skillPromises = job.requirementSkills.map(async (skillId) => {
                const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
                return skillResult.data.skill.skillName;
              });
  
              const skills = await Promise.all(skillPromises);
              return { ...job, skills }; // Thêm skills vào từng công việc
            })
          );
  
          filtered = jobsWithSkills;
          // if (!filtered.length) {
          //   filtered = [];
          // }
        }
      } catch (error) {
        filtered = [];
        console.error('Error fetching jobs by category:', error);
      }
    } else if (filterValue !== 'All') {
      filtered = filtered.filter(job => {
        const jobSalaryValue = parseSalary(job.salary);

      // Kiểm tra cho "thỏa thuận" không phân biệt hoa thường
      if (filterValue.toLowerCase() === 'thỏa thuận') {
        // Nếu bộ lọc là "thỏa thuận", kiểm tra xem lương của công việc có là null không
        return jobSalaryValue === null;
      }

      // Đối với các giá trị bộ lọc khác (như khoảng lương), thực hiện logic tiếp theo
      const [minSalary, maxSalary] = filterValue.split('-').map(val => {
        return parseSalary(val.trim().replace(/\$|triệu|tr/g, '').trim() + ' triệu');
      });

      if (filterCriteria === 'salary') {
        // Kiểm tra xem lương của công việc có nằm trong khoảng được chọn không
        return jobSalaryValue !== null && jobSalaryValue >= minSalary && jobSalaryValue <= maxSalary;
      }

        if (filterCriteria === 'expiredAt') {
          const jobExpiredDate = new Date(job.expiredAt);
          const jobMonth = jobExpiredDate.getMonth() + 1; // getMonth() is 0-based, so add 1 to get the correct month.
          const jobYear = jobExpiredDate.getFullYear();
  
          // Assuming filterValue is in format "MM/YYYY"
          const [selectedMonth, selectedYear] = filterValue.split('/');
  
          return jobMonth === parseInt(selectedMonth) && jobYear.toString() === selectedYear;
        }
        if (filterCriteria === 'type') return job.type === filterValue;
        
        // if (filterCriteria === 'position') {
        //   const normalizedJobPosition = job.position.toLowerCase().replace(/\s+/g, ''); // Xóa khoảng trắng
        //   const normalizedFilterValue = filterValue.toLowerCase().replace(/\s+/g, ''); // Xóa khoảng trắng
        //   return normalizedJobPosition === normalizedFilterValue; // So sánh
        // }  
        
        return true;
      });
    }

    setFilteredJobs(filtered);
    // console.log("all",filtered);
    
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

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>{error}</div>;

  return (
    <div className={clsx(styles.joblist)}>
      {/* <p className={clsx(styles.textTitle)}>Việc làm tốt nhất</p> */}
      <p className={clsx(styles.textTitle)}>{t('listJobInfo.bestJob')}</p>
      <div className={clsx(styles.filter)}>
        <div className={clsx(styles.textLocContainer)}>
        <div className={clsx(styles.loc)}>{t('listJobInfo.filter')}</div>
        <select className={clsx(styles.locationInput)} value={filterCriteria} onChange={handleFilterChange}>
          <option value="salary">{t('listJobInfo.salary')}</option>
          <option value="type">{t('listJobInfo.type')}</option>
          <option value="expiredAt">{t('listJobInfo.expired')}</option>
          {/* <option value="position">{t('listJobInfo.position')}</option> */}
          <option value="category">{t('listJobInfo.category')}</option>
        </select>
        </div>

        <div className={clsx(styles.filterOptions)}>
          <button onClick={() => handleFilterValueChange('All')} className={clsx(filterValue === 'All' && styles.active)}>{t('listJobInfo.all')}</button>
          {filterCriteria === 'salary' && (
            <>
              {/* <button onClick={() => handleFilterValueChange('1000 - 2000$')} className={clsx(filterValue === '1000 - 2000$' && styles.active)}>1000 - 2000$</button> */}
              {/* <button onClick={() => handleFilterValueChange('2000 - 3000$')} className={clsx(filterValue === '2000 - 3000$' && styles.active)}>2000 - 3000$</button> */}
              <button onClick={() => handleFilterValueChange('1-9 triệu')} className={clsx(filterValue === '1-9 triệu' && styles.active)}>1-9 triệu</button>
              <button onClick={() => handleFilterValueChange('10-15 triệu')} className={clsx(filterValue === '10-15 triệu' && styles.active)}>10-15 triệu</button>
              <button onClick={() => handleFilterValueChange('16-25 triệu')} className={clsx(filterValue === '16-25 triệu' && styles.active)}>16-25 triệu</button>
              <button onClick={() => handleFilterValueChange('26-35 triệu')} className={clsx(filterValue === '26-35 triệu' && styles.active)}>26-35 triệu</button>
              <button onClick={() => handleFilterValueChange('36-45 triệu')} className={clsx(filterValue === '36-45 triệu' && styles.active)}>36-45 triệu</button>
              {/* <button onClick={() => handleFilterValueChange('trên 50 triệu')} className={clsx(filterValue === 'trên 50 triệu' && styles.active)}>trên 50 triệu</button> */}
              <button 
                onClick={() => handleFilterValueChange('Thỏa thuận')} 
                className={clsx(filterValue === 'thỏa thuận' && styles.active)}
              >
                Thỏa thuận
              </button>
            </>
          )}
          {filterCriteria === 'expiredAt' && (
            <>
              <button onClick={() => handleFilterValueChange('11/2024')} className={clsx(filterValue === '11/2024' && styles.active)}>11/2024</button>
              <button onClick={() => handleFilterValueChange('12/2024')} className={clsx(filterValue === '12/2024' && styles.active)}>12/2024</button>
              <button onClick={() => handleFilterValueChange('01/2025')} className={clsx(filterValue === '01/2025' && styles.active)}>01/2025</button>
              <button onClick={() => handleFilterValueChange('02/2025')} className={clsx(filterValue === '02/2025' && styles.active)}>02/2025</button>
            </>
          )}
          {filterCriteria === 'type' && (
            <>
              <button onClick={() => handleFilterValueChange('fulltime')} className={clsx(filterValue === 'fulltime' && styles.active)}>{t('listJobInfo.fulltime')}</button>
              <button onClick={() => handleFilterValueChange('parttime')} className={clsx(filterValue === 'parttime' && styles.active)}>{t('listJobInfo.parttime')}</button>
              <button onClick={() => handleFilterValueChange('intern')} className={clsx(filterValue === 'intern' && styles.active)}>{t('listJobInfo.intern')}</button>
            </>
          )}
          {/* {filterCriteria === 'position' && (
            <>
              <button onClick={() => handleFilterValueChange('Fullstack developer')} className={clsx(filterValue === 'Fullstack developer' && styles.active)}>Fullstack developer</button>
              <button onClick={() => handleFilterValueChange('Senior Developer')} className={clsx(filterValue === 'Senior Developer' && styles.active)}>Senior Developer</button>
              <button onClick={() => handleFilterValueChange('lập trình viên')} className={clsx(filterValue === 'lập trình viên' && styles.active)}>{t('listJobInfo.dev')}</button>
            </>
          )} */}
          {filterCriteria === 'category' && (
            <div className={styles.categoryFilter}>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleFilterValueChange(category.name)}
                  className={clsx(filterValue === category.name && styles.active)}
                >
                  {category.name}
                </button>
              ))}
            </div>
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
                    <Link to={`/detailJob/${job._id}`} className={clsx(styles.linkJob)} 
                      target="_blank" rel="noopener noreferrer"
                    >
                      {job.pendingUpdates !== null && (<p style={{color: 'white', backgroundColor: 'lightcoral', width: '90%', display: 'flex',justifyContent: 'center', alignItems:'center', borderRadius: '3px'}}><strong>{t('detailJob.suspend')}</strong></p>)}
                      <p><strong>{job.title}</strong></p>
                    </Link>
                    {(userRole === 'candidate' || !userRole) && (
                  <div onClick={() => handleSaveJob(job._id)}>
                    <i 
                      className={clsx(savedJobs[job._id] ? 'fa-solid fa-heart' : 'fa-regular fa-heart')} 
                      style={{color: savedJobs[job._id]?'red':'gray'}}
                    ></i>
                  </div>
                )}
                    </div>
                    <Link to={`/detailJob/${job._id}`} className={clsx(styles.linkJob)} 
                      target="_blank" rel="noopener noreferrer"//
                    >
                    <div className={clsx(styles.describe)}>
                      <p>{job.company.name}</p>
                      <p>{t('detailJob.address')}: {job.street}, {job.city}</p>
                      <p>{t('listJobInfo.salary')}: {job.salary}</p>
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
          <div>{t('listJobInfo.noJob')}</div>
        )}
      </div>

      <div className={clsx(styles.pagination)}>
        {pagination.currentPage > 1 && (
          <button onClick={() => handlePageChange(pagination.currentPage - 1)}>
            <i className="fa-solid fa-angle-left"></i>
            {/* Previous */}
          </button>
        )}
        <span>{pagination.currentPage} / {pagination.totalPages} {t('listJobInfo.page')} </span>
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
