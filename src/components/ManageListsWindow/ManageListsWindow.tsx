import React, { ChangeEvent, Dispatch, FocusEvent, FunctionComponent, KeyboardEvent, MouseEvent, SetStateAction, useCallback, useEffect, useState } from 'react'
import Config from "../../config.json"
import "./ManageListsWindow.css"
import { ListInterface } from '../../interfaces/List'

import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import { ReactComponent as TrashIcon } from '../../assets/trash.svg';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import DeleteAlert from '../Alert/DeleteAlert';

interface ManageListsWindowProps {
    lists: Array<ListInterface>,
	setLists: Dispatch<Array<ListInterface>>,
	getLists: Dispatch<void>,
    currentList: ListInterface|string,
    setCurrentList: Dispatch<SetStateAction<ListInterface|string>>,
    openLists: Array<number>,
    setOpenLists: Dispatch<SetStateAction<Array<number>>>
    
}

const ManageListsWindow: FunctionComponent<ManageListsWindowProps> = ({
    lists, 
    setLists,
    getLists,
    currentList,
    setCurrentList,
    openLists,
    setOpenLists
}) => {

    const [listsFilter, setListsFilter] = useState("");
    const alertMessage = "Are you sure you want to delete this list? This action cannot be undone."
    const [listToRemove, setListToRemove] = useState(-1); 

    const handleListSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setListsFilter(e.target.value.toLowerCase());
    }

    const handleSearchFocus = () => {
        document.getElementById("manage-lists-window-search-bar")!.style.backgroundColor = '#B4D9AD';
    }

    const handleSearchFocusOut = () => {
        document.getElementById("manage-lists-window-search-bar")!.style.backgroundColor = '';
    }

    const editListName = (e: MouseEvent<SVGSVGElement>) => {
        let listNameInputElem = e.currentTarget.parentElement!.previousElementSibling! as HTMLInputElement
        listNameInputElem.disabled = false;
        listNameInputElem.focus();
    }

    const handleRenameList = (e: KeyboardEvent<HTMLInputElement>) => {
        let id = e.currentTarget.getAttribute("data-list-id")!;

        if(e.key === "Enter" &&  e.currentTarget.value !== ""){
            if(e.currentTarget.value !== e.currentTarget.defaultValue){
                renameList(parseInt(id), e.currentTarget.value);
                e.currentTarget.defaultValue = e.currentTarget.value;
            }
            e.currentTarget.disabled = true;
            e.currentTarget.blur();
        }

        getLists();
    }

    const handleRemoveList = (e: MouseEvent<SVGSVGElement>) =>{
        let list_id = e.currentTarget.getAttribute("data-id");
        if(list_id){
            document.getElementById("alert-blur-lists")?.setAttribute("data-is-visible", "true");
            setListToRemove(parseInt(list_id));
        }
    }

    const handleUnfocus = (e: FocusEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.defaultValue;
        e.currentTarget.disabled = true;
    }

    const renameList = useCallback(async (id: number, name: string) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/rename_list", {
            method: 'POST',
            body: JSON.stringify({
                name: name, 
                id: id}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
            });
            response = await response.json();
            return response;
    }, [])

    const removeListHelper = (id: number) => {
        closeTab(id);
        removeList(id);
    }

    const removeList = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/remove_list/" + id);
            response = await response.json();
            return(response);
    }, [])

    const closeTab = (id: number) => {
        if(id){
            if(currentList !== "all" && (currentList as ListInterface).id === id){
                document.getElementById(id + "-task-tab")!.setAttribute("data-highlighted", "false");
                document.getElementById("all-task-tab")!.setAttribute("data-highlighted", "true");
                setCurrentList("all");
            }
            setOpenLists(openLists.filter(list => list !== id));
        }
    }

    useEffect(() => {
        getLists();
    }, [listToRemove, getLists])

    return (
        <>
        <DeleteAlert
                message={alertMessage} 
                confirmAction={removeListHelper} 
                idToRemove={listToRemove}
                setIdToRemove={setListToRemove}
                type='lists'
        />
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
                                <input 
                                    type="text"
                                    className='manage-lists-window-list-name' 
                                    defaultValue={list.name}
                                    data-list-id={list.id}
                                    disabled={true}
                                    onKeyDown={handleRenameList}
                                    onBlur={handleUnfocus}
                                ></input>
                                <div className='manage-lists-window-actions'>
                                    <EditIcon id="manage-lists-window-edit-icon" onClick={editListName}></EditIcon>
                                    <TrashIcon id="manage-lists-window-trash-icon" data-id={list.id} onClick={handleRemoveList}></TrashIcon>
                                </div>
                            </div> 
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default ManageListsWindow