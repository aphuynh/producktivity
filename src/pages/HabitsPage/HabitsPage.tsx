import {Dispatch, FunctionComponent} from 'react'
import "./HabitsPage.css"

import {Routes, Route, useLocation} from "react-router-dom"
import HabitsNavBar from '../../components/HabitsNavBar/HabitsNavBar'
import DailyHabitsPage from './subHabitsPages/DailyHabitsPage/DailyHabitsPage'
import WeeklyHabitsPage from './subHabitsPages/WeeklyHabitsPage/WeeklyHabitsPage'
import ManageHabitsPage from './subHabitsPages/ManageHabitsPage/ManageHabitsPage'

export interface HabitsPageProps{
	getWallet: Dispatch<void>,
	updateWallet: Dispatch<number>,
	closePageDisable: Dispatch<void>
}

const HabitsPage: FunctionComponent<HabitsPageProps> = ({
  	getWallet,
	updateWallet,
	closePageDisable
}
) => {

	return (
		<div id='habits-page'>
			<HabitsNavBar pages={['daily', 'weekly', 'manage']}/>
			<div id='habits-page-content'>
				<Routes>
					<Route path="/daily" element={<DailyHabitsPage 
						getWallet={getWallet} 
						updateWallet={updateWallet}
					/>}/>
					<Route path="/weekly" element={<WeeklyHabitsPage
						getWallet={getWallet}
						updateWallet={updateWallet}
					/>}/>
					<Route path="/manage" element={<ManageHabitsPage/>}/>
				</Routes>

				
			</div>
		</div>
	)
}

export default HabitsPage