import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import NavSideBar from './components/NavSideBar/NavSideBar';
import TopBar from './components/TopBar/TopBar';
import {Routes, Route } from 'react-router-dom';
import TaskPage from './pages/TaskPage/TaskPage';
import PageNotFound from './pages/PageNotFound/PageNotFound';
import { ListInterface } from './interfaces/List';

function App() {
	const [wallet, setWallet] = useState(-1);
	const [lists, setLists] = useState<Array<ListInterface>>([]);

	const getWallet = useCallback(async () => {
        let response = await fetch("/wallet");
            response = await response.json();
            setWallet(response as unknown as number);
    }, [])


	const closePageDisable = () =>{
		document.getElementById("disabled-page-content")!.style.display = "none";
		document.getElementById("add-task-form")!.style.display = "none";
		document.getElementById("manage-lists-window")!.style.display = "none";
	}

	const getLists = useCallback(async () => {
        let response: any = await fetch("/lists");
            response = await response.json();
            var tempLists = []
            for(var i =0; i < response.length; i++){
                tempLists.push({id: response[i].id, name: response[i].name, isOpen: false});
            }
            setLists(tempLists);
    }, [])

	useEffect(() => {
        getWallet();
		getLists();
    }, [getWallet, getLists])

	return (
		<div className="app-page">
		<NavSideBar></NavSideBar>
		<TopBar 
			wallet={wallet}
		></TopBar>
		<div id='page-content' data-expanded="false">
			<Routes>
			<Route path="/tasks/*" element={<TaskPage 
				closePageDisable={closePageDisable}
				getWallet={getWallet}
				lists={lists}
				setLists={setLists}
				getLists={getLists}
			></TaskPage>}/>
			<Route path="*" element={<PageNotFound/>}/>
			</Routes>
		</div>
		<div id='disabled-page-content' data-expanded="false" onClick={closePageDisable}></div>
		</div>
	);
}

export default App;
