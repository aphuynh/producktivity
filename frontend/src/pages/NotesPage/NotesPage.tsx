import React, { ChangeEvent, useState } from 'react'

import "./NotesPage.css"

import { ReactComponent as SearchIcon } from '../../../src/assets/search.svg';
import { ReactComponent as ArrowDownIcon } from '../../../src/assets/carrot.svg';
import { ReactComponent as ClseIcon } from '../../../src/assets/close.svg';
import { ReactComponent as ImageIcon } from '../../../src/assets/image.svg';

import NotesWindow from '../../components/NotesWindow/NotesWindow';

const NotesPage = () => {
    const testing = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20, 21, 22, 23, 24, 25];
    const [searchNotesFilter, setSearchNotesFilter] = useState("");
    const [searchTagsFilter, setSearchTagsFilter] = useState("");
    const [noteTagsFilter, setNoteTagsFilter] = useState("");

    const handleNotesSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchNotesFilter(e.target.value.toLowerCase());
    }
    const handleTagsSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTagsFilter(e.target.value.toLowerCase());
    }
    const handleNoteTagsSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setNoteTagsFilter(e.target.value.toLowerCase());
    }

    return (
        <div id="notes-page">
            <NotesWindow></NotesWindow>
            <div id="notes-page-notes-list-wrapper">
                <div id="notes-page-notes-list">
                    {testing.map((number) => (
                        <div className='notes-page-notes-bar'>CS Notes</div>
                    ))}
                </div>
            </div>
            <div id="notes-page-options">
                <div id="notes-page-create-new-note-button">Create New Note</div>
                <div id="notes-page-notes-search-bar">
                    <input type="text"id='notes-page-notes-search-input' placeholder="Search Title..." onChange={handleNotesSearch}></input>
                    <SearchIcon id="notes-page-notes-search-icon"></SearchIcon>
                </div>
                <div id="notes-page-notes-sort-by-bar">
                    <input type="text"id='notes-page-notes-sort-by-input' placeholder="Sort By"></input>
                    <ArrowDownIcon id="notes-page-arrow-icon"></ArrowDownIcon>
                </div>
                <div id="note-page-tags-search">
                    <div id="notes-page-tags-search-bar">
                        <input type="text"id='notes-page-tags-search-input' placeholder="Search for list..." onChange={handleTagsSearch}></input>
                        <SearchIcon id="notes-page-tags-search-icon"></SearchIcon>
                    </div>
                    <div id="notes-page-tags-search-results">
                        <div id="notes-page-tags-search-results-wrapper">
                            {testing.map((number) => (
                                <div className='notes-page-search-tags-bar'>CS Noasdasdasdasdasdasdtes</div>
                            ))}

                            {/*lists.filter(x => x.name.toLowerCase().includes(listsFilter)).map((list, ind) => (
                                <div 
                                    className='notes-page-drop-down-result'
                                    key={"notes-page-drop-down-option-" + list.id}
                                    id={"notes-page-drop-down-option-" + list.id}
                                    data-list-id={list.id}
                                    data-list-name={list.name}
                                    data-selected="false"
                                    onClick={addListToTask}
                                >
                                    {list.name}
                                </div> 
                            ))*/}
                        </div>
                    </div>
                </div>
                <div id="notes-page-tags-wrapper">
                        {testing.map((number) => (
                            <div className='notes-page-tag-bar'>Dictionary</div>
                        ))}
                    {/*lists.filter(item => taskListsArray.includes(item.id)).map((list, ind)=>(
                        <div className='applied-list' key={"applied-list-" + list.id + "-" + ind}>
                            {list.name}
                            <CloseIcon className='task-tab-close' onClick={removeListFromTask} title="Close Tab" data-list-id={list.id}></CloseIcon>    
                        </div>
                    ))*/}
                </div>
            </div>
        </div>
    )
}

export default NotesPage