import React, { useState, useEffect, useRef } from 'react';
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

    // Cache pour éviter de recharger les mêmes données
    const cacheRef = useRef({});

    const fetchArticles = async (page = 1) => {
        const cacheKey = `page-${page}`;
        if (cacheRef.current[cacheKey]) {
            // Si la page est déjà en cache, utiliser les données mises en cache
            console.log(`Using cached data for page ${page}`);
            const cachedData = cacheRef.current[cacheKey];
            setArticles((prevArticles) => {
                const articleIds = new Set(prevArticles.map((article) => article.id));
                const newItems = cachedData.filter((item) => !articleIds.has(item.id));
                return [...prevArticles, ...newItems];
            });
            setIsLastPage(cachedData.length < 10);
            setIsLoading(false);
            setIsLoadingMore(false); // Important pour éviter les états bloqués
            return; // Ne pas appeler l'API
        }

        setIsLoadingMore(true);
        try {
            console.log(`Fetching data from API for page ${page}...`);
            const response = await apiClient.get(`/api/articles?page=${page}&itemsPerPage=10`);
            const articlesData = response.data?.member || [];
            cacheRef.current[cacheKey] = articlesData; // Stocker les articles dans le cache
            setArticles((prevArticles) => {
                const articleIds = new Set(prevArticles.map((article) => article.id));
                const newItems = articlesData.filter((item) => !articleIds.has(item.id));
                return [...prevArticles, ...newItems];
            });
            setIsLastPage(articlesData.length < 10); // Moins de 10 articles signifie qu'on est à la dernière page
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
