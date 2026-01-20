'use client'
import { useState } from "react"

export default function Filters() {
  const [filters, setFilters] = useState<string[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  
  const addFilter = () => {
    if (!inputValue.trim()) return;

    if(filters.includes(inputValue)) return;

    setFilters([...filters, inputValue]);
    setInputValue('');
  }


  //TODO: Remove filters
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  }



  return (
    <aside className="filters h-[85vh] flex flex-col max-w-sm bg-white rounded-lg p-5">
      <h2 className="">Filters</h2>
      
      <div className="filters-list-wrapper flex flex-col justify-between h-full">
        <div className="filters-list flex flex-col">
          {filters.map((filter, index) => (
            <div key={index} className="filter-item-container group flex flex-row justify-between 
              items-center mb-2">

              <label className="flex items-center gap-3 cursor-pointer relative ">
                  <input 
                    type="checkbox" 
                    value={filter}
                    className="peer sr-only"
                  />

                  <div className="
                    w-5 h-5 border-2 rounded 
                    border-none bg-[#4b4276]
                    flex items-center justify-center
                    transition-all duration-200 ease-in-out
                    peer-hover:bg-[#5f5789]
                    peer-checked:bg-[#4b4276]
                    peer-checked:[&>svg]:opacity-100">

                    <svg 
                      className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100
                        transition-opacity duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="3">
                      
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>

                  <span className="font-victor text-[#878585] text-2xl select-none">
                    {filter}
                  </span>
              </label>

              <div className="remove-filter-icon mr-5 cursor-pointer opacity-0 
              group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => removeFilter(index)}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="3" 
                  stroke="gray" 
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </div>
            </div>
          ))} 
        </div>
        
        <div>
          <input className="border-2 border-[#878585] text-lg rounded w-full pl-1 font-victor" 
            type="text" placeholder="Filter name" value={inputValue} 
            onChange={(e)=> setInputValue(e.target.value)}/>
          <button className="add-filters-button cursor-pointer w-full p-1  underline-offset-2
            text-white font-victor mt-3 text-lg rounded transition-all duration-300
            hover:shadow-md bg-[#4b4276] hover:bg-[#564f7a] "
            onClick={addFilter}>Add filter</button>
        </div>
      </div>
    </aside>  
  )
}