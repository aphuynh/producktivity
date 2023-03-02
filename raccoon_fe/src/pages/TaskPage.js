import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import "../style/TaskPage.css";

const TaskPage = () => {
  
    const [data, setData] = useState([{}]);
    const [raccoins, setRaccoins] = useState(0);
    const [storeItems, setStoreItems] = useState([{}]);
    const [inventoryItems, setInventoryItems] = useState([{}]);
    const [name, setName] = useState("");
    const [highlightedTask, setHighlightedTask] = useState("");
    const {register, getValues, handleSubmit, reset} = useForm();
    

    const getTasks = useCallback(async () => {
        let response = await fetch("/tasks");
            response = await response.json();
            setData(response)
    }, [])

    const getStore = useCallback(async () => {
        let response = await fetch("/store");
            response = await response.json();
            setStoreItems(response)
    }, [])

    const getInventory = useCallback(async () => {
        let response = await fetch("/inventory");
            response = await response.json();
            setInventoryItems(response)
    }, [])

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

    const completeTask = useCallback(async (id) => {
        let response = await fetch("/complete/" + id);
            response = await response.json();
            if(response === "failed"){
                sendAlert("There was an error completing your task :(", "bad");
            }else{
                sendAlert("Yay, you finished a task! :D", "good")
            }
    }, [])

    const removeTask = useCallback(async (id) => {
        let response = await fetch("/remove/" + id);
            response = await response.json();
            if(response === "failed"){
                sendAlert("There was an error removing your task.", "bad");
            }else{
                sendAlert("Task removed!", "good")
            }
    }, [])

    const addTask = useCallback(async (task) => {
        let response = await fetch("/add", {
            method: 'POST',
            body: JSON.stringify({name: task, reward: 5}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            if(response === "failed"){
                sendAlert("Unable to add task D:", "bad");
            }else{
                sendAlert("Task added!", "good")
            }
    }, [])

    const purchaseItem = useCallback(async (id) => {
        let response = await fetch("/purchase/" + id);
            response = await response.json();
            if(response === "failed"){
                sendAlert("Purchase unsuccessful :(", "bad");
            }else{
                sendAlert("Yay, you purchased a plushie! :D", "good")
            }
    }, [])
    
    useEffect(() => {
        getTasks();
        getName();
        getWallet();
        getStore();
        getInventory();
    }, [getTasks, getName, getWallet, getStore, getInventory])

    const selectTask = (e) =>{
        if(e.target.classList.contains("selected")){
            e.target.classList.remove("selected")
            setHighlightedTask("")
        }else{
            if(highlightedTask){
            highlightedTask.classList.remove("selected")
            }        
            setHighlightedTask(e.target)
            e.target.classList.add("selected")
        }
    }

    const handleCompleteTask = () =>{
        if(!highlightedTask){
            sendAlert("No task selected", "bad"); 
        }else if(highlightedTask.classList.contains("completed")){
            sendAlert("Task already completed", "bad");
        }else{
            completeTask(highlightedTask.getAttribute("taskid"))
            updateWallet(raccoins + parseInt(highlightedTask.getAttribute("reward")))
            getTasks();
            getWallet();
        }
    }

    const handleRemoveTask = () =>{
        if(!highlightedTask){
            sendAlert("No task selected", "bad"); 
        }else{
            removeTask(highlightedTask.getAttribute("taskid"));
            getTasks();
        }
    }

    const handleAddTask = () =>{
        const task = getValues("task");
        if(task){
            addTask(task);
            getTasks();
        }
        reset();
    }

    const handlePurchaseItem = (e) =>{
        if(e.target.getAttribute("cost") <= raccoins){
            purchaseItem(e.target.getAttribute("storeitemid"));
            updateWallet(raccoins - parseInt(e.target.getAttribute("cost")));
            getStore();
            getInventory();
            setRaccoins(raccoins - parseInt(e.target.getAttribute("cost")));
        }else{
            sendAlert("Not enough raccoins! Complete more tasks to purchase a plushie :D", "bad");
        }
    }

    const convertDate = (date) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        let d = new Date(date)
        let h = d.getHours()
        let m = d.getMinutes()
        let t = ((h > 12) ? (h - 12) : h) + ":" + ((m < 10) ? "0" : "") + m  + ((h > 12) ? "PM" : "AM")

        const dateString = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " at " + t
        return dateString
    }

    const sendAlert = (message, type) =>{
        let elem = document.getElementById("alert-message");
        console.log(elem);
        elem.style.display = "flex";
        elem.classList.add(type);
        elem.innerHTML= message;
        elem.style.opacity = 1;
        
        setTimeout(function(){
            var fade = setInterval(function(){
                if(elem.style.opacity > 0){
                    elem.style.opacity -= .1
                    console.log(elem.style.opacity)
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
        <div className='task-info'>
            <div className='task-list-label'>To Do List</div>
            <div className='task-list'>
            {data.map((item, ind) => (
                <div className={'task' + (item.is_completed ? " completed": "")} taskid={item.id} reward={item.reward} key={"task" + ind} onClick={selectTask}>
                    {(ind + 1) + ". " + item.name}
                </div>))}
            </div>
            <button className="complete-task-button" onClick={handleCompleteTask}>
                Complete Selected Task
            </button>
            <button className="remove-task-button" onClick={handleRemoveTask}>
                Delete Selected Task
            </button>
            <form className='add-task-section'>
            <input {...register("task")} type={"task"} placeholder="Type task here..." className='add-task-input'/>
            <button onClick={handleSubmit(handleAddTask)} className='add-task-button'> Add Task </button>
            </form>
        </div>
        <div className='store'>
            <div className='store-label'>Store</div>
            <div className='store-item-list'>
                {storeItems.map((item, ind)=>(
                <div className={'store-item' + ((item.stock <= 0) ? " unavailable" : "")} key={"store-item-"+ind}>
                    <div className="store-item-name">{item.name}</div>
                    <div className='store-item-img-wrapper'>
                        <img src={item.img_src} className="store-item-image" alt={item.name}></img>
                    </div>
                    <div className='item-button-wrapper'>
                        <div className={"store-item-button" + ((item.stock <= 0) ? " disabled" : "")} onClick={handlePurchaseItem} storeitemid={item.id} cost={item.cost}>{item.cost} Raccoins</div>
                    </div>                
                </div>
                ))}
            </div>
            <div className='inventory-label'>My Plushies</div>
            <div className="inventory">
                {inventoryItems.map((item, ind)=>(
                    <div className='inventory-item' key={"inventory-item-"+ind}>
                        <div className='inventory-img-wrapper'>
                            <img src={item.img_src} className="inventory-item-image" alt={item.name}></img>
                            {item.name}
                            <div className='inventory-item-desc'>
                                Purchased on {convertDate(item.date_purchased)} for {item.cost} Raccoins
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div id='alert-message'></div>
    </div>
  )
}

export default TaskPage