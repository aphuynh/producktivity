import React, { ChangeEvent, Dispatch, FunctionComponent, useState } from 'react'
import "./ManageListsWindow.css"
import { ListInterface } from '../../interfaces/List'

import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import { ReactComponent as TrashIcon } from '../../assets/trash.svg';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';

interface ManageListsWindowProps {
    lists: Array<ListInterface>,
	setLists: Dispatch<Array<ListInterface>>,
	getLists: Dispatch<void>
}

const ManageListsWindow: FunctionComponent<ManageListsWindowProps> = ({
    lists, 
    setLists,
    getLists
}) => {

    const [listsFilter, setListsFilter] = useState("");

    const handleListSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setListsFilter(e.target.value.toLowerCase());
    }

    const handleSearchFocus = () => {
        document.getElementById("manage-lists-window-search-bar")!.style.backgroundColor = '#B4D9AD';
    }

    const handleSearchFocusOut = () => {
        document.getElementById("manage-lists-window-search-bar")!.style.backgroundColor = '';
    }

    return (
        <div id="manage-lists-window">
            <div id='manage-lists-window-label'>Manage Lists</div>
            <div id='manage-lists-window-content'>
                <div id="manage-lists-window-search-bar">
                    <input type="text"id='manage-lists-window-search-input' placeholder="Search for list..." onChange={handleListSearch} onFocus={handleSearchFocus} onBlur={handleSearchFocusOut}></input>
                    <div id="manage-lists-window-search-icon-wrapper">
                        <SearchIcon id="manage-lists-window-search-icon"></SearchIcon>
                    </div>
                </div>
                <div id="manage-lists-window-search-results">
                    <div id="search-results-wrapper">
                        {lists.filter(x => x.name.toLowerCase().includes(listsFilter)).map((list, ind) => (
                            <div 
                                className='manage-lists-window-drop-down-result'
                                key={"manage-lists-window-drop-down-option-" + list.id}
                                id={"manage-lists-window-drop-down-option-" + list.id}
                                data-list-id={list.id}
                                data-list-name={list.name}                          
                            >
                                <div className='manage-lists-window-list-name'>{list.name}</div>
                                <div className='manage-lists-window-actions'>
                                    <EditIcon id="manage-lists-window-edit-icon"></EditIcon>
                                    <TrashIcon id="manage-lists-window-trash-icon"></TrashIcon>
                                </div>
                            </div> 
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageListsWindow