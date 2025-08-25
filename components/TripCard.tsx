import { formatDate } from "@lib/utils";
import { ArrowUp } from "./icons/ArrowUp"

interface TripCardProps {
    name: string;
    destinationType: string;
    destination: string;
    startsOn: Date
    link: string;
}

export const TripCard = (props: TripCardProps) => {
    return (
        <a href={props?.link} className="group w-full p-3 flex flex-col justify-between border border-neutral-800 rounded-md hover:border-neutral-700 hover:cursor-pointer hover:border-yellow-500">
            <div className="flex justify-between items-center">
                <p>{props?.name}</p>
                <p className="text-neutral-500">{props?.destinationType}</p>
            </div>
            <div className="flex justify-between items-center mt-4 text-neutral-400">
                <div>
                    <p>Traveling to {props?.destination}</p>
                    <p>On {formatDate(props?.startsOn)}</p>
                </div>
                <ArrowUp classes="text-neutral-400 self-end group-hover:text-yellow-500" />
            </div>
        </a>
    )
}