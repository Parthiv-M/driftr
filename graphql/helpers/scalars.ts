/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLScalarType, Kind } from "graphql";

export const dateScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value.toISOString(); // Convert outgoing Date to ISO String
  },
  parseValue(value: any) {
    return new Date(value); // Convert incoming ISO String to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Convert AST string to Date
    }
    return null;
  },
});