import React, { ChangeEvent, Dispatch, FunctionComponent, MouseEvent, useCallback, useEffect, useState } from 'react'

import Config from "../../../../config.json"
import { HabitInterface } from '../../../../interfaces/Habit';
import WaterDrop from '../../../../assets/waterdrop.png';
import  { ReactComponent as AddIcon } from '../../../../assets/plus.svg';
import  { ReactComponent as PawIcon } from '../../../../assets/paw.svg';
import { ReactComponent as SearchIcon } from '../../../../../src/assets/search.svg';
import "./WeeklyHabitsPage.css"

export interface WeeklyHabitsPageProps{
	getWallet: Dispatch<void>,
    updateWallet: Dispatch<number>
}

const WeeklyHabitsPage: FunctionComponent<WeeklyHabitsPageProps> = ({
    getWallet,
    updateWallet
}) => {
    
    const [habits, setHabits] = useState<Array<HabitInterface>>([]);
    const [habitsMap, setHabitsMap] = useState<Map<number, HabitInterface>>(new Map());
    const [weeklyHabitsFilter, setWeeklyHabitsFilter] = useState("");

    const handleWeeklyHabitSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setWeeklyHabitsFilter(e.target.value.toLowerCase());
    }

    const getHabits = useCallback(async () => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/habits/weekly");
            response = await response.json();
            setHabits(response as Array<HabitInterface>);
    }, [])

    const complete_habit = useCallback(async (id: number) => {
        let response: any = await fetch(Config.baseUrlProducktivityManager + "/complete_habit/" + id);
            await response.json();
    }, [])

    const handleHabitUpdateButtonClick = useCallback(async(e: MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.disabled = true;
        let habit_id = parseInt(e.currentTarget.getAttribute("data-habit-id")!);
        let habit = habitsMap.get(habit_id)!;

        await complete_habit(habit_id);

        if(habit.times_needed === habit.times_completed + 1){
            updateWallet(habit.reward);
        }

        await getHabits();
        getWallet();
        let button = (document.getElementById("weekly-habit-complete-button-" + habit_id)! as HTMLButtonElement);

        button.disabled = false;
        
    }, [complete_habit, getHabits, getWallet, habitsMap, updateWallet])
    
    useEffect(()=>{
		setHabitsMap(new Map(habits.map((item => [item.id, item]))));
	}, [habits])

    useEffect(() => {
        getHabits();
        getWallet();
    }, [getHabits, getWallet])

    return (
        <>
        <div id="weekly-habits-page" className="sub-habits-page">
            <div id='weekly-habits-wrapper'>
                {habits.filter(x => x.name.toLowerCase().includes(weeklyHabitsFilter)).map((habit, ind) => (
                    <div 
                        className='weekly-habit-wrapper'
                        key={"weekly-habit-" + habit.id}
                        data-habit-id={habit.id}
                        data-habit-name={habit.name}
                    >
                        <div className="weekly-habit-reward">
                            {habit.reward}
                            <PawIcon className='weekly-habit-paw-icon'></PawIcon>
                        </div>
                        <div className="weekly-habit-circle-wrapper">
                            <div className='weekly-habit-background-circle' data-completed={habit.times_completed >= habit.times_needed ? "true": "false"}>
                                <img className="weekly-habit-image" alt="weekly-habit-icon" src={WaterDrop}></img>
                                <div className="weekly-habit-progress">{habit.times_completed}/{habit.times_needed}</div>
                            </div>
                            {habit.times_completed >= habit.times_needed ? "" :
                                <button id={"weekly-habit-complete-button-"+habit.id} className="weekly-habit-complete-button" data-habit-id={habit.id} onClick={handleHabitUpdateButtonClick}>
                                    <AddIcon className='weekly-habit-complete-icon'></AddIcon>
                                </button>
                            }
                        </div>
                        <div className="weekly-habit-name">{habit.name}</div>
                    </div> 
                ))}
            </div>
        </div>
        <div id='habits-bottom-bar'>
            <div id="habits-search-bar">
                <input type="text"id='habits-search-input' placeholder="Search..." onChange={handleWeeklyHabitSearch}></input>
                <SearchIcon id="habits-search-icon"></SearchIcon>
            </div>
        </div>
        </>
    )
}

export default WeeklyHabitsPage