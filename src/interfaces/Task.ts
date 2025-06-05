
export interface TaskInterface{
    id: number,
    name: string,
    description: string,
    is_completed: boolean,
    reward: number,
    priority: number,
    due_date: string,
    start_date: string,
    complete_date: string,
    type: string,
    subtasks: Array<TaskInterface>,
    lists: Array<number>,
    parent_id: number
}