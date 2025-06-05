import React, { Fragment, Dispatch, FunctionComponent, SetStateAction, ChangeEvent, useState, useCallback, MouseEvent, useEffect } from 'react';
import {useForm} from "react-hook-form";
import Config from "../../config.json"
import "./EditTaskForm.css"

import { ReactComponent as SearchIcon } from '../../assets/search.svg';

import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { TaskInterface } from '../../interfaces/Task';
import TaskSelectOption from './TaskSelectOption';
import { ListInterface } from '../../interfaces/List';

export interface EditTaskFormProps{
    closePageDisable: Dispatch<SetStateAction<void>>,
    tasks: Array<TaskInterface>,
    getTasks: Dispatch<void>,
	getTasksInOrder: Dispatch<void>,
    lists: Array<ListInterface>,
    currentTask: TaskInterface | null
}

const EditTaskForm:FunctionComponent<EditTaskFormProps> = ({
    closePageDisable,
    tasks,
    getTasks,
    getTasksInOrder,
    lists,
    currentTask
}) => {

    const {register, getValues, reset} = useForm();
    
    const [listsFilter, setListsFilter] = useState("");
    const [taskListsArray, setTaskListsArray] = useState<Array<number>>(currentTask ? [...currentTask.lists] : []);
    const [parentTaskSelect, setParentTaskSelect] = useState(currentTask ? currentTask.parent_id + "" : "");

    const handleSearchFocus = () => {
        document.getElementById("edit-task-list-search-bar")!.style.backgroundColor = '#B4D9AD';
    }

    const handleSearchFocusOut = () => {
        document.getElementById("edit-task-list-search-bar")!.style.backgroundColor = '';
    }

    const handleParentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setParentTaskSelect(e.target.value);
    }

    const closeEditTaskForm = () => {
        reset();
        clearListsFromTask();
        document.getElementById("edit-task-form")!.style.display = "none";
        closePageDisable();
        document.getElementById("edit-task-priority")!.style.color = "#777777";
        document.getElementById("edit-task-date")!.style.color = "#777777";

        document.getElementById('edit-task-reward')!.style.backgroundColor = "#ffffff";
        document.getElementById('edit-task-name')!.style.backgroundColor = "#ffffff";
        document.getElementById('edit-task-priority')!.style.backgroundColor = "#ffffff";
    }

    const editTask = useCallback(async (
        id: number,
		name: string,
		description: string,
		reward: number,
		priority: number,
		due_date: Date,
		parent_id: number | null,
        lists: Array<number>
	) => {
		let response = await fetch(Config.baseUrlProducktivityManager + "/edit_task", {
            method: 'POST',
            body: JSON.stringify({
                id: id,
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
        return response;
	}, [])

    const handleEditTask = () => {
        if(currentTask){
            const name = getValues("edit-name");
            const description = getValues("edit-description");
            const parent_task = getValues("edit-parent-task");
            const parent_id = parent_task === "" ? null : parseInt(parent_task);
            const priority = getValues("edit-priority");
            const reward = getValues("edit-reward");
            const due_date = getValues("edit-due-date");
            if(name && priority !== "0" && reward){
                editTask(currentTask.id, name, description, reward, priority, due_date, parent_id, taskListsArray);
                //updateProgress();
                getTasks();
                getTasksInOrder();
                closeEditTaskForm();
            }else{
                if(!name){
                    document.getElementById('edit-task-name')!.style.backgroundColor = "#ffc5cd";
                }else{
                    document.getElementById('edit-task-name')!.style.backgroundColor = "#ffffff";
                }

                if(priority === "0"){
                    document.getElementById('edit-task-priority')!.style.backgroundColor = "#ffc5cd";
                }else{
                    document.getElementById('edit-task-priority')!.style.backgroundColor = "#ffffff";
                }

                if(!reward){
                    document.getElementById('edit-task-reward')!.style.backgroundColor = "#ffc5cd";
                }else{
                    document.getElementById('edit-task-reward')!.style.backgroundColor = "#ffffff";
                }
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
        let option = document.getElementById("edit-task-list-drop-down-option-" + id);
        if(option){
            option.setAttribute("data-selected", "false");
        }
    }

    const clearListsFromTask = () => {
        let options = document.getElementsByClassName("edit-task-list-drop-down-result");
        for(let i = 0; i < options.length; i++){
            options[i].setAttribute("data-selected", "false");
        }
        
        setTaskListsArray([]);
    }

    useEffect(()=>{
        if(currentTask){
            setTaskListsArray(currentTask.lists);
            setParentTaskSelect(currentTask.parent_id +"");
        }
    }, [currentTask])

    return (
        <>
        {currentTask ?
        <div id='edit-task-form'>
            <div id='edit-task-form-label'>Edit Task</div>
            <form id='edit-task-form-contents'>
                <input {...register("edit-name")} type="text" placeholder='Task Name*' defaultValue={currentTask.name} id='edit-task-name' required></input>
                <textarea {...register("edit-description")} placeholder='Description' defaultValue={currentTask.description} id='edit-task-description'></textarea>
                <select {...register("edit-parent-task")} id='edit-task-parent' value={parentTaskSelect} onChange={handleParentChange}>
                    <option value={""}>Select Parent Task</option>
                    {tasks.map((task, ind)=>(
                        <Fragment key={"task-select-option-" + task.id}>
                        {task.id === currentTask.id ? "" :
                        <TaskSelectOption taskInfo={task} level={0}></TaskSelectOption>
                        }
                        </Fragment>
                    ))}
                </select>
                <div id='edit-task-form-row-3'>
                    <select {...register("edit-priority")} id='edit-task-priority' onChange={changeSelectColor} required defaultValue={currentTask.priority}>
                        <option value={"0"} id="edit-task-priority-label" disabled hidden>Priority*</option>
                        <option value={"1"}>1 &#9733;</option>
                        <option value={"2"}>2 &#9733;</option>
                        <option value={"3"}>3 &#9733;</option>
                        <option value={"4"}>4 &#9733;</option>
                        <option value={"5"}>5 &#9733;</option>
                    </select>
                    <input {...register("edit-reward")} type="number" placeholder='Reward*' defaultValue={currentTask.reward} id='edit-task-reward' required></input>
                </div>
                <input {...register("edit-due-date")} id='edit-task-date' type="datetime-local" onChange={changeInputColor} defaultValue={currentTask.due_date}></input>
                <div id="edit-task-form-row-4">
                    <div id='edit-task-list-search'>
                        <div id="edit-task-list-search-left">
                            <div id="edit-task-list-search-bar">
                                <input type="text"id='edit-task-list-search-input' placeholder="Search for list..." onChange={handleListSearch} onFocus={handleSearchFocus} onBlur={handleSearchFocusOut}></input>
                                <SearchIcon id="edit-task-list-search-icon"></SearchIcon>
                            </div>
                            <div id="edit-task-list-search-results">
                                <div id="search-results-wrapper">
                                    {lists.filter(x => x.name.toLowerCase().includes(listsFilter)).map((list, ind) => (
                                        <div 
                                            className='edit-task-list-drop-down-result'
                                            key={"edit-task-list-drop-down-option-" + list.id}
                                            id={"edit-task-list-drop-down-option-" + list.id}
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
                    <div id="edit-task-list-wrapper">
                        {lists.filter(item => taskListsArray.includes(item.id)).map((list, ind)=>(
                            <div className='applied-list' key={"applied-list-" + list.id + "-" + ind}>
                                {list.name}
                                <CloseIcon className='task-tab-close' onClick={removeListFromTask} title="Close Tab" data-list-id={list.id}></CloseIcon>    
                            </div>
                        ))}
                    </div>
                </div>
            </form>
            <div id='edit-task-form-actions'>
                <div id='edit-task-form-cancel-button' onClick={closeEditTaskForm}>Cancel</div>
                <div id='edit-task-form-create-button' onClick={handleEditTask}>Save Task</div>
            </div>
        </div>
        : ""}
        </>
    )
}

export default EditTaskForm