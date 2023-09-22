import {FunctionComponent} from 'react'
import "./TaskNavBar.css"
import {NavLink} from "react-router-dom"

interface TaskNavBarProps{
    pages: Array<string>
}

const TaskNavBar : FunctionComponent<TaskNavBarProps> = ({pages}) => {

    const getNavClass = (state: {isActive: boolean}) =>{
        return state.isActive ? "sub-nav-item sub-active-nav-item" : "sub-nav-item";
    }

    return (
        <div id='task-nav-bar'>
            {pages.map((page) => {
                return <NavLink className={getNavClass} to={page} key={page+"-navlink"} end>{page.toUpperCase()}</NavLink>
            })}
        </div>
    )
}

export default TaskNavBar