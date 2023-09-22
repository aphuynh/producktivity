import React, { Dispatch, FunctionComponent, SetStateAction, ChangeEvent, useState,FormEvent, ChangeEventHandler, useCallback, MouseEvent } from 'react';
import {useForm} from "react-hook-form";
import "./AddTaskForm.css"

import { ReactComponent as SearchIcon } from '../../assets/search.svg';

import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { TaskInterface } from '../../interfaces/Task';
import TaskSelectOption from './TaskSelectOption';
import { ListInterface } from '../../interfaces/List';

export interface AddTaskFormProps{
    closePageDisable: Dispatch<SetStateAction<void>>,
    tasks: Array<TaskInterface>,
    parentTaskSelect: string,
    setParentTaskSelect: Dispatch<SetStateAction<string>>,
    setAllowParentSelectChange: Dispatch<SetStateAction<boolean>>,
    getTasks: Dispatch<void>,
	getTasksInOrder: Dispatch<void>,
    lists: Array<ListInterface>
}

const AddTaskForm:FunctionComponent<AddTaskFormProps> = ({
    closePageDisable,
    tasks,
    parentTaskSelect,
    setParentTaskSelect,
    setAllowParentSelectChange,
    getTasks,
    getTasksInOrder,
    lists
}) => {

    const {register, getValues, handleSubmit, reset} = useForm();
    
    const [listsFilter, setListsFilter] = useState("");
    const [taskListsArray, setTaskListsArray] = useState<Array<number>>([]);

    const handleSearchFocus = () => {
        document.getElementById("add-task-list-search-bar")!.style.backgroundColor = '#B4D9AD';
    }

    const handleSearchFocusOut = () => {
        document.getElementById("add-task-list-search-bar")!.style.backgroundColor = '';
    }

    	
	const handleParentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setParentTaskSelect(e.target.value);
    }

    const closeAddTaskForm = () => {
        reset();
        clearListsFromTask();
        document.getElementById("add-task-form")!.style.display = "none";
        setAllowParentSelectChange(true);
        closePageDisable();
        document.getElementById("add-task-priority")!.style.color = "#777777";
        document.getElementById("add-task-date")!.style.color = "#777777";

        document.getElementById('add-task-reward')!.style.backgroundColor = "#ffffff";
        document.getElementById('add-task-name')!.style.backgroundColor = "#ffffff";
        document.getElementById('add-task-priority')!.style.backgroundColor = "#ffffff";
    }

    const addTask = useCallback(async (
		name: string,
		description: string,
		reward: number,
		priority: number,
		due_date: Date,
		parent_id: number | null,
        lists: Array<number>
	) => {
		let response = await fetch("/add", {
		method: 'POST',
		body: JSON.stringify({
			name: name, 
			description: description, 
			reward: reward,
			priority: priority,
			type: "normal", 
			due_date: due_date,
			parent_id: parent_id,
            lists: lists}),
		headers: {
		"Content-type": "application/json; charset=UTF-8"
		}
		});
		response = await response.json();
	}, [])

    const handleAddTask = () => {
        const task = getValues("name");
        const description = getValues("description");
        const parent_task = getValues("parent-task");
        const parent_id = parent_task === "" ? null : parseInt(parent_task);
        const priority = getValues("priority");
        const reward = getValues("reward");
        const due_date = getValues("due-date");
        if(task && priority !== "0" && reward){
            addTask(task, description, reward, priority, due_date, parent_id, taskListsArray);
            //updateProgress();
            getTasks();
            getTasksInOrder();
            closeAddTaskForm();
        }else{
            if(!task){
                document.getElementById('add-task-name')!.style.backgroundColor = "#ffc5cd";
            }else{
                document.getElementById('add-task-name')!.style.backgroundColor = "#ffffff";
            }

            if(priority === "0"){
                document.getElementById('add-task-priority')!.style.backgroundColor = "#ffc5cd";
            }else{
                document.getElementById('add-task-priority')!.style.backgroundColor = "#ffffff";
            }

            if(!reward){
                document.getElementById('add-task-reward')!.style.backgroundColor = "#ffc5cd";
            }else{
                document.getElementById('add-task-reward')!.style.backgroundColor = "#ffffff";
            }
        }
    }

    const changeInputColor = (e: ChangeEvent<HTMLInputElement>) => {
        if((e.target! as HTMLInputElement).value === ""){
            e.target!.style.color = "#777777";
        }else{
            e.target!.style.color = "#000000";
        }
    }

    const changeSelectColor = (e: ChangeEvent<HTMLSelectElement>) => {
        if(e.target.selectedIndex === 0){
            e.target.style.color = "#777777";
        }else{
            e.target.style.color = "#000000";
        }
    }

    const handleListSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setListsFilter(e.target.value.toLowerCase());
    }

    const addListToTask = (e: MouseEvent<HTMLElement>) => {
        let id = (e.currentTarget as HTMLElement).getAttribute("data-list-id")!;
        setTaskListsArray([...taskListsArray, parseInt(id)]);
        (e.target as HTMLElement).setAttribute("data-selected", "true");
    }

    const removeListFromTask = (e: MouseEvent<SVGSVGElement>) => {
        let id = ((e as MouseEvent).currentTarget as HTMLElement).getAttribute("data-list-id")!;
        setTaskListsArray(taskListsArray.filter(item => item !== parseInt(id)));
        let option = document.getElementById("add-task-list-drop-down-option-" + id);
        if(option){
            option.setAttribute("data-selected", "false");
        }
    }

    const clearListsFromTask = () => {
        let options = document.getElementsByClassName("add-task-list-drop-down-result");
        for(let i = 0; i < options.length; i++){
            options[i].setAttribute("data-selected", "false");
        }
        
        setTaskListsArray([]);
    }

    return (
        <div id='add-task-form'>
            <div id='add-task-form-label'>Add Task</div>
            <form id='add-task-form-contents'>
                <input {...register("name")} type="text" placeholder='Task Name*' id='add-task-name' required></input>
                <textarea {...register("description")} placeholder='Description' id='add-task-description'></textarea>
                <select {...register("parent-task")} id='add-task-parent' value={parentTaskSelect} onChange={handleParentChange}>
                    <option value={""}>Select Parent Task</option>
                    {tasks.map((task, ind)=>(
                        <TaskSelectOption taskInfo={task} level={0} key={"task-select-option-" + task.id}></TaskSelectOption>
                    ))}
                </select>
                <div id='add-task-form-row-3'>
                    <select {...register("priority")} id='add-task-priority' onChange={changeSelectColor} required defaultValue={"0"}>
                        <option value={"0"} id="add-task-priority-label" disabled hidden>Priority*</option>
                        <option value={"1"}>1 &#9733;</option>
                        <option value={"2"}>2 &#9733;</option>
                        <option value={"3"}>3 &#9733;</option>
                        <option value={"4"}>4 &#9733;</option>
                        <option value={"5"}>5 &#9733;</option>
                    </select>
                    <input {...register("reward")} type="number" placeholder='Reward*' id='add-task-reward' required></input>
                </div>
                <input {...register("due-date")} id='add-task-date' type="datetime-local" onChange={changeInputColor}></input>
                <div id="add-task-form-row-4">
                    <div id='add-task-list-search'>
                        <div id="add-task-list-search-left">
                            <div id="add-task-list-search-bar">
                                <input type="text"id='add-task-list-search-input' placeholder="Search for list..." onChange={handleListSearch} onFocus={handleSearchFocus} onBlur={handleSearchFocusOut}></input>
                                <SearchIcon id="add-task-list-search-icon"></SearchIcon>
                            </div>
                            <div id="add-task-list-search-results">
                                <div id="search-results-wrapper">
                                    {lists.filter(x => x.name.toLowerCase().includes(listsFilter)).map((list, ind) => (
                                        <div 
                                            className='add-task-list-drop-down-result'
                                            key={"add-task-list-drop-down-option-" + list.id}
                                            id={"add-task-list-drop-down-option-" + list.id}
                                            data-list-id={list.id}
                                            data-list-name={list.name}
                                            data-selected="false"
                                            onClick={addListToTask}
                                        >
                                            {list.name}
                                        </div> 
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="add-task-list-wrapper">
                        {lists.filter(item => taskListsArray.includes(item.id)).map((list, ind)=>(
                            <div className='applied-list' key={"applied-list-" + list.id + "-" + ind}>
                                {list.name}
                                <CloseIcon className='task-tab-close' onClick={removeListFromTask} title="Close Tab" data-list-id={list.id}></CloseIcon>    
                            </div>
                        ))}
                    </div>
                </div>
            </form>
            <div id='add-task-form-actions'>
                <div id='add-task-form-cancel-button' onClick={closeAddTaskForm}>Cancel</div>
                <div id='add-task-form-create-button' onClick={handleAddTask}>Create Task</div>
            </div>
        </div>
    )
}

export default AddTaskForm