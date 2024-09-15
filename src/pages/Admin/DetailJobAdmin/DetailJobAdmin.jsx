import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiWithToken, putApiWithToken } from '../../../api';
import styles from './detailJobAdmin.module.scss';
import clsx from 'clsx';
import { getUserStorage } from '../../../Utils/valid';
import Header from '../HeaderAdmin/HeaderAdmin';

const DetailJobAdmin = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJob = async () => {
      try {
        const result = await getAPiNoneToken(`/job/${jobId}`);
        if (result.data.job) {
          setJob(result.data.job);
  
          const categoryId = result.data.job.category;
          if (categoryId) {
            const categoryResult = await getAPiNoneToken(`/category/${categoryId}`);
            
            // console.log(categoryResult.data.category.name);
            setCategoryName(categoryResult.data.category.name);
          } else {
            setCategoryName("Unknown Category");
          }

          // const skillPromises = result.data.job.requirements.map(async (skillId) => {
          //   const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
          //   return skillResult.data.skill.skillName;
          // });
          
          // const fetchedSkills = await Promise.all(skillPromises);
          // setSkills(fetchedSkills);
          if (result.data.job.requirements && result.data.job.requirements.length > 0) {
            const skillPromises = result.data.job.requirements.map(async (skillId) => {
              const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
              return skillResult.data.skill.skillName;
            });

            const fetchedSkills = await Promise.all(skillPromises);
            setSkills(fetchedSkills);
          } else {
            setSkills([]); // Không có kỹ năng
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to fetch job details');
      }
    };
    
    fetchJob();
    
    const userData = getUserStorage()?.user;
    setUserRole(userData?.role);
    setUserId(userData?._id);
  }, [jobId]);

  if (error) return <div>{error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.jobDetail)}>
        <div className={clsx(styles.titleContainer)}>
          <div className={clsx(styles.title)}>
            <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
            <h1>{job.title}</h1>
          </div>
        </div>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Address:</strong> {job.street}, {job.city}</p>
        <p><strong>Company:</strong> {job.company.name}</p>
        <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
        <p><strong>Expires:</strong> {new Date(job.expiredAt).toLocaleDateString()}</p>
        <p><strong>Salary:</strong> ${job.salary}</p>
        <p><strong>Type:</strong> {job.type}</p>
        <p><strong>Position:</strong> {job.position}</p>
        <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
        <p><strong>Category: </strong>{categoryName}</p>
        <div>
          <strong>Requirements: </strong>
          {skills.length > 0 ? (
            <ul>
              {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <span>No skill</span>
          )}
        </div>
        <p><strong>Number of cruiment:</strong> {job.numberOfCruiment}</p>
      </div>
      <div className={clsx(styles.button)}>
        <button>Accept</button>
        <button>Reject</button>
        <button>Xem bản cập nhật</button>
        <button>Xóa</button>
      </div>
    </>
  );
};

export default DetailJobAdmin;

