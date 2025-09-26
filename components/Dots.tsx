interface DotProps {
    count: number,
    context: 'trips' | 'countries' | 'days'
}
export const Dots = (props: DotProps) => {
    const activeCount = props?.count;
    let countToGenerate;
    switch (props?.context) {
        case 'countries':
            countToGenerate = 195;
            break;
        case 'days':
            countToGenerate = 183;
            break;
        case 'trips':
            countToGenerate = 200;
            break;
    }
    return (
        <div className="flex items-center w-1/2 flex-wrap gap-2">
            {
                Array
                    .from(Array(countToGenerate).keys())
                    .map(
                        (_, index: number) => {
                            return <div key={index} className={`h-3 w-3 ${index < activeCount ? 'bg-neutral-400' : 'bg-neutral-800'} rounded-full`}></div>
                        }
                    )
            }
            {
                activeCount > countToGenerate &&
                <p className="-m-1 ml-1 text-neutral-400"><em>and it goes on...</em></p>
            }
        </div>
    )
}