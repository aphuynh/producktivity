import {FunctionComponent, Dispatch, SetStateAction, MouseEvent, ChangeEvent, useEffect, useMemo} from 'react'
import "./Task.css"
import {TaskInterface} from '../../interfaces/Task.js'
import { ReactComponent as CarrotIcon } from '../../assets/carrot.svg';
import { ReactComponent as PawIcon } from '../../assets/paw.svg';
import { timeLeft, isLate } from '../../utils/parseTime.tsx';
import { ListInterface } from '../../interfaces/List.ts';

export interface TaskProps{
    taskInfo: TaskInterface,
	tasksMap: Map<String, TaskInterface>,
    level: number,

	currentTask: TaskInterface | null,
	setCurrentTask: Dispatch<SetStateAction<TaskInterface|null>>,

	currentTaskDIV: HTMLElement | null,
	setCurrentTaskDIV: Dispatch<SetStateAction<HTMLElement|null>>,
	listTaskMap: Map<number, number[]>,
	currentList: string | ListInterface,
	type: string,
	currentTaskFilter: string
}

const Task: FunctionComponent<TaskProps> = ({	
	taskInfo,
	tasksMap, 
	level, 
	currentTask, 
	setCurrentTask, 
	currentTaskDIV, 
	setCurrentTaskDIV,
	listTaskMap,
	currentList,
	type,
	currentTaskFilter
}) => {

	const toggleChildren = (e: MouseEvent<HTMLElement>) =>{

		let children = document.getElementById("task-bar-children-" + e.currentTarget.getAttribute("data-id"));
		let svg = e.currentTarget.childNodes[0] as HTMLElement;
		let display = ""
	
		if(e.currentTarget.getAttribute('data-expanded') === "true"){
			e.currentTarget.setAttribute('data-expanded', "false");
			svg.style.transform = "rotate(0deg)";
			display = "none";
		}else{
			e.currentTarget.setAttribute('data-expanded', "true");
			svg.style.transform = "rotate(180deg)";
			display = "block";
		}

		if(children){
			children.style.display = display;
		}
	}

	const highlightTask = (e: MouseEvent<HTMLInputElement>) => {
		let target = e.target as HTMLInputElement;
		if(target.classList[0] !== "expand-div" && target.nodeName !== "svg" && target.nodeName !== "path"){
			let taskId = e.currentTarget.getAttribute('data-id')!;
			let task = tasksMap.get(taskId!);

			if(e.currentTarget.getAttribute('data-selected') === "true"){
				currentTaskDIV?.setAttribute('data-selected', 'false');
				setCurrentTask(null)
				setCurrentTaskDIV(null)
			}else{
				if(currentTaskDIV){
					currentTaskDIV?.setAttribute('data-selected', 'false');
				}
				setCurrentTask(task!);
				setCurrentTaskDIV(e.currentTarget);
				e.currentTarget.setAttribute('data-selected', "true");
			}
		}
	}


	return (
		<>
			<div className='task-bar-wrapper' data-type={type}>
				{(typeof currentList === 'string' || taskInfo.lists.includes(currentList.id)) && (currentTaskFilter === "all" || (currentTaskFilter === "in-progress" && !taskInfo.is_completed) || (currentTaskFilter === "complete" && taskInfo.is_completed))?
					<div className='task-bar' id={"task-bar-"+taskInfo.id} data-id={taskInfo.id} data-selected="false" onClick={highlightTask}>
						<div className='left-task-bar'>
							{Object.keys(taskInfo).length > 0 && taskInfo.subtasks.length > 0 ?
							<div className='expand-div' data-expanded="false" onClick={toggleChildren} data-id={taskInfo.id}><CarrotIcon className="carrot-icon"></CarrotIcon></div>
							: <div className='expand-div-empty'></div>}
							<div className='indents'>
								{Array.from({ length: level }).map((i, index) => <div className='indent' key={taskInfo.id+'indent'+index}/>)}
							</div>
							<div className='label'>{taskInfo.name}</div>
						</div>
						<div className='right-task-bar'>
							<div className='task-progress' data-is-complete={taskInfo.is_completed ? true : false}>{taskInfo.is_completed ? 'Complete' : <><PawIcon className='task-bar-paw-icon'></PawIcon>{taskInfo.reward}</> }</div>
							<div className='task-due-date' data-is-late={isLate(taskInfo.due_date)}>{taskInfo.is_completed || !taskInfo.due_date ? "" : timeLeft(taskInfo.due_date)}</div>
						</div>
					</div>
				: ""}
				{Object.keys(taskInfo).length > 0 && taskInfo.subtasks.length > 0 ?
					<div className='task-bar-children' id={"task-bar-children-"+taskInfo.id} style={{display: taskInfo.is_completed ? "block" : "none"}}>
					{taskInfo.subtasks.map((child, ind)=>(
						<Task 
							type="subtask"
							key={"subtask" + taskInfo.id + "-" +ind}
							taskInfo={child}
							tasksMap={tasksMap} 
							level={level + 1}
							currentTask={currentTask}
							setCurrentTask={setCurrentTask}
							currentTaskDIV={currentTaskDIV}
							setCurrentTaskDIV={setCurrentTaskDIV}
							listTaskMap={listTaskMap}
							currentList={currentList}
							currentTaskFilter={currentTaskFilter}
							></Task>
					))}
					</div> : ""}
			</div>
		</>
	)
}

export default Task