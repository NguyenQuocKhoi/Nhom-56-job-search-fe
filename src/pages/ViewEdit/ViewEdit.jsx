import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './viewEdit.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import { getAPiNoneToken } from '../../api';

const ViewEdit = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchJobAndCandidates = async () => {
      try {
        const resultJobs = await getAPiNoneToken(`/job/${jobId}`);
        setJob(resultJobs.data.job);
        
        // Fetch category name
        if (resultJobs.data.job.category) {
          const categoryData = await getAPiNoneToken(`/category/${resultJobs.data.job.pendingUpdates.category}`);
          const categoryName = categoryData.data.category.name;
          setCategoryName(categoryName);
        } else {
          setCategoryName('No category');
        }

        // Fetch skills
        if (resultJobs.data.job.pendingUpdates.requirementSkills && resultJobs.data.job.pendingUpdates.requirementSkills.length > 0) {
          const skillPromises = resultJobs.data.job.pendingUpdates.requirementSkills.map(async (skillId) => {
            const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
            return skillResult.data.skill.skillName;
          });
          const fetchedSkills = await Promise.all(skillPromises);
          setSkills(fetchedSkills);
        } else {
          setSkills([]); // No skills
        }
      } catch (err) {
        setError('Failed');
      }
    };
    fetchJobAndCandidates();
  }, [jobId]);

  const isFieldDifferent = (field) => job && job.pendingUpdates && job[field] !== job.pendingUpdates[field];

  if (error) return <div>{error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p>Chi tiết công việc: {jobId}</p>

        <div className={clsx(styles.jobDetail)}>
          <div className={clsx(styles.titleContainer)}>
            <div className={clsx(styles.title)}>
              <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
              <h1 className={clsx({ [styles.highlight]: isFieldDifferent('title') })}>
                {job.pendingUpdates.title}
              </h1>
            </div>
          </div>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('city') })}>
            <strong>Address:</strong> {job.pendingUpdates.street}, {job.pendingUpdates.city}
          </p>
          <p><strong>Company:</strong> {job.company.name}</p>
          <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('expiredAt') })}>
            <strong>Expires:</strong> {new Date(job.pendingUpdates.expiredAt).toLocaleDateString()}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('numberOfCruiment') })}>
            <strong>Number of Recruitment:</strong> {job.pendingUpdates.numberOfCruiment}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('requirements') })}>
            <strong>Requirements:</strong> {job.pendingUpdates.requirements}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('interest') })}>
            <strong>Interest:</strong> {job.pendingUpdates.interest}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('salary') })}>
            <strong>Salary:</strong> {job.pendingUpdates.salary}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('type') })}>
            <strong>Type:</strong> {job.pendingUpdates.type}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('position') })}>
            <strong>Position:</strong> {job.pendingUpdates.position}
          </p>
          <p className={clsx({ [styles.highlight]: isFieldDifferent('experienceLevel') })}>
            <strong>Experience Level:</strong> {job.pendingUpdates.experienceLevel}
          </p>
          <p><strong>Category:</strong> {categoryName || 'No Category'}</p>
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
          <p className={clsx({ [styles.highlight]: isFieldDifferent('description') })}>
            <strong>Description:</strong> {job.pendingUpdates.description}
          </p>
          <p><strong>Last Modified:</strong> {new Date(job.pendingUpdates.lastModified).toLocaleString()}</p>
          <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewEdit;
