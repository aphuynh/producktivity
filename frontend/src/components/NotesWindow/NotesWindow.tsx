import React from 'react'

import {ReactComponent as LeftArrowIcon} from '../../assets/leftarrow.svg';
import {ReactComponent as EditIcon} from '../../assets/edit.svg';

import "./NotesWindow.css"

const NotesWindow = () => {

    const testing = [1,2,3,4,5,6,7,8,9,10,11, 23, 24, 25];

    return (
        <div id="notes-window">
            <div id="notes-window-top-bar">
                <div id="notes-window-back-button">
                    <LeftArrowIcon id="notes-window-left-arrow-icon"></LeftArrowIcon>
                    Notes
                </div>
                <div id="notes-window-note-title-information">
                    <input id="notes-window-notes-title" value="AOT Crochet Cape">
                    </input>
                    <EditIcon id="notes-window-title-edit-icon"></EditIcon>
                </div>
            </div>
            <div id="notes-window-body">
                <div id="notes-window-body-left">
                    <div id="notes-window-tags-section">
                        <div id="notes-window-tags-top-bar">
                            Tags
                        </div>
                        <div id="notes-window-tags-wrapper">
                            <div id="notes-window-tags-list">
                                {testing.map((number) => (
                                    <div className='notes-window-tag-bar'>Testing {number}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div id="notes-window-notes-actions">
                        <div className="notes-window-actions-buttons" id="notes-window-save-changes-button">
                            Save Changes
                        </div>
                        <div className="notes-window-actions-buttons" id="notes-window-delete-note-button">
                            Delete Note
                        </div>
                    </div>
                </div>
                <div id="notes-window-body-right">

                </div>
            </div>
        </div>
    )
}

export default NotesWindow