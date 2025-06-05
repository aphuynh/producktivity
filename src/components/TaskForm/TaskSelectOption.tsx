import React, { FunctionComponent } from 'react'
import { TaskInterface } from '../../interfaces/Task'

export interface TaskProps{
    taskInfo: TaskInterface,
    level: number
}

const TaskSelectOption: FunctionComponent<TaskProps> = ({taskInfo, level}) => {
    
    const returnSpaces = (level: number) =>{
        let indent = "";
        for(let i = 0; i < level * 3; i++){
            indent += "\u00A0";
        }

        return indent;
    }

    return (
        <>
            <option value={taskInfo.id + ""} className='task-select-option' title={'Task ID: ' + taskInfo.id}>
                {returnSpaces(level)}
                {taskInfo.name}
            </option>
            {Object.keys(taskInfo).length > 0 && taskInfo.subtasks.length > 0 ?
            <>
            {taskInfo.subtasks.map((child, ind)=>(
                <TaskSelectOption 
                    key={"subtask-option-" + taskInfo.id + "-" +ind}
                    taskInfo={child}
                    level={level + 1}
                ></TaskSelectOption>
            ))}
            </> : ""}
        </>
    )
}

export default TaskSelectOption