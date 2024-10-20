import React, { useCallback, useEffect, useState } from 'react';
import styles from '../SkillManagement/skillManagement.module.scss';
import { getAPiNoneToken, getApiWithToken, postApiWithToken, putApiWithToken } from '../../../api';
import clsx from 'clsx';
// import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
  // const [results, setResults] = useState(null);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

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

  // const fetchCandidatesAndJobsBySkill = async (skillName) => {
  //   try {
  //     const response = await postApiWithToken('/skill/get-candidate-and-job-by-skill', { name: skillName });
  //     console.log(response.data.jobs);
      
  //     if (response.data.success) {
  //       setCandidates(response.data.candidates);
  //       setJobs(response.data.jobs);
  //     } else {
  //       setError(response.message || 'Error fetching candidates and jobs');
  //     }
  //   } catch (err) {
  //     setError('Error fetching candidates and jobs 123');
  //   }
  // };
  const fetchCandidatesAndJobsBySkill = async (skillName) => {
    try {
      const response = await postApiWithToken('/skill/get-candidate-and-job-by-skill', { name: skillName });      
      const jobsWithCompanyInfo = await Promise.all(
        response.data.jobs.map(async (job) => {
          const companyResponse = await getAPiNoneToken(`/company/${job.company}`);
          return {
            ...job,
            companyInfo: companyResponse.data, // Attach company info to each job
          };
        })
      );
  
      console.log(jobsWithCompanyInfo);
      if (response.data.success) {
        setCandidates(response.data.candidates);
        setJobs(jobsWithCompanyInfo); // Set jobs with attached company info
      } else {
        setError(response.message || 'Error fetching candidates and jobs');
      }
    } catch (err) {
      setError('Error fetching candidates and jobs');
    }
  };  

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
      setErrorMessage('Vui lòng nhập tên kỹ năng');
      setResults([]);
      return;
    }
  
    try {
      const response = await postApiWithToken('/skill/get-skill-by-skill-name', { name: skillSearchInput });
  
      if (response.data.success) {
        setResults(response.data.data); 
        setErrorMessage('');              
      } else {
        setResults([]); 
        setErrorMessage('Không tìm thấy kết quả phù hợp'); 
      }
    } catch (error) {
      console.error("Error during skill search:", error);
      setResults([]);
      setErrorMessage('Không tìm thấy kết quả phù hợp');
    }
  };  

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSkill(null);
    setCandidates([]);
    setJobs([]);
  };

  const handleShowModal = (skillName) => {
    setSelectedSkill(skillName);
    setShowModal(true);
    fetchCandidatesAndJobsBySkill(skillName);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <Modal show={showModal} onHide={handleCloseModal} className={clsx(styles.modal)} centered>
      <div>
      <Modal.Header closeButton className={clsx(styles.modalHeader)}>
        <Modal.Title className={clsx(styles.modalTitle)}>Danh sách công việc và ứng viên {selectedSkill?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={clsx(styles.modalBody)}>
        {/* {<> */}
                {candidates.length > 0 ? (
                  <div>
                    <h5>Ứng viên:</h5>
                      {candidates.map((candidate) => (
                        <div key={candidate._id} className={clsx(styles.candidatecard)}>
                          <Link to={`/detailCandidateAdmin/${candidate._id}`} className={clsx(styles.linkJC)} target="_blank" rel="noopener noreferrer">
                            <img src={candidate.avatar} alt="Logo" className={clsx(styles.avatar)}/>                    
                            <div className={clsx(styles.textCandidate)}>
                              <p><strong>{candidate.name}</strong></p>
                              <p>{candidate.email}</p>
                              <p>{candidate.phoneNumber}</p>
                            </div>
                          </Link>
                        </div>
                      ))}
                  </div>
                ):(
                  <div>Không có ứng viên phù hợp</div>
                )}

                {jobs.length > 0 ? (
                  <div>
                    <h5>Việc làm:</h5>
                      {jobs.map((job) => (
                        <div key={job._id} className={clsx(styles.candidatecard)}>
                          <Link to={`/detailJobAdmin/${job._id}`} className={clsx(styles.linkJC)} target="_blank" rel="noopener noreferrer">
                            <img src={job.companyInfo.company.avatar} alt="Logo" className={clsx(styles.avatar)}/>                    
                            <div className={clsx(styles.textCandidate)}>
                              <h5>{job.title}</h5>
                              <p>{job.companyInfo.company.name}</p>
                              <p>{job.street}, {job.city}</p>
                            </div>
                          </Link>
                        </div>
                      ))}
                  </div>
                ):(
                  <div>Không có việc làm phù hợp.</div>
                )}

                {/* {candidates.length === 0 && jobs.length === 0 && <div>Không có ứng viên hoặc công việc phù hợp.</div>} */}
              {/* </>} */}
      </Modal.Body>
      <Modal.Footer className={clsx(styles.modalFooter)}>
        <Button variant="danger" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
      </div>
    </Modal>

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

      {results.length > 0 ? (
        <div>
          <strong>Kết quả phù hợp: {results.length}</strong>
          {results.map((skill) => (
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
                  <div onClick={() => handleShowModal(skill.skillName)} className={clsx(styles.skillNameText)}>
                    <h3>{skill.skillName}</h3>
                  </div>
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
              // <div className={clsx(styles.skillName)}>
              //   <h3 key={skill._id}>{skill.skillName}</h3>
              // </div>
            ))}
        </div>
      ) : (
        errorMessage && 
        <div className={clsx(styles.kqSearch)}>
          <p>{errorMessage}</p>  
        </div>
      )}

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

      <strong>Tổng số lượng kỹ năng: {skills.length}</strong>

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
                    <div onClick={() => handleShowModal(skill.skillName)} className={clsx(styles.skillNameText)}>
                      <h3>{skill.skillName}</h3>
                    </div>
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
    </>
  );
};

export default SkillManagement;
