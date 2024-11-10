import {FunctionComponent} from 'react'
import "./HabitsNavBar.css"
import {NavLink} from "react-router-dom"

interface HabitsNavBarProps{
    pages: Array<string>
}

const HabitsNavBar : FunctionComponent<HabitsNavBarProps> = ({pages}) => {

    const getNavClass = (state: {isActive: boolean}) =>{
        return state.isActive ? "sub-habits-nav-item sub-habits-active-nav-item" : "sub-habits-nav-item";
    }

    return (
        <div id='habits-nav-bar'>
            {pages.map((page) => {
                return <NavLink className={getNavClass} to={page} key={page+"-navlink"} end>{page.toUpperCase()}</NavLink>
            })}
        </div>
    )
}

export default HabitsNavBar