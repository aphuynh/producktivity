import {useState, useEffect, useCallback, FunctionComponent, Dispatch, SetStateAction, ChangeEvent, useRef} from 'react'
import PageNotFound from '../PageNotFound/PageNotFound'
import {Routes, Route} from "react-router-dom"
import "./TaskPage.css"
import TaskNavBar from '../../components/TaskNavBar/TaskNavBar'
import { TaskInterface } from '../../interfaces/Task'
import MainTaskPage from './subTaskPages/MainTaskPage/MainTaskPage'
import AddTaskForm from '../../components/TaskForm/AddTaskForm'
import { ListInterface } from '../../interfaces/List'
import ManageListsWindow from '../../components/ManageListsWindow/ManageListsWindow'
import EditTaskForm from '../../components/TaskForm/EditTaskForm'

export interface TaskPageProps{
    closePageDisable: Dispatch<SetStateAction<void>>,
	getWallet: Dispatch<void>,
	lists: Array<ListInterface>,
	setLists: Dispatch<SetStateAction<Array<ListInterface>>>,
	getLists: Dispatch<void>,
	setClickToClose: Dispatch<SetStateAction<boolean>>
}

const TaskPage: FunctionComponent<TaskPageProps> = ({
	closePageDisable,
	getWallet,
	lists,
	setLists,
	getLists,
	setClickToClose
}) => {

	const [tasks, setTasks] = useState([{}]);
	const [tasksMap, setTasksMap] = useState(new Map<string, TaskInterface>());	

	const [currentTask, setCurrentTask] = useState<TaskInterface|null>(null);
    const [currentTaskDIV, setCurrentTaskDIV] = useState<HTMLElement|null>(null);
	
    const [currentList, setCurrentList] = useState<ListInterface|string>("all");
	
    const [parentTaskSelect, setParentTaskSelect] = useState("");
	const [allowParentSelectChange, setAllowParentSelectChange] = useState(true);

	const [openLists, setOpenLists] = useState<Array<number>>([]);

	const getTasksInOrder = useCallback(async () => {
        let response: any = await fetch("/tasks/ordered");
            response = await response.json();
            setTasks(response as Array<TaskInterface>);
    }, [])

    const getTasks = useCallback(async () => {
        let response: any = await fetch("/tasks/all");
            response = await response.json();
            setTasksMap(new Map(Object.entries(response)));
    }, [])

	const updateTaskInfo = () =>{
        if(currentTask){
            let oldID = currentTask.id;
            let new_task = tasksMap.get(oldID + "");
            if(new_task){
                setCurrentTask(new_task);
                setCurrentTaskDIV(document.getElementById("task-bar-"+ oldID));
            }else{
                setCurrentTask(null);
                setCurrentTaskDIV(null);
                setParentTaskSelect("");
                setAllowParentSelectChange(true);
            }
        }
    }

    useEffect(()=>{
        updateTaskInfo();
    }, [tasks, tasksMap])


	useEffect(() => {
        getTasksInOrder();
        getTasks();
    }, [getTasks, getTasksInOrder])

	return (
		<div id="task-page">
			<AddTaskForm 
				closePageDisable={closePageDisable}
				tasks={tasks as Array<TaskInterface>} 
				parentTaskSelect={parentTaskSelect}
				setParentTaskSelect={setParentTaskSelect}
				setAllowParentSelectChange={setAllowParentSelectChange}
				getTasks={getTasks}
				getTasksInOrder={getTasksInOrder}
				lists={lists}
			></AddTaskForm>
			<EditTaskForm
				closePageDisable={closePageDisable}
				tasks={tasks as Array<TaskInterface>}
				getTasks={getTasks}
				getTasksInOrder={getTasksInOrder}
				lists={lists}
				currentTask={currentTask}
			></EditTaskForm>
			<ManageListsWindow
				lists={lists}
				setLists={setLists}
				getLists={getLists}
				currentList={currentList}
				setCurrentList={setCurrentList}
				openLists={openLists}
				setOpenLists={setOpenLists}
			></ManageListsWindow>
			{/*<TaskNavBar pages={['all', 'progress']}/>*/}
			<div id='task-page-content'>
				<Routes>
					<Route path="/pinboard" element={<PageNotFound/>}/>
					<Route path="/all" element={
						<MainTaskPage 
							tasks={tasks as Array<TaskInterface>} 
							tasksMap={tasksMap} 
							closePageDisable={closePageDisable} 
							currentTask={currentTask}
							setCurrentTask={setCurrentTask}
							currentTaskDIV={currentTaskDIV}
							setCurrentTaskDIV={setCurrentTaskDIV}
							setParentTaskSelect={setParentTaskSelect}
							allowParentSelectChange={allowParentSelectChange}
							setAllowParentSelectChange={setAllowParentSelectChange}
							getTasks={getTasks}
							getTasksInOrder={getTasksInOrder}
							lists={lists}
							setLists={setLists}
							getLists={getLists}
							currentList={currentList}
							setCurrentList={setCurrentList}
							openLists={openLists}
							setOpenLists={setOpenLists}
							getWallet={getWallet}
							setClickToClose={setClickToClose}
						/>}/>
				</Routes>
				</div>
			</div>
	)
}

export default TaskPage