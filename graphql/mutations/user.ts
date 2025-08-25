import gql from "graphql-tag";

export const SIGN_IN_WITH_OTP_MUTATION = gql`
  mutation SignInWithOtp($email: String!) {
    signInWithOtp(email: $email)
  }
`;