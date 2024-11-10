import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'

import "./Alert.css"

interface DeleteAlertProps{
    message: string,
    confirmAction: (id: number) => void,
    idToRemove: number,
    setIdToRemove: Dispatch<SetStateAction<number>>,
    type: string
}

const DeleteAlert: FunctionComponent<DeleteAlertProps> = ({
    message, 
    confirmAction, 
    idToRemove, 
    setIdToRemove,
    type
}) => {

    const closeWindow = () => {
        document.getElementById("alert-blur-"+type)?.setAttribute("data-is-visible", "false");
        setIdToRemove(-1);
    }

    const handleConfirm = () => {
        confirmAction(idToRemove);
        closeWindow();
    }

    return (
        <div id={'alert-blur-'+type} className='alert-blur' data-is-visible="false">
            <div className='alert-window'>
                <div className='alert-message'>{message}</div>
                <div className='alert-actions'>
                    <div className='alert-cancel-button alert-buttons' onClick={closeWindow}>Cancel</div>
                    <div className='alert-confirm-button alert-buttons' onClick={handleConfirm}>Confirm</div>
                </div>
            </div>
        </div>
    )
}

export default DeleteAlert