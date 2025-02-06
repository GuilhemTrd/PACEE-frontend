import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../utils/apiClient';
import './Users.css';
import Navbar from '../../common/navbar/Navbar';
import useAuth from '../../../hooks/useAuth';
import userProfilePlaceholder from '../../../assets/temp/userProfile.png';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiClient.get('/api/users');
                const allUsers = response.data.member || [];
                const filteredUsers = user ? allUsers.filter(u => u.email !== user.email) : allUsers;

                setUsers(filteredUsers);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs:", error);
                setUsers([]);
            }
        };

        fetchUsers();
    }, [user]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleRowClick = (userId) => {
        navigate(`/publicProfile/${userId}`);
    };

    const filteredUsers = users.filter((u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="users-page">
            <Navbar />
            <div className="users-content-wrapper">
                <h1>Découvre d'autres utilisateurs !</h1>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur par nom"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                <table className="users-table">
                    <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.id} onClick={() => handleRowClick(user.id)} className="clickable-row">
                                <td>
                                    <img
                                        src={user.image_profile ? `${process.env.REACT_APP_API_URL}${user.image_profile}` : userProfilePlaceholder}
                                        alt="Avatar utilisateur"
                                        className="user-avatar"
                                    />
                                </td>
                                <td className="user-name">{user.username}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" className="no-users">Aucun utilisateur trouvé.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
