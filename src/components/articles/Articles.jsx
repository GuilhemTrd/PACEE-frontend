import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Articles.css';
import Navbar from '../navbar/Navbar';
import apiClient from '../../utils/apiClient';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false);

    const fetchArticles = async (page = 1) => {
        setIsLoadingMore(true);
        try {
            const response = await apiClient.get(`/api/articles?page=${page}&itemsPerPage=10`);
            const articlesData = response.data?.member || [];
            setArticles((prevArticles) => [...prevArticles, ...articlesData]);
            setIsLastPage(articlesData.length < 10);
        } catch (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            setError("Impossible de charger les articles pour le moment.");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        console.log('Fetching articles for page 1...');
        fetchArticles(1);
    }, []);

    const loadMoreArticles = () => {
        if (isLoadingMore || isLastPage) return;
        const nextPage = currentPage + 1;
        console.log(`Fetching articles for page ${nextPage}...`);
        setCurrentPage(nextPage);
        fetchArticles(nextPage);
    };

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
                <Link to="/create-article" className="create-article-button">
                    Créer un Nouvel Article
                </Link>

                <div className="articles-grid">
                    {articles.map((article) => (
                        <Link
                            to={`/articles/${article.id}`}
                            key={article.id}
                            className="article-card"
                        >
                            <span className="article-tag">CONSEILS</span>
                            <h2 className="article-title">{article.title}</h2>
                            <p className="article-excerpt">{article.description}</p>
                        </Link>
                    ))}
                </div>

                <div className="load-more-container">
                    {isLoadingMore ? (
                        <p>Chargement...</p>
                    ) : isLastPage ? (
                        <p className="no-more-articles-message">Tous les articles ont été chargés.</p>
                    ) : (
                        <button onClick={loadMoreArticles} className="load-more-button">
                            Voir plus
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Articles;
