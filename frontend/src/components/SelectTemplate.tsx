import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { API_ROOT } from "../App";

interface SelectTemplateType {
  setTemplate: Dispatch<SetStateAction<string>>,
  template: string
}

export default function SelectTemplate({ setTemplate, template }: SelectTemplateType) {
  const [availableTemplates, setAvailableTemplates] = useState([]);
  useEffect(() => {
    fetch(API_ROOT + `/templates`).then(res => res.json()).then(data => setAvailableTemplates(data))
  }, [])

  useEffect(() => {
    if (!availableTemplates.length) return;
    setTemplate(availableTemplates[0])
  }, [availableTemplates])

  return <select onChange={(e) => setTemplate(e.target.value)}>

    {availableTemplates.map((value) =>
      <option key={value} selected={value == template}>{value}</option>
    )}
  </select>
}
