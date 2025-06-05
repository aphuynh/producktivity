import React, { ChangeEvent, Dispatch, FunctionComponent, KeyboardEvent, MouseEvent, SetStateAction, useRef } from 'react'


import { ReactComponent as LeftArrowIcon } from '../../../src/assets/leftarrow.svg';
import { ReactComponent as RightArrowIcon } from '../../../src/assets/rightarrow.svg';

import Config from "../../config.json";
import useOutsideClick from '../../hooks/useOutsideClick';


export interface MonthSelectorProps{
    currentYear: number,
    yearInput: string,
    setYearInput: Dispatch<SetStateAction<string>>,
    year: number,
    setYear: Dispatch<SetStateAction<number>>,
    month: number,
    setMonth: Dispatch<SetStateAction<number>>,
}

const MonthSelector: FunctionComponent<MonthSelectorProps> = ({
    currentYear,
    yearInput,
    setYearInput,
    year,
    setYear,
    month,
    setMonth
}) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthSelectorRef = useRef<HTMLDivElement | null>(null);

    const closeMonthSelector = () =>{
        document.getElementById("month-selector")!.style.display = "none";
    }

    useOutsideClick(monthSelectorRef, closeMonthSelector);

    const checkValidYear = (year: number|string) => {
        if(typeof(year) == "string"){
            const re = new RegExp("^\d+$");
            return !re.test(year);
        }else if(typeof(year) == "number"){
            return Number.isInteger(year) && year >= 0;
        }
        return false;
    }

    const checkYearWithinRange = (year: number) => {
        return Math.abs(year - currentYear) <= Config.validYearRange;
    }

    const handleYearInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newYear = e.currentTarget.value;
        console.log(newYear)
        if(checkValidYear(newYear)){
            setYearInput(newYear);
        }
    }

    const handleYearInputEnter = (e: KeyboardEvent<HTMLInputElement>) => {
        if(e.key == 'Enter' && checkValidYear(yearInput) && checkYearWithinRange(parseInt(yearInput))){
            e.preventDefault();
            setYear(parseInt(yearInput));
        }
    }

    const handleYearInputBlur = (e: ChangeEvent<HTMLInputElement>) => {
        if(checkValidYear(yearInput) && checkYearWithinRange(parseInt(yearInput))){
            setYear(parseInt(yearInput));
        }else{
            setYearInput(year.toString());
        }
    }

    const handleMonthOptionClick = (e: MouseEvent<HTMLElement>) => {
        const monthInd = e.currentTarget.getAttribute("data-month");
        if(monthInd){
            setMonth(parseInt(monthInd));
        }
    }

    const incrementYear = (amount: number) =>{
        if(Number.isInteger(amount) && checkYearWithinRange(year + amount)){
            setYear(year + amount);
        }
    }
    
    return (
        <div id="month-selector" ref={monthSelectorRef}>
            <div id="year-selector">
                <LeftArrowIcon 
                    id="year-option-left" 
                    className='year-option-arrow' 
                    onClick={()=>{incrementYear(-1)}}
                    data-disabled={year <= currentYear - Config.validYearRange ? "true" : "false"}
                ></LeftArrowIcon>
                <input 
                    id="year-option" 
                    type="number" 
                    value={yearInput}
                    onKeyDown={handleYearInputEnter}
                    onChange={handleYearInputChange}
                    onBlur={handleYearInputBlur}
                ></input>
                <RightArrowIcon 
                    id="year-option-left" 
                    className='year-option-arrow' 
                    onClick={()=>{incrementYear(1)}} 
                    data-disabled={year >= currentYear + Config.validYearRange ? "true" : "false"}
                ></RightArrowIcon>
            </div>
            <div id="months-wrapper">
                {months.map((month_name, ind) => (
                    <div id="month-option" 
                        key={month_name} 
                        data-month={ind} 
                        data-selected={month == ind ? "true" : "false"}
                        onClick={handleMonthOptionClick}
                    >
                        {month_name}
                    </div>
                ))}
            </div>

        </div>
    )
}

export default MonthSelector