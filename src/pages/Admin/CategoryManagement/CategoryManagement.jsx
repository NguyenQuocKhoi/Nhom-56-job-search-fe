import React, { useCallback, useEffect, useState } from 'react';
import styles from '../CategoryManagement/categoryManagement.module.scss';
import { getApiWithToken } from '../../../api';
import clsx from 'clsx';
import { Button, Form } from 'react-bootstrap';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const fetchCategories = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getApiWithToken(`/category/get-all?page=${page}&limit=${pagination.limit}`);
      setCategories(result.data.categories);
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
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (newPage) => {
    fetchCategories(newPage);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    
    <div>
      <h2>Quản lí danh mục công việc</h2>
       {/* searchBar */}
       <div className={clsx(styles.searchBar)}>
      <Form className={clsx(styles.form)}>
        <Form.Control
          type="text"
          placeholder="Enter category title"
          className={clsx(styles.jobInput)}
        />
        <Button variant="primary" className={clsx(styles.searchButton)}>
          Search
        </Button>
      </Form>
    </div>
            {/* searchBar */}
      <p>Tổng số lượng danh mục:</p>
      <button>thêm danh mục</button>
      <hr />
      <div className={clsx(styles.categorylist)}>
      <div className={clsx(styles.categoryContainer)}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div>
            {/* <Link key={company._id} to={`/detailCompany/${company._id}`} className={clsx(styles.companycard)}> */}
              <h3>Category name: {category.name}</h3>
              <button>xóa danh mục</button>
              <button>sửa danh mục</button>
              <hr />
            {/* </Link> */}
            </div>
          ))
        ) : (
          <div>No companies available</div>
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

export default CategoryManagement
