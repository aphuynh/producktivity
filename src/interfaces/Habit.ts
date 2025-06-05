export interface HabitInterface{
    id: number,
    name: string,
    reward: number,
    times_completed: number,
    times_needed: number,
    img: string,
    frequency: string
}

export interface HabitFormProps{
    name: string,
    img: string,
    reward: number,
    times_completed: number,
    times_needed: number,
    frequency: string
}