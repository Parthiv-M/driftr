import { gql } from '@apollo/client';

export const CREATE_TRIP_MUTATION = gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(input: $input) {
      id
      name
      destination
    }
  }
`;

export const UPDATE_TRIP_MUTATION = gql`
  mutation UpdateTrip($id: ID!, $input: UpdateTripInput!) {
    updateTrip(id: $id, input: $input) {
      id
      name
    }
  }
`