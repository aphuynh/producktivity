import React, { ChangeEvent, KeyboardEvent, MouseEvent, useCallback, useEffect, useState } from 'react'
import "./ChecklistPage.css"
import Config from "../../config.json";

import { ReactComponent as SearchIcon } from '../../assets/search.svg';
import { ReactComponent as TrashIcon } from '../../assets/trash.svg';
import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { ReactComponent as AddIcon } from '../../assets/plus.svg';
import { ChecklistItemInterface } from '../../interfaces/ChecklistItem';
import { ChecklistInterface } from '../../interfaces/Checklist';
import DeleteAlert from '../../components/Alert/DeleteAlert';


const ChecklistPage = () => {

	const checklistAlertMessage = "Are you sure you want to delete this checklist and all of its items? This action cannot be undone.";
	const checklistItemAlertMessage = "Are you sure you want to delete this item from the checklist? This action cannot be undone.";

	const [checklistsFilter, setChecklistsFilter] = useState("");
	const [checklists, setChecklists] = useState<Array<ChecklistInterface>>([]);
	const [checklistToRemove, setChecklistToRemove] = useState(-1);
	const [checklistItemToRemove, setChecklistItemToRemove] = useState(-1);

	const [checklistItemsFilter, setChecklistItemsFilter] = useState("");
	const [checklistItems, setChecklistItems] = useState<Array<ChecklistItemInterface>>([]);
	const [checklistItemsMap, setChecklistItemsMap] = useState<Map<number, ChecklistItemInterface>>(new Map());

	const [currentChecklist, setCurrentChecklist] = useState<ChecklistInterface|null>(null);
    const [currentChecklistDIV, setCurrentChecklistDIV] = useState<HTMLElement|null>(null);


	const [currentChecklistItem, setCurrentChecklistItem] = useState<ChecklistItemInterface|null>(null);
    const [currentChecklistItemDIV, setCurrentChecklistItemDIV] = useState<HTMLElement|null>(null);

	const [editChecklistItemMode, setEditChecklistItemMode] = useState(false);

	const getChecklists = useCallback(async () => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/checklists");
            response = await response.json();
            var tempLists = []
            for(var i =0; i < response.length; i++){
                tempLists.push({id: response[i].id, name: response[i].name});
            }
            setChecklists(tempLists);
    }, [])


	const addChecklist = useCallback(async (name: string) => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/add_checklist/" + name);
            response = await response.json();
			return(response);
    }, [])

	const editChecklist = useCallback(async (id: number, name: string) => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/edit_checklist/" + id + "/" + name);
            response = await response.json();
			return(response);
    }, [])

	const removeChecklist = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/remove_checklist/" + id);
            response = await response.json();
            return(response);
    }, [])

	const removeChecklistItem = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/remove_checklist_item/" + id);
            response = await response.json();
            return(response);
    }, [])


	const getChecklistItems = useCallback(async (id: number) => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/checklist_items/" + id);
            response = await response.json();
            var tempLists = []
            for(var i =0; i < response.length; i++){
                tempLists.push({id: response[i].id, checklist_id: response[i].checklist_id, name: response[i].name, description: response[i].description, is_complete: response[i].is_complete});
            }
            setChecklistItems(tempLists);
    }, [])

	const completeChecklistItem = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/complete_checklist_item/" + id);
            response = await response.json();
			return response;
    }, [])

    const undoCompleteChecklistItem = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/undo_complete_checklist_item/" + id);
            response = await response.json();
			return(response);
    }, [])

	const editChecklistItem = useCallback(async (
        id: number,
		name: string,
		description: string
	) => {
		let response = await fetch(Config.baseUrlProducktivityManager + "/edit_checklist_item", {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                name: name, 
                description: description
			}),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
		});
		response = await response.json();
        return response;
	}, [])

	const addChecklistItem = useCallback(async (
        checklist_id: number,
		name: string,
		description: string | null
	) => {
		let response = await fetch(Config.baseUrlProducktivityManager + "/add_checklist_item", {
            method: 'POST',
            body: JSON.stringify({
                checklist_id: checklist_id,
                name: name, 
                description: description
			}),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
		});
		response = await response.json();
		if(currentChecklist){
			getChecklistItems(currentChecklist.id);
		}
        return response;
	}, [currentChecklist, getChecklistItems])

	const closeNewChecklistBar = () => {
		var new_checklist_bar = document.getElementById("new-checklist-bar")! as HTMLInputElement;
		new_checklist_bar.value = "";
		new_checklist_bar.style.display = "none";
		new_checklist_bar.setAttribute("data-valid", "true");
	}

	const openNewChecklistBar = () => {
		var new_checklist_bar = document.getElementById("new-checklist-bar")! as HTMLInputElement;
		new_checklist_bar.style.display = "flex";
		new_checklist_bar.focus();
	}

	const handleListSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setChecklistsFilter(e.target.value.toLowerCase());
    }

	const handleItemListSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setChecklistItemsFilter(e.target.value.toLowerCase());
    }

	const handleCompleteChecklistItem = () => {
		let complete = null;
		if(currentChecklistItem){
            if(currentChecklistItem.is_complete){
                undoCompleteChecklistItem(currentChecklistItem.id);
				complete = false;
            }else{
                completeChecklistItem(currentChecklistItem.id);
				complete = true;
            }

			if(currentChecklist){
				getChecklistItems(currentChecklist.id);
			}

			setCurrentChecklistItem({...currentChecklistItem, is_complete: complete})
        }
	}

	const handleClickChecklist = (e: MouseEvent<HTMLElement>) => {
		if(!editChecklistItemMode){
			const checklist_id = parseInt(e.currentTarget.getAttribute("data-checklist-id")!);
			const checklist_name = e.currentTarget.getAttribute("data-checklist-name")!;
			console.log(checklist_name);
			setChecklistItems([]);

			if(currentChecklist){
				if(currentChecklistDIV){
					currentChecklistDIV.setAttribute("data-selected", "false");
				}
				if(currentChecklist.id === checklist_id){
					setCurrentChecklist(null);
					setCurrentChecklistDIV(null);
				}else{
					e.currentTarget.setAttribute("data-selected", "true");
					setCurrentChecklistDIV(e.currentTarget);
					setCurrentChecklist({id: checklist_id, name: checklist_name})
				}
			}else{
				e.currentTarget.setAttribute("data-selected", "true");
				setCurrentChecklistDIV(e.currentTarget);
				setCurrentChecklist({id: checklist_id, name: checklist_name})
			}
		}
	}

	const handleClickChecklistItem = (e: MouseEvent<HTMLElement>) =>{
		if(!editChecklistItemMode){
			let div_type = (e.target as HTMLElement).nodeName;
			if(div_type !== "svg" && div_type !== "path"){
				const checklist_item_id = parseInt(e.currentTarget.getAttribute("data-checklist-item-id")!);
				console.log(checklistItemsMap.get(checklist_item_id)!);
				if(currentChecklistItem){
					if(currentChecklistItemDIV){
						currentChecklistItemDIV.setAttribute("data-selected", "false");
					}
						e.currentTarget.setAttribute("data-selected", "true");
						setCurrentChecklistItemDIV(e.currentTarget);
						setCurrentChecklistItem(checklistItemsMap.get(checklist_item_id)!);
					
				}else{
					e.currentTarget.setAttribute("data-selected", "true");
					setCurrentChecklistItemDIV(e.currentTarget);
					setCurrentChecklistItem(checklistItemsMap.get(checklist_item_id)!);
				}
			}
		}  
	}

	const handleChecklistItemEditButtonClick = () => {
		if(!editChecklistItemMode){
			setEditChecklistItemMode(true);
			let mainDIV = currentChecklistItemDIV!;
			mainDIV.setAttribute("data-edit-mode", "true");

			let nameDIV = mainDIV.querySelector(".checklist-item-bar-name")!;
			nameDIV.setAttribute("contenteditable", "true");
			
			let descDIV = mainDIV.querySelector(".checklist-item-bar-description")!;
			descDIV.setAttribute("contenteditable", "true");
		}
	}

	const handleChecklistItemEditCancel = () => {
		if(editChecklistItemMode){
			setEditChecklistItemMode(false);
			let mainDIV = currentChecklistItemDIV!;
			mainDIV.setAttribute("data-edit-mode", "false");

			let nameDIV = mainDIV.querySelector(".checklist-item-bar-name")!;
			nameDIV.innerHTML = currentChecklistItem!.name;
			nameDIV.setAttribute("contenteditable", "false");
			
			let descDIV = mainDIV.querySelector(".checklist-item-bar-description")!;
			descDIV.innerHTML = currentChecklistItem!.description;
			descDIV.setAttribute("contenteditable", "false");
		}
	}

	const handleChecklistItemEditSave = () => {
		let mainDIV = currentChecklistItemDIV!;

		let nameDIV = mainDIV.querySelector(".checklist-item-bar-name")!;
		let newName = nameDIV.textContent!;
		
		let descDIV = mainDIV.querySelector(".checklist-item-bar-description")!;
		let newDesc = descDIV.textContent!;
		
		if(newName){
			editChecklistItem(currentChecklistItem!.id, newName, newDesc);

			mainDIV.setAttribute("data-edit-mode", "false");
			nameDIV.setAttribute("contenteditable", "false");
			descDIV.setAttribute("contenteditable", "false");

			if(!newDesc){
				mainDIV.setAttribute("data-has-desc", "false");
				descDIV.setAttribute("data-has-desc", "false");
			}

			setEditChecklistItemMode(false);

			getChecklistItems(currentChecklist!.id);
		}
	}

	const handleInsertNewLine = (e: KeyboardEvent<HTMLElement>) => {
		if(e.key === "Enter"){
			e.preventDefault();
			document.execCommand('insertHTML', false, '\n');
		}else if(e.key === "Tab"){
			e.preventDefault();
			document.execCommand('insertHTML', false, '&#009');
		}
	}

	const handleRemoveChecklist = () => {
		if(currentChecklist){
			var id = currentChecklist.id;
			document.getElementById("alert-blur-checklist")?.setAttribute("data-is-visible", "true");
            setChecklistToRemove(id);
		}
	}

	const removeChecklistHelper = (id: number) => {
		setCurrentChecklist(null);
		setCurrentChecklistDIV(null);
		removeChecklist(id);
		getChecklists();
	}

	const handleRemoveChecklistItem = () => {
		if(currentChecklistItem){
			var id = currentChecklistItem.id;
			document.getElementById("alert-blur-checklist-item")?.setAttribute("data-is-visible", "true");
            setChecklistItemToRemove(id);
		}
	}

	const removeChecklistItemHelper = (id: number) => {
		removeChecklistItem(id);
		setCurrentChecklistItem(null);
		if(currentChecklist){
			getChecklistItems(currentChecklist.id);
		}
	}

	const handleAddChecklist = useCallback(async (e: KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Enter" && (e.target as HTMLInputElement).value !== ""){
            let checklist_name = (e.target as HTMLInputElement).value
            let result = await addChecklist(checklist_name) as unknown as Array<number>;
            if((result[0]) === 1){
				closeNewChecklistBar();
                getChecklists();
            }else{
                (document.getElementById("new-checklist-bar")! as HTMLInputElement).setAttribute("data-valid", "false")
            }
        }else{
            (document.getElementById("new-checklist-bar")! as HTMLInputElement).setAttribute("data-valid", "true")
        }
        
    }, [addChecklist, getChecklists])

	const handleAddChecklistItemButtonClick = () => {
		if(!editChecklistItemMode){
			setEditChecklistItemMode(true);

			if(currentChecklistItemDIV){
				currentChecklistItemDIV.setAttribute("data-selected", "false");
			}
			setCurrentChecklistItemDIV(null);
			setCurrentChecklistItem(null);

			let newItemDIV = document.getElementById("new-checklist-item-bar")!;
			let newItemNameDIV = document.getElementById("new-checklist-item-bar-name")! as HTMLInputElement;

			newItemDIV.setAttribute("data-visible", "true");
			newItemNameDIV.focus();
		}
	}

	const cancelAddChecklistItem = () => {
		let newItemDIV = document.getElementById("new-checklist-item-bar")!;
		let newItemNameDIV = document.getElementById("new-checklist-item-bar-name")! as HTMLInputElement;
		let newItemDescDIV = document.getElementById("new-checklist-item-bar-description")!;

		newItemDIV.setAttribute("data-visible", "false");
		newItemNameDIV.value = "";
		newItemDescDIV.innerHTML = "";

		setEditChecklistItemMode(false);
	}

	const saveAddChecklistItem = () => {
		let newItemDIV = document.getElementById("new-checklist-item-bar")!;
		let newItemNameDIV = document.getElementById("new-checklist-item-bar-name")! as HTMLInputElement;
		let newItemDescDIV = document.getElementById("new-checklist-item-bar-description")!;

		let item_name = newItemNameDIV.value;
		let item_desc = newItemDescDIV.textContent;

		if(item_name){
			addChecklistItem(currentChecklist!.id, item_name, item_desc);

			newItemDIV.setAttribute("data-visible", "false");
			newItemNameDIV.value = "";
			newItemDescDIV.innerHTML = "";
			setEditChecklistItemMode(false);
			getChecklistItems(currentChecklist!.id);
		}
    }

	const handleEditChecklistNameButtonClick = () => {
		let checklistNameSpan = document.getElementById("current-checklist-name-field")!;
		checklistNameSpan.setAttribute("contenteditable", "true");
		checklistNameSpan.focus();
	}

	const editChecklistNameInput = useCallback(async (e: KeyboardEvent<HTMLInputElement>) => {
		console.log(currentChecklist);
        if(e.key === "Enter" && (e.target as HTMLInputElement).textContent !== ""){
			e.preventDefault();
            let checklist_name = (e.target as HTMLInputElement).textContent!;
			if(checklist_name === currentChecklist!.name){
				(e.target as HTMLInputElement).setAttribute("contenteditable", "false");
				closeNewChecklistBar();
				return;
			}
            let result = await editChecklist(currentChecklist!.id, checklist_name) as unknown as Array<number>;
            if(result){
				setCurrentChecklist({id: currentChecklist!.id, name: checklist_name});
				(e.target as HTMLInputElement).setAttribute("contenteditable", "false");
                getChecklists();
            }else{
                (e.target as HTMLInputElement).setAttribute("data-valid", "false")
            }
        }else{
            (e.target as HTMLInputElement).setAttribute("data-valid", "true")
        }
         
    }, [getChecklists, currentChecklist, editChecklist])

	const cancelEditChecklistName = () => {
		let checklistNameSpan = document.getElementById("current-checklist-name-field")!;
		checklistNameSpan.innerHTML = currentChecklist!.name;
		checklistNameSpan.setAttribute("data-valid", "true")
		checklistNameSpan.setAttribute("contenteditable", "false ");
	}

	useEffect(() => {
        getChecklists();
    }, [getChecklists])

	useEffect(()=>{
		setChecklistItemsMap(new Map(checklistItems.map((item => [item.id, item]))));
	}, [checklistItems])

	useEffect(() =>{
		setCurrentChecklistItem(null);
		setCurrentChecklistItemDIV(null);
		if(currentChecklist){
			getChecklistItems(currentChecklist.id);
		}
	}, [currentChecklist, getChecklistItems])

	return (
		
		<div id="checklist-page">
			<DeleteAlert
				message={checklistAlertMessage} 
				confirmAction={removeChecklistHelper} 
				idToRemove={checklistToRemove} 
				setIdToRemove={setChecklistToRemove}
				type='checklist'
			/>
			<DeleteAlert
				message={checklistItemAlertMessage} 
				confirmAction={removeChecklistItemHelper} 
				idToRemove={checklistItemToRemove} 
				setIdToRemove={setChecklistItemToRemove}
				type='checklist-item'
			/>
			<div id="checklist-page-left">
				<div id="checklists-window">
					<div id="checklists-top-bar">
						<div id="checklists-label">Checklists</div>
						<AddIcon id="add-checklist-button" onClick={openNewChecklistBar}></AddIcon>
					</div>
					<div id="checklist-search-bar">
						<input type="text"id='checklist-search-input' placeholder="Search..." onChange={handleListSearch}></input>
						<SearchIcon id="checklist-search-icon"></SearchIcon>
					</div>
					<div id="checklists-wrapper">
						<div id="checklists">
							{checklists.filter(x => x.name.toLowerCase().includes(checklistsFilter)).map((checklist, ind) => (
								<div 
									className='checklist-bar'
									key={"checklist-bar" + checklist.id}
									data-checklist-id={checklist.id}
									data-checklist-name={checklist.name}
									data-selected="false"
									onClick={handleClickChecklist}
								>
									{checklist.name}
								</div> 
							))}
							<input 
								id="new-checklist-bar" 
								type='text' 
								placeholder='New Checklist' 
								onKeyDown={handleAddChecklist} 
								onBlur={closeNewChecklistBar}
								data-valid="true"></input>
						</div>
					</div>
				</div>
				{currentChecklistItem ? 
				<div id='complete-task-button' data-mode={currentChecklistItem.is_complete ? "undo" : "complete"} onClick={handleCompleteChecklistItem}>
                        {currentChecklistItem.is_complete ? "Undo Complete" : "Mark Complete"}
                    </div>
				: ""}
			</div>
			<div id="checklist-page-right">
				{currentChecklist ?
				<>
					<div id="current-checklist-top-bar">
						<div id="current-checklist-name">
							<span>
								<span id="current-checklist-name-field" onBlur={cancelEditChecklistName} onKeyDown={editChecklistNameInput}>
									{currentChecklist ? currentChecklist.name : ""}
								</span>
							<EditIcon id="current-checklist-edit-icon" onClick={handleEditChecklistNameButtonClick}></EditIcon>
							</span>
						</div>
						<div id="current-checklist-options">
							<AddIcon className="current-checklist-option" id="current-checklist-option-add-icon" onClick={handleAddChecklistItemButtonClick}></AddIcon>
							<TrashIcon className="current-checklist-option" id="current-checklist-option-trash-icon" onClick={handleRemoveChecklist}></TrashIcon>
						</div>
					</div>
					<div id="checklist-items-search-bar">
						<input type="text"id='checklist-items-search-input' placeholder="Search..." onChange={handleItemListSearch}></input>
						<SearchIcon id="checklist-items-search-icon"></SearchIcon>
					</div>
					<div id="checklist-items-wrapper">
						<div id="checklist-items">
							{checklistItems && checklistItems.length > 0 ?
							<>
							{checklistItems.filter(x => x.name.toLowerCase().includes(checklistItemsFilter)).map((item, ind) => (
								<div 
									className='checklist-item-bar'
									key={"checklist-item-bar" + item.id}
									id={"checklist-item-bar" + item.id}
									data-checklist-item-id={item.id}
									data-selected="false"
									data-has-desc={item.description ? "true" : "false"}
									data-edit-mode={"false"}
									data-is-complete={item.is_complete ? "true" : "false"}
									onClick={handleClickChecklistItem}
								>
									<div className="checklist-item-bar-top-bar">

										<div className="checklist-item-bar-name" data-text="Name (required)">
											{item.name}
										</div>
										<div className="checklist-item-bar-options">
											<EditIcon className="checklist-item-bar-option" onClick={handleChecklistItemEditButtonClick}></EditIcon>
											<TrashIcon className="checklist-item-bar-option" onClick={handleRemoveChecklistItem}></TrashIcon>
										</div>
									</div>
									<div className="checklist-item-bar-description" data-text="Description" data-has-desc={item.description ? "true" : "false"} onKeyDown={handleInsertNewLine}>
										{item.description}
									</div>
									<div className='checklist-item-bar-edit-buttons'>
										<div className='checklist-item-bar-edit-button checklist-item-bar-cancel-edit-button' onClick={handleChecklistItemEditCancel}>Cancel</div>
										<div className='checklist-item-bar-edit-button checklist-item-bar-save-edit-button' onClick={handleChecklistItemEditSave}>Save</div>
									</div>
								</div> 
							))}
							</> : ""}
								<div
									id="new-checklist-item-bar"
									data-visible="false"
								>
									<div id="new-checklist-item-bar-top-bar">
										<input type="text" id="new-checklist-item-bar-name" placeholder='Name'>
										</input>
									</div>
									<div id="new-checklist-item-bar-description" placeholder='Description' contentEditable>
									</div>
									<div id='new-checklist-item-bar-edit-buttons'>
										<div id='new-checklist-item-bar-cancel-edit-button' onClick={cancelAddChecklistItem}>Cancel</div>
										<div id='new-checklist-item-bar-save-edit-button' onClick={saveAddChecklistItem}>Save</div>
									</div>
								</div>
						</div>
					</div>
				</>
				: ""}
			</div>
		</div>
	)
}

export default ChecklistPage