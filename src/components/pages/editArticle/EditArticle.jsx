import React, { useState, useEffect } from 'react';
import Navbar from '../../common/navbar/Navbar';
import { Editor } from '@tinymce/tinymce-react';
import apiClient from '../../../utils/apiClient';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../common/loader/Loader';
import './EditArticle.css';

const EditArticle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Récupérer les détails de l'article
    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await apiClient.get(`/api/articles/${id}`);
                const article = response.data;
                setTitle(article.title || '');
                setDescription(article.description || '');
                setContent(article.content || '');
                setStatus(article.status || true);
            } catch (err) {
                console.error("Erreur lors de la récupération de l'article :", err);
                toast.error("Impossible de charger l'article.", { position: "top-right" });
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestBody = {
            title,
            description,
            content,
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            await apiClient.put(`/api/articles/${id}`, requestBody);
            navigate('/articles', { state: { toastMessage: "Article mis à jour avec succès !" } });
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'article :", err);
            toast.error("Mise à jour échouée. Veuillez réessayer.", { position: "top-right" });
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="edit-article-container">
            <Navbar />
            <ToastContainer
                autoClose={3000}
                hideProgressBar={true}
                position="top-right"
                closeOnClick
                draggable
                pauseOnHover
            />
            <div className="edit-article-content">
                <h1>Modifier l'article {title}</h1>
                <form onSubmit={handleSubmit} className="edit-article-form">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de l'article"
                        required
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description de l'article"
                        required
                    />
                    <Editor
                        apiKey="6cqpnv6i2qqe2tm1hfcsxjusxefid5bvk7vyy3pnfd3uooej"
                        value={content}
                        init={{
                            height: 400,
                            width: '100%',
                            plugins: [
                                'advlist autolink lists link image charmap print preview anchor',
                                'searchreplace visualblocks code fullscreen',
                                'insertdatetime media table paste code help wordcount image',
                                'table',
                            ],
                            toolbar:
                                'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | help',
                        }}
                        onEditorChange={(newContent) => setContent(newContent)}
                    />
                    <button type="submit" className="submit-button">Mettre à jour</button>
                </form>
            </div>
        </div>
    );
};

export default EditArticle;
