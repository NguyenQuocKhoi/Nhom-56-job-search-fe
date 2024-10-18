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

  const [categorySearchInput, setCategorySearchInput] = useState('');
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!categorySearchInput) {
      setErrorMessage('Please provide a Category name');
      setResults(null);
      return;
    }

    try {
      // Make the POST request to the backend API
      const response = await postApiWithToken('/category/get-category-by-name', { name: categorySearchInput });

      console.log(response);
      

      if (response.data.success) {
        setResults(response.data.data);  // Set the results to display on the interface
        setErrorMessage('');        // Clear any previous error message
      } else {
        setResults(null);           // Clear previous results
        setErrorMessage('Không tìm thấy kết quả phù hợp'); // Set error message
      }
    } catch (error) {
      console.error("Error during category search:", error);
      setResults(null);
      setErrorMessage('Không tìm thấy kết quả phù hợp'); // Set error message
      // setErrorMessage('Error occurred while searching. Please try again later.');
    }
  };  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Quản lí danh mục công việc</h2>

      <form className={clsx(styles.searchBar)}>
        <div className={clsx(styles.form)}>
          <input
            type="text"
            placeholder="Nhập tên danh mục"
            className={clsx(styles.jobInput)}
            id="search"
            value={categorySearchInput}
            onChange={(e) => setCategorySearchInput(e.target.value)}
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

      {results ? (
        <div>
          <p>Kết quả:</p>
          <ul>
            {results.map((category) => (
              <li key={category._id}>{category.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        errorMessage && <p>{errorMessage}</p>
      )}

      <strong>Tổng số lượng danh mục: {categories.length}</strong>
      <div className={clsx(styles.top)}>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nhập tên danh mục mới"
          className={clsx(styles.inputCategory)}
        />
        <button onClick={handleCreateCategory} className={clsx(styles.btnSua)}>Thêm danh mục</button>
      </div>

      <div className={clsx(styles.categorylist)}>
        <div className={clsx(styles.categoryContainer)}>
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category._id}>
                {editingCategoryId === category._id ? (
                  <div className={clsx(styles.categoryName)}>
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className={clsx(styles.inputCategory)}
                    />
                    <div>
                      <button onClick={() => handleUpdateCategory(category._id)} className={clsx(styles.btnSua)}>Xác nhận chỉnh sửa</button>
                      <button onClick={() => setEditingCategoryId(null)} className={clsx(styles.btnHuy)}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div className={clsx(styles.categoryName)}>
                    <h3>{category.name}</h3>
                    <button onClick={() => {
                      setEditingCategoryId(category._id);
                      setCategoryInput(category.name); // Set the input with current category name
                    }}
                      className={clsx(styles.btnSua)}
                    >
                      Sửa danh mục
                    </button>
                  </div>
                )}
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
