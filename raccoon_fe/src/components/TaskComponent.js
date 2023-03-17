import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import { faArrowUpWideShort, faFilter, faArrowDownShortWide } from "@fortawesome/free-solid-svg-icons";
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../style/TaskComponent.css";

const TaskComponent = ({getWallet, updateWallet, sendAlert, raccoins}) => {

    const {register, getValues, handleSubmit, reset} = useForm();
    const [tasks, setTasks] = useState([{}]);
    const [filters, setFilters] = useState([]);
    const [highlightedTask, setHighlightedTask] = useState("");
    const [highlightedCategory, setHighlightedCategory] = useState("");
    const [categories, setCategories] = useState([{}]);

    const [sortIcon, setSortIcon] = useState(faArrowUpWideShort);

    const [sortFunction, setSortFunction] = useState(() => (a,b) => {return 0 });
    
    const handleAddTask = () =>{
        const task = getValues("name");
        const reward = getValues("reward");
        const type = getValues("type");
        const due_date = getValues("due_date");
        if(task){
            addTask(task, reward, type, due_date);
            updateProgress();
            getTasks();
        }
        reset();
    }

    const handleCompleteTask = () =>{
        if(!highlightedTask){
            sendAlert("No task selected", "bad"); 
        }else if(highlightedTask.classList.contains("completed")){
            sendAlert("Task already completed", "bad");
        }else{
            completeTask(highlightedTask.getAttribute("taskid"));
            addCategory(highlightedTask.getAttribute("taskid"), ["Completed"]);
            removeCategory(highlightedTask.getAttribute("taskid"), ["In-Progress"])
            updateWallet(raccoins + parseInt(highlightedTask.getAttribute("reward")))
            getTasks();
            getWallet();
        }
    }

    const handleRemoveTask = () =>{
        if(!highlightedTask){
            sendAlert("No task selected", "bad"); 
        }else{
            removeTask(highlightedTask.getAttribute("taskid"));
            getTasks();
        }
    }

    const handleCreateCategory = () => {
        let newCategory = document.getElementById("new-filter-input").value;
        if(newCategory && !categories.includes(newCategory)){
            createCategory(newCategory);
            getCategories();
            document.getElementById("new-filter-input").value = '';
        }
    }

    const handleDeleteCategory = () => {
        let category = highlightedCategory.getAttribute("category");
        if(category && category !== "Completed" && category !== "In-Progress"){
            deleteCategory(category);
            getCategories();
        }
    }

    const handleToggleCategory = () =>{
        if(highlightedCategory && highlightedTask){
            let category = highlightedCategory.getAttribute("category");
            let task = highlightedTask.getAttribute("taskid");
            if(category !== "Completed" && category !== "In-Progress"){
                toggleCategory(task, category);
                getCategories();
                getTasks();
            }
        }
    }

    const getTasks = useCallback(async () => {
        let response = await fetch("/tasks", {
            method: 'POST',
            body: JSON.stringify({categories: filters}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            setTasks(response)
    }, [filters])

    const getCategories = useCallback(async () => {
        let response = await fetch("/categories");
            response = await response.json();
            setCategories(response);
    }, [])

    const updateProgress = useCallback(async () => {
        let response = await fetch("/update_progress");
            response = await response.json();

        if(response === "failed"){
            sendAlert("Unable to update progress D:", "bad");
        }else{
            sendAlert("Progress updated!", "good")
        }
    }, [sendAlert])

    const addTask = useCallback(async (task, reward_amt, type, due_date) => {
        let response = await fetch("/add", {
            method: 'POST',
            body: JSON.stringify({name: task, reward: reward_amt, type: type, due_date: due_date}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            if(response === "failed"){
                sendAlert("Unable to add task D:", "bad");
            }else{
                sendAlert("Task added!", "good")
            }
    }, [sendAlert])

    const completeTask = useCallback(async (id) => {
        let response = await fetch("/complete/" + id);
            response = await response.json();
            if(response === "failed"){
                sendAlert("There was an error completing your task :(", "bad");
            }else{
                sendAlert("Yay, you finished a task! :D", "good")
            }
    }, [sendAlert])

    const removeTask = useCallback(async (id) => {
        let response = await fetch("/remove/" + id);
            response = await response.json();
            if(response === "failed"){
                sendAlert("There was an error removing your task.", "bad");
            }else{
                sendAlert("Task removed!", "good")
            }
    }, [sendAlert])

    const createCategory = useCallback(async (category) => {
        let response = await fetch("/create_category/" + category);
            response = await response.json();
            if(response === "failed"){
                sendAlert("There was an error creating your category :(", "bad");
            }else{
                sendAlert("Yay, you created a category! :D", "good")
            }
    }, [sendAlert])

    const deleteCategory = useCallback(async (category) => {
        let response = await fetch("/delete_category/" + category);
            response = await response.json();
            if(response === "failed"){
                sendAlert("There was an error deleting your category :(", "bad");
            }else{
                sendAlert("Yay, you deleted a category! :D", "good")
            }
    }, [sendAlert])

    const addCategory = useCallback(async (task_id, categories) => {
        let response = await fetch("/add_categories", {
            method: 'POST',
            body: JSON.stringify({task_id: task_id, categories: categories}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            if(response === "failed"){
                sendAlert("Unable to add category D:", "bad");
            }else{
                sendAlert("Category added!", "good")
            }
    }, [sendAlert])

    const removeCategory = useCallback(async (task_id, categories) => {
        let response = await fetch("/remove_categories", {
            method: 'POST',
            body: JSON.stringify({task_id: task_id, categories: categories}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            if(response === "failed"){
                sendAlert("Unable to remove category D:", "bad");
            }else{
                sendAlert("Category removed!", "good")
            }
    }, [sendAlert])

    const toggleCategory = useCallback(async (task_id, category) => {
        let response = await fetch("/toggle_category", {
            method: 'POST',
            body: JSON.stringify({task_id: task_id, category: category}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            if(response === "failed"){
                sendAlert("Something went wrong D:", "bad");
            }else{
                sendAlert("Success!", "good")
            }
    }, [sendAlert])

    const selectTask = (e) =>{
        let target = e.target;

        if(target.classList.contains("task-type-value") || 
            target.classList.contains("task-type-label") ||
            target.classList.contains("task-progress") ||
            target.classList.contains("task-start") || 
            target.classList.contains("task-due")){
            target = target.parentElement;
        }

        if(target.classList.contains("task-completion-info") || 
            target.classList.contains("task-type-wrapper") ||
            target.classList.contains("task-name") ||
            target.classList.contains("list-num")){
            target = target.parentElement;
        }

        if(target.classList.contains("selected")){
            target.classList.remove("selected")
            target.childNodes[2].classList.remove("expanded-task-name")
            setHighlightedTask("")
        }else{
            if(highlightedTask){
            highlightedTask.classList.remove("selected")
            highlightedTask.childNodes[2].classList.remove("expanded-task-name")
            }        
            setHighlightedTask(target)
            target.classList.add("selected")
            target.childNodes[2].classList.add("expanded-task-name")
        }
    }

    const selectCategory = (e) =>{
        if(e.target.classList.contains("selected-filter-name")){
            e.target.classList.remove("selected-filter-name")
            setHighlightedCategory("")
        }else{
            if(highlightedCategory){
            highlightedCategory.classList.remove("selected-filter-name")
            }        
            setHighlightedCategory(e.target)
            e.target.classList.add("selected-filter-name")
        }
    }

    const openTaskMenu = (e) =>{
        let target = e.target
        if(target.nodeName === "svg"){
            target = target.parentElement
        }else if(target.nodeName === "path"){
            target = target.parentElement.parentElement
        }

        if(target.getAttribute("isvisible") === "false"){
            target.style.backgroundColor = "#EAE7E2";
            target.setAttribute("isvisible", "true");
            document.getElementById('add-task-section').style.display = "flex";
        }else{
            target.style.backgroundColor = "#C9D8D1";
            target.setAttribute("isvisible", "false");
            document.getElementById('add-task-section').style.display = "none";
        }
    }

    const openFilterMenu = (e) =>{
        let target = e.target
        if(target.nodeName === "svg"){
            target = target.parentElement
        }else if(target.nodeName === "path"){
            target = target.parentElement.parentElement
        }

        if(target.getAttribute("isvisible") === "false"){
            target.style.backgroundColor = "#EAE7E2";
            target.setAttribute("isvisible", "true");
            document.getElementById('filter-section').style.display = "flex";
        }else{
            target.style.backgroundColor = "#C9D8D1";
            target.setAttribute("isvisible", "false");
            document.getElementById('filter-section').style.display = "none";
        }
    }

    const displayForm = (e) => {
        let formWrapper = document.getElementById("add-task-form-line-2")
        for(let i = 0; i < formWrapper.childElementCount; i++){
            formWrapper.childNodes[i].style.display = "none";
        }

        document.getElementById(e.target.value + "-add-task-form").style.display = "flex";
    }

    const formatDateTime = (dateTimeString) =>{
        let d = new Date(dateTimeString)
        let h = d.getHours()
        let m = d.getMinutes()
        let t = ((h > 12) ? (h - 12) : h) + ":" + ((m < 10) ? "0" : "") + m  + ((h > 12) ? "PM" : "AM")
        let day = d.getDate()
        let month = d.getMonth()
        let year = d.getFullYear()
        return (month + 1) + "/" + day + "/" + year + " " + t
    }

    const toggleFilter = () =>{
        if(highlightedCategory){
            var category = highlightedCategory.getAttribute("category");
            let ind = filters.indexOf(category);
            let filtersCopy = [...filters];
            if (ind !== -1) {
                filtersCopy.splice(ind, 1);
                setFilters(filtersCopy);
                highlightedCategory.classList.remove("active-filter-name");
            }else{
                filtersCopy.push(category);
                setFilters(filtersCopy);
                highlightedCategory.classList.add("active-filter-name"); 
            }
        }
    }

    const toggleSort = (e) => {
        let target = e.target
        if(target.nodeName === "svg"){
            target = target.parentElement
        }else if(target.nodeName === "path"){
            target = target.parentElement.parentElement
        }

        let direction = target.getAttribute("direction");
        if(direction === "none"){
            target.style.backgroundColor = "#EAE7E2";
            target.setAttribute("direction", "newest")
            setSortIcon(faArrowUpWideShort)
            setSortFunction(() => (a,b) => {return new Date(b.due_date) - new Date(a.due_date);});
        }else if(direction === "newest"){
            target.style.backgroundColor = "#EAE7E2";
            target.setAttribute("direction", "oldest")
            setSortIcon(faArrowDownShortWide)
            setSortFunction(() => (a,b) => {return new Date(a.due_date) - new Date(b.due_date);});
        }else{
            target.style.backgroundColor = "#C9D8D1";
            target.setAttribute("direction", "none")
            setSortIcon(faArrowUpWideShort)
            setSortFunction(() => (a,b) => {return 0;});
        }
    }

    useEffect(() => {
        getTasks();
        getCategories();
    },[getTasks, getCategories])
    
    return (
        <div className='task-section'>
            <div className='task-info'>
                <div className='task-list-information-bar'>
                    <div className='task-list-label'>To Do List <span className='task-count'>{tasks.length}</span></div>
                    <div className='task-list-buttons'>
                        <div direction="none" onClick={toggleSort}><FontAwesomeIcon icon={sortIcon} /></div>
                        <div onClick={openFilterMenu} isvisible="false"><FontAwesomeIcon icon={faFilter} /></div>
                        <div onClick={openTaskMenu} isvisible="false"><FontAwesomeIcon icon={faSquarePlus}/></div>
                    </div>
                </div>
                <div id='filter-section'>
                    
                    <div className='filter-options'>
                        <div className='filter-options-buttons' id='apply-remove-filter-button' onClick={toggleFilter}>Apply/Remove Filter</div>
                        <div className='filter-options-buttons' id='add-category-task-button' onClick={handleToggleCategory}>Add/Remove Category to Task</div>
                    </div>
                    <div className='filters-wrapper'>
                        {categories.map((category, ind) => (
                            <div 
                                className={'filter-name' + (filters.includes(category.name) ? ' active-filter-name' : '') + 
                                ((highlightedCategory && highlightedCategory.getAttribute("category") === category.name) ? ' selected-filter-name' : '')}
                                category = {category.name}
                                key={'category-' + ind} onClick={selectCategory}>
                                    {category.name}
                            </div>
                        ))}
                    </div>
                    <div className='filter-options'>
                        <input id="new-filter-input" placeholder='Type category here...' type={'name'}></input>
                        <div className='filter-options-buttons2' id='create-category-button' onClick={handleCreateCategory}>Create New Category</div>
                        <div className='filter-options-buttons2' id='delete-category-button' onClick={handleDeleteCategory}>Delete Category</div>
                    </div>
                </div>
                <div id='add-task-section'>
                    <form className='add-task-form'>
                        <div className='add-task-form-line-1'>
                            <input {...register("name")} type={"name"} placeholder="Type task here..." className='add-task-input'/>
                            <div className='task-info-label'>Difficulty: </div>
                            <select {...register("reward")} className='reward-input'>
                                <option value={1}>1 &#9733;</option>
                                <option value={2}>2 &#9733;</option>
                                <option value={5}>3 &#9733;</option>
                                <option value={10}>4 &#9733;</option>
                                <option value={20}>5 &#9733;</option>
                            </select>
                            <div className='task-type'>
                                <div className='task-info-label'>Task Type: </div>
                                <select {...register("type")} className='task-type-input' onChange={displayForm}>
                                    <option value="normal">Normal</option>
                                    <option value="daily" disabled>Daily</option>
                                    <option value="weekly" disabled>Weekly</option>
                                    <option value="custom" disabled>Custom</option>
                                </select>
                            </div>
                        </div>
                        <div id='add-task-form-line-2'>
                            <div id="normal-add-task-form" className='add-task-forms-2'>
                                <div className='task-info-label'>Due: </div>
                                <input {...register("due_date")} type="datetime-local" className='due-date-input'></input>
                            </div>
                            <div id="daily-add-task-form" className='add-task-forms-2'>
                                <div className='task-info-label'>Refresh at</div>
                                <input {...register("recurring_time")} type="time" className='recurring-time-input' defaultValue={"23:59:59"}></input>
                            </div>
                            <div id="weekly-add-task-form" className='add-task-forms-2'>
                                <div className='task-info-label'>Refresh on</div>
                                <select {...register("weekday")} className='weekday-input'>
                                    <option value="sunday">Sundays</option>
                                    <option value="monday">Mondays</option>
                                    <option value="tuesday">Tuesdays</option>
                                    <option value="wednesday">Wednesdays</option>
                                    <option value="thursday">Thursdays</option>
                                    <option value="friday">Fridays</option>
                                    <option value="saturday">Saturdays</option>
                                </select>
                                <div className='task-info-label'>at</div>
                                <input {...register("recurring_time")} type="time" className='recurring-time-input' defaultValue={"23:59:59"}></input>
                            </div>
                        </div>                            
                        <button onClick={handleSubmit(handleAddTask)} className='add-task-button'> Add Task </button>
                    </form>
                </div>
                

                <div className='task-list'>
                    <div className='task-scroll-bar-container'>
                        <div className='tasks-wrapper'>
                            {[...tasks].sort(sortFunction).map((item, ind) => (
                                <div className='task' taskid={item.id} reward={item.reward} key={"task" + ind} onClick={selectTask}>
                                    <div className='list-num'>{ind + 1}</div>
                                    <div className='task-type-wrapper'><div className='task-type-value'>Task Type: {item.type}</div></div>
                                    <div className='task-name'>{item.name}</div>
                                    <div className='task-completion-info'>
                                        <div className={'task-progress' + (item.is_completed ? " completed": "")}>{item.is_completed ? "Completed" : item.reward + " Raccoins"}</div>
                                        <div className='task-start'>{"Start: " + formatDateTime(item.start_date)}</div>
                                        {item.due_date ? <div className='task-due'>{"Due: " +  formatDateTime(item.due_date)}</div> : ""}
                                    </div>
                                </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className='task-actions'>
                    <button className="remove-task-button" onClick={handleRemoveTask}>
                        Delete
                    </button>
                    <button className="complete-task-button" onClick={handleCompleteTask}>
                        Mark Complete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskComponent