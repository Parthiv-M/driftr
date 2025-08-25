import { ActionBaseType, PromptParams } from "./types";

const ActionBaseItemSet1: ActionBaseType[] = [
  {
    label: "Create Trip",
    link: "/d/trip/create"
  },
  {
    label: "All Trips",
    link: "/d/trip/all"
  }
];

const ActionBaseItemSet2: ActionBaseType[] = [
  {
    label: "View on map",
    link: "/d/map"
  },
  {
    label: "Trips in numbers",
    link: "/d/me/stats"
  },
  {
    label: "Profile",
    link: "/d/me"
  }
];

export const ActionBaseItemSets: ActionBaseType[][] = [
  ActionBaseItemSet1, ActionBaseItemSet2
];

export function formatDate(dateVal: Date): string {
  const date = new Date(dateVal);
  
  // Use Intl.DateTimeFormat for robust, locale-aware date formatting.
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // The formatter returns parts, which we can reassemble to get the exact order.
  const parts = formatter.formatToParts(date);
  const day = parts.find(part => part.type === 'day')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const year = parts.find(part => part.type === 'year')?.value;

  return `${day} ${month} ${year}`;
}

export const buildPromptForLLM = (params: PromptParams): string => {
  let tagPromptChunk = '';
  if (params.tags) {
    tagPromptChunk = `It has also been tagged by the user with the following keywords: ${params?.tags.join(', ')}.`;
  }
  
  let destinationTypePromptChunk = '';
  if (params.destinationType) {
    destinationTypePromptChunk = `The trip type is categorized as '${params?.destinationType}' by the user. `;
  }
  
  return `
    You are a trip planning assistant with insights about travel and weather.
    Generate a detailed packing list in markdown format for a ${params.totalDays}-day
    trip to ${params.destination}.
    
    ${destinationTypePromptChunk} ${tagPromptChunk} 
    
    Keep the list concise and do not confuse the user. Organize the list by category.
    Do not give headings or titles or comments before or after the list.
    Give me ONLY the markdown code required for the list.
  `;
}