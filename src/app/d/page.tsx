"use client"

import { ActionBase } from "@components/ActionBase";
import { ActionBaseType } from "@lib/types";
import { ActionBaseItemSets } from "@lib/utils";

export default function Dashboard() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div>
                {
                    ActionBaseItemSets.map((actionBaseItemSet: ActionBaseType[], index) => {
                        return (
                            <div key={index} className="flex items-center gap-3 mb-3">
                                {actionBaseItemSet.map((item: ActionBaseType, index) => <ActionBase key={item.label + "-" + index} label={item.label} link={item.link} />)}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}