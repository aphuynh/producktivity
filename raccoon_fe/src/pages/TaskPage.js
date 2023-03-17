import React, {useCallback, useEffect, useState} from 'react';
import "../style/TaskPage.css";

import TaskComponent from '../components/TaskComponent';
import StoreComponent from '../components/StoreComponent';
import InventoryComponent from '../components/InventoryComponent';

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
        let elem = document.getElementById("alert-message");

        elem.style.display = "flex";
        elem.classList.add(type);
        elem.innerHTML= message;
        elem.style.opacity = 1;
        
        setTimeout(function(){
            var fade = setInterval(function(){
                if(elem.style.opacity > 0){
                    elem.style.opacity -= .1
                }else{
                    elem.innerHTML = ""
                    elem.classList.remove(type)
                    elem.style.display = "none";
                    clearInterval(fade);
                }
            }, 50)
        }, 4000)
    }    

  return (
    <div className='task-page'>
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