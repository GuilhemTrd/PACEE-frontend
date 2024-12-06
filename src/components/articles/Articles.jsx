import React, { useState, useEffect } from 'react';
import './Articles.css';
import Navbar from '../navbar/Navbar';
import apiClient from '../../utils/apiClient';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArticles = async () => {
        try {
            const response = await apiClient.get('/api/articles');
            setArticles(response.data.member);
            console.log(response.data.member);
        } catch (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            setError("Impossible de charger les articles pour le moment.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    if (isLoading) {
        return (
            <div className="articles-container">
                <Navbar />
                <div className="articles-content">
                    <h1>Nos Articles</h1>
                    <p>Chargement des articles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="articles-container">
                <Navbar />
                <div className="articles-content">
                    <h1>Nos Articles</h1>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="articles-container">
            <Navbar />
            <div className="articles-content">
                <h1>Nos Articles</h1>
                <div className="articles-grid">
                    {articles.map((article) => (
                        <div key={article.id} className="article-card">
                            <span className="article-tag">CONSEILS</span>
                            <h2 className="article-title">{article.title}</h2>
                            <p className="article-excerpt">{article.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Articles;
