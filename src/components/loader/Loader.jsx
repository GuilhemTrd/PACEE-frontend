import React from 'react';
import './Loader.css';
import { LineWobble } from '@uiball/loaders';
const Loader = ({ isCommentLoader }) => {
    return (
        <div className={isCommentLoader ? "comment-loader-container" : "loader-container"}>
            <div className="loader-content">
                <LineWobble size={70} lineWeight={5.5} speed={1.9} color="#FF7B00" />
            </div>
        </div>
    );
};

export default Loader;
