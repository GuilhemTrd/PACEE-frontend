import React, {useState, useEffect, useCallback, useRef} from 'react';
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
    const [isLastPage, setIsLastPage] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newCommentContent, setNewCommentContent] = useState({});
    const [isLoadingComments, setIsLoadingComments] = useState({});
    const [flyLikeId, setFlyLikeId] = useState(null);
    const [isLiking, setIsLiking] = useState({});
    const newDiscussionRef = useRef(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const userId = localStorage.getItem('userId');

    const fetchDiscussions = useCallback(async (page = 0) => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            const response = await apiClient.get(`/api/discussions?page=${page}&itemsPerPage=10`);
            const discussionsData = response.data['member'] || [];

            // Vérifiez si c'est la dernière page
            if (discussionsData.length < 10) {
                setIsLastPage(true);
            }

            const updatedDiscussions = await Promise.all(
                discussionsData.map(async (discussion) => {
                    const userResponse = await apiClient.get(discussion.user);
                    const user = userResponse.data;

                    const likeResponse = await apiClient.get(`/api/discussion_likes?user=/api/users/${userId}&discussion=/api/discussions/${discussion.id}`);
                    const userLiked = likeResponse.data['member'].length > 0;

                    return { ...discussion, user, userLiked };
                })
            );

            updatedDiscussions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setDiscussions((prevDiscussions) => {
                const newDiscussions = updatedDiscussions.filter(
                    (newDisc) => !prevDiscussions.some((prevDisc) => prevDisc.id === newDisc.id)
                );
                return [...prevDiscussions, ...newDiscussions];
            });

            setIsLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des discussions:', error);
            setIsLoading(false);
        } finally {
            setIsLoadingMore(false);
        }
    }, [userId]);

    const loadMoreDiscussions = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    useEffect(() => {
        fetchDiscussions(currentPage);
    }, [currentPage, fetchDiscussions]);

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
    const toggleLike = async (id, userLiked) => {
        if (isLiking[id]) return;
        setIsLiking((prevIsLiking) => ({ ...prevIsLiking, [id]: true }));

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
            setIsLiking((prevIsLiking) => ({ ...prevIsLiking, [id]: false }));
        }
    };
    const fetchComments = async (discussionId, commentUrls) => {
        setIsLoadingComments((prev) => ({ ...prev, [discussionId]: true }));
        try {
            const commentsData = await Promise.all(
                commentUrls.map(async (url) => {
                    const commentResponse = await apiClient.get(url);
                    const comment = commentResponse.data;
                    const userResponse = await apiClient.get(comment.user);
                    const user = userResponse.data;
                    return { ...comment, user };
                })
            );

            commentsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setComments(prevComments => ({
                ...prevComments,
                [discussionId]: commentsData
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
        } finally {
            setIsLoadingComments((prev) => ({ ...prev, [discussionId]: false }));
        }
    };
    const toggleShowComments = (discussionId, commentUrls) => {
        setShowComments((prevShowComments) => {
            if (prevShowComments[discussionId]) {
                return {}; // Ferme tout espace de commentaires
            } else {
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
    const handleAddComment = async (discussionId) => {
        const nowAddComment = new Date();
        nowAddComment.setMinutes(nowAddComment.getMinutes() - nowAddComment.getTimezoneOffset());
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

            setNewCommentContent({ ...newCommentContent, [discussionId]: '' });

        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire :", error);
        }
    };
    const handleAdddiscussion = async () => {
        console.log('Ajout de la discussion :', newdiscussionMessage);
        try {
            console.log('try');
            const response = await apiClient.post('/api/discussions', {
                content: newdiscussionMessage,
                user: `/api/users/33`,
                created_at: new Date(),
                updated_at: new Date(),
                status: true
            });
            const newDiscussion = response.data;

            setDiscussions([newDiscussion, ...discussions]);
            setNewdiscussionMessage('');
            setIsPopupOpen(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la discussion:', error);
        }
    };
    const handleCommentInputChange = (discussionId, value) => {
        if (value.length <= 200) {
            setNewCommentContent({ ...newCommentContent, [discussionId]: value });
        }
    };

    function formatElapsedTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();

        const diffInSec = Math.floor((now - date) / 1000);

        const timezoneOffset = (new Date()).getTimezoneOffset();
        const timezoneOffsetInSec = timezoneOffset * 60;

        const diffInSeconds = diffInSec - timezoneOffsetInSec;
        if (diffInSeconds < 0) {
            return 'à venir';
        }
        if (diffInSeconds < 15) {
            return 'à l\'instant';
        }
        if (diffInSeconds < 60) {
            return `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? 's' : ''}`;
        }
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
        }
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
        }
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
        }
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
        }
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `il y a ${diffInMonths} mois`;
        }
        const diffInYears = Math.floor(diffInDays / 365);
        return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
    }
    if (isLoading) { return <Loader />; }

    return (
        <div className="actualite-container">
            <Navbar />
            <div className="content-container">
                <h1>Fil d’actualité</h1>
                {/* Bouton pour ajouter une nouvelle discussion */}
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
                                <button onClick={handleAdddiscussion} className="submit-button">Publier</button>
                                <button onClick={() => setIsPopupOpen(false)} className="cancel-button">Annuler</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="discussions-container">
                    {discussions.length > 0 ? (
                        discussions.map((discussion, index) => (
                            <div className={`discussion ${discussion.userLiked ? 'liked' : ''}`} key={discussion.id}
                                 style={{backgroundColor: index % 2 === 0 ? 'rgba(255, 123, 0, 0.1)' : '#fff'}}>
                                <div className="discussion-header">
                                    <img src={discussion.user?.image_profile || userProfile} alt="User Profile"
                                         className="discussion-profile-pic"/>
                                    <div className="discussion-info">
                                        <h2>{discussion.user?.full_name}</h2>
                                        <span>{formatElapsedTime(discussion.created_at)}</span>
                                    </div>
                                </div>
                                <p className="discussion-message">
                                    {expandeddiscussions[discussion.id] || discussion.content.length <= 100
                                        ? discussion.content
                                        : `${discussion.content.substring(0, 100)}...`}
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
                                        {isLoadingComments[discussion.id] ? (
                                            <Loader isCommentLoader={true}/>
                                        ) : (
                                            comments[discussion.id]?.slice(0, visibleComments[discussion.id]).map(comment => (
                                                <div className="comment" key={comment.id}>
                                                    <div className="comment-header">
                                                        <span
                                                            className="comment-author">{comment.user?.full_name}</span>
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

                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Aucune discussion disponible pour le moment.</p>
                    )}
                </div>
                <div className="load-more-container">
                    {isLastPage ? (
                        <p className="no-more-discussions-message">Toutes les discussions ont été chargées.</p>
                    ) : (
                        isLoadingMore ? (
                            <Loader/>
                        ) : (
                            <button onClick={loadMoreDiscussions} className="load-more-button">
                                Voir plus
                            </button>
                        )
                    )}
                </div>

            </div>
        </div>
    );
};

export default Discussion;
