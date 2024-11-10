import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'

import "./Alert.css"

interface UnsavedChangesAlertProps{
    message: string,
    confirmAction: (old_id: number|null, new_id: number|null) => void,
    params: [number|null, number|null],
    setAlertParams: Dispatch<SetStateAction<[number|null, number|null]>>,
    setChangesDiscarded: Dispatch<SetStateAction<boolean>>,
    type: string
}

const UnsavedChangesAlert: FunctionComponent<UnsavedChangesAlertProps> = ({
    message, 
    confirmAction,
    params,
    setAlertParams,
    setChangesDiscarded,
    type
}) => {

    const closeWindow = () => {
        document.getElementById("alert-blur-"+type)?.setAttribute("data-is-visible", "false");
        setAlertParams([null, -1]);
    }

    const handleConfirm = () => {
        confirmAction(params[0], params[1]);
        setChangesDiscarded(true);
        closeWindow();
    }

    return (
        <div id={'alert-blur-'+type} className='alert-blur' data-is-visible="false">
            <div className='alert-window'>
                <div className='alert-message'>{message}</div>
                <div className='alert-actions'>
                    <div className='alert-cancel-button alert-buttons' onClick={closeWindow}>Cancel</div>
                    <div className='alert-confirm-button alert-buttons' onClick={handleConfirm}>Discard</div>
                </div>
            </div>
        </div>
    )
}

export default UnsavedChangesAlert