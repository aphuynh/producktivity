export interface EventInterface{
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
}

export interface EventTypeInterface{
    id: number,
    name: string,
    color: string,
    backgroundColor: string
}

export interface EventGroupInterface{
    id: number,
    name: string
}