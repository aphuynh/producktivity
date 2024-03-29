import React from 'react'
import "./NavSideBar.css"
import { ReactComponent as MenuIcon } from '../../assets/menu.svg';
import {NavLink, useLocation} from "react-router-dom"

const NavSideBar = () => {

  const { pathname } = useLocation();
    const getNavClass = (state: {isActive: boolean}) =>{
        return state.isActive ? "nav-item active-nav-item" : "nav-item";
    }

    const getNavClassTask = (state: {isActive: boolean}) =>{
        return state.isActive || ['/tasks/pinboard', '/tasks/all', '/tasks/progress'].includes(pathname) ? "nav-item active-nav-item" : "nav-item";
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
				<NavLink className={getNavClass} to="/" end>Calendar</NavLink>
				<NavLink className={getNavClassTask} to="/tasks/all" end>Tasks</NavLink>
				<NavLink className={getNavClass} to="/checklist" end>Checklist</NavLink>
				<NavLink className={getNavClass} to="/habits" end>Habits</NavLink>
				<NavLink className={getNavClass} to="/store" end>Store</NavLink>
			</div>
			{/*
			<div className='nav-section'>
				<div className='nav-section-label'>
					SOCIAL
				</div>
				<NavLink className={getNavClass} to="/contacts" end>Contacts</NavLink>
				<NavLink className={getNavClass} to="/messages" end>Messages</NavLink>
			</div>*/}
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