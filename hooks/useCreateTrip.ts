import { useMutation } from "@apollo/client";
import { CREATE_TRIP_MUTATION } from "@graphql/mutations/trip";
import { LinkTreeType } from "@lib/types";
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from 'next/navigation';
import { GET_MY_TRIPS_QUERY } from "@graphql/queries/trip";

export const useCreateTrip = () => {
    const [tripName, setTripName] = useState<string>("");
    const [startsOn, setStartsOn] = useState<Date>();
    const [endsOn, setEndsOn] = useState<Date>();
    const [destination, setDestination] = useState<string>("");
    const [country, setCountry] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [travelMode, setTravelMode] = useState<string>("");
    const [packingList, setPackingList] = useState<string>();
    const [destinationType, setDestinationType] = useState<string>("");
    const [destinationCoordinates, setDestinationCoordinates] = useState<string | null>(null);
    const [isDisabled, setIsDisabled] = useState<boolean>(true);
    const [dateError, setDateError] = useState({ type: "", message: "" });
    const [currentTag, setCurrentTag] = useState('');
    const [linkTree, setLinkTree] = useState<LinkTreeType>({
        googlePhotos: '',
        googleDrive: '',
        dropbox: '',
        travelWebsite: '',
        customLinks: [''],
    });

    const router = useRouter();

    const [createTrip, { loading, error, data }] = useMutation(CREATE_TRIP_MUTATION, {
        refetchQueries: [{ query: GET_MY_TRIPS_QUERY }],
    });

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await createTrip({
                variables: {
                    input: {
                        name: tripName,
                        startsOn,
                        endsOn,
                        destination,
                        state,
                        country,
                        travelMode,
                        tags,
                        packingList: packingList ?? "",
                        linkTree,
                        destinationType,
                        destinationCoordinates,
                    }
                }
            });
            console.log("data after create: ", data)
            router.push('/d');
        } catch (error) {
            console.error('Failed to create trip:', error);
        }
    }

    const handleAddTag = () => {
        if (currentTag && !tags.includes(currentTag)) {
            setTags([...tags, currentTag.trim().toLowerCase()]);
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDestinationSelect = (location: any) => {
        if (location && location.properties) {
            const { lat, lon, country, state, city, address_line1 } = location.properties;
            setDestination(city ?? address_line1);
            setCountry(country);
            setState(state);
            setDestinationCoordinates(`${lat},${lon}`);
        }
    };

    useEffect(() => {
        if (
            tripName !== "" &&
            startsOn !== null &&
            endsOn !== null &&
            destination !== "" &&
            travelMode !== "" &&
            destinationType !== ""
        ) setIsDisabled(false);
        else setIsDisabled(true);
    }, [tripName, startsOn, endsOn, destination, travelMode, destinationType]);

    const handleDateChange = (value: string, type: "start" | "end"): void => {
        if (value === "")
            setDateError({ type: "", message: "" });
        else {
            const dateFromValue = new Date(value);
            if (dateFromValue.toString() === "Invalid Date")
                setDateError({ type: type, message: "Not a valid " + type + " date" });
            else {
                setDateError({ type: "", message: "" });
            }
            if (type === "start") {
                setStartsOn(dateFromValue);
            } else {
                setEndsOn(dateFromValue);
            }
        }
    }

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setLinkTree((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCustomLinkChange = (index: number, value: string) => {
        const newCustomLinks = [...linkTree.customLinks];
        newCustomLinks[index] = value;
        setLinkTree(prev => ({ ...prev, customLinks: newCustomLinks }));
    };

    const handleAddCustomLink = () => {
        setLinkTree(prev => ({ ...prev, customLinks: [...prev.customLinks, ''] }));
    };

    const handleRemoveCustomLink = (index: number) => {
        const newCustomLinks = linkTree.customLinks.filter((_, i) => i !== index);
        setLinkTree(prev => ({ ...prev, customLinks: newCustomLinks }));
    };

    const isValidUrl = (url: string) => /^https:\/\/[^\s$.?#].[^\s]*$/.test(url);
    const createValidator = (domain: string) => (url: string) => url.includes(domain);

    const validators = {
        googlePhotos: createValidator('photos.google.com'),
        googleDrive: createValidator('drive.google.com'),
        dropbox: createValidator('dropbox.com'),
    };

    const linkErrors = useMemo(() => {
        const errors: { [key: string]: string | string[] } = { customLinks: [] };
        if (linkTree.googlePhotos && !validators.googlePhotos(linkTree.googlePhotos)) errors.googlePhotos = 'Must be a valid Google Photos URL.';
        if (linkTree.googleDrive && !validators.googleDrive(linkTree.googleDrive)) errors.googleDrive = 'Must be a valid Google Drive URL.';
        if (linkTree.dropbox && !validators.dropbox(linkTree.dropbox)) errors.dropbox = 'Must be a valid Dropbox URL.';
        if (linkTree.travelWebsite && !isValidUrl(linkTree.travelWebsite)) errors.travelWebsite = 'Must be a valid URL starting with https://';

        const customLinkErrors = linkTree.customLinks.map(link =>
            link && !isValidUrl(link) ? 'Must be a valid URL starting with https://' : ''
        );
        errors.customLinks = customLinkErrors;

        return errors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [linkTree]);

    return {
        loading,
        error,
        data,
        tripName,
        startsOn,
        endsOn,
        destination,
        country,
        state,
        destinationCoordinates,
        tags,
        currentTag,
        travelMode,
        packingList,
        linkTree,
        destinationType,
        isDisabled,
        dateError,
        linkErrors,
        validators,
        handlers: {
            setTripName,
            setStartsOn,
            setEndsOn,
            setDestination,
            setCountry,
            setState,
            setTravelMode,
            setTags,
            setPackingList,
            setCurrentTag,
            setLinkTree,
            setDestinationType,
            setDestinationCoordinates,
            handleSignUp,
            handleDateChange,
            handleAddTag,
            handleRemoveTag,
            handleDestinationSelect,
            handleCustomLinkChange,
            handleLinkChange,
            handleAddCustomLink,
            handleRemoveCustomLink
        }
    }
}