import { provideHttpClient, withXhr } from '@angular/common/http';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';

function graphqlWsUrl(): string {
  const loc = globalThis.location;
  const protocol = loc?.protocol === 'https:' ? 'wss' : 'ws';
  const host = loc?.host || '127.0.0.1:5173';
  return `${protocol}://${host}/graphql`;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withXhr()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const http = httpLink.create({ uri: '/graphql' });
      const cache = new InMemoryCache();
      if (typeof WebSocket === 'undefined') {
        return { link: http, cache };
      }
      const ws = new GraphQLWsLink(
        createClient({
          url: graphqlWsUrl(),
          lazy: true,
          retryAttempts: 3,
        }),
      );
      const link = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === Kind.OPERATION_DEFINITION &&
            definition.operation === OperationTypeNode.SUBSCRIPTION
          );
        },
        ws,
        http,
      );
      return { link, cache };
    }),
  ],
};
