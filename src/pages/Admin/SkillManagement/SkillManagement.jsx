import React, { useCallback, useEffect, useState } from 'react';
import styles from '../CategoryManagement/categoryManagement.module.scss';
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quản lí danh mục kỹ năng</h2>
      <p>Tổng số lượng kỹ năng: {skills.length}</p>
      <div>
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Nhập kỹ năng mới"
        />
        <button onClick={handleCreateSkill}>Thêm kỹ năng</button>
      </div>
      <hr />

      <div className={clsx(styles.categorylist)}>
        <div className={clsx(styles.categoryContainer)}>
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div key={skill._id}>
                {editingSkillId === skill._id ? (
                  <div>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                    />
                    <button onClick={() => handleUpdateSkill(skill._id)}>Xác nhận chỉnh sửa</button>
                    <button onClick={() => setEditingSkillId(null)}>Hủy</button>
                  </div>
                ) : (
                  <div>
                    <h3>Skill: {skill.skillName}</h3>
                    <button onClick={() => {
                      setEditingSkillId(skill._id);
                      setSkillInput(skill.skillName);
                    }}>
                      Sửa kỹ năng
                    </button>
                  </div>
                )}
                <hr />
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
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          {pagination.currentPage < pagination.totalPages && (
            <button onClick={() => handlePageChange(pagination.currentPage + 1)}>Next</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillManagement;
