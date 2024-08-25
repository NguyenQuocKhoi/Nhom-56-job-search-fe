import React from 'react';
import clsx from 'clsx';
import { Form, Button } from 'react-bootstrap';
import styles from './searchBar.module.scss';

const SearchBar = () => {
  return (
    <div className={clsx(styles.searchBar)}>
      <Form className={clsx(styles.form)}>
        <Form.Control
          type="text"
          placeholder="Enter job title"
          className={clsx(styles.jobInput)}
        />
        <Form.Control
          type="text"
          placeholder="Enter location"
          className={clsx(styles.locationInput)}
        />
        <Button variant="primary" type="submit" className={clsx(styles.searchButton)}>
          Search
        </Button>
      </Form>
    </div>
  );
};

export default SearchBar;
