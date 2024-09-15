import React, { useCallback, useEffect, useState } from 'react';
import { getApiWithToken, postApiNoneToken, putApiWithToken } from '../../../api';
import styles from '../CandidateManagement/candidateManagement.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [addressInput, setAddressInput] = useState('');
  const [candidateInput, setCandidateInput] = useState('');
  const [results, setResults] = useState(null);

  const [userIsActive, setUserIsActive] = useState();

  const fetchCandidates = useCallback(async (page = 1) => {

    try {
      setLoading(true);
      const result = await getApiWithToken(`/candidate/get-all?page=${page}&limit=${pagination.limit}`);
      setCandidates(result.data.candidates);
      setPagination(prev => ({
        ...prev,
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
      }));

      console.log("result",result);
      
    } catch (err) {
      setError('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handlePageChange = (newPage) => {
    fetchCandidates(newPage);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: candidateInput.trim(),
        address: addressInput.trim() || '',
      };
  
      const response = await postApiNoneToken('/candidate/search', searchParams);

      console.log("64", searchParams);
      
      console.log("66", response.data.candidates);
  
      if (response.data.success) {
        setResults(response.data.candidates);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };

  const handleDisable = async (candidateId, isActive) => {
    try {
      const result = await Swal.fire({
        title: `Bạn có chắc muốn ${isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản này?`,
        text: `Tài khoản sẽ bị ${isActive ? 'vô hiệu hóa' : 'kích hoạt'}. Bạn có muốn tiếp tục không?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
      });
  
      if (result.isConfirmed) {
        const updatedStatus = { isActive: !isActive };
        const response = await putApiWithToken(`/user/update-status/${candidateId}`, updatedStatus);
        
        console.log("93",response.data.user.isActive);
        const userIsAct = response.data.user.isActive;
        setUserIsActive(userIsAct);

        if (response.data.success) {
          setCandidates((prevCandidates) =>
            prevCandidates.map((candidate) =>
              candidate._id === candidateId ? { ...candidate, isActive: !isActive } : candidate
            )
          );
  
          await Swal.fire({
            title: 'Thành công!',
            text: `Tài khoản đã được ${isActive ? 'vô hiệu hóa' : 'kích hoạt'} thành công.`,
            icon: 'success',
            confirmButtonText: 'OK',
          });
        }
      }
    } catch (error) {
      console.error("Error updating candidate status:", error);
      await Swal.fire({
        title: 'Lỗi!',
        text: 'Đã xảy ra lỗi khi cập nhật trạng thái tài khoản.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quản lí ứng viên</h2>
       {/* searchBar */}
       <div className={clsx(styles.searchBar)}>
      <Form className={clsx(styles.form)}>
        {/* <Form.Control
          type="text"
          placeholder="Address"
          className={clsx(styles.jobInput)}
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
        /> */}
        <select
            className={clsx(styles.locationInput)}
            id="address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          >
            <option value="">All cities</option>
            <option value="Ha Noi">Hà Nội</option>
            <option value="Da Nang">Đà Nẵng</option>
            <option value="Ho Chi Minh">TP.HCM</option>
            <option value="Others">Others</option>
          </select>
        <Form.Control
          type="text"
          placeholder="Enter candidate"
          className={clsx(styles.jobInput)}
          value={candidateInput}
          onChange={(e) => setCandidateInput(e.target.value)}
        />
        <Button 
          variant="primary" 
          className={clsx(styles.searchButton)}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Form>
    </div>
            {/* searchBar */}

      {results && (
        <div>
          {results.length > 0 ? (
          results.map((candidate) => (
            <Link key={candidate._id} to={`/detail-candidate/${candidate._id}`} className={clsx(styles.candidatecard)}>
              <h3>Candidate name: {candidate.name}</h3>
              <hr />
            </Link>
          ))
        ) : (
          <div>No candidates available</div>
        )}
        </div>
      )}

      {/* content */}
      <p>Tổng số lượng ứng viên:</p>
      <div className={clsx(styles.candidatelist)}>
      <div className={clsx(styles.candidateContainer)}>
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <div key={candidate._id}>
              <Link to={`/detail-candidate/${candidate._id}`} className={clsx(styles.candidatecard)}>
                <h3>Candidate name: {candidate.name}</h3>
                <p>IsActive: {"" + userIsActive}</p>
              </Link>
              <button onClick={() => handleDisable(candidate._id, userIsActive)}>
                {userIsActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
              </button>
              <hr />
            </div>
          ))
        ) : (
          <div>No candidates available</div>
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

export default CandidateManagement;
