import React from 'react';
import { faArrowUpWideShort, faFilter } from "@fortawesome/free-solid-svg-icons";
//import { faStar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../style/InventoryComponent.css";

const InventoryComponent = ({inventoryItems, setInventoryPage}) => {


    const selectInventoryTab = (e) => {

        if(!e.target.classList.contains("selected-tab")){
            let siblings = document.getElementById("inventory-tabs").childNodes;
            for(var i = 0; i < siblings.length; i++){
                siblings[i].classList.remove("selected-tab");
            }
            e.target.classList.add("selected-tab");
        }
        let page = "";
        if(e.target.id === "favorite-inventory-tab"){
            page = "favorites";
        }else{
            page = "all";
        }
        setInventoryPage(page);
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

    return (
        <div className='inventory-wrapper'>
            <div className='top-bar' id="inventory-top-bar">
                    <div className='inventory-label'>Inventory ({inventoryItems.length})</div>
                    <div className='inventory-buttons'>
                        <div direction="up"><FontAwesomeIcon icon={faArrowUpWideShort} /></div>
                        <div isvisible="hidden"><FontAwesomeIcon icon={faFilter} /></div>
                    </div>
                </div>
                <div className='tabs' id="inventory-tabs">
                    <div className='tab selected-tab' id='all-inventory-tab' onClick={selectInventoryTab}>All</div>
                    <div className='tab' id="favorite-inventory-tab" onClick={selectInventoryTab}>Favorites</div>
                </div>
                <div className="inventory">
                    <div className='inventory-scroll-bar-wrapper'>
                        <div className='inventory-items-wrapper'>
                            {inventoryItems.map((item, ind)=>(
                                <div className='inventory-item-wrapper' key={"inventory-item-"+ind}>
                                    <div className='inventory-item' key={"inventory-item-"+ind}>
                                            <div className='inventory-item-name'>{item.name}</div>
                                            <div className='inventory-img-wrapper'>
                                                <img src={item.img_src} className="inventory-item-image" alt={item.name}></img>
                                                <div className='inventory-item-desc'>
                                                    Purchased on {convertDate(item.date_purchased)} for {item.cost} Raccoins
                                                </div>
                                            </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default InventoryComponent