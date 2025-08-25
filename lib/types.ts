import { DestinationType, Trip } from "@prisma/client";

export interface LinkTreeType {
    googlePhotos: string;
    dropbox: string;
    googleDrive: string;
    travelWebsite: string;
    customLinks: string[];
}

export interface MetadataType {
    country: string;
    state: string;
    totalDays: number;
    destinationType: DestinationType;
    continent: string;
}

export interface ActionBaseType {
    label: string;
    link: string;
}

export interface TripType extends Trip {
    linkTree: LinkTreeType;
    metadata: MetadataType;
}

export interface PromptParams {
    totalDays: number;
    destination: string;
    destinationType?: string;
    tags?: string[];
}