import React from 'react'
import "./NavSideBar.css"
import {NavLink, useLocation} from "react-router-dom"

const NavSideBar = () => {

  const { pathname } = useLocation();
    const getNavClass = (state: {isActive: boolean}) =>{
        return state.isActive ? "nav-item active-nav-item" : "nav-item";
    }

    const getNavClassTask = (state: {isActive: boolean}) =>{
        return state.isActive || ['/tasks/pinboard', '/tasks/all', '/tasks/progress'].includes(pathname) ? "nav-item active-nav-item" : "nav-item";
    }

	const getNavClassHabit = (state: {isActive: boolean}) =>{
        return state.isActive || ['/habits/daily', '/habits/weekly', '/habits/manage'].includes(pathname) ? "nav-item active-nav-item" : "nav-item";
    }

  return (
    <nav id='nav-side-bar' data-expanded="true">
		<div id='title-wrapper'>
			<div id='title-label'>Producktivity</div>
		</div>
		<div id='nav-sections-wrapper'>
			<div className='nav-section'>
				<div className='nav-section-label'>
					PAGES
				</div>
				{/*<NavLink className={getNavClass} to="/" end>Home</NavLink>*/}
				<NavLink className={getNavClass} to="/calendar" end>Calendar</NavLink>
				<NavLink className={getNavClassTask} to="/tasks/all" end>Tasks</NavLink>
				<NavLink className={getNavClass} to="/checklists" end>Checklists</NavLink>
				<NavLink className={getNavClassHabit} to="/habits/daily" end>Habits</NavLink>
				<NavLink className={getNavClass} to="/notes" end>Notes</NavLink>
				<NavLink className={getNavClass} to="/search" end>Search</NavLink>
			</div>

			<div className='nav-section'>
				<div className='nav-section-label'>
					REWARDS
				</div>
				<NavLink className={getNavClass} to="/inventory" end>Inventory</NavLink>
				<NavLink className={getNavClass} to="/store" end>Store</NavLink>
			</div>

			<div className='nav-section'>
				<div className='nav-section-label'>
					GENERAL
				</div>
				<NavLink className={getNavClass} to="/settings" end>Settings</NavLink>
			</div>
		</div>
    </nav>
  )
}

export default NavSideBar