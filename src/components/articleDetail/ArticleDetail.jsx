import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import apiClient from '../../utils/apiClient';
import './ArticleDetail.css';

const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArticle = useCallback(async () => {
        try {
            const response = await apiClient.get(`/api/articles/${id}`);
            setArticle(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération de l'article:", err);
            setError("Impossible de charger l'article pour le moment.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    if (isLoading) {
        return (
            <div className="article-detail-container">
                <Navbar />
                <div className="article-detail-content">
                    <h1>Chargement de l'article...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="article-detail-container">
                <Navbar />
                <div className="article-detail-content">
                    <h1 className="error-message">{error}</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="article-detail-container">
            <Navbar />
            <div className="article-detail-content">
                <h1>{article.title}</h1>
                <p className="article-detail-date">Publié le : {new Date(article.created_at).toLocaleDateString()}</p>
                <div
                    className="article-detail-body"
                    dangerouslySetInnerHTML={{
                        __html: article.content.replace(
                            /<img /g,
                            '<img onError="this.style.display=\'none\'" '
                        ),
                    }}
                />
            </div>
        </div>
    );
};

export default ArticleDetail;
