import React, {useState, useEffect, useCallback, useRef} from 'react';
import './Discussions.css';
import Navbar from '../../common/navbar/Navbar';
import userProfile from '../../../assets/temp/userProfile.png';
import likeIcon from '../../../assets/icons/like.svg';
import likeIconColor from '../../../assets/icons/likeColor.svg';
import Loader from '../../common/loader/Loader';
import apiClient from '../../../utils/apiClient';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer, toast} from 'react-toastify';
import useAuth from '../../../hooks/useAuth';

const Discussions = () => {
    // ** Références **
    const newDiscussionRef = useRef(null);
    const {isAdmin} = useAuth();

    // ** États liés à l'utilisateur **
    const userId = localStorage.getItem('userId');

    // ** États globaux pour les discussions **
    const [discussions, setDiscussions] = useState([]);
    const [expandeddiscussions, setExpandeddiscussions] = useState({});
    const [isLastPage, setIsLastPage] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('recent');

    // ** États pour les commentaires **
    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const [visibleComments, setVisibleComments] = useState({});
    const [newCommentContent, setNewCommentContent] = useState({});
    const [isLoadingComments, setIsLoadingComments] = useState({});
    const [replyInputVisible, setReplyInputVisible] = useState({});

    // ** États pour la création/modification des discussions **
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [newdiscussionMessage, setNewdiscussionMessage] = useState('');

    // ** États pour le chargement et les interactions **
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLiking, setIsLiking] = useState({});
    const [flyLikeId, setFlyLikeId] = useState(null);

    // ** Référence pour le cache des discussions **
    const cacheRef = useRef({});

    // ** Fonctions utilitaires **
    const formatElapsedTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        const diffInSec = Math.floor((now - date) / 1000);
        const timezoneOffset = (new Date()).getTimezoneOffset();
        const diffInSeconds = diffInSec - timezoneOffset * 60;

        if (diffInSeconds < 0) return 'à venir';
        if (diffInSeconds < 15) return 'à l\'instant';
        if (diffInSeconds < 60) return `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? 's' : ''}`;
        if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''}`;
        if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} heure${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`;

        const days = Math.floor(diffInSeconds / 86400);
        if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (days === 7) return `il y a 1 semaine`;
        if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (days === 30) return `il y a 1 mois`;
        if (days < 90) return `il y a ${days} jour${days > 1 ? 's' : ''}`;

        const months = Math.floor(days / 30);
        return `il y a ${months} mois`;
    };


    // ** Fonctions pour les discussions **
    const fetchDiscussions = useCallback(async (page = 1) => {
        const cacheKey = `${filter}-${page}`;
        if (cacheRef.current[cacheKey]) {
            setDiscussions((prev) => {
                const newItems = cacheRef.current[cacheKey].filter(
                    (item) => !prev.some((d) => d.id === item.id)
                );
                return [...prev, ...newItems];
            });
            setIsLastPage(cacheRef.current[cacheKey].length < 10);
            setIsLoading(false);
            return;
        }

        setIsLoadingMore(true);
        try {
            const response = await apiClient.get(
                `/api/custom-filter?page=${page}&itemsPerPage=10&filter=${filter}`
            );
            const discussionsData = response.data?.member || [];
            cacheRef.current[cacheKey] = discussionsData;

            setDiscussions((prev) => {
                const uniqueItems = discussionsData.filter(
                    (item) => !prev.some((d) => d.id === item.id)
                );
                return [...prev, ...uniqueItems];
            });
            setIsLastPage(discussionsData.length < 10);
        } catch (error) {
            console.error('Erreur lors de la récupération des discussions :', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [filter]);


    const loadMoreDiscussions = () => {
        if (isLoadingMore || isLastPage) return;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchDiscussions(nextPage);
    };

    const toggleExpanddiscussion = (id) => {
        setExpandeddiscussions((prevExpandeddiscussions) => ({
            ...prevExpandeddiscussions,
            [id]: !prevExpandeddiscussions[id]
        }));
    };
    const openNewDiscussion = () => {
        setIsPopupOpen(true);
        setTimeout(() => {
            if (newDiscussionRef.current) {
                newDiscussionRef.current.focus();
            }
        }, 0);
    };
    const handleAddDiscussion = async () => {
        try {
            const hasFirstDiscussionBadge = await apiClient.get(`/api/user_badges?user.id=${userId}&badge.name=Première discussion`);
            const nowAddDiscussion = new Date();
            nowAddDiscussion.setMinutes(nowAddDiscussion.getMinutes() - nowAddDiscussion.getTimezoneOffset());
            const firstDiscussionBadge = await apiClient.get('/api/badges?name=Première discussion');
            const firstDiscussionBadgeId = firstDiscussionBadge.data['member'][0].id;
            if (hasFirstDiscussionBadge.data['member'].length === 0) {
                console.log('Badge non trouvé');
                await apiClient.post('/api/user_badges', {
                    user: `/api/users/${userId}`,
                    badge: `/api/badges/${firstDiscussionBadgeId}`,
                    awarded_at: nowAddDiscussion,
                    status: true,
                });

                toast.success(
                    "Félicitations ! Vous avez débloqué le badge 'Première discussion'. Cliquez ici pour voir tous vos badges.",
                    { onClick: () => window.location.href = '/profile' }
                );
            }

            const response = await apiClient.post('/api/discussions', {
                content: newdiscussionMessage,
                user: `/api/users/${userId}`,
                created_at: nowAddDiscussion,
                updated_at: nowAddDiscussion,
                status: true
            });

            const newDiscussion = response.data;

            // Mettre à jour les discussions localement
            setDiscussions([newDiscussion, ...discussions]);
            setNewdiscussionMessage('');
            setIsPopupOpen(false);
        } catch (error) {
            console.error("Erreur lors de l'ajout de la discussion ou de l'attribution du badge :", error);
        }
    };


    // ** Fonctions pour les commentaires **
    const fetchComments = async (discussionId, commentUrls) => {
        setIsLoadingComments((prev) => ({ ...prev, [discussionId]: true }));
        try {
            if (!Array.isArray(commentUrls)) {
                throw new Error(`Les URLs des commentaires doivent être un tableau : reçu ${typeof commentUrls}`);
            }

            const validUrls = commentUrls.filter((url) => typeof url === 'string');

            const commentsData = await Promise.all(
                validUrls.map(async (url) => {
                    const commentResponse = await apiClient.get(url);
                    const comment = commentResponse.data;

                    if (!comment.user || typeof comment.user !== 'string') {
                        throw new Error(`Le champ 'user' dans un commentaire est invalide : ${JSON.stringify(comment)}`);
                    }

                    const userResponse = await apiClient.get(comment.user);
                    const user = userResponse.data;

                    return { ...comment, user };
                })
            );

            setComments((prevComments) => ({
                ...prevComments,
                [discussionId]: commentsData,
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
        } finally {
            setIsLoadingComments((prev) => ({ ...prev, [discussionId]: false }));
        }
    };

    const toggleShowComments = (discussionId, commentIds) => {
        setShowComments((prevShowComments) => {
            if (prevShowComments[discussionId]) {
                return {};
            } else {
                if (!comments[discussionId]) {
                    const commentUrls = commentIds.map((id) => `/api/discussion_comments/${id}`);
                    fetchComments(discussionId, commentUrls);
                }
                setVisibleComments({ [discussionId]: 5 });
                return { [discussionId]: true };
            }
        });
    };

    const handleReplyClick = (discussionId) => {
        setReplyInputVisible((prev) => ({
            ...prev,
            [discussionId]: !prev[discussionId],
        }));
    };

    const loadMoreComments = (id) => {
        setVisibleComments((prevVisibleComments) => ({
            ...prevVisibleComments,
            [id]: prevVisibleComments[id] + 5
        }));
    };
    const handleAddComment = async (discussionId) => {

        const commentContent = newCommentContent[discussionId];

        if (!commentContent || commentContent.trim() === '') {
            const inputElement = document.getElementById(`comment-input-${discussionId}`);
            const counterElement = document.getElementById(`character-counter-${discussionId}`);

            inputElement.classList.add('shake');
            counterElement.classList.add('shake');

            setTimeout(() => {
                inputElement.classList.remove('shake');
                counterElement.classList.remove('shake');
            }, 300);

            return;
        }

        try {
            const nowAddComment = new Date();
            nowAddComment.setMinutes(nowAddComment.getMinutes() - nowAddComment.getTimezoneOffset());
            const response = await apiClient.post('/api/discussion_comments', {
                content: commentContent,
                discussion: `/api/discussions/${discussionId}`,
                user: `/api/users/${userId}`,
                created_at: nowAddComment,
                updated_at: nowAddComment,
                status: true
            });
            const newComment = response.data;

            const userResponse = await apiClient.get(`/api/users/${userId}`);
            const user = userResponse.data;

            const commentWithUser = {
                ...newComment,
                user: user
            };

            setComments((prevComments) => ({
                ...prevComments,
                [discussionId]: [commentWithUser, ...(prevComments[discussionId] || [])]
            }));
            setDiscussions((prevDiscussions) =>
                prevDiscussions.map((discussion) =>
                    discussion.id === discussionId
                        ? { ...discussion, commentCount: discussion.commentCount + 1 }
                        : discussion
                )
            );

            setReplyInputVisible((prev) => ({
                ...prev,
                [discussionId]: false,
            }));

            setNewCommentContent({ ...newCommentContent, [discussionId]: '' });

        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire :", error);
        }
    };
    const handleCommentInputChange = (discussionId, value) => {
        if (value.length <= 200) {
            setNewCommentContent({ ...newCommentContent, [discussionId]: value });
        }
    };

    // ** Fonctions pour les likes **
    const toggleLike = async (id, userLiked) => {
        if (isLiking[id]) return;
        setIsLiking((prevIsLiking) => ({ ...prevIsLiking, [id]: true }));

        try {
            let updatedLikeCount = 0;

            if (userLiked) {
                const likeToDelete = await apiClient.get(`/api/discussion_likes?user=/api/users/${userId}&discussion=/api/discussions/${id}`);
                if (likeToDelete.data['member'].length > 0) {
                    const likeId = likeToDelete.data['member'][0].id;
                    await apiClient.delete(`/api/discussion_likes/${likeId}`);
                    updatedLikeCount = -1;
                }
            } else {
                await apiClient.post('/api/discussion_likes', {
                    discussion: `/api/discussions/${id}`,
                    user: `/api/users/${userId}`
                });
                updatedLikeCount = 1;

                setFlyLikeId(id);
                setTimeout(() => setFlyLikeId(null), 800);
            }

            setDiscussions(prevDiscussions =>
                prevDiscussions.map(discussion =>
                    discussion.id === id
                        ? { ...discussion, userLiked: !userLiked, likeCount: discussion.likeCount + updatedLikeCount }
                        : discussion
                )
            );
        } catch (error) {
            console.error('Erreur lors du like de la discussions:', error);
        } finally {
            setIsLiking((prevIsLiking) => ({ ...prevIsLiking, [id]: false }));
        }
    };

    useEffect(() => {
        const cacheKey = `${filter}-1`;
        if (cacheRef.current[cacheKey]) {
            setDiscussions(cacheRef.current[cacheKey]);
            setIsLastPage(cacheRef.current[cacheKey].length < 10);
            setIsLoading(false);
        } else {
            setDiscussions([]);
            setCurrentPage(1);
            setIsLastPage(false);
            fetchDiscussions(1);
        }
    }, [filter, fetchDiscussions]);


    // ** Rendu de la page **
    if (isLoading) { return <Loader />; }
    return (
        <div className="actualite-container">
            <Navbar/>
            <ToastContainer/>
            <div className="discussion-content-container">
                <h1>Fil d’actualité</h1>
                <div className="filter-buttons">
                    <button
                        className={filter === 'recent' ? 'active' : ''}
                        onClick={() => setFilter('recent')}
                    >
                        Récents
                    </button>
                    <button
                        className={filter === 'most_liked' ? 'active' : ''}
                        onClick={() => setFilter('most_liked')}
                    >
                        Les plus aimés
                    </button>
                    <button
                        className={filter === 'trending' ? 'active' : ''}
                        onClick={() => setFilter('trending')}
                    >
                        Tendances
                    </button>
                </div>
                {/* Bouton pour ajouter une nouvelle discussions */}
                {isAdmin && (
                    <div className="add-discussion-section">
                        {!isPopupOpen ? (
                            <div className="add-discussion-button" onClick={openNewDiscussion}>+</div>
                        ) : (
                            <div className="new-discussion-card">
                        <textarea
                            ref={newDiscussionRef}
                            placeholder="Quoi de neuf?"
                            value={newdiscussionMessage}
                            onChange={(e) => setNewdiscussionMessage(e.target.value)}
                            className="new-discussion-textarea"
                        />
                                <div className="new-discussion-actions">
                                    <button onClick={handleAddDiscussion} className="submit-button">Publier</button>
                                    <button onClick={() => setIsPopupOpen(false)} className="cancel-button">Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                    <div className="discussions-container">
                {discussions.length > 0 && (
                    discussions.map((discussion, index) => (
                    <div className={`discussion ${discussion.userLiked ? 'liked' : ''}`}
                 key={`discussion-${index}-${discussion.id}`}
                 style={{backgroundColor: index % 2 === 0 ? 'rgba(255, 123, 0, 0.1)' : '#fff'}}>
                <div className="discussion-header">
                    <img src={discussion.user?.image_profile || userProfile} alt="User Profile"
                         className="discussion-profile-pic"/>
                    <div className="discussion-info">
                        <h2>{discussion.user?.username}</h2>
                        <span>{formatElapsedTime(discussion.created_at)}</span>
                    </div>
                </div>
                <p className="discussion-message">
                    {expandeddiscussions[discussion.id] || discussion.content.length <= 100
                        ? discussion.content
                        : `${discussion.content.substring(0, 150)}...`}
                    {discussion.content.length > 100 && (
                        <span className="toggle-message"
                              onClick={() => toggleExpanddiscussion(discussion.id)}>
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
                        <button onClick={() => handleReplyClick(discussion.id)} className="reply-button">
                            {replyInputVisible[discussion.id] ? 'Annuler' : 'Répondre'}
                        </button>
                        {replyInputVisible[discussion.id] && (
                            <div className="add-comment-section">
                                <input
                                    type="text"
                                    id={`comment-input-${discussion.id}`}
                                    value={newCommentContent[discussion.id] || ''}
                                    onChange={(e) => handleCommentInputChange(discussion.id, e.target.value)}
                                    placeholder="Ajouter un commentaire..."
                                    className="comment-input"
                                    maxLength="200"
                                />
                                <div id={`character-counter-${discussion.id}`}
                                     className="character-counter">
                                    {newCommentContent[discussion.id]?.length || 0} / 200
                                </div>
                                <button onClick={() => handleAddComment(discussion.id)}
                                        className="comment-button">
                                    Commenter
                                </button>
                            </div>
                        )}
                        {isLoadingComments[discussion.id] ? (
                            <Loader isCommentLoader={true}/>
                        ) : (
                            comments[discussion.id]?.slice(0, visibleComments[discussion.id]).map(comment => (
                                <div className="comment" key={comment.id}>
                                    <div className="comment-header">
                                                        <span
                                                            className="comment-author">{comment.user?.username}</span>
                                        <span
                                            className="comment-time">{formatElapsedTime(comment.created_at)}</span>
                                    </div>
                                    <span className="comment-message">{comment.content}</span>
                                </div>
                            ))
                        )}
                        {visibleComments[discussion.id] < (comments[discussion.id]?.length || 0) && (
                            <div className="load-more" onClick={() => loadMoreComments(discussion.id)}>
                                Charger plus
                            </div>
                        )}

                    </div>
                )}
            </div>
            ))
            )}
        </div>
    <div className="load-more-container">
        {
            isLoading || isLoadingMore ? (
                <Loader/>
            ) : discussions.length === 0 ? (
                <p>Aucune discussion disponible pour le moment.</p>
            ) : isLastPage ? (
                <p className="no-more-discussions-message">Toutes les discussions ont été chargées.</p>
            ) : (
                <button onClick={loadMoreDiscussions} className="load-more-button">
                    Voir plus
                </button>
            )
        }
    </div>

</div>
</div>
)
    ;
};

export default Discussions;
