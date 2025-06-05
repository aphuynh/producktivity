import React, { ChangeEvent, FocusEventHandler, KeyboardEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import './CalendarPage.css';

import Config from "../../config.json";

import MonthSelector from './MonthSelector';

import useOutsideClick from '../../hooks/useOutsideClick';
import { CalendarInfoInterface } from '../../interfaces/CalendarInfo';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { EventChangeArg, EventInput, EventSourceFuncArg, EventSourceInput } from '@fullcalendar/core';
import rrulePlugin from '@fullcalendar/rrule'

import { EventInterface, EventTypeInterface } from '../../interfaces/Event';


const CalendarPage = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const calendarRef = useRef<FullCalendar | null>(null);
    
    const events = [
        [[], [], [], [], [], [], []],
        [[], [], ["Buy a Raccoon", "Eat Trash"], [], [], [], []],
        [[], [], [], [], [], [], []],
        [[], [], [], [], [], ["Finish Crochet Evan"], []],
        [["Project 1 ABCDDJNLSDFNAJLSKDFNJKSDAFNJSKDFNJKN", "Project 2", "Project 3", "Project 4", "Project 5", ], [], [], [], [], [], []],
        [[], [], [], [], [], [], []],
    ]
    const [calendarLayout, setCalendarLayout] = useState<number[][]>([]);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [yearInput, setYearInput] = useState(currentYear.toString());
    const [eventTypes, setEventTypes] = useState(new Map<number, EventTypeInterface>());

    const [showTaskOnCalendar, setShowTaskOnCalendar] = useState(false);

    const getCalendarInfo = (month: number, year: number) => {
        return {
            year: year,
            month: month,
            numDays: new Date(year, month+1, 0).getDate(),
            beginningWeekDay: new Date(year, month, 1).getDay()
        };
        
    }  
    const [calendarInfo, setCalendarInfo]  = useState(getCalendarInfo(currentMonth, currentYear));
    
    const openMonthSelector = () => {
        document.getElementById("month-selector")!.style.display = "flex";
    }

    const determineMonthDays = () => {
        const cInfo = getCalendarInfo(month, year);
        setCalendarInfo(cInfo);
        let currDate = 1;
        let calendarLayout: number[][] = [];
        const maxWeeks = 6;


        for(let i = 0; i < maxWeeks; i++){
            calendarLayout.push([])
            for(let j = 0; j < weekdays.length; j++){
                if((i == 0 && j < cInfo.beginningWeekDay) || currDate > cInfo.numDays){
                    calendarLayout[i].push(-1);
                }else{
                    calendarLayout[i].push(currDate);
                    currDate++;
                }
            }
        }
        setCalendarLayout(calendarLayout);

    }

    const getShowTasksCalendar = useCallback(async () => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/show_tasks_calendar");
            response = await response.json();
            setShowTaskOnCalendar(response as unknown as boolean);
    }, [])

    const getCalendarEventTypes = useCallback(async () => {
        let response = await fetch(Config.baseUrlProducktivityManager + "/calendar_event_types");
            response = await response.json();
            setEventTypes(formatEventTypes(response as unknown as EventTypeInterface[]))
    }, [])

    const getCalendarEvents = useCallback(async (
        fetchInfo: EventSourceFuncArg, 
        successCallback: (event_inputs: EventInput[])=>void, 
        failureCallback: (e: Error)=>void
	) => {

        console.log(eventTypes);
        let date_start = fetchInfo.start.getTime()
        let date_end = fetchInfo.end.getTime()

		let response = await fetch(Config.baseUrlProducktivityManager + "/calendar_events", {
            method: 'POST',
            body: JSON.stringify({
                date_start: date_start,
                date_end: date_end
			}),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
		});
		response = await response.json();
        let dbOutput = (response as unknown as EventInterface[]);
        console.log(dbOutput);
        successCallback(formatEvents(dbOutput))

	}, [])

    const formatEvents = (events: EventInterface[]) => {
        let formatted: EventInput[] = 
            events.map((event)=>(
                {
                    groupId: event.group_id ? event.group_id.toString() : undefined,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    rrule: JSON.parse(event.rrule),
                    textColor: eventTypes && (eventTypes.size > 0) ? eventTypes.get(event.event_type_id)!.color : undefined,
                    backgroundColor: eventTypes && (eventTypes.size > 0) ? eventTypes.get(event.event_type_id)!.backgroundColor : undefined,
                    extendedProps: {eventTypeId: event.event_type_id}
                }
            ))
        
        return formatted
    }

    const formatEventTypes = (eventTypes: EventTypeInterface[]) => {
        return new Map(eventTypes.map(obj => [obj.id, {id: obj.id, name: obj.name, color: obj.color, backgroundColor: obj.backgroundColor}]));
    }

    const eventDebug = () => {
        console.log(calendarRef.current?.getApi().getEvents());
    }

    const eventChange = (changeInfo: EventChangeArg) => {
        console.log(changeInfo);

    }

    const editEvent = useCallback( async (
        id: number,
        group_id: number,
        event_type_id: number,
        title: string,
        all_day: boolean,
        start: string,
        end: string,
        rrule: string,
        url: string,
        editable: boolean,
        extended_props: string
    ) => {

    }, [])
    
    useEffect(()=>{
        determineMonthDays();
    },  [year, month])

    useEffect(()=>{
        getShowTasksCalendar();
        getCalendarEventTypes();
    }, [])

    return (
        <div id="calendar-page">{true ? 
            <div id="calendar-wrapper">
            <FullCalendar
                themeSystem='bootstrap5'
                plugins={[interactionPlugin, dayGridPlugin, bootstrap5Plugin, rrulePlugin]}
                customButtons={{
                    addEvent: {
                        icon: "calendar-plus",
                        click: ()=>{}
                    },
                    debug: {
                        icon: "bug",
                        click: eventDebug
                    }
                }}
                initialView='dayGridMonth'
                selectable={true}
                editable={true}
                height={"100%"}
                headerToolbar={{
                    start: 'addEvent debug', // will normally be on the left. if RTL, will be on the right
                    center: 'title',
                    end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
                }}
                events={getCalendarEvents}
                ref={calendarRef}
                eventChange={eventChange}
            />
        </div>
            :
            <div id="calendar-wrapper">
                <div id="month-bar">
                    <div id="month-label-wrapper">
                        <div id="month-label" onClick={openMonthSelector}>{monthsFull[calendarInfo.month] + " " + calendarInfo.year}</div>
                        <MonthSelector
                            currentYear={currentYear}
                            yearInput={yearInput}
                            setYearInput={setYearInput}
                            year={year}
                            setYear={setYear}
                            month={month}
                            setMonth={setMonth}
                        ></MonthSelector>
                    </div>
                </div>
                <div id="week-labels">
                    {weekdays.map((day)=>(
                        <div id="weekday-label" key={day}>{day}</div>
                    ))}
                </div>
                <div id="calendar-grid-wrapper">
                    <div id="calendar-grid">
                        <div id="calendar-day-card" data-week="3" data-weekday="4" data-current-month="false">
                        </div>
                        {calendarLayout.map((w, wInd) => (
                            <>
                            {w.map((d, dInd) => (
                                <div 
                                    className="calendar-day-card"
                                    data-week={wInd + 1} 
                                    data-weekday={dInd + 1} 
                                    data-current-month={d == -1 ? "false" : "true"}
                                >
                                    {d == -1 ? "" : 
                                        <>
                                            <div className='calendar-day-card-number'>{d}</div>
                                            <div className='calendar-day-card-events-wrapper'>
                                                {events[wInd][dInd].map((e, ind) => (
                                                    <div className='calendar-day-card-event'>{e}</div>
                                                ))}
                                            </div>
                                        </>
                                    }
                                </div>
                            ))}
                            </>
                        ))}
                        
                    </div>
                </div>
            </div>
            }
        </div>
    )
}

export default CalendarPage