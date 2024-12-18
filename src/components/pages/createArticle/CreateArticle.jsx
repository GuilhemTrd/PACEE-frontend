import React, { useState } from 'react';
import Navbar from '../../common/navbar/Navbar';
import { Editor } from '@tinymce/tinymce-react';
import apiClient from '../../../utils/apiClient';
import './CreateArticle.css';

const CreateArticle = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState(true);
    const [articleLikes, setArticleLikes] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const extractImageUrls = (content) => {
        const div = document.createElement('div');
        div.innerHTML = content;
        const images = div.querySelectorAll('img');
        return Array.from(images).map((img) => img.src);
    };

    const uploadImages = async (imageUrls) => {
        const uploadedUrls = [];
        console.log('Uploading images:', imageUrls);

        for (const imageUrl of imageUrls) {
            if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
                const blob = await fetch(imageUrl).then((res) => res.blob());
                const formData = new FormData();
                formData.append('file', blob);

                try {
                    const response = await apiClient.post('/api/articles/upload-image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    uploadedUrls.push(response.data.url);
                } catch (err) {
                    console.error('Erreur lors de l\'upload de l\'image:', err);
                }
            } else {
                uploadedUrls.push(imageUrl);
            }
        }

        return uploadedUrls;
    };

    const replaceImageUrls = (content, originalUrls, uploadedUrls) => {
        let updatedContent = content;

        originalUrls.forEach((originalUrl, index) => {
            const uploadedUrl = uploadedUrls[index];
            updatedContent = updatedContent.replace(originalUrl, uploadedUrl);
        });

        return updatedContent;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const originalImageUrls = extractImageUrls(content);
        const uploadedImageUrls = await uploadImages(originalImageUrls);
        const updatedContent = replaceImageUrls(content, originalImageUrls, uploadedImageUrls);
        const requestBody = {
            user: localStorage.getItem('user_id'),
            title,
            description,
            content: updatedContent,
            status,
            articleLikes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            await apiClient.post('/api/articles', requestBody);
            setSuccess(true);

            setTitle('');
            setDescription('');
            setContent('');
            setStatus(true);
            setArticleLikes([]);
        } catch (err) {
            console.error("Erreur lors de la création de l'article:", err);
            setError("Impossible de créer l'article. Veuillez réessayer.");
        }
    };

    return (
        <div className="create-article-container">
            <Navbar />
            <div className="create-article-content">
                <h1>Créer un Nouvel Article</h1>
                {success && <p className="success-message">Article créé avec succès !</p>}
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="create-article-form">
                    <label htmlFor="title">Titre de l'article :</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Entrez le titre"
                        required
                    />

                    <label htmlFor="description">Description :</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Entrez une brève description"
                        required
                    ></textarea>

                    <label htmlFor="content">Contenu de l'article :</label>
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
                                'table'
                            ],
                            toolbar: [
                                'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | help'
                            ].join(' | '),
                            menu: {
                                table: { title: 'Tableau', items: 'inserttable tableprops deletetable | cell row column' }
                            },
                            menubar: 'file edit insert view format table tools help',
                            images_upload_handler: async (blobInfo, success, failure) => {
                                const formData = new FormData();
                                formData.append('file', blobInfo.blob(), blobInfo.filename());

                                try {
                                    const response = await apiClient.post('/api/articles/upload-image', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                    });
                                    success(response.data.url);
                                } catch (err) {
                                    console.error('Erreur lors de l\'upload de l\'image:', err);
                                    failure('Erreur lors de l\'upload de l\'image.');
                                }
                            },
                        }}
                        onEditorChange={(newContent) => setContent(newContent)}
                    />

                    <button type="submit" className="submit-button">
                        Publier l'article
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateArticle;
