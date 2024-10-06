import React, { useCallback, useEffect, useState } from 'react';
import styles from '../CategoryManagement/categoryManagement.module.scss';
import { getApiWithToken, postApiWithToken, putApiWithToken } from '../../../api';
import clsx from 'clsx';
// import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');

  const fetchCategories = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getApiWithToken(`/category/get-all?page=${page}&limit=${pagination.limit}`);
      setCategories(result.data.categories);
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
    fetchCategories();
  }, [fetchCategories]);

  const handlePageChange = (newPage) => {
    fetchCategories(newPage);
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCategoryName) {
        Swal.fire('Error', 'Category name is required', 'error');
        return;
      }
      console.log(newCategoryName);

      const checkResult = await postApiWithToken('/category/check-category', { name: newCategoryName });
      console.log("55",checkResult.data.message);
      
      console.log("57 success",checkResult.data.success);
      
      if (checkResult.data.success === true) {
        Swal.fire('Error', 'Category already exists', 'error');
        return;
      } else{

      await postApiWithToken('/category/create', { name: newCategoryName });
      Swal.fire('Success', 'Category created successfully', 'success');
      setNewCategoryName('');
      fetchCategories();
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to create category', 'error');
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      if (!categoryInput) {
        Swal.fire('Error', 'Category name cannot be empty', 'error');
        return;
      }
      console.log(categoryInput);
      
  
      const checkResult = await postApiWithToken('/category/check-category', { name: categoryInput });

      console.log("77",checkResult);
      
      if (checkResult.data.success === true) {
        Swal.fire('Error', 'Category already exists', 'error');
        return;
      }
  
      await putApiWithToken(`/category/update/${categoryId}`, { name: categoryInput });
      Swal.fire('Success', 'Category updated successfully', 'success');
      setEditingCategoryId(null); // Exit edit mode
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', 'Failed to update category', 'error');
    }
  };  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quản lí danh mục công việc</h2>
      <p>Tổng số lượng danh mục: {categories.length}</p>
      <div>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nhập tên danh mục mới"
        />
        <button onClick={handleCreateCategory}>Thêm danh mục</button>
      </div>
      <hr />

      <div className={clsx(styles.categorylist)}>
        <div className={clsx(styles.categoryContainer)}>
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category._id}>
                {editingCategoryId === category._id ? (
                  <div>
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                    />
                    <button onClick={() => handleUpdateCategory(category._id)}>Xác nhận chỉnh sửa</button>
                    <button onClick={() => setEditingCategoryId(null)}>Hủy</button>
                  </div>
                ) : (
                  <div className={clsx(styles.categoryName)}>
                    <h3>{category.name}</h3>
                    <button onClick={() => {
                      setEditingCategoryId(category._id);
                      setCategoryInput(category.name); // Set the input with current category name
                    }}>
                      Sửa danh mục
                    </button>
                  </div>
                )}
                <hr />
              </div>
            ))
          ) : (
            <div>No categories available</div>
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

export default CategoryManagement;
