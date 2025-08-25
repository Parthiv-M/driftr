/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCreateTrip } from "@hooks/useCreateTrip";
import { DestinationType, TravelMode } from "@prisma/client";
import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from "@geoapify/react-geocoder-autocomplete";

export default function CreateTrip() {
    const {
        loading, error,
        tags,
        linkTree,
        linkErrors,
        currentTag,
        dateError,
        isDisabled,
        validators,
        handlers
    } = useCreateTrip();

    return (
        <div className="w-1/2 mx-auto mt-32">
            <h2 className="text-lg">Create Trip</h2>
            <code className="text-sm text-neutral-500">Put everything in one place.</code>
            {error && <p className="text-yellow-400">
                {error.message.toLowerCase().includes('validation')
                    ? 'There was a problem with your submission. Please check the form and try again.'
                    : 'An unexpected error occurred on our end. Please try again later.'}
            </p>}
            <form className="mt-8">
                <div className="mb-2 flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center bg-neutral-800 text-yellow-100 text-sm font-medium px-2.5 py-0.5 rounded">
                            #{tag}
                            <button type="button" onClick={() => handlers.handleRemoveTag(tag)} className="ml-2 text-neutral-200">&times;</button>
                        </span>
                    ))}
                </div>
                <input required onChange={(e) => handlers.setTripName(e.target.value)} placeholder="Trip name" className="w-full border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm" />
                <div className="my-3">
                    <div className="flex gap-3">
                        <input onChange={(e) => handlers.handleDateChange(e.target.value, "start")} required placeholder="Starts on (MM/DD/YYYY)" className="w-full border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm" />
                        <input onChange={(e) => handlers.handleDateChange(e.target.value, "end")} required placeholder="Ends on (MM/DD/YYYY)" className="w-full border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm" />
                    </div>
                    {dateError?.message && <p className="text-sm mt-1 text-yellow-400">{dateError.message}</p>}
                </div>
                <GeoapifyContext apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}>
                    <GeoapifyGeocoderAutocomplete
                        placeholder="Destination"
                        type="city"
                        placeSelect={handlers.handleDestinationSelect}
                    />
                </GeoapifyContext>
                <div className="flex my-3 gap-3">
                    <select
                        required
                        defaultValue={"choose"}
                        name="travelMode"
                        onChange={(e) => handlers.setTravelMode(e.target.value)}
                        className="w-full border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm"
                    >
                        <option value="choose" disabled>Choose travel mode</option>
                        <option value={TravelMode.PLANE}>Plane</option>
                        <option value={TravelMode.CAR}>Car</option>
                        <option value={TravelMode.TRAIN}>Train</option>
                        <option value={TravelMode.BOAT}>Boat</option>
                        <option value={TravelMode.BUS}>Bus</option>
                        <option value={TravelMode.OTHER}>Other</option>
                    </select>
                    <select
                        required
                        defaultValue={"choose"}
                        name="destinationType"
                        onChange={(e) => handlers.setDestinationType(e.target.value)}
                        className="w-full border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm"
                    >
                        <option value="choose" disabled>Choose destination type</option>
                        <option value={DestinationType.ADVENTURE}>Adventure</option>
                        <option value={DestinationType.BEACH}>Beach</option>
                        <option value={DestinationType.MOUNTAINS}>Mountains</option>
                        <option value={DestinationType.CULTURAL}>Cultural</option>
                        <option value={DestinationType.CITY}>City</option>
                        <option value={DestinationType.NATURE}>Nature</option>
                    </select>
                </div>
                <textarea
                    placeholder="Packing list"
                    className="w-full min-h-24 max-h-100 outline-none border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm mb-2"
                ></textarea>
                <div>
                    <div className="flex items-center border border-neutral-800 bg-neutral-900/50 rounded-sm">
                        <input
                            type="text"
                            value={currentTag}
                            onChange={(e) => handlers.setCurrentTag(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlers.handleAddTag(); } }}
                            className="w-full border border-none px-2 py-1 text-sm"
                            placeholder="Tag with #work #christmas2025 #solo..."
                        />
                        <button type="button" onClick={handlers.handleAddTag} className="text-sm bg-neutral-800 px-2 py-1">Add</button>
                    </div>
                </div>
                <div className="mt-3">
                    <div className={`${linkTree.customLinks.length > 0 ? "space-y-3" : "space-y-1"}`}>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.keys(validators).map(key => (
                                <div key={key}>
                                    <input type="text" name={key} onChange={handlers.handleLinkChange} className="w-full border border-neutral-800 bg-neutral-900/50 rounded-sm px-2 py-1 text-sm" />
                                    {(linkErrors as any)[key] && <p className="text-red-500 text-xs mt-1">{(linkErrors as any)[key]}</p>}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {linkTree.customLinks.map((link, index) => (
                                <div key={index}>
                                    <div className="flex items-center border border-neutral-800 bg-neutral-900/50 rounded-sm">
                                        <input type="text" value={link} onChange={(e) => handlers.handleCustomLinkChange(index, e.target.value)} className="w-full border border-none px-2 py-1 text-sm" placeholder="https://example.com" />
                                        <button type="button" onClick={() => handlers.handleRemoveCustomLink(index)} className="text-sm bg-neutral-800 px-2 py-1">&times;</button>
                                    </div>
                                    {(linkErrors.customLinks as string[]).map((error, index) => error && <p key={index} className="text-red-500 text-xs mt-1">{error}</p>)}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handlers.handleAddCustomLink} className="text-sm text-yellow-400 hover:underline">+ Add another link</button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-yellow-500 text-neutral-900 text-sm px-3 py-1 float-right rounded border border-transparent hover:border hover:border-yellow-600 disabled:opacity-50 disabled:border-none"
                    onClick={handlers.handleSignUp}
                    disabled={isDisabled}
                >{loading ? "Creating..." : "Create new trip"}</button>
            </form>
        </div>
    )
}