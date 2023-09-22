import { FunctionComponent } from "react";


export interface UndoProps{
    onUndo: () => void,
    closeToast: () => void
}

const Undo: FunctionComponent<UndoProps> = ({ onUndo, closeToast }) => {
    const handleClick = () => {
      onUndo();
      closeToast();
    };
  
    return (
      <div>
        <h3>
          Row Deleted <button onClick={handleClick}>UNDO</button>
        </h3>
      </div>
    );
  };

  export default Undo;