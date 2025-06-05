import React, { ChangeEvent, Dispatch, FunctionComponent, KeyboardEvent, MouseEvent, SetStateAction, useEffect, useState } from 'react'

import './PageSelector.css'

import { ReactComponent as LeftArrow } from '../../../src/assets/leftarrow.svg';
import { ReactComponent as RightArrow } from '../../../src/assets/rightarrow.svg';


interface PageSelectorProps{
    page: number,
    setPage: Dispatch<SetStateAction<number>>,
    maxResults: number,
    maxResultsPerPage: number,
    setMaxResultsPerPage: Dispatch<SetStateAction<number>>
}

const PageSelector: FunctionComponent<PageSelectorProps> = ({
    page,
    setPage,
    maxResults,
    maxResultsPerPage,
    setMaxResultsPerPage
}) => {

    const [pageNumberInputValue, setPageNumberInputValue] = useState("");
    const [maxPages, setMaxPages] = useState(0);

    const handlePageNumberTextInput = (e: ChangeEvent<HTMLInputElement>) =>{
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            setPageNumberInputValue(e.target.value);
        }
    }

    const handlePageNumberInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if( e.key === "Enter"){
            const newPageNum = parseInt(pageNumberInputValue);
            if(newPageNum > 0 && newPageNum <= maxPages){
                setPage(newPageNum);
                setPageNumberInputValue("");
                e.currentTarget.blur();
            }
        }
    }

    const handleMaxResultsChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setMaxResultsPerPage(parseInt(e.target.value));
    }

    const changePage = (e: MouseEvent<HTMLElement>) => {
        const new_page = parseInt(e.currentTarget.getAttribute("data-page")!);
        const disabled = e.currentTarget.getAttribute("data-disabled");
        const lastPageButton = e.currentTarget.classList.contains("page-selector-last-page-number-button");

        if((disabled === "false" || lastPageButton) && page != new_page && 0 < new_page && new_page <= maxPages){
            setPage(new_page);
            setPageNumberInputValue("");
            // Clear input and blur
            let input = document.activeElement;
            if(input && input.classList.contains("page-selector-page-number-text-input")){
                (input as HTMLInputElement).blur();
            }
        }
    }

    useEffect(()=>{
        setPage(1);
        setMaxPages(Math.ceil(maxResults/maxResultsPerPage));
    }, [maxResults, maxResultsPerPage])

    return (
        <div className="page-selector">
            <div className='page-selector-max-page-results'>
                Results per page:
                <span>
                <select className="page-selector-results-count-select" onChange={handleMaxResultsChange}>
                    <option className="notes-page-results-count-select-option">10</option>
                    <option className="notes-page-results-count-select-option">25</option>
                    <option className="notes-page-results-count-select-option">50</option>
                </select>
                </span>
            </div>
            <div className='page-selector-arrow-button page-selector-back-button' data-page={page - 1} onClick={changePage} data-disabled={page > 1 ? "false": "true"}>
                <LeftArrow className='page-selector-arrow-icon'></LeftArrow>
                <span className='page-select-arrow-button-label'>Back</span>
            </div>
            <div className='page-selector-pages-section'>
                <div className='page-selector-page-number-button' data-page={page - 3} onClick={changePage} data-disabled={(page - 3 > 0) && page === maxPages ? "false" : "true"}>{page - 3}</div>
                <div className='page-selector-page-number-button' data-page={page - 2} onClick={changePage} data-disabled={page - 2 > 0 ? "false" : "true"}>{page - 2}</div>
                <div className='page-selector-page-number-button' data-page={page - 1} onClick={changePage} data-disabled={page - 1 > 0 ? "false" : "true"}>{page - 1}</div>
                <div className='page-selector-current-page-number' data-disabled={page !== maxPages ? "false" : "true"}>{page}</div>
                <div className='page-selector-page-number-button' data-page={page + 1} onClick={changePage} data-disabled={page + 1 < maxPages ? "false" : "true"}>{page + 1}</div>
                <div className='page-selector-page-number-button' data-page={page + 2} onClick={changePage} data-disabled={page + 2 < maxPages ? "false" : "true"}>{page + 2}</div>
                <input 
                    className='page-selector-page-number-text-input' 
                    type="text" 
                    value={pageNumberInputValue} 
                    placeholder='...'
                    data-disabled = {maxPages >= 5 ? "false": "true"}
                    onChange={handlePageNumberTextInput}
                    onKeyDown={handlePageNumberInputKeyPress}
                ></input>
                <div className='page-selector-page-number-button page-selector-last-page-number-button' data-page={maxPages} onClick={changePage} data-current-page={maxPages === page ? "true" : "false"}>{maxPages}</div>
            </div>
            <div className='page-selector-arrow-button page-selector-next-button' data-page={page + 1} onClick={changePage} data-disabled={page < maxPages ? "false": "true"}>
                <span className='page-select-arrow-button-label'>Next</span>
                <RightArrow className='page-selector-arrow-icon'></RightArrow>
            </div>
            <div className='page-selector-information'>
                Showing {((page - 1) * maxResultsPerPage) + 1} - {Math.min(page * maxResultsPerPage, maxResults)} of {maxResults}
            </div>
        </div>
    )
}

export default PageSelector