import React, { ChangeEvent, FormEvent, Fragment, MouseEvent, MouseEventHandler, useCallback, useEffect, useState } from 'react';
import Config from "../../../../config.json";
import {useForm} from "react-hook-form";

import "./ManageHabitsPage.css";

import { ReactComponent as SearchIcon } from '../../../../../src/assets/search.svg';
import { ReactComponent as ArrowDownIcon } from '../../../../../src/assets/carrot.svg';
import { ReactComponent as PlusIcon } from '../../../../../src/assets/plus.svg';
import { ReactComponent as ImageIcon } from '../../../../../src/assets/image.svg';
import { ReactComponent as DeleteIcon } from '../../../../../src/assets/trash.svg';

import { HabitInterface, HabitFormProps } from '../../../../interfaces/Habit';
import UnsavedChangesAlert from '../../../../components/Alert/UnsavedChangesAlert';
import DeleteAlert from '../../../../components/Alert/DeleteAlert';
import { response } from 'express';


const ManageHabitsPage = () => {

    const emptyHabitFormProps = {
        name: "",
        img: "",
        reward: 0,
        times_completed: 0,
        times_needed: 0,
        frequency: ""
    }

    const [discardChangesMessage, setDiscardChangesMessage] = useState("You have unsaved changes. Would you like to discard them?");
    const [deleteMessage, setDeleteMessage] = useState("Are you sure you want to delete this habit? This cannot be undone.");
    const [alertParams, setAlertParams] = useState<[number|null, number|null, boolean]>([null, null, false]);
    
    const [imageFileURL, setImageFileURL] = useState<string|undefined>(undefined);

    const [habitsListType, setHabitsListType] = useState<string>("daily");
    const [manageHabitsFilter, setManageHabitsFilter] = useState<string>("");

    const [selectedHabitID, setSelectedHabitID] = useState<number|null>(null);
    const [selectedHabit, setSelectedHabit] = useState<HabitInterface|null>(null);
    
	const [habitToRemove, setHabitToRemove] = useState(-1);

    const [values, setFormDefaultValues] = useState<HabitFormProps>(emptyHabitFormProps);

    const [updatedHabitsListType, setUpdatedHabitsListType] = useState<string|null>(null);
    const [changesDiscarded, setChangesDiscarded] = useState<boolean>(false);

    const {register, getValues, reset, formState, setValue, resetField} = useForm({
        values,
    });

    const imageField = register('img');

    const [habits, setHabits] = useState(Array<HabitInterface>());
    const [habitsMap, setHabitsMap] = useState(new Map<number, HabitInterface>());

    const handleManageHabitsSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setManageHabitsFilter(e.target.value.toLowerCase());
    }

    const getWeeklyHabits = useCallback(async () => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/habits/weekly");
            response = await response.json();
            setHabits(response as Array<HabitInterface>);
    }, [])

    const getDailyHabits = useCallback(async () => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/habits/daily");
            response = await response.json();
            setHabits(response as Array<HabitInterface>);
    }, [])

    const addHabit = useCallback(async (
		name: string,
		reward: number,
        timesNeeded: number,
        frequency: string,
        image: string
	) => {
		let response = await fetch(Config.baseUrlProducktivityManager + "/add_habit", {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                reward: reward,
                times_needed: timesNeeded,
                frequency: frequency,
                img: image
			}),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
		});
		response = await response.json();
        return response;
	}, [])

    const removeHabit = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/delete_habit/" + id);
            response = await response.json();
            return(response);
    }, [])

    const editHabit = useCallback(async (
        id: number,
		name: string,
		reward: number,
        timesCompleted: number,
        timesNeeded: number,
        frequency: string,
        image: string
	) => {
		let response = await fetch(Config.baseUrlProducktivityManager + "/edit_habit", {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                name: name,
                reward: reward,
                times_completed: timesCompleted,
                times_needed: timesNeeded,
                frequency: frequency,
                img: image
			}),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
		});
		response = await response.json();
        return response;
	}, [])

    const refreshHabitsList = () => {
        if(habitsListType === "daily"){
            getDailyHabits();
        }else{
            getWeeklyHabits();
        }
    }

    const openListTypeDropDown = (e: MouseEvent<HTMLElement>) => {
        if(e.currentTarget.getAttribute("data-drop-down-active") === "false"){
            e.currentTarget.setAttribute("data-drop-down-active", "true");
            let dropdown = document.getElementById("manage-habits-list-type-drop-down")!;
            dropdown.setAttribute("data-open", "true");
            dropdown.focus();
        }
    }

    const closeListTypeDropDown = () => {
        let dropdownButton = document.getElementById("manage-habits-list-type")!;
        let dropdownList = document.getElementById("manage-habits-list-type-drop-down")!;

        dropdownButton.setAttribute("data-drop-down-active", "false");
        dropdownList.setAttribute("data-open", "false");
    }

    const handleListTypeDropDownOptionClick = (e: MouseEvent<HTMLElement>) => {
        if(e.currentTarget.getAttribute("data-selected") === "false"){
            if(formState.isDirty){
                setAlertParams([selectedHabitID, null, false]);
                setUpdatedHabitsListType(e.currentTarget.getAttribute("data-type")!);
                document.getElementById("alert-blur-habits-unsaved")?.setAttribute("data-is-visible", "true");
            }else{
                if(selectedHabitID){
                    setSelectedHabitID(null);
                }
                e.currentTarget.parentElement!.childNodes.forEach(child => {
                    (child as HTMLElement).setAttribute("data-selected", "false");
                });
                setHabitsListType(e.currentTarget.getAttribute("data-type")!);
                e.currentTarget.setAttribute("data-selected", "true");
                closeListTypeDropDown();
            }
        }
    }

    const handleHabitBarClick = (e: MouseEvent<HTMLElement>) => {
        const clickedHabitId = parseInt(e.currentTarget.getAttribute("data-id")!);
        if(formState.isDirty){
            setAlertParams([selectedHabitID, clickedHabitId, false]);
            document.getElementById("alert-blur-habits-unsaved")?.setAttribute("data-is-visible", "true");
        }else{
            updateSelectedHabit(selectedHabitID, clickedHabitId);
        }
    }

    const updateHabitBarCSS = (id: number, selected: boolean) => {
        let div = document.getElementById("manage-habits-habit-bar-" + id);
        if(div){
            div.setAttribute("data-selected", selected ? "true" : "false");
        }
    }

    const updateSelectedHabit = (old_id: number|null, new_id: number|null, new_habit: boolean = false) => {
        if(old_id){
            updateHabitBarCSS(old_id, false);
            setSelectedHabitID(null);
        }

        if(new_id && (!old_id || (old_id != new_id))){
            updateHabitBarCSS(new_id, true);
            setSelectedHabitID(new_id);
        }

        if (new_habit){
            handleAddNewHabit();
        }
    }

    const handleNewHabitButtonClick = () => {
        if(formState.isDirty){
            setAlertParams([selectedHabitID, null, true]);
            document.getElementById("alert-blur-habits-unsaved")?.setAttribute("data-is-visible", "true");
        }else{
            updateSelectedHabit(selectedHabitID, null, true);
        }
    }

    const handleAddNewHabit = () => {
        addHabit(
            "New Habit",
            0,
            1,
            habitsListType,
            ""
        ).then((response) => {
            console.log("ONE");
            const new_habit_id = response as unknown as number;
            if((new_habit_id) !== -1){
                refreshHabitsList();
                setSelectedHabitID(new_habit_id);
            }
        });
    
    }

    const handleUpdateHabit = () => {
        const id = selectedHabitID!
        const name = getValues("name");
        const reward = getValues("reward");
        const timesCompleted = getValues("times_completed");
        const timesNeeded = getValues("times_needed");
        const image = getValues("img");
        const frequency = getValues("frequency");

        const rewardValid = Number.isInteger(reward) && reward >= 0;
        const timesNeededValid = Number.isInteger(timesNeeded) && timesNeeded > 0;
        const timesCompletedValid = Number.isInteger(timesCompleted) && timesCompleted >= 0 && timesCompleted <= timesNeeded;
        //console.log(image); 
        
        if(name && rewardValid && timesCompletedValid && timesNeededValid){
            editHabit(
                id,
                name,
                reward,
                timesCompleted,
                timesNeeded,
                frequency,
                ""
            ).then((response) => {
                    refreshHabitsList();
                }
            ).then(
                (response) => {
                    if(frequency === selectedHabit!.frequency){
                        updateSelectedHabitFromID();
                    }else{
                        deselectHabit();
                    }
                }
            );

        }

        
        if(!name){
            document.getElementById('manage-habits-right-top-bar')!.style.backgroundColor = "#ffc5cd";
        }else{
            document.getElementById('manage-habits-right-top-bar')!.style.background = "none";
        }

        if(!rewardValid){
            document.getElementById('manage-habits-reward')!.style.backgroundColor = "#ffc5cd";
        }else{
            document.getElementById('manage-habits-reward')!.style.background = "none";
        }

        if(!timesCompletedValid){
            document.getElementById('manage-habits-times-completed')!.style.backgroundColor = "#ffc5cd";
        }else{
            document.getElementById('manage-habits-times-completed')!.style.background = "none";
        }

        if(!timesNeededValid){
            document.getElementById('manage-habits-times-needed')!.style.backgroundColor = "#ffc5cd";
        }else{
            document.getElementById('manage-habits-times-needed')!.style.background = "none";
        }
        
        
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) =>{
        const files = e.currentTarget.files; 
        if(files && files.length == 1 && files[0].type.match("image.*")){
            const img_url = URL.createObjectURL(files[0])
            setImageFileURL(img_url);
            //setValue("img", img_url);
        }
    }

    const handleRemoveHabit = () => {
		if(selectedHabitID){
			document.getElementById("alert-blur-habits-delete")?.setAttribute("data-is-visible", "true");
            setHabitToRemove(selectedHabitID);
		}
	}

    const removeHabitHelper = (id: number) => {
		removeHabit(id).then(
            (response) => {
                console.log(response);
                if(response){
                    updateHabitBarCSS(id, false);
                    deselectHabit();
                    refreshHabitsList();
                }
            }
        );
	}

    const clearHabitImage = () => {
        setValue("img", "");  
        setImageFileURL("");
    }

    const updateSelectedHabitFromID = () => {
        setSelectedHabit(selectedHabitID ? habitsMap.get(selectedHabitID)! : null);
    }

    const deselectHabit = () => {
        setSelectedHabitID(null);
    }

    const discardChanges = () => {
        reset();
        setImageFileURL(values.img);
    }

    // USE EFFECTS
    
    // RUN ONCE AFTER INITIAL RENDER
    useEffect(() => {
        refreshHabitsList();
    }, [])

    // if list type is changed (weekly or daily), refresh habits list
    useEffect(() => {
        refreshHabitsList();
    }, [habitsListType])

    // if habits list is changed, create new habits map and if if is selected, update its css
    useEffect(() => {
        let updatedMap = new Map<number, HabitInterface>();
        habits.forEach(habit => {
            updatedMap.set(habit.id, habit);
        });
        setHabitsMap(updatedMap);
        if(selectedHabitID){
            updateHabitBarCSS(selectedHabitID, true);
        }
    }, [habits])

    // when user confirms alert to discard unsaved changes
    useEffect(() => {
        if(changesDiscarded){
            setChangesDiscarded(false);
            if(updatedHabitsListType){
                document.getElementById("manage-habits-list-type-drop-down")!.childNodes.forEach(child => {
                    (child as HTMLElement).setAttribute("data-selected", "false");
                });
                setHabitsListType(updatedHabitsListType);
                document.getElementById("manage-habits-list-type-drop-down-option-"+updatedHabitsListType)!.setAttribute("data-selected", "true");
                closeListTypeDropDown();
                setUpdatedHabitsListType(null);
            }
        }
    }, [changesDiscarded])

        
    // update selected habit if selected habit id is changed
    useEffect(() => {
        updateSelectedHabitFromID();
    }, [selectedHabitID, habitsMap])

    // set default values for form whenever selected habit is changed
    useEffect(() => {
        if(selectedHabit){
            let {id, ...updated} = selectedHabit;
            setFormDefaultValues(
                updated
            );
        }else{
            setFormDefaultValues(
                emptyHabitFormProps
            );
        }
    }, [selectedHabit])
    
    // Reset Form if default values change
    useEffect(() => {
        reset();
        setImageFileURL(values.img);
    }, [values])
    
    return (
        <div id="manage-habits-page" className="sub-habits-page">
            <UnsavedChangesAlert
                message={discardChangesMessage} 
                confirmAction={updateSelectedHabit}
                params={alertParams}
                setAlertParams={setAlertParams}
                setChangesDiscarded={setChangesDiscarded}
                type='habits-unsaved'
            />
            <DeleteAlert
				message={deleteMessage} 
				confirmAction={removeHabitHelper} 
				idToRemove={habitToRemove} 
				setIdToRemove={setHabitToRemove}
				type='habits-delete'
			/>
            <div id="manage-habits-left">
                <div id="manage-habits-left-top-bar">
                    <div id="manage-habits-list-type" data-drop-down-active="false" onClick={openListTypeDropDown}>
                        <div id="manage-habits-list-type-label">
                            {habitsListType}
                        </div>
                        <ArrowDownIcon id="manage-habits-list-type-arrow-icon"></ArrowDownIcon>
                    </div>
                    <PlusIcon id="manage-habits-add-habit-icon" onClick={handleNewHabitButtonClick}></PlusIcon>
                    <div id="manage-habits-list-type-drop-down" data-open="false" onBlur={closeListTypeDropDown} tabIndex={-1}>
                        <div 
                            id="manage-habits-list-type-drop-down-option-daily"
                            className="manage-habits-list-type-drop-down-option" 
                            data-type="daily" 
                            data-selected="true" 
                            onClick={handleListTypeDropDownOptionClick}
                        >
                            Daily
                        </div>
                        <div 
                            id="manage-habits-list-type-drop-down-option-weekly"
                            className="manage-habits-list-type-drop-down-option" 
                            data-type="weekly" 
                            data-selected="false"
                            onClick={handleListTypeDropDownOptionClick}
                        >
                                Weekly
                        </div>
                    </div>
                </div>
                <div id="manage-habits-left-content">
                    <div id="manage-habits-search-bar">
                        <input type="text"id='manage-habits-search-input' placeholder="Search..." onChange={handleManageHabitsSearch}></input>
                        <SearchIcon id="manage-habits-search-icon"></SearchIcon>
                    </div>
                    <div id="manage-habits-list-wrapper">
                        <div id="manage-habits-list-items">
                            {habits.filter(x => x.name.toLowerCase().includes(manageHabitsFilter)).map((habit, ind) => (
                                <div 
                                    className='manage-habits-habits-bar'
                                    id={"manage-habits-habit-bar-" + habit.id}
                                    key={"manage-habits-habit-bar-" + habit.id}
                                    data-selected="false"
                                    data-id={habit.id}
                                    onClick={handleHabitBarClick}
                                >
                                    {habit.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div id="manage-habits-right">
                {selectedHabit ? 
                <form id="manage-habits-form">
                    <div id="manage-habits-right-top-bar">
                        <input id="manage-habits-right-top-bar-name" placeholder="Habit Name" {...register("name")} required></input>
                        <DeleteIcon title="Delete Habit" id="manage-habits-right-top-bar-delete-button" onClick={handleRemoveHabit}></DeleteIcon>
                    </div>
                    <div id="manage-habits-right-content">
                        <div id="manage-habits-habit-information">
                            <div id="manage-habits-image-wrapper">
                                <div 
                                    id="manage-habits-remove-image-button" 
                                    data-disabled={imageFileURL ? "false" : "true"}
                                    onClick={clearHabitImage}
                                >
                                        Clear Image
                                </div>
                                <label
                                    id="manage-habits-image-input-wrapper"
                                    htmlFor='manage-habits-image-input'
                                >
                                    {imageFileURL ? 
                                    <img 
                                        id="manage-habits-image-preview"
                                        alt="habit-image"
                                        src={imageFileURL}
                                    />
                                    :
                                    <Fragment>
                                        <ImageIcon id="manage-habits-image-icon"></ImageIcon>
                                        UPLOAD IMAGE
                                    </Fragment>
                                    }   
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        id="manage-habits-image-input" 
                                        {...imageField}
                                        onChange={(e) => {
                                            imageField.onChange(e);
                                            handleFileInputChange(e);
                                        }}
                                        hidden/>
                                </label>
                            </div>
                            <div id="manage-habits-information-details">
                                <div className="manage-habits-information-line" id="manage-habits-reward">
                                <div className='manage-habits-input-label'>Reward</div>
                                    <input 
                                        className="manage-habits-input" 
                                        id="manage-habits-reward-input" 
                                        {...register("reward", {valueAsNumber: true})}
                                        placeholder='Reward'
                                        type="number"
                                        min="0"
                                        required
                                    ></input>
                                </div>
                                <div className="manage-habits-information-line" id="manage-habits-times-completed">
                                    <div className='manage-habits-input-label'>Times Completed</div>
                                    <input 
                                        className="manage-habits-input" 
                                        id="manage-habits-times-completed-input" 
                                        {...register("times_completed", {valueAsNumber: true})}
                                        placeholder='Times Completed'
                                        type="number"
                                        min="0"
                                        required
                                        ></input>
                                </div>
                                <div className="manage-habits-information-line" id="manage-habits-times-needed">
                                    <div className='manage-habits-input-label'>Times Needed</div>
                                    <input 
                                        className="manage-habits-input" 
                                        id="manage-habits-times-needed-input" 
                                        {...register("times_needed", {valueAsNumber: true})}
                                        placeholder='Times Needed' 
                                        type="number"
                                        min="1"
                                        required
                                        ></input>
                                </div>
                                <div className="manage-habits-information-line" id="manage-habits-type">
                                    <div className='manage-habits-input-label'>Type</div>
                                    <select 
                                        className="manage-habits-input" 
                                        id="manage-habits-type-input" 
                                        {...register("frequency")}
                                        required
                                    >
                                        <option className="manage-habits-type-input-option" value={"daily"}>Daily</option>
                                        <option className="manage-habits-type-input-option" value={"weekly"}>Weekly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="manage-habits-action-buttons" data-disabled={formState.isDirty ? "false" : "true"}>
                        <div id='manage-habits-discard-button' onClick={discardChanges}>Discard Changes</div>
                        <div id='manage-habits-save-button' onClick={handleUpdateHabit}>Save</div>
                    </div>
                </form> : ""}
            </div>
        </div>
    )
}

export default ManageHabitsPage