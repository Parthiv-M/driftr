import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String
    fullName: String
    createdAt: String
    trips: [Trip!] # A user can have many trips
  }

  # This type contains the tokens and user data from Supabase
  type AuthResponse {
    accessToken: String
    refreshToken: String
    user: User
  }

  type Trip {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    startsOn: DateTime!
    endsOn: DateTime!
    destination: String!
    coverImage: String
    travelMode: TravelMode!
    destinationCoordinates: String
    packingList: String
    linkTree: LinkTree
    metadata: Metadata
    user: User!
  }

  type LinkTree {
    id: ID!
    googlePhotos: String
    dropbox: String
    googleDrive: String
    travelWebsite: String
    customLinks: [String!]
  }

  type Metadata {
    id: ID!
    country: String!
    state: String
    totalDays: Int!
    destinationType: DestinationType!
    continent: String
  }

  enum TravelMode {
    PLANE, CAR, TRAIN, BOAT, BUS, OTHER
  }

  enum DestinationType {
    CITY, NATURE, BEACH, MOUNTAINS, ADVENTURE, RELAXATION, CULTURAL
  }

  input CreateTripInput {
    name: String!
    startsOn: DateTime!
    endsOn: DateTime!
    destination: String!
    state: String!
    country: String!
    tags: [String]
    coverImage: String
    travelMode: TravelMode
    packingList: String
    linkTree: LinkTreeInput
    destinationCoordinates: String
    destinationType: DestinationType
  }

  input UpdateTripInput {
    name: String
    startsOn: DateTime
    endsOn: DateTime
    destination: String
    coverImage: String
    travelMode: TravelMode
    packingList: String
    linkTree: LinkTreeInput
    destinationType: DestinationType
  }

  input LinkTreeInput {
    googlePhotos: String
    dropbox: String
    googleDrive: String
    travelWebsite: String
    customLinks: [String]
  }

  type Query {
    me: User # Fetches the currently authenticated user
    myTrips: [Trip!]
    trip(id: ID!): Trip
  }

  type Mutation {
    signInWithOtp(email: String!): Boolean
    updateUserProfile(username: String, fullName: String): User
    createTrip(input: CreateTripInput!): Trip
    updateTrip(id: ID!, input: UpdateTripInput): Trip
  }

  scalar DateTime
`;