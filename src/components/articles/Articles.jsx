import React from 'react';
import './Articles.css';
import Navbar from '../navbar/Navbar';

const Articles = () => {

    return (
        <div className="articles-container">
            <Navbar />
            <div className="articles-content">
                <h1>Nos Articles</h1>
            </div>
        </div>
    );
};

export default Articles;
