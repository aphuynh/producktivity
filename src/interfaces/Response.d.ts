export interface IJsonBackup
{
    Added : number;
    DEVCount : number;
    DS1Count : number;
    Events : IViewEvent[];
    Errors : string[];
    Rejected : number;
    Success : bool;
    Updated : number;
}