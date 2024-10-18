import React, { useCallback, useEffect, useState } from 'react';
import styles from '../SkillManagement/skillManagement.module.scss';
import { getApiWithToken, postApiWithToken, putApiWithToken } from '../../../api';
import clsx from 'clsx';
// import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const SkillManagement = () => {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [newSkillName, setNewSkillName] = useState('');
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSkills = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getApiWithToken(`/skill/get-all?page=${page}&limit=${pagination.limit}`);
      setSkills(result.data.skills);
      setPagination((prev) => ({
        ...prev,
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
      }));
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handlePageChange = (newPage) => {
    fetchSkills(newPage);
  };

  const handleCreateSkill = async () => {
    try {
      if (!newSkillName) {
        Swal.fire('Error', 'Skil name is required', 'error');
        return;
      }
      console.log("52", newSkillName);

      const checkResult = await postApiWithToken('/skill/check-skill', { skillName: newSkillName });
      console.log("55", checkResult.data.message);
      
      console.log("57 success", checkResult.data.success);
      
      if (checkResult.data.success === true) {
        Swal.fire('Error', 'Category already exists', 'error');
        return;
      } else{

      await postApiWithToken('/skill/create', { skillName: newSkillName });
      Swal.fire('Success', 'Skill created successfully', 'success');
      setNewSkillName('');
      fetchSkills();
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to create skill', 'error');
    }
  };

  const handleUpdateSkill = async (skillId) => {
    try {
      if (!skillInput) {
        Swal.fire('Error', 'Skill name cannot be empty', 'error');
        return;
      }
      console.log(skillInput);
      
  
      const checkResult = await postApiWithToken('/skill/check-skill', { skillName: skillInput });

      console.log("77",checkResult);
      
      if (checkResult.data.success === true) {
        Swal.fire('Error', 'Skill already exists', 'error');
        return;
      }
  
      await putApiWithToken(`/skill/update/${skillId}`, { skillName: skillInput });
      Swal.fire('Success', 'Skill updated successfully', 'success');
      setEditingSkillId(null); // Exit edit mode
      fetchSkills();
    } catch (err) {
      Swal.fire('Error', 'Failed to update skill', 'error');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent the page from reloading on form submit
  
    if (!skillSearchInput) {
      setErrorMessage('Please provide a Skill name');
      setResults({ candidates: [], jobs: [] });
      return;
    }
  
    try {
      // Make the POST request to the backend API
      const response = await postApiWithToken('/skill/get-candidate-and-job-by-skill', { name: skillSearchInput });
  
      if (response.data && response.data.success) {
        const { candidates, jobs } = response.data;
        setResults({ candidates, jobs }); // Set candidates and jobs to display
        setErrorMessage('');              // Clear any previous error message
      } else {
        setResults({ candidates: [], jobs: [] }); // Clear previous results
        setErrorMessage('Không tìm thấy kết quả phù hợp'); // Set error message
      }
    } catch (error) {
      console.error("Error during skill search:", error);
      setResults({ candidates: [], jobs: [] });
      setErrorMessage('Không tìm thấy kết quả phù hợp'); // Set error message
      // setErrorMessage('Error occurred while searching. Please try again later.');
    }
  };  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quản lí danh mục kỹ năng</h2>

      <form className={clsx(styles.searchBar)}>
        <div className={clsx(styles.form)}>
          <input
            type="text"
            placeholder="Nhập tên kỹ năng"
            className={clsx(styles.jobInput)}
            id="search"
            value={skillSearchInput}
            onChange={(e) => setSkillSearchInput(e.target.value)}
          />
          <button 
            variant="primary" 
            className={clsx(styles.searchButton)} 
            onClick={handleSearch}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <strong className={clsx(styles.s)}>Search</strong>  
          </button>
        </div>
      </form>

      {results && (results.candidates.length > 0 || results.jobs.length > 0) ? (
        <div>
          <p>Kết quả:</p>
          <div>
            <p>Candidates:</p>
            <ul>
              {results.candidates.map((candidate) => (
                <li key={candidate._id}>{candidate.name}</li> // Assuming candidate has a "name" field
              ))}
            </ul>
          </div>
          <div>
            <p>Jobs:</p>
            <ul>
              {results.jobs.map((job) => (
                <li key={job._id}>{job.title}</li> // Assuming job has a "title" field
              ))}
            </ul>
          </div>
        </div>
      ) : (
        errorMessage && <p>{errorMessage}</p>  // Display error message when no results are found
      )}

      <strong>Tổng số lượng kỹ năng: {skills.length}</strong>
      <div className={clsx(styles.top)}>
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Nhập kỹ năng mới"
          className={clsx(styles.inputSkill)}
        />
        <button onClick={handleCreateSkill} className={clsx(styles.btnSua)}>Thêm kỹ năng</button>
      </div>

      <div className={clsx(styles.categorylist)}>
        <div className={clsx(styles.categoryContainer)}>
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div key={skill._id}>
                {editingSkillId === skill._id ? (
                  <div className={clsx(styles.skillName)}>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className={clsx(styles.inputSkill)}
                    />
                    <div>
                      <button onClick={() => handleUpdateSkill(skill._id)} className={clsx(styles.btnSua)}>Xác nhận chỉnh sửa</button>
                      <button onClick={() => setEditingSkillId(null)} className={clsx(styles.btnHuy)}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div className={clsx(styles.skillName)}>
                    <h3>{skill.skillName}</h3>
                    <button 
                      onClick={() => {
                        setEditingSkillId(skill._id);
                        setSkillInput(skill.skillName);
                      }}
                      className={clsx(styles.btnSua)}
                    >
                      Sửa kỹ năng
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No skills available</div>
          )}
        </div>

        <div className={clsx(styles.pagination)}>
          {pagination.currentPage > 1 && (
            <button onClick={() => handlePageChange(pagination.currentPage - 1)}>Previous</button>
          )}
          <span>{pagination.currentPage} / {pagination.totalPages} trang</span>
          {pagination.currentPage < pagination.totalPages && (
            <button onClick={() => handlePageChange(pagination.currentPage + 1)}>Next</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillManagement;
