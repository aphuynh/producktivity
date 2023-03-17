import React, {useCallback, useEffect, useState} from 'react';
import { faArrowUpWideShort, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../style/StoreComponent.css";

const StoreComponent = ({getWallet, updateWallet, sendAlert, raccoins, getInventory}) => {

    const [storeItems, setStoreItems] = useState([{}]);

    const [selectedTab, setSelectedTab] = useState("");
    const [storePage, setStorePage] = useState("all");
    const [surpriseCost, setSurpriseCost] = useState(10);

    const selectStoreTab = (e) => {

        if(!e.target.classList.contains("selected-tab")){
            setStorePage(e.target.getAttribute('page'))
            let siblings = document.getElementById("shop-tabs").childNodes;
            for(var i = 0; i < siblings.length; i++){
                siblings[i].classList.remove("selected-tab");
            }
            setSelectedTab(e.target);
            e.target.classList.add("selected-tab");
        }
    }

    const getStore = useCallback(async () => {
        let response = await fetch("/store/" + storePage);
            response = await response.json();
            setStoreItems(response)
    }, [storePage])

    const refreshFeatured = useCallback(async () => {
        let response = await fetch("/refresh");
            response = await response.json();
            console.log(response)
    }, [])

    const purchaseItem = useCallback(async (id, cost) => {
        let response = await fetch("/purchase", {
            method: 'POST',
            body: JSON.stringify({task_id: id, cost: cost}),
            headers: {
            "Content-type": "application/json; charset=UTF-8"
            }
        });
            response = await response.json();
            if(response === "failed"){
                sendAlert("Unable to purchase item D:", "bad");
            }
    }, [sendAlert])

    const handlePurchaseItem = (e) =>{
        getWallet();
        let cost = parseInt(e.target.getAttribute("cost")) 
        if(cost <= raccoins){
            purchaseItem(e.target.getAttribute("storeitemid"), null);
            updateWallet(raccoins - cost);
            getStore();
            getInventory();
            getWallet();
        }else{
            sendAlert("Not enough raccoins! Complete more tasks to purchase a plushie :D", "bad");
        }
    }

    const buyRandom = () =>{
        let ind = Math.floor(Math.random() * storeItems.length)
        getWallet();
    
        if(surpriseCost <= raccoins){
            purchaseItem(storeItems[ind].id, surpriseCost);
            updateWallet(raccoins - surpriseCost);
            getStore();
            getInventory();
            getWallet();
            sendAlert("You purchased a " + storeItems[ind].name + " :D", "good");
        }else{
            sendAlert("Not enough raccoins! Complete more tasks to purchase a plushie :D", "bad");
        }
    }

    useEffect(() => {
        refreshFeatured();
        getStore();
        setSelectedTab(document.getElementById("all-shop-tab"))
    },[getStore, refreshFeatured])

    return (
        <div className='store-wrapper'>
            <div className='top-bar' id="shop-top-bar">
                <div className='store-label'>Shop ({storeItems.length})</div>
                <div className='shop-buttons'>
                    <div direction="up"><FontAwesomeIcon icon={faArrowUpWideShort} /></div>
                    <div isvisible="hidden"><FontAwesomeIcon icon={faFilter} /></div>
                </div>
            </div>
            <div className='tabs' id="shop-tabs">
                <div className='tab selected-tab' id="all-shop-tab" onClick={selectStoreTab} page='all'>All</div>
                <div className='tab' id="banner-shop-tab" onClick={selectStoreTab} page='featured'>Featured</div>
                <div className='tab' id="weekly-shop-tab" onClick={selectStoreTab} page='unowned'>Surprise</div>
                
            </div>
            <div className='store-item-list'>
                {storePage === "unowned" ? <div className='buy-surprise-plush-button' onClick={buyRandom}>Random Plush for 10 Raccoins</div> : ""}
                <div className='store-list-scroll-bar-wrapper'>
                    <div className='store-items-wrapper'>
                        {storeItems.map((item, ind)=>(
                            <div className='store-item-wrapper' key={"store-item-"+ind}>
                                <div className={'store-item' + ((item.stock <= 0) ? " unavailable" : "")}>
                                    <div className="store-item-name">{item.name}</div>
                                    <div className='store-item-img-wrapper'>
                                        <img src={item.img_src} className="store-item-image" alt={item.name}></img>
                                    </div>
                                    {storePage === "featured" ? <div className='item-button-wrapper'>
                                        <div className={"store-item-button" + ((item.stock <= 0) ? " disabled" : "")} onClick={handlePurchaseItem} storeitemid={item.id} cost={item.cost}>{item.cost} Raccoins</div>
                                    </div> : ""}                
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StoreComponent