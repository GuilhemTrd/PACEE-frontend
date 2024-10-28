import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Discussion.css';
import Navbar from '../navbar/Navbar';
import userProfile from '../../assets/temp/userProfile.png';
import likeIcon from '../../assets/icons/like.svg';
import likeIconColor from '../../assets/icons/likeColor.svg';
import Loader from '../loader/Loader';
import apiClient from '../../utils/apiClient';

const Discussion = () => {
    const [discussions, setDiscussions] = useState([]);
    const [expandeddiscussions, setExpandeddiscussions] = useState({});
    const [showComments, setShowComments] = useState({});
    const [comments, setComments] = useState({});
    const [visibleComments, setVisibleComments] = useState({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [newdiscussionMessage, setNewdiscussionMessage] = useState('');
    const [lastdiscussionTime, setLastdiscussionTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    //const [newCommentContent, setNewCommentContent] = useState({});
    const [flyLikeId, setFlyLikeId] = useState(null);
    const [isLiking, setIsLiking] = useState({});

    const userId = localStorage.getItem('userId'); // Récupère l'ID de l'utilisateur connecté

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchDiscussions = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/discussions');
            const discussionsData = response.data['member'] || [];

            const updatedDiscussions = await Promise.all(
                discussionsData.map(async (discussion) => {
                    const userResponse = await apiClient.get(discussion.user);
                    const user = userResponse.data;

                    const likeResponse = await apiClient.get(`/api/discussion_likes?user=/api/users/${userId}&discussion=/api/discussions/${discussion.id}`);
                    const userLiked = likeResponse.data['member'].length > 0;

                    return { ...discussion, user, userLiked };
                })
            );

            setDiscussions(updatedDiscussions);
            setIsLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des discussions:', error);
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchDiscussions().then(() => console.log('Discussions récupérées'));
    }, [fetchDiscussions]);

    const toggleExpanddiscussion = (id) => {
        setExpandeddiscussions((prevExpandeddiscussions) => ({
            ...prevExpandeddiscussions,
            [id]: !prevExpandeddiscussions[id]
        }));
    };

    const toggleLike = async (id, userLiked) => {
        if (isLiking[id]) return; // Ignorer le clic si un like/unlike est déjà en cours pour ce post

        setIsLiking((prevIsLiking) => ({ ...prevIsLiking, [id]: true })); // Verrouille le like pour ce post

        try {
            let updatedLikeCount = 0;

            if (userLiked) {
                // Unlike the discussion
                const likeToDelete = await apiClient.get(`/api/discussion_likes?user=/api/users/${userId}&discussion=/api/discussions/${id}`);
                if (likeToDelete.data['member'].length > 0) {
                    const likeId = likeToDelete.data['member'][0].id;
                    await apiClient.delete(`/api/discussion_likes/${likeId}`);
                    updatedLikeCount = -1;
                }
            } else {
                // Like the discussion
                await apiClient.post('/api/discussion_likes', {
                    discussion: `/api/discussions/${id}`,
                    user: `/api/users/${userId}`
                });
                updatedLikeCount = 1;

                setFlyLikeId(id);
                setTimeout(() => setFlyLikeId(null), 800); // Réinitialise après 0.8 seconde
            }

            // Update the like count and userLiked state in discussions
            setDiscussions(prevDiscussions =>
                prevDiscussions.map(discussion =>
                    discussion.id === id
                        ? { ...discussion, userLiked: !userLiked, likeCount: discussion.likeCount + updatedLikeCount }
                        : discussion
                )
            );
        } catch (error) {
            console.error('Erreur lors du like de la discussion:', error);
        } finally {
            setIsLiking((prevIsLiking) => ({ ...prevIsLiking, [id]: false })); // Déverrouille le like pour ce post
        }
    };

    const fetchComments = async (discussionId, commentUrls) => {
        try {
            const commentsData = await Promise.all(
                commentUrls.map(async (url) => {
                    const commentResponse = await apiClient.get(url);
                    const comment = commentResponse.data;
                    // Récupérer les informations utilisateur pour chaque commentaire
                    const userResponse = await apiClient.get(comment.user);
                    const user = userResponse.data;
                    return { ...comment, user };
                })
            );
            setComments(prevComments => ({
                ...prevComments,
                [discussionId]: commentsData
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
        }
    };

    const toggleShowComments = (discussionId, commentUrls) => {
        setShowComments((prevShowComments) => {
            // Si l'espace de commentaires est déjà ouvert, on le ferme
            if (prevShowComments[discussionId]) {
                return {}; // Ferme tout espace de commentaires
            } else {
                // Ferme les autres et ouvre celui sélectionné
                if (!comments[discussionId]) {
                    fetchComments(discussionId, commentUrls);
                }
                setVisibleComments({ [discussionId]: 5 });
                return { [discussionId]: true };
            }
        });
    };

    const loadMoreComments = (id) => {
        setVisibleComments((prevVisibleComments) => ({
            ...prevVisibleComments,
            [id]: prevVisibleComments[id] + 5
        }));
    };

    const handleAdddiscussion = async () => {
        const now = Date.now();
        if (now - lastdiscussionTime < 60000) {
            toast.error('Vous ne pouvez discussioner qu\'une fois par minute.');
            return;
        }

        if (newdiscussionMessage.trim() === '') {
            toast.error('Le message ne peut pas être vide.');
            return;
        }

        try {
            const response = await apiClient.discussion('/api/discussions', {
                content: newdiscussionMessage,
                user: `/api/users/${userId}`,
            });
            const newDiscussion = response.data;

            setDiscussions([newDiscussion, ...discussions]);
            setNewdiscussionMessage('');
            setIsPopupOpen(false);
            setLastdiscussionTime(now);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la discussion:', error);
        }
    };
    /*
        const handleAddComment = async (discussionId) => {
            const commentContent = newCommentContent[discussionId];
            if (!commentContent || commentContent.trim() === '') {
                toast.error('Le commentaire ne peut pas être vide.');
                return;
            }

            try {
                const response = await apiClient.discussion('/api/discussion_comments', {
                    content: commentContent,
                    discussion: `/api/discussions/${discussionId}`,
                    user: `/api/users/${userId}`,
                });

                const newComment = response.data;
                setDiscussions(prevDiscussions =>
                    prevDiscussions.map(discussion =>
                        discussion.id === discussionId
                            ? { ...discussion, comments: [...discussion.comments, newComment] }
                            : discussion
                    )
                );
                setNewCommentContent({ ...newCommentContent, [discussionId]: '' });
            } catch (error) {
                console.error('Erreur lors de l\'ajout du commentaire:', error);
            }
        };

       const handleCommentInputChange = (discussionId, value) => {
            setNewCommentContent({ ...newCommentContent, [discussionId]: value });
        };
        */

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="actualite-container">
            <Navbar />
            <div className="content-container">
                <h1>Fil d’actualité</h1>
                <div className="discussions-container">
                    {discussions.length > 0 ? (
                        discussions.map((discussion, index) => (
                            <div className={`discussion ${discussion.userLiked ? 'liked' : ''}`} key={discussion.id} style={{ backgroundColor: index % 2 === 0 ? 'rgba(255, 123, 0, 0.1)' : '#fff' }}>
                                <div className="discussion-header">
                                    <img src={discussion.user?.image_profile || userProfile} alt="User Profile" className="discussion-profile-pic" />
                                    <div className="discussion-info">
                                        <h2>{discussion.user?.full_name}</h2>
                                        <span>{new Date(discussion.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="discussion-message">
                                    {expandeddiscussions[discussion.id] || discussion.content.length <= 100
                                        ? discussion.content
                                        : `${discussion.content.substring(0, 100)}...`}
                                    {discussion.content.length > 100 && (
                                        <span className="toggle-message" onClick={() => toggleExpanddiscussion(discussion.id)}>
                                            {expandeddiscussions[discussion.id] ? ' Voir moins' : ' Voir plus'}
                                        </span>
                                    )}
                                </p>
                                <div className="discussion-footer">
                                    <div className="like-container"
                                         onClick={() => toggleLike(discussion.id, discussion.userLiked)}>
                                        <span className="like-count">{discussion.likeCount}‎ ‎ </span>
                                        <img
                                            src={discussion.userLiked ? likeIconColor : likeIcon}
                                            alt={discussion.userLiked ? 'Liked' : 'Like'}
                                            className={`discussion-like ${discussion.userLiked ? 'liked' : ''}`}
                                        />
                                        {flyLikeId === discussion.id && <span className="fly-like">+1</span>}
                                    </div>
                                    <span className="discussion-comments"
                                          onClick={() => toggleShowComments(discussion.id, discussion.discussionComments)}>
                                        {discussion.commentCount || 0} {discussion.commentCount === 1 ? "commentaire" : "commentaires"}
                                    </span>
                                </div>
                                {showComments[discussion.id] && (
                                    <div className="comments-section">
                                        {comments[discussion.id]?.slice(0, visibleComments[discussion.id]).map(comment => (
                                            <div className="comment" key={comment.id}>
                                                <span className="comment-author">{comment.user?.full_name}</span>
                                                <span className="comment-message">{comment.content}</span>
                                            </div>
                                        ))}
                                        {visibleComments[discussion.id] < (comments[discussion.id]?.length || 0) && (
                                            <div className="load-more" onClick={() => loadMoreComments(discussion.id)}>
                                                Charger plus
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Aucune discussion disponible pour le moment.</p>
                    )}
                </div>
                <div className="add-discussion-button" onClick={() => setIsPopupOpen(true)}>+</div>
            </div>
            {isPopupOpen && (
                <div className="popup">
                    <div className="popup-inner">
                        <textarea
                            placeholder="Quoi de neuf?"
                            value={newdiscussionMessage}
                            onChange={(e) => setNewdiscussionMessage(e.target.value)}
                        />
                        <button onClick={handleAdddiscussion}>Ajouter</button>
                        <button onClick={() => setIsPopupOpen(false)}>Annuler</button>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default Discussion;