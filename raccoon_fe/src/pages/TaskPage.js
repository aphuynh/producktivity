import React, {useCallback, useEffect, useState} from 'react';
import "../style/TaskPage.css";

import TaskComponent from '../components/TaskComponent';
import StoreComponent from '../components/StoreComponent';
import InventoryComponent from '../components/InventoryComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskPage = () => {
    const [raccoins, setRaccoins] = useState(0);
    const [inventoryItems, setInventoryItems] = useState([{}]);
    const [name, setName] = useState("");
    const [inventoryPage, setInventoryPage] = useState("all");

    const getInventory = useCallback(async () => {
        let response = await fetch("/inventory/" + inventoryPage);
            response = await response.json();
            setInventoryItems(response)
    }, [inventoryPage])

    const getWallet = useCallback(async () => {
        let response = await fetch("/wallet");
            response = await response.json();
            setRaccoins(parseInt(response))
    }, [])

    const getName = useCallback(async () => {
        let response = await fetch("/name");
            response = await response.json();
            setName(response)
    }, [])

    const updateWallet = useCallback(async (amount) => {
        let response = await fetch("/update_wallet/" + amount);
            response = await response.json();
            console.log(response);
    }, [])
    
    useEffect(() => {
        getName();
        getWallet();
        getInventory();
    }, [getName, getWallet, getInventory])


    const sendAlert = (message, type) =>{
        if(type === "good"){
            toast.success(message);
        }else if(type === "bad"){
            toast.error(message);
        }else{
            toast(message);
        }
    }    

  return (
    <div className='task-page'>
        <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        ></ToastContainer>
        <div className='user-info'>
            <div className='welcome-section'>Welcome back, {name}!</div>
            <div className='wallet'>Raccoins: {raccoins}</div>
        </div>
        <div className='content-wrapper'>
            <TaskComponent
                getWallet={getWallet}
                updateWallet={updateWallet}
                sendAlert={sendAlert}
                raccoins={raccoins}
            />
            <div className='store-inventory-section'>
                <StoreComponent
                    getWallet={getWallet}
                    updateWallet={updateWallet}
                    sendAlert={sendAlert}
                    raccoins={raccoins}
                    getInventory={getInventory}
                />
                <InventoryComponent
                    sendAlert = {sendAlert}
                    raccoins = {raccoins} 
                    getInventory = {getInventory} 
                    inventoryItems = {inventoryItems} 
                    setInventoryPage = {setInventoryPage}
                />
            </div>
        </div>
        
        <div id='alert-message'></div>
    </div>
  )
}

export default TaskPage