import React from 'react';
import Navbar from '../../common/navbar/Navbar';
import './Settings.css';

const Settings = () => {

    return (
        <div className="settings-container">
            <Navbar />
            <div className="settings-content">
                <h1 className="settings-title">Paramètres</h1>
            </div>
        </div>
    );
};

export default Settings;
