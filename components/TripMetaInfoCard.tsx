import { ArrowUp } from "./icons/ArrowUp"

interface TripMetaProps {
    dataInSpan: string;
    dataBeforeSpan?: string;
    dataAfterSpan?: string;
}

export const TripMetaInfoCard = (props: TripMetaProps) => {
    return (
        <div className="bg-neutral-900 rounded-lg h-32 w-32 p-3 flex flex-col justify-between">
            <p><ArrowUp /></p>
            <p className="text-right uppercase">{props?.dataBeforeSpan} <span className="text-xl">{props?.dataInSpan}</span> {props?.dataAfterSpan}</p>
        </div>
    )
}