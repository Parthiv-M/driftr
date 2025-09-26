import gql from "graphql-tag";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      username
      fullName
    }
  }
`;

export const STATS_QUERY = gql`
  query Stats {
    stats {
      totalTrips,
      totalCountries,
      totalDays,
      longestTrip {
        id
        name
        days
        country
      },
      shortestTrip {
        id
        name
        days
        country
      },
      mostVisitedCountry {
        country,
        visitCount
      }
    }
  }
`;

export const GET_TRIPS_BY_USERNAME_QUERY = gql`
  query GetTripsByUsername($username: String!) {
    tripsByUsername(username: $username) {
      id
      name
      destination
      destinationCoordinates
      metadata {
        totalDays
      }
    }
  }
`;
