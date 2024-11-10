import {FunctionComponent, useState, useEffect, useCallback, MouseEvent, Dispatch, SetStateAction, ChangeEvent, KeyboardEvent} from 'react'
import {TaskInterface} from '../../../../interfaces/Task.ts'
import {ListInterface} from '../../../../interfaces/List.ts'
import Task from '../../../../components/Task/Task.tsx'
import Config from "../../../../config.json"
import "./MainTaskPage.css"


import { ReactComponent as AddIcon } from '../../../../assets/add-plus-square.svg';
import { ReactComponent as SortAscIcon } from '../../../../assets/sort-ascending.svg';
import { ReactComponent as FilterIcon } from '../../../../assets/filter.svg';
import { ReactComponent as PawIcon } from '../../../../assets/paw.svg';
import { ReactComponent as StarIcon } from '../../../../assets/star.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/close.svg';
import { ReactComponent as PlusIcon } from '../../../../assets/plus.svg';
import { ReactComponent as SearchIcon } from '../../../../assets/search.svg';


import { parseDateTime, parseDate, parseTime} from '../../../../utils/parseTime.tsx';
import DeleteAlert from '../../../../components/Alert/DeleteAlert.tsx'


interface MainTaskPageProps{
    tasks: Array<TaskInterface>,
    tasksMap: Map<String, TaskInterface>,
    closePageDisable: Dispatch<SetStateAction<void>>,
    currentTask: TaskInterface | null,
	setCurrentTask: Dispatch<SetStateAction<TaskInterface|null>>,

	currentTaskDIV: HTMLElement | null,
	setCurrentTaskDIV: Dispatch<SetStateAction<HTMLElement|null>>,

    setParentTaskSelect: Dispatch<SetStateAction<string>>,

    allowParentSelectChange: boolean,
    setAllowParentSelectChange: Dispatch<SetStateAction<boolean>>,

    getTasks: Dispatch<void>,
	getTasksInOrder: Dispatch<void>,

    lists: Array<ListInterface>,
    setLists: Dispatch<SetStateAction<Array<ListInterface>>>,
    getLists: Dispatch<void>,

    currentList: ListInterface|string,
    setCurrentList: Dispatch<SetStateAction<ListInterface|string>>,

    getWallet: Dispatch<void>,
    openLists: Array<number>,
    setOpenLists: Dispatch<SetStateAction<Array<number>>>,
    setClickToClose: Dispatch<SetStateAction<boolean>>
}


const MainTaskPage: FunctionComponent<MainTaskPageProps> = ({
    tasks, 
    tasksMap, 
    closePageDisable, 
    currentTask, 
    setCurrentTask, 
    currentTaskDIV, 
    setCurrentTaskDIV, 
    setParentTaskSelect, 
    allowParentSelectChange,
    setAllowParentSelectChange,
    getTasks,
    getTasksInOrder,
    lists,
    setLists,
    getLists,
    currentList,
    setCurrentList,
    getWallet,
    openLists,
    setOpenLists,
    setClickToClose
}) => {

    const [listsMap, setListsMap] = useState<Map<number, ListInterface>>(new Map());
    const [listsFilter, setListsFilter] = useState("");
    const [listTaskMap, setListTaskMap] = useState<Map<number, number[]>>(new Map());
    const [numTasks, setNumTasks] = useState(0)
    const [subtasksCount, setSubtasksCount] = useState<Map<number, number>>(new Map());
    const [currentTaskFilter, setCurrentTaskFilter] = useState("all");
    const [currentSort, setCurrentSort] = useState("id");
    const taskFilters = [{value: "all", label: "All"}, {value: "in-progress", label: "In Progress"}, {value: "complete", label: "Complete"}];
    const taskSort = [
        {value: "id", label: "Default"}, 
        {value: "priority", label: "Priority"}, 
        {value: "reward", label: "Reward"},
        {value: "date", label: "Due Date"},
        {value: "alphabetical", label: "A-Z"},
    ];

    const [taskToRemove, setTaskToRemove] = useState(-1);

    const alertMessage = "Are you sure you want to delete this task and all of its subtasks? This action cannot be undone.";

    const openAddTaskForm = () => {
        document.getElementById("add-task-form")!.style.display = "flex";
        setClickToClose(true);
    }

    const openEditTaskForm = () => {
        document.getElementById("edit-task-form")!.style.display = "flex";
        setClickToClose(false);
    }

    const openManageListsWindow = () => {
        document.getElementById("manage-lists-window")!.style.display = "flex";
        setClickToClose(true);
    }

    const handleAddTaskButtonClick = (e: MouseEvent<SVGSVGElement>) => {
        let page_disable = document.getElementById("disabled-page-content")!;
        page_disable.style.display = "block";
        if(allowParentSelectChange){
            setParentTaskSelect(currentTask ? (currentTask.id + "") : "");
            setAllowParentSelectChange(false);
        }
        
        openAddTaskForm();
    }

    const handleManageListClick = (e: MouseEvent<HTMLElement>) => {
        let page_disable = document.getElementById("disabled-page-content")!;
        page_disable.style.display = "block";

        closeAddTaskTab();
        openManageListsWindow();
    }

    const handleEditTaskButtonClick = (e: MouseEvent<HTMLElement>) => {
        let page_disable = document.getElementById("disabled-page-content")!;
        page_disable.style.display = "block";
        
        openEditTaskForm();
    }

    const handleAddTaskTab = (e: MouseEvent<HTMLElement>) => {
        let currentTarget = e.currentTarget;

        if(currentTarget.getAttribute("data-display") === "hidden"){
            openAddTaskTab();
        }else{
            closeAddTaskTab();
        }

    }

    const openAddTaskTab = () => {
        let tab = document.getElementById("add-task-tab")!;
        let dropDownMenu = document.getElementById("task-tab-drop-down-menu")!;
        
        tab.setAttribute("data-display", "shown");
        dropDownMenu.style.display = "flex";
    }

    const closeAddTaskTab = () => {
        let tab = document.getElementById("add-task-tab")!;
        let dropDownMenu = document.getElementById("task-tab-drop-down-menu")!;

        tab.setAttribute("data-display", "hidden");
        dropDownMenu.style.display = "none";
    }

    const completeTask = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/complete/" + id);
            response = await response.json();
            return response;
    }, [])

    const undoCompleteTask = useCallback(async (id: number) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/undo_complete/" + id);
            response = await response.json();
            return response;
    }, [])

    const updateWallet = useCallback(async (amount: number) => {
		let response = await fetch(Config.baseUrlProducktivityManager + "/update_wallet", {
            method: 'POST',
            body: JSON.stringify({
                transaction_amount: amount
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
		});
		response = await response.json();
        return response;
	}, [])

    const removeTask = useCallback(async (id: number) => {
        console.log(id)
        let response = await fetch(Config.baseUrlProducktivityManager + "/remove/" + id);
            response = await response.json();
            console.log(response);
    }, [])

    const getListTaskMap = useCallback(async () => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/list_task_map");
            response = await response.json();
            let tempMap = new Map<number, number[]>();
            let entries = Object.entries(response);

            for(let i = 0; i < entries.length; i++){
                tempMap.set(parseInt(entries[i][0]), entries[i][1] as number[]);
            }

            setListTaskMap(tempMap);
    }, [])

    const addList = useCallback(async (name: string) => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/add_list/" + name);
            response = await response.json();
            return(response);
    }, [])

    const handleCompleteTask = () =>{
        if(currentTask){
            if(currentTask.is_completed){
                undoCompleteTask(currentTask.id);
                updateWallet(-currentTask.reward);
            }else{
                completeTask(currentTask.id);
                updateWallet(currentTask.reward);
            }
            getWallet();
            getTasks();
            getTasksInOrder();
        }
    }

    const handleRemoveTask = () =>{
        if(currentTask){
            document.getElementById("alert-blur-tasks")?.setAttribute("data-is-visible", "true");
            setTaskToRemove(currentTask.id);
        }
    }

    const openTab = (e: MouseEvent<HTMLElement>) => {
        let id = e.currentTarget.getAttribute("data-list-id")!;
        if(id){
            setOpenLists([...openLists, parseInt(id)])
        }
    }

    const closeTab = (e:MouseEvent<SVGSVGElement>) => {
        let id = e.currentTarget.getAttribute("data-list-id")!;
        if(id){
            if(currentList !== "all" && (currentList as ListInterface).id === parseInt(id)){
                document.getElementById(id + "-task-tab")!.setAttribute("data-highlighted", "false");
                document.getElementById("all-task-tab")!.setAttribute("data-highlighted", "true");
                setCurrentList("all");
            }
            setOpenLists(openLists.filter(list => list !== parseInt(id)));
        }
    }

    const selectList = (e:MouseEvent<HTMLElement>) => {
        let type = (e.target as HTMLElement).nodeName;
        if(type !== "svg" && type !== "path"){
            let oldListID = typeof currentList === "string" ? "all" : currentList.id; 
            let oldList = document.getElementById(oldListID + "-task-tab")!;
            oldList.setAttribute("data-highlighted", "false");

            e.currentTarget.setAttribute("data-highlighted", "true");
            let current = undefined
            if(e.currentTarget.id === "all-task-tab"){
                current = "all"
            }else{
                current = {
                    id: parseInt(e.currentTarget.getAttribute("data-list-id")!), 
                    name: e.currentTarget.getAttribute("data-list-name"), 
                    isOpen: true
                } as ListInterface
            }
            setCurrentList(current);
        }
    }

    const handleListSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setListsFilter(e.target.value.toLowerCase());
    }

    const handleAddList = useCallback(async (e: KeyboardEvent<HTMLInputElement>) => {
        if(e.key === "Enter" && (e.target as HTMLInputElement).value !== ""){
            let list_name = (e.target as HTMLInputElement).value
            let result = await addList(list_name) as unknown as Array<number>;
            if((result[0]) === 1){
                getLists();
                setOpenLists([...openLists, result[1]]);
                closeNewListTab();
            }else{
                (document.getElementById("new-list-input")! as HTMLInputElement).setAttribute("data-valid", "false")
            }
        }else{
            (document.getElementById("new-list-input")! as HTMLInputElement).setAttribute("data-valid", "true")
        }
        
    }, [addList, getLists, openLists, setOpenLists])

    const closeNewListTab = () => {
        let tab = document.getElementById("new-task-tab")!;
        tab.style.display = "none";
        (document.getElementById("new-list-input")! as HTMLInputElement).value = "";
        let add_list_button = document.getElementById("tab-drop-down-create")!;
        add_list_button.setAttribute("data-status", "enabled");
    }

    const openNewListTab = (e: MouseEvent<HTMLElement>) => {
        let tab = (document.getElementById("new-task-tab") as HTMLInputElement)!;
        if((e.target as HTMLElement).getAttribute("data-status") === "enabled"){
            tab.style.display = "flex";
            document.getElementById("new-list-input")!.focus();
            (e.target as HTMLElement).setAttribute("data-status", "disabled");
        }
    }

    const countTasksR = useCallback((task: TaskInterface) => {
        let total = 0
        task.subtasks.forEach((subtask)=>{
            total += countTasksR(subtask);
        })
        return total + ((typeof currentList === 'string' || task.lists.includes(currentList.id)) && ((currentTaskFilter === "all" || (currentTaskFilter === "in-progress" && !task.is_completed) || (currentTaskFilter === "complete" && task.is_completed)))? 1 : 0)
    }, [currentList, currentTaskFilter])

    const countTasks = useCallback(() => {
        if(tasks.length > 0 && typeof tasks[1] === "object"){
            let newMap = new Map<number, number>();
            let total = 0
            tasks.forEach((task, ind) => {
                let num = countTasksR(task)
                newMap.set(ind, num);
                total += num
            })

            setNumTasks(total);
            setSubtasksCount(newMap);
        }
    }, [countTasksR, tasks])

    const changeTaskFilter = (e: MouseEvent<HTMLElement>) => {
        setCurrentTaskFilter((e.target as HTMLElement).getAttribute("data-value")!);
        closeFilterDropDown();
    }

    const changeSortFilter = (e: MouseEvent<HTMLElement>) => {
        setCurrentSort((e.target as HTMLElement).getAttribute("data-value")!);
        closeSortDropDown();
    }

    const openFilterDropDown = () => {
        let dropdown = document.getElementById("list-options-filter-dropdown")!;
        let filterIcon = document.getElementById("filter-icon")!;
        dropdown.setAttribute("data-display", "shown");
        filterIcon.setAttribute("data-display", "shown");
    }

    const closeFilterDropDown = () => {
        let dropdown = document.getElementById("list-options-filter-dropdown")!;
        let filterIcon = document.getElementById("filter-icon")!;
        dropdown.setAttribute("data-display", "hidden");
        filterIcon.setAttribute("data-display", "hidden");
    }

    const openSortDropDown = () => {
        let dropdown = document.getElementById("list-options-sort-dropdown")!;
        let filterIcon = document.getElementById("sort-icon")!;
        dropdown.setAttribute("data-display", "shown");
        filterIcon.setAttribute("data-display", "shown");
    }

    const closeSortDropDown = () => {
        let dropdown = document.getElementById("list-options-sort-dropdown")!;
        let filterIcon = document.getElementById("sort-icon")!;
        dropdown.setAttribute("data-display", "hidden");
        filterIcon.setAttribute("data-display", "hidden");
    }

    const handleToggleDropdown = (e: MouseEvent<SVGSVGElement>) => {
        let type = e.currentTarget.id;
        if(e.currentTarget.getAttribute("data-display") === "shown"){
            if(type === "filter-icon"){
                closeFilterDropDown();
            }else{
                closeSortDropDown();
            }
        }else{
            if(type === "filter-icon"){
                closeSortDropDown();
                openFilterDropDown();
            }else{
                closeFilterDropDown();
                openSortDropDown();
            }
        }
    }

    const sortTasks = (a: TaskInterface, b: TaskInterface) => {
        switch (currentSort){
            case "id":
                return a.id - b.id
            case "priority":
                return b.priority - a.priority
            case "reward":
                return b.reward - a.reward
            case "date": 
                if(a.due_date && b.due_date){
                    let a_date = Date.parse(a.due_date);
                    let b_date = Date.parse(b.due_date)
                    return a_date - b_date;
                }else if (a.due_date){
                    return -1;
                }else if (b.due_date){
                    return 1;
                }else{
                    return 0;
                }
            case "alphabetical":
                return a.name.localeCompare(b.name)
            default:
                return 0 
        }
    }

    useEffect(() => {
        getListTaskMap();
    }, [getListTaskMap])

    useEffect(() => {
        let tempMap = new Map<number, ListInterface>();
        for(let i = 0; i < lists.length; i++){
            tempMap.set(lists[i].id, lists[i]);
        }
        setListsMap(tempMap);
    }, [lists])

    useEffect(()=>{
        countTasks();
    },[currentList, tasks, countTasks]);

    useEffect(() => {
        getTasks();
        getTasksInOrder();
    }, [taskToRemove, getTasks, getTasksInOrder])

    return (
        <div id='main-tasks-page'>
            <DeleteAlert
                message={alertMessage} 
                confirmAction={removeTask} 
                idToRemove={taskToRemove} 
                setIdToRemove={setTaskToRemove}
                type='tasks'
            />
            <div id='main-tasks-page-left'>
                <div id='task-tabs'>
                    <div id="task-tabs-wrapper">
                        <div className='task-tab' 
                            id="all-task-tab" 
                            title={"All Tasks"}
                            data-highlighted="true"
                            onClick={selectList}
                        >
                            <span className='task-tab-name'>
                                All Tasks
                            </span>
                        </div>
                            {openLists.map((listID, ind) => (
                                listsMap.has(listID) ? 
                                <div className='task-tab' 
                                    id={listID + "-task-tab"} 
                                    title={listsMap.get(listID)!.name} 
                                    key={"list-tab-" + listID + "-" + ind}
                                    data-highlighted="false"
                                    data-list-id={listID}
                                    data-list-name={listsMap.get(listID)!.name}
                                    onClick={selectList}
                                >
                                    <span className='task-tab-name'>
                                        {listsMap.get(listID)!.name}
                                    </span>
                                    <CloseIcon className='task-tab-close' data-list-id={listID} onClick={closeTab} title="Close Tab"></CloseIcon>
                                </div> : ""
                            ))}
                        <div className='task-tab' 
                            id="new-task-tab"
                            data-highlighted="false"
                        >
                            <input type="text" placeholder='Unnamed List' id="new-list-input" onKeyDown={handleAddList} data-valid="true"></input>
                            <CloseIcon className='task-tab-close' onClick={closeNewListTab} title="Close Tab"></CloseIcon>
                        </div> 
                    </div>
                    <div id="add-task-tab-wrapper" onMouseLeave={closeAddTaskTab}>
                        <div id='add-task-tab' data-display="hidden" onClick={handleAddTaskTab}>
                            <PlusIcon id='add-task-tab-plus'></PlusIcon>
                        </div>
                        <div id="task-tab-drop-down-menu">
                            <div id="tab-drop-down-label">Open List:</div>
                            <div id="tab-drop-down-search-wrapper">
                                <div id="tab-drop-down-search-bar">
                                    <input type="text" placeholder="Search for list..." id="tab-drop-down-search-input" onChange={handleListSearch}></input>
                                    <SearchIcon id="tab-drop-down-search-icon"></SearchIcon>
                                </div>
                                <div id="tab-drop-down-search-results">
                                    <div id="search-results-wrapper">
                                        {lists.filter(x => x.name.toLowerCase().includes(listsFilter)).map((list, ind) => (
                                            <div 
                                                className='tab-drop-down-result'
                                                key={"drop-down-list-option-" + list.id}
                                                data-list-id={list.id}
                                                data-list-name={list.name}
                                                data-disabled={openLists.includes(list.id) ? "true" : "false"}
                                                onClick={openLists.includes(list.id) ? undefined : openTab}
                                            >
                                                {list.name}
                                            </div> 
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div id="tab-drop-down-create" className='tab-drop-down-options' data-status="enabled" onClick={openNewListTab}>Create New List</div>
                            <div id="tab-drop-down-manage" className='tab-drop-down-options' data-status="enabled" onClick={handleManageListClick}>Manage Lists</div>
                        </div>
                    </div>
                </div>
                <div id='task-list-section'>
                    <div id='list-options-bar'>
                        <div id='list-options-left'>
                            <div id='task-list-name'>{currentList === "all" ? "All Tasks" : (currentList as ListInterface).name} ({numTasks})</div>
                        </div>
                        <div id='list-options-right'>
                            <div id="list-options-sort-wrapper" onMouseLeave={closeSortDropDown}>
                                <SortAscIcon className='list-options-buttons' id="sort-icon" data-display="hidden" onClick={handleToggleDropdown}></SortAscIcon>
                                <div id="list-options-sort-dropdown" data-display="hidden">
                                    {taskSort.map((item) => (
                                        <div 
                                            className='sort-dropdown-option' 
                                            data-value={item.value} 
                                            data-active={item.value === currentSort ? "true" : "false"}
                                            key={"sort-drop-down-option" + item.value}
                                            onClick={changeSortFilter}
                                            >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div id="list-options-filter-wrapper" onMouseLeave={closeFilterDropDown}>
                                <FilterIcon className='list-options-buttons' id="filter-icon" data-display="hidden" onClick={handleToggleDropdown}></FilterIcon>
                                <div id="list-options-filter-dropdown" data-display="hidden">
                                    {taskFilters.map((item) => (
                                        <div 
                                            className='filter-dropdown-option' 
                                            data-value={item.value} 
                                            data-active={item.value === currentTaskFilter ? "true" : "false"}
                                            key={"filter-drop-down-option" + item.value}
                                            onClick={changeTaskFilter}
                                            >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <AddIcon className='list-options-buttons' id="add-icon" onClick={handleAddTaskButtonClick}></AddIcon>
                        </div>
                    </div>
                    <div id='task-list-wrapper'>
                        {numTasks > 0 ?
                        <div id='tasks-list'>
                        {tasks.sort(sortTasks).map((task, ind)=>(
                                subtasksCount.has(ind) && subtasksCount.get(ind)! > 0 ? 
                                <Task 
                                    type='main'
                                    key={"main-task-" + task.id}
                                    taskInfo={task as TaskInterface}
                                    tasksMap={tasksMap}
                                    level={0}
                                    currentTask={currentTask}
                                    setCurrentTask={setCurrentTask}
                                    currentTaskDIV={currentTaskDIV}
                                    setCurrentTaskDIV={setCurrentTaskDIV}
                                    currentList={currentList}
                                    listTaskMap={listTaskMap}
                                    currentTaskFilter={currentTaskFilter}
                                ></Task> : 
                                ""
                        ))}
                        </div> : 
                            <div id="empty-task-list-display">
                                Hooray! You don't have any tasks to complete!
                            </div>}
                    </div>
                </div>
                
            </div>

            <div id='main-tasks-page-right'>
                {currentTask ?
                <>
                    <div id="task-info-label">Task Details</div>
                    <div id='task-info'>
                        <div id='task-info-row-1'>
                            <div id='task-info-reward'><PawIcon id="task-info-paw-icon"></PawIcon>{currentTask.reward}</div>
                            <div id='task-info-row-1-right'>
                                <div id='task-info-priority'>
                                    {Array.from({ length: currentTask.priority }).map((i, index) => <StarIcon className="task-info-star-icon" key={"task-info-star" + index}></StarIcon>)}
                                </div>
                                <div id='task-info-due-date'>{currentTask.is_completed ? "Completed: " + parseDateTime(currentTask.complete_date) : (currentTask.due_date ? "Due: " + parseDate(currentTask.due_date) + " @ " + parseTime(currentTask.due_date) : "")}</div>
                                <div id="task-info-id">Task ID: {currentTask.id}</div>
                            </div>
                        </div>
                        <div id='task-info-name'>{currentTask.name}</div>
                        <div id='task-info-start-date'>Started on: {parseDate(currentTask.start_date)}</div> 
                        <div id='task-info-lists'>
                            
                            {listsMap.size > 0 ? currentTask.lists.map((tag, ind) => (
                                <div className='task-info-list-tag' key={"list-tag"+tag+"-"}>{listsMap.get(tag)!.name}</div>
                            )):""}
                        </div> 
                        <div id='task-info-description'>{currentTask.description}</div>         
                    </div>
                
                    <div className='task-action-buttons' id='complete-task-button' data-mode={currentTask.is_completed ? "undo" : "complete"} onClick={handleCompleteTask}>
                        {currentTask.is_completed ? "Undo Complete" : "Mark Complete"}
                    </div>
                    <div className='task-action-buttons' id='edit-task-button' onClick={handleEditTaskButtonClick}>Edit Task</div>
                    <div className='task-action-buttons' id='delete-task-button' onClick={handleRemoveTask}>Delete Task</div>
                </>: ""}
            </div>
        </div>
    )
}

export default MainTaskPage