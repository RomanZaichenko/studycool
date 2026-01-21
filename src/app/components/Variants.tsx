
interface VariantsProps {
  isDisplayed: boolean;
  addArea: ({id, title}: {id: number, title: string}) => void;
}


export default function Variants({isDisplayed, addArea}: VariantsProps) {
  const display = isDisplayed ? "block" : "hidden";
  
  return (
    <div className={`variants-to-choose ${display}`} onMouseDown={e => e.preventDefault()}>
      <div className="map-choice">
        <h4>Map</h4>
      </div>

      <div className="area-choice none" onClick={add => addArea({id: 3, title: "New Area"})}>
        <h4>Project</h4>
      </div>
    </div>
  )
}