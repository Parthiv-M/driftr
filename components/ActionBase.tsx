import { ArrowUp } from "./icons/ArrowUp"

interface ActionBaseProps {
    label: string;
    link: string;
}

export const ActionBase = (props: ActionBaseProps) => {
    return (
        <a
            href={props?.link}
            className="group h-32 w-32 rounded-lg bg-neutral-800 p-3 flex flex-col justify-between border border-transparent hover:text-yellow-500 hover:border hover:border-yellow-500"
        >
            <div>{/* Possibly add an icon here */}</div>
            <div className="grid grid-cols-2 items-end">
                <p className="text-sm">{props?.label}</p>
                <div className="ml-auto"><ArrowUp classes="text-neutral-200 group-hover:text-yellow-500" /></div>
            </div>
        </a>
    )
}