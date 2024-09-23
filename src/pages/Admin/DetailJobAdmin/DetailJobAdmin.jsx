import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAPiNoneToken } from '../../../api';
import styles from './detailJobAdmin.module.scss';
import clsx from 'clsx';
import Header from '../HeaderAdmin/HeaderAdmin';

const DetailJobAdmin = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  // const [userRole, setUserRole] = useState(null);
  // const [userId, setUserId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNameEdited, setCategoryNameEdited] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillsEdited, setSkillsEdited] = useState([]);

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
            setCategoryName(categoryResult.data.category.name);
            // console.log(categoryResult.data.category.name);

            if(result.data.job.pendingUpdates?.category){
              const categoryResultEdited = await getAPiNoneToken(`category/${result.data.job.pendingUpdates.category}`)
              setCategoryNameEdited(categoryResultEdited.data.category.name);
            }
          } else {
            setCategoryName("Unknown Category");
          }

          // const skillPromises = result.data.job.requirements.map(async (skillId) => {
          //   const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
          //   return skillResult.data.skill.skillName;
          // });
          
          // const fetchedSkills = await Promise.all(skillPromises);
          // setSkills(fetchedSkills);
          if (result.data.job.requirementSkills && result.data.job.requirementSkills.length > 0) {
            const skillPromises = result.data.job.requirementSkills.map(async (skillId) => {
              const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
              return skillResult.data.skill.skillName;
            });

            const fetchedSkills = await Promise.all(skillPromises);
            setSkills(fetchedSkills);
          } else {
            setSkills([]); // Không có kỹ năng
          }
          //pendingUpdates
          if (result.data.job.pendingUpdates?.requirementSkills && result.data.job.pendingUpdates.requirementSkills.length > 0) {
            const skillPromisesEdited = result.data.job.pendingUpdates.requirementSkills.map(async (skillId) => {
              const skillResultEdited = await getAPiNoneToken(`/skill/${skillId}`);
              return skillResultEdited.data.skill.skillName;
            });

            const fetchedSkillsEdited = await Promise.all(skillPromisesEdited);
            setSkillsEdited(fetchedSkillsEdited);
          } 
          // else {
          //   setSkillsEdited([]); // Không có kỹ năng
          // }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to fetch job details');
      }
    };
    
    fetchJob();
    
    // const userData = getUserStorage()?.user;
    // setUserRole(userData?.role);
    // setUserId(userData?._id);
  }, [jobId]);

  const renderField = (label, originalValue, updatedValue) => {
    return (
      <p>
        <strong>{label}:</strong> {originalValue}
        {updatedValue !== undefined && updatedValue !== originalValue && (
          <span style={{ backgroundColor: 'yellow', paddingLeft: '10px' }}>
            (Cập nhật thành: {updatedValue})
          </span>
        )}
      </p>
    );
  };

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
            {
              job.pendingUpdates?.title && job.pendingUpdates.title !== job.title && (
                <h1 style={{backgroundColor: 'yellow'}}>Title mới: {job.pendingUpdates.title}</h1>
              )
            }
          </div>
        </div>
        {renderField('Description', job.description, job.pendingUpdates?.description)}
        {renderField('Address', `${job.street}, ${job.city}`, `${job.pendingUpdates?.street}, ${job.pendingUpdates?.city}`)}
        <p><strong>Company:</strong> {job.company.name}</p>
        <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
        {renderField('Expires', new Date(job.expiredAt).toLocaleDateString(), new Date(job.pendingUpdates?.expiredAt).toLocaleDateString())}
        {/* {renderField('Salary', `${job.salary}`, `${job.pendingUpdates?.salary}`)} */}
        {renderField('Requirements', job.requirements, job.pendingUpdates?.requirements)}
        {renderField('Salary', job.salary, job.pendingUpdates?.salary)}
        {renderField('Interest', job.interest, job.pendingUpdates?.interest)}
        {renderField('Type', job.type, job.pendingUpdates?.type)}
        {renderField('Position', job.position, job.pendingUpdates?.position)}
        {renderField('Experience Level', job.experienceLevel, job.pendingUpdates?.experienceLevel)}
        {renderField('Category', categoryName, categoryNameEdited)}
        <div>
          <strong>Requirements skills: </strong>
          {skills.length > 0 ? (
            <ul>
              {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <span>No requirements skills</span>
          )}
        </div>
        <div>
          <strong>Updated Requirements skills: </strong>
          {skillsEdited.length > 0 ? (
            <ul>
              {skillsEdited.map((skill, index) => (
                <li key={index} style={{ backgroundColor: 'yellow' }}>{skill}</li>
              ))}
            </ul>
          ) : (
            <span>No updated requirements skills</span>
          )}
        </div>

        {renderField('Number of Recruitments', job.numberOfCruiment, job.pendingUpdates?.numberOfCruiment)}
      </div>
      <div className={clsx(styles.button)}>
        <button>Accept</button>
        <button>Reject</button>
        <button>Xóa</button>
      </div>
    </>
  );
};

export default DetailJobAdmin;

