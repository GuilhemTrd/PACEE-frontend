import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Articles.css';
import Navbar from '../../common/navbar/Navbar';
import apiClient from '../../../utils/apiClient';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Cache pour éviter de recharger les mêmes données
    const cacheRef = useRef({});

    const fetchArticles = async (page = 1, query = '') => {
        const cacheKey = `page-${page}-search-${query}`;
        console.log(`Tentative de récupération des articles : page=${page}, query="${query}"`);

        if (cacheRef.current[cacheKey]) {
            console.log(`Données en cache trouvées pour : ${cacheKey}`);
            const cachedData = cacheRef.current[cacheKey];
            setArticles((prevArticles) => {
                const articleIds = new Set(prevArticles.map((article) => article.id));
                const newItems = cachedData.filter((item) => !articleIds.has(item.id));
                return query ? cachedData : [...prevArticles, ...newItems];
            });
            setIsLastPage(cachedData.length < 10);
            setIsLoading(false);
            setIsLoadingMore(false);
            return;
        }

        setIsLoading(true);
        try {
            console.log(`Appel API pour les articles : page=${page}, query="${query}"`);
            const response = await apiClient.get(
                `/api/articles?page=${page}&itemsPerPage=10${query ? `&title=${query}` : ''}`
            );
            console.log('Réponse de l\'API :', response.data);
            const articlesData = response.data.member || [];
            console.log('Données des articles :', articlesData);
            cacheRef.current[cacheKey] = articlesData;

            setArticles((prevArticles) => {
                const articleIds = new Set(prevArticles.map((article) => article.id));
                const newItems = articlesData.filter((item) => !articleIds.has(item.id));
                return query ? articlesData : [...prevArticles, ...newItems];
            });

            setIsLastPage(articlesData.length < 10);
        } catch (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            setError("Impossible de charger les articles pour le moment.");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        console.log('Chargement initial des articles...');
        fetchArticles(1);
    }, []);

    const loadMoreArticles = () => {
        if (isLoadingMore || isLastPage || isSearching) return;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        console.log(`Chargement de la page suivante : ${nextPage}`);
        fetchArticles(nextPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        console.log(`Recherche mise à jour : "${value}"`);
        setSearchTerm(value);
        setIsSearching(true);
        fetchArticles(1, value);
    };

    if (isLoading && !isSearching) {
        console.log('Affichage de l\'écran de chargement initial');
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
        console.log('Affichage de l\'écran d\'erreur');
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
                <div className="articles-grid">
                    {articles.length > 0 ? (
                        articles.map((article) => {
                            console.log('Article rendu :', article);
                            return (
                                <Link
                                    to={`/articles/${article.id || article['@id']}`}
                                    key={article.id || article['@id']}
                                    className="article-card"
                                >
                                    <span className="article-tag">CONSEILS</span>
                                    <h2 className="article-title">{article.title || 'Titre manquant'}</h2>
                                    <p className="article-excerpt">{article.description || 'Description manquante'}</p>
                                </Link>
                            );
                        })
                    ) : (
                        <p className="no-articles-message">Aucun article trouvé.</p>
                    )}
                </div>
                {/* Bouton flottant pour ajouter un article */}
                <Link to="/create-article" className="floating-button">
                    +
                </Link>
                {!isSearching && (
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
                )}
            </div>
        </div>
    );
};

export default Articles;
