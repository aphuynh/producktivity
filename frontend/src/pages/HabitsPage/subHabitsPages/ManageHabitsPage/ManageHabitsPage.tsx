import React, { ChangeEvent, FormEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Config from "../../../../config.json"
import {useForm} from "react-hook-form";

const { app, dialog } = require('electron');
const fs = require('fs');
const path = require("path");

import "./ManageHabitsPage.css"

import { ReactComponent as SearchIcon } from '../../../../../src/assets/search.svg';
import { ReactComponent as ArrowDownIcon } from '../../../../../src/assets/carrot.svg';
import { ReactComponent as PlusIcon } from '../../../../../src/assets/plus.svg';
import { ReactComponent as ImageIcon } from '../../../../../src/assets/image.svg';
import { HabitInterface, HabitFormProps } from '../../../../interfaces/Habit';
import UnsavedChangesAlert from '../../../../components/Alert/UnsavedChangesAlert';



const ManageHabitsPage = () => {

    const emptyHabitFormProps = {
        name: "",
        img: "",
        reward: 0,
        times_completed: 0,
        times_needed: 0,
        frequency: 0
    }

    const [alertMessage, setAlertMessage] = useState("You have unsaved changes. Would you like to discard them?");
    const [alertParams, setAlertParams] = useState<[number|null, number|null]>([null, null]);
    
    const [imageFile, setImageFile] = useState<File|undefined>();

    const [habitsListType, setHabitsListType] = useState<string>("daily");
    const [manageHabitsFilter, setManageHabitsFilter] = useState<string>("");

    const [selectedHabitID, setSelectedHabitID] = useState<number|null>(null);
    const [selectedHabit, setSelectedHabit] = useState<HabitInterface|null>(null);

    const [values, setFormDefaultValues] = useState<HabitFormProps>(emptyHabitFormProps);

    const [updatedHabitsListType, setUpdatedHabitsListType] = useState<string|null>(null);
    const [changesDiscarded, setChangesDiscarded] = useState<boolean>(false);

    const {register, getValues, reset, formState} = useForm({
        values,
    });

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
                setAlertParams([selectedHabitID, null]);
                setUpdatedHabitsListType(e.currentTarget.getAttribute("data-type")!);
                document.getElementById("alert-blur-habits")?.setAttribute("data-is-visible", "true");
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
            setAlertParams([selectedHabitID, clickedHabitId]);
            document.getElementById("alert-blur-habits")?.setAttribute("data-is-visible", "true");
        }else{
            updateSelectedHabit(selectedHabitID, clickedHabitId);
        }
    }

    const updateSelectedHabit = (old_id: number|null, new_id: number|null) => {
        if(old_id){
            let old_div = document.getElementById("manage-habits-habit-bar-" + old_id)!;
            old_div.setAttribute("data-selected", "false");
            setSelectedHabitID(null);
        }

        if(new_id && (!old_id || (old_id != new_id))){
            let new_div = document.getElementById("manage-habits-habit-bar-" + new_id)!;
            new_div.setAttribute("data-selected", "true");
            setSelectedHabitID(new_id);
        }
    }

    const handleUpdateHabit = () => {
        const id = selectedHabitID
        const name = getValues("name");
        const reward = getValues("reward");
        const timesCompleted = getValues("times_completed");
        const timesNeeded = getValues("times_needed");
        const image = getValues("img");
        const frequency = getValues("frequency");

        const rewardValid = reward && reward > 0;
        const timesCompletedValid = timesCompleted && timesCompleted > 0;
        const timesNeededValid = timesNeeded && timesNeeded > 1;

        if(name && rewardValid && timesCompletedValid && timesNeededValid){
            console.log("VALID")
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
        
    }
    
    const handleImageUpload = (e: FormEvent<HTMLInputElement>) => {
        console.log(e);

        const target = e.target as HTMLInputElement & {
            files: FileList;
          }

        let apple = target.files[0];
        
        setImageFile(target.files[0]);
    }

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

    useEffect(() => {
        reset();
    }, [values])

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
    
    useEffect(() => {
        setSelectedHabit(selectedHabitID ? habitsMap.get(selectedHabitID)! : null);
    }, [selectedHabitID])

    useEffect(() => {
        let updatedMap = new Map<number, HabitInterface>();
        habits.forEach(habit => {
            updatedMap.set(habit.id, habit);
        });
        setHabitsMap(updatedMap);
    }, [habits])

    useEffect(() => {
        refreshHabitsList();
    }, [habitsListType])
    
    useEffect(() => {
        refreshHabitsList();
    }, [])
    
    return (
        <div id="manage-habits-page" className="sub-habits-page">
            {<UnsavedChangesAlert
                message={alertMessage} 
                confirmAction={updateSelectedHabit}
                params={alertParams}
                setAlertParams={setAlertParams}
                setChangesDiscarded={setChangesDiscarded}
                type='habits'
            />}
            <div id="manage-habits-left">
                <div id="manage-habits-left-top-bar">
                    <div id="manage-habits-list-type" data-drop-down-active="false" onClick={openListTypeDropDown}>
                        <div id="manage-habits-list-type-label">
                            {habitsListType}
                        </div>
                        <ArrowDownIcon id="manage-habits-list-type-arrow-icon"></ArrowDownIcon>
                    </div>
                    <PlusIcon id="manage-habits-add-habit-icon"></PlusIcon>
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
                <input id="manage-habits-right-top-bar" placeholder="Habit Name" {...register("name")} required></input>
                <div id="manage-habits-right-content">
                    <div id="manage-habits-habit-information">
                        <div
                            id="manage-habits-image-wrapper" 
                        >
                            <ImageIcon id="manage-habits-image-icon"></ImageIcon>
                            UPLOAD IMAGE
                        </div>
                        <div id="manage-habits-information-details">
                            <div className="manage-habits-information-line" id="manage-habits-reward">
                            <div className='manage-habits-input-label'>Reward</div>
                                <input 
                                    className="manage-habits-input" 
                                    id="manage-habits-reward-input" 
                                    {...register("reward")}
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
                                    {...register("times_completed")}
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
                                    {...register("times_needed")}
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
                                    placeholder='Type' 
                                    required
                                >
                                    <option className="manage-habits-type-input-option" value={"daily"}>Daily</option>
                                    <option className="manage-habits-type-input-option" value={"weekly"}>Weekly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="manage-habits-action-buttons">
                    <div id='manage-habits-save-button' data-disabled={formState.isDirty ? "false" : "true"} onClick={handleUpdateHabit}>Save Changes</div>
                </div>
                </form> : ""}
            </div>
        </div>
    )
}

export default ManageHabitsPage