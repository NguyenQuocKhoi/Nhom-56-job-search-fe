import React, { useCallback, useEffect, useState } from 'react';
import { getApiWithToken } from '../../../api';
import styles from '../CandidateManagement/candidateManagement.module.scss';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quản lí ứng viên</h2>
       {/* searchBar */}
       <div className={clsx(styles.searchBar)}>
      <Form className={clsx(styles.form)}>
        <Form.Control
          type="text"
          placeholder="Enter candidate"
          className={clsx(styles.jobInput)}
        />
        <Button variant="primary" className={clsx(styles.searchButton)}>
          Search
        </Button>
      </Form>
    </div>
            {/* searchBar */}
      <p>Tổng số lượng ứng viên:</p>
      <div className={clsx(styles.candidatelist)}>
      <div className={clsx(styles.candidateContainer)}>
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <Link key={candidate._id} to={`/detail-candidate/${candidate._id}`} className={clsx(styles.candidatecard)}>
              <h3>Candidate name: {candidate.name}</h3>
              <button>vô hiệu hóa</button>
              <button>Xóa tài khoản</button>
              <hr />
            </Link>
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
