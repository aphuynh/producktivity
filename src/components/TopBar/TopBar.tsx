import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import Config from "../../config.json"
import "./TopBar.css"

import { ReactComponent as PawIcon } from '../../assets/paw.svg';
import { ReactComponent as UserIcon } from '../../assets/user.svg';

interface TopBarProps{
    wallet: number,
}

const TopBar: FunctionComponent<TopBarProps> = ({ 
    wallet
}) => {

    const [username, setUsername] = useState("");

    const getUsername = useCallback(async () => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/username");
            response = await response.json();
            setUsername(response as unknown as string);
    }, [])

    useEffect(() => {
        getUsername();
    }, [getUsername])

    return (
        <div id='top-bar' data-expanded="false">
            <div id='wallet'>
                <PawIcon id="top-bar-paw-icon"></PawIcon>
                {wallet}
            </div>
            <div id='name-section'>
                <UserIcon id="top-bar-user-icon"></UserIcon>
                {username}
                {/*<CarrotIcon id="top-bar-carrot-icon"></CarrotIcon>*/}
            </div>
        </div>
    )
}

export default TopBar