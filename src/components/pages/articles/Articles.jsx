import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../../common/navbar/Navbar';
import apiClient from '../../../utils/apiClient';
import './Articles.css';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const cacheRef = useRef({});

    useEffect(() => {
        if (toastMessage) {
            toast.success(toastMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 3100);

            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Récupérer les articles
    const fetchArticles = async (page = 1, query = '') => {
        const cacheKey = `page-${page}-search-${query}`;

        // Réinitialiser les articles et `isLastPage` uniquement pour la première page
        if (page === 1) {
            setArticles([]);
            setIsLastPage(false);
        }

        setIsLoading(page === 1);
        setIsLoadingMore(page > 1);

        try {
            const response = await apiClient.get(
                `/api/articles?page=${page}&itemsPerPage=10${query ? `&title=${query}` : ''}`
            );
            const articlesData = response.data.member || [];
            cacheRef.current[cacheKey] = articlesData;

            setArticles((prevArticles) => {
                const articleIds = new Set(prevArticles.map((article) => article.id));
                const newItems = articlesData.filter((item) => !articleIds.has(item.id));
                return page === 1 ? articlesData : [...prevArticles, ...newItems];
            });

            setIsLastPage(articlesData.length < 10);
        } catch (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            setError('Impossible de charger les articles pour le moment.');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsSearching(false);
        }
    };

    // Initialiser les articles
    useEffect(() => {
        fetchArticles(1);
    }, []);

    // Charger plus d'articles
    const loadMoreArticles = () => {
        if (isLoadingMore || isLastPage || isSearching) return;

        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);

        fetchArticles(nextPage, searchTerm);
    };

    // Gestion de la recherche
    const handleSearchChange = (e) => {
        const value = e.target.value;

        setSearchTerm(value);
        setCurrentPage(1);
        setIsSearching(true);

        fetchArticles(1, value);
    };

    // Gestion des états
    if (isLoading && !isSearching) {
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
            <ToastContainer
                autoClose={3000}
                hideProgressBar={true}
                position="top-right"
                closeOnClick
                draggable
                pauseOnHover
            />

            <div className="articles-content">
                <h1>Nos Articles</h1>
                {/* Barre de recherche */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Rechercher des articles ..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                {/* Liste des articles */}
                <div className="articles-grid">
                    {articles.length > 0 ? (
                        articles.map((article) => (
                            <Link
                                to={`/articles/${article.id || article['@id']}`}
                                key={article.id || article['@id']}
                                className="article-card"
                            >
                                <span className="article-tag">CONSEILS</span>
                                <h2 className="article-title">{article.title || 'Titre manquant'}</h2>
                                <p className="article-excerpt">{article.description || 'Description manquante'}</p>
                            </Link>
                        ))
                    ) : searchTerm.trim() ? (
                        <p className="no-articles-message">Aucun article trouvé en fonction de vos filtres.</p>
                    ) : (
                        <p className="no-articles-message">Aucun article écrit pour le moment, revenez plus tard.</p>
                    )}
                </div>

                {/* Bouton flotant pour ajouter un article */}
                <Link to="/create-article" className="floating-button">
                    +
                </Link>

                {/* Bouton Charger plus */}
                {!isSearching && articles.length > 0 && !isLastPage && (
                    <div className="load-more-container">
                        {isLoadingMore ? (
                            <p>Chargement...</p>
                        ) : (
                            <button onClick={loadMoreArticles} className="load-more-button">
                                Voir plus
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Articles;
