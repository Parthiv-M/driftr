import gql from "graphql-tag";

export const GET_MY_TRIPS_QUERY = gql`
    query GetMyTrips {
        myTrips {
            id
            name
            destination
            startsOn
            metadata {
                destinationType
            }
        }
    }
`

export const GET_TRIP_BY_ID_QUERY = gql`
  query GetTripById($id: ID!) {
    trip(id: $id) {
      id
      name
      destination
      startsOn
      endsOn
      coverImage
      travelMode
      destinationCoordinates
      packingList
      linkTree {
        googlePhotos
        dropbox
        googleDrive
        travelWebsite
        customLinks
      }
      metadata {
        country
        state
        totalDays
        destinationType
        continent
      }
    }
  }
`;
